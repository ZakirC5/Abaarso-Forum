import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import app from "./firebase.js";
import Header from "./components/Header";
import SideBar from "./components/SideBar";
import "./ViewPost.css";

// Icons
const likeEmptyIcon = "https://www.svgrepo.com/show/489499/like.svg";
const likeFilledIcon = "https://www.svgrepo.com/show/488268/like.svg";
const bookmarkIcon = "https://www.svgrepo.com/show/525696/bookmark.svg";
const bookmarkEmptyIcon = "https://www.svgrepo.com/show/524332/bookmark.svg";

function ViewPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLiked, setUserLiked] = useState(false);
  const [userBookmarked, setUserBookmarked] = useState(false);
  const [commentMsg, setCommentMsg] = useState("");
  const [comments, setComments] = useState([]);

  const db = getFirestore(app);
  const auth = getAuth(app);
  const currentUser = auth.currentUser;

  // Fetch post
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "posts", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPost(data);
          setUserLiked(currentUser ? data.likes?.includes(currentUser.uid) : false);

          // Check bookmark
          if (currentUser) {
            const userSnap = await getDoc(doc(db, "users", currentUser.uid));
            if (userSnap.exists()) {
              setUserBookmarked(userSnap.data().bookmarks?.includes(id));
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [db, id, currentUser]);

  // Listen for comments
  useEffect(() => {
    const q = query(collection(db, "comments"), where("postId", "==", id));
    const unsub = onSnapshot(q, snapshot => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(list);
    });
    return () => unsub();
  }, [db, id]);

  const toggleLike = async () => {
    if (!currentUser) return alert("Login to like posts");
    const postRef = doc(db, "posts", id);

    if (userLiked) {
      await updateDoc(postRef, {
        likes: arrayRemove(currentUser.uid),
        likesCount: (post.likesCount || 1) - 1,
      });
      setUserLiked(false);
      setPost(prev => ({
        ...prev,
        likesCount: (prev.likesCount || 1) - 1,
        likes: prev.likes?.filter(uid => uid !== currentUser.uid),
      }));
    } else {
      await updateDoc(postRef, {
        likes: arrayUnion(currentUser.uid),
        likesCount: (post.likesCount || 0) + 1,
      });
      setUserLiked(true);
      setPost(prev => ({
        ...prev,
        likesCount: (prev.likesCount || 0) + 1,
        likes: [...(prev.likes || []), currentUser.uid],
      }));
    }
  };

  const toggleBookmark = async () => {
    if (!currentUser) return alert("Login to bookmark posts");
    const userRef = doc(db, "users", currentUser.uid);

    if (userBookmarked) {
      await updateDoc(userRef, { bookmarks: arrayRemove(id) });
      setUserBookmarked(false);
    } else {
      await updateDoc(userRef, { bookmarks: arrayUnion(id) });
      setUserBookmarked(true);
    }
  };

  const addComment = async () => {
    if (!currentUser) return alert("Login to comment");
    if (!commentMsg.trim()) return;

    try {
      await addDoc(collection(db, "comments"), {
        postId: id,
        userId: currentUser.uid,
        authorName: currentUser.displayName || "Anonymous",
        message: commentMsg,
        likes: [],
        likesCount: 0,
        createdAt: new Date(),
      });
      setCommentMsg("");
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCommentLike = async (commentId, liked) => {
    if (!currentUser) return;
    const commentRef = doc(db, "comments", commentId);
    if (liked) {
      await updateDoc(commentRef, {
        likes: arrayRemove(currentUser.uid),
        likesCount: arrayRemove(1),
      });
    } else {
      await updateDoc(commentRef, {
        likes: arrayUnion(currentUser.uid),
        likesCount: arrayUnion(1),
      });
    }
  };

  if (loading) return <div className="view-loading">Loading post...</div>;
  if (!post) return <div className="view-error">Post not found.</div>;

  return (
    <>
      <Header />
      <SideBar />
      <div className="view-container">
        <div className="view-card">
          {post.image && <img src={post.image} alt={post.title} className="view-image" />}
          <h1 className="view-title">{post.title}</h1>
          {post.subtitle && <h3 className="view-subtitle">{post.subtitle}</h3>}

          <div className="view-tags">
            {post.tags?.map((tag, idx) => (
              <span key={idx} className="view-tag">#{tag}</span>
            ))}
          </div>

          <p className="view-body">{post.body}</p>

          <div className="view-actions">
            <button className="icon-btn" onClick={toggleLike}>
              <img src={userLiked ? likeFilledIcon : likeEmptyIcon} alt="Like" />
              {post.likesCount > 0 && <span>{post.likesCount}</span>}
            </button>
            <button className="icon-btn" onClick={toggleBookmark}>
              <img src={userBookmarked ? bookmarkIcon : bookmarkEmptyIcon} alt="Bookmark" />
            </button>
          </div>

          {/* Comments */}
          <div className="comments-section">
            <h3>Comments</h3>
            <div className="comment-input">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentMsg}
                onChange={e => setCommentMsg(e.target.value)}
              />
              <button onClick={addComment}>Send</button>
            </div>

            <div className="comments-list">
              {comments.length === 0 && <p>No comments yet…</p>}
              {comments.map(c => {
                const liked = c.likes?.includes(currentUser?.uid);
                return (
                  <div key={c.id} className="comment-item">
                    <strong>{c.authorName}</strong>: {c.message}
                    <div className="comment-actions">
                      <button
                        className="icon-btn"
                        onClick={() => toggleCommentLike(c.id, liked)}
                      >
                        <img src={liked ? likeFilledIcon : likeEmptyIcon} alt="Like" />
                        {c.likesCount > 0 && <span>{c.likesCount}</span>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewPost;
