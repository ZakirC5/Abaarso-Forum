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
  deleteDoc,
  increment,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import app from "./firebase.js";
import Header from "./components/Header";
import SideBar from "./components/SideBar";
import "./ViewPost.css";

const likeEmptyIcon = "https://www.svgrepo.com/show/489499/like.svg";
const likeFilledIcon = "https://www.svgrepo.com/show/488268/like.svg";
const bookmarkIcon = "https://www.svgrepo.com/show/525696/bookmark.svg";
const bookmarkEmptyIcon = "https://www.svgrepo.com/show/524332/bookmark.svg";
const deleteIcon = "https://www.svgrepo.com/show/499905/delete.svg";

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

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        const postRef = doc(db, "posts", id);
        const snap = await getDoc(postRef);
        if (snap.exists()) {
          const data = snap.data();
          setPost(data);
          setUserLiked(currentUser ? data.likes?.includes(currentUser.uid) : false);
        }
        if (currentUser) {
          const userSnap = await getDoc(doc(db, "users", currentUser.uid));
          if (userSnap.exists()) {
            setUserBookmarked(userSnap.data().bookmarks?.includes(id));
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [db, id, currentUser]);

  useEffect(() => {
    const q = query(collection(db, "comments"), where("postId", "==", id));
    const unsub = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [db, id]);

  const toggleLike = async () => {
    if (!currentUser || !post) return;
    const postRef = doc(db, "posts", id);
    const isLiking = !userLiked;

    setPost((prev) => {
      const likes = isLiking
        ? [...(prev.likes || []), currentUser.uid]
        : (prev.likes || []).filter((uid) => uid !== currentUser.uid);
      return { ...prev, likes, likesCount: likes.length };
    });
    setUserLiked(isLiking);

    await updateDoc(postRef, {
      likes: isLiking ? arrayUnion(currentUser.uid) : arrayRemove(currentUser.uid),
      likesCount: increment(isLiking ? 1 : -1),
    });
  };

  const toggleBookmark = async () => {
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, {
      bookmarks: userBookmarked ? arrayRemove(id) : arrayUnion(id),
    });
    setUserBookmarked(!userBookmarked);
  };

  const addComment = async () => {
    if (!currentUser || !commentMsg.trim()) return;
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
  };

  const toggleCommentLike = async (commentId, liked) => {
    if (!currentUser) return;
    const commentRef = doc(db, "comments", commentId);
    await updateDoc(commentRef, {
      likes: liked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid),
      likesCount: increment(liked ? -1 : 1),
    });
  };

  const deleteCommentById = async (commentId) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, "comments", commentId));
  };

  if (loading) return <div className="view-loading">Loading post...</div>;
  if (!post) return <div className="view-error">Post not found.</div>;

  return (
    <>
      <Header />
      <SideBar />
      <main>
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

            <div className="comments-section">
              <h3>Comments</h3>
              <div className="comment-input">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentMsg}
                  onChange={(e) => setCommentMsg(e.target.value)}
                />
                <button onClick={addComment}>Send</button>
              </div>

              <div className="comments-list">
                {comments.length === 0 && <p>No comments yet...</p>}
                {comments.map((c) => {
                  const liked = c.likes?.includes(currentUser?.uid);
                  const isOwner = currentUser?.uid === c.userId;
                  return (
                    <div key={c.id} className="comment-item">
                      <strong>{c.authorName}</strong>: {c.message}
                      <div className="comment-actions">
                        <button className="icon-btn" onClick={() => toggleCommentLike(c.id, liked)}>
                          <img src={liked ? likeFilledIcon : likeEmptyIcon} alt="Like" />
                          {c.likesCount > 0 && <span>{c.likesCount}</span>}
                        </button>
                        {isOwner && (
                          <button className="icon-btn" onClick={() => deleteCommentById(c.id)}>
                            <img src={deleteIcon} alt="Delete" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default ViewPost;
