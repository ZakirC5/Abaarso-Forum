import { useEffect, useState, lazy } from "react";
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
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);

  const [userLiked, setUserLiked] = useState(false);
  const [userBookmarked, setUserBookmarked] = useState(false);

  const [commentMsg, setCommentMsg] = useState("");
  const [comments, setComments] = useState([]);

  const db = getFirestore(app);
  const auth = getAuth(app);
  const currentUser = auth.currentUser;

  /* FETCH POST + AUTHOR */
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        const postRef = doc(db, "posts", id);
        const snap = await getDoc(postRef);

        if (snap.exists()) {
          const data = snap.data();
          setPost(data);

          // Check if current user liked post
          setUserLiked(
            currentUser ? data.likes?.includes(currentUser.uid) : false
          );

          // Fetch author info
          if (data.userId) {
            const authorRef = doc(db, "users", data.userId);
            const authorSnap = await getDoc(authorRef);

            if (authorSnap.exists()) {
              setAuthor(authorSnap.data());
            }
          }
        }

        // Check bookmark
        if (currentUser) {
          const userSnap = await getDoc(doc(db, "users", currentUser.uid));

          if (userSnap.exists()) {
            setUserBookmarked(
              userSnap.data().bookmarks?.includes(id) || false
            );
          }
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [db, id, currentUser]);

  /* LIVE COMMENTS */
  useEffect(() => {
    const q = query(collection(db, "comments"), where("postId", "==", id));

    const unsub = onSnapshot(q, (snapshot) => {
      setComments(
        snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
      );
    });

    return () => unsub();
  }, [db, id]);

  /* LIKE POST */
  const toggleLike = async () => {
    if (!currentUser || !post) return;

    const postRef = doc(db, "posts", id);
    const isLiking = !userLiked;

    // Instant UI update
    setPost((prev) => {
      const likes = isLiking
        ? [...(prev.likes || []), currentUser.uid]
        : (prev.likes || []).filter((uid) => uid !== currentUser.uid);

      return {
        ...prev,
        likes,
        likesCount: likes.length,
      };
    });

    setUserLiked(isLiking);

    try {
      await updateDoc(postRef, {
        likes: isLiking
          ? arrayUnion(currentUser.uid)
          : arrayRemove(currentUser.uid),
        likesCount: increment(isLiking ? 1 : -1),
      });
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  /* BOOKMARK */
  const toggleBookmark = async () => {
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);

    try {
      await updateDoc(userRef, {
        bookmarks: userBookmarked
          ? arrayRemove(id)
          : arrayUnion(id),
      });

      setUserBookmarked(!userBookmarked);
    } catch (error) {
      console.error("Error updating bookmark:", error);
    }
  };

  /* ADD COMMENT */
  const addComment = async () => {
    if (!currentUser || !commentMsg.trim()) return;

    try {
      await addDoc(collection(db, "comments"), {
        postId: id,
        userId: currentUser.uid,
        authorName: currentUser.displayName || "Anonymous",
        message: commentMsg.trim(),
        likes: [],
        likesCount: 0,
        createdAt: new Date(),
      });

      setCommentMsg("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  /* LIKE COMMENT */
  const toggleCommentLike = async (commentId, liked) => {
    if (!currentUser) return;

    const commentRef = doc(db, "comments", commentId);

    try {
      await updateDoc(commentRef, {
        likes: liked
          ? arrayRemove(currentUser.uid)
          : arrayUnion(currentUser.uid),
        likesCount: increment(liked ? -1 : 1),
      });
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  /* DELETE COMMENT */
  const deleteCommentById = async (commentId) => {
    if (!currentUser) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "comments", commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  /* LOADING */
  if (loading) {
    return <div className="view-loading">Loading post...</div>;
  }

  /* NOT FOUND */
  if (!post) {
    return <div className="view-error">Post not found.</div>;
  }

  return (
    <>
      <Header />
      <SideBar />

      <main>
        <div className="view-container">
          <div className="view-card">

            {/* IMAGE */}
            {post.photoURL && (
              <img
                src={post.photoURL}
                alt={post.title}
                className="view-image"
                loading="lazy"
              />
            )}

            {/* AUTHOR */}
            {author && (
              <div className="post-author">
                <img
                  src={
                    author.photoURL ||
                    "https://via.placeholder.com/40"
                  }
                  alt="Profile"
                  className="author-pic"
                />

                <span className="author-name">
                  {author.name ||
                    author.displayName ||
                    "Unknown User"}
                </span>
              </div>
            )}

            {/* TITLE */}
            <h1 className="view-title">{post.title}</h1>

            {/* SUBTITLE */}
            {post.subtitle && (
              <h3 className="view-subtitle">
                {post.subtitle}
              </h3>
            )}

            {/* TAGS */}
            <div className="view-tags">
              {post.tags?.map((tag, index) => (
                <span key={index} className="view-tag">
                  #{tag}
                </span>
              ))}
            </div>

            {/* BODY */}
            <p className="view-body">{post.body}</p>

            {/* ACTIONS */}
            <div className="view-actions">

              {/* LIKE */}
              <button
                className="icon-btn"
                onClick={toggleLike}
              >
                <img
                  src={
                    userLiked
                      ? likeFilledIcon
                      : likeEmptyIcon
                  }
                  alt="Like"
                />

                {post.likesCount > 0 && (
                  <span>{post.likesCount}</span>
                )}
              </button>

              {/* BOOKMARK */}
              <button
                className="icon-btn"
                onClick={toggleBookmark}
              >
                <img
                  src={
                    userBookmarked
                      ? bookmarkIcon
                      : bookmarkEmptyIcon
                  }
                  alt="Bookmark"
                />
              </button>
            </div>

            {/* COMMENTS */}
            <div className="comments-section">
              <h3>Comments</h3>

              {/* INPUT */}
              <div className="comment-input">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentMsg}
                  onChange={(e) =>
                    setCommentMsg(e.target.value)
                  }
                />

                <button onClick={addComment}>
                  Send
                </button>
              </div>

              {/* LIST */}
              <div className="comments-list">

                {comments.length === 0 && (
                  <p>No comments yet...</p>
                )}

                {comments.map((comment) => {
                  const liked =
                    comment.likes?.includes(
                      currentUser?.uid
                    );

                  const isOwner =
                    currentUser?.uid ===
                    comment.userId;

                  return (
                    <div
                      key={comment.id}
                      className="comment-item"
                    >
                      <strong>
                        {comment.authorName}:
                      </strong>
                      {comment.message}

                      <div className="comment-actions">

                        {/* COMMENT LIKE */}
                        <button
                          className="icon-btn"
                          onClick={() =>
                            toggleCommentLike(
                              comment.id,
                              liked
                            )
                          }
                        >
                          <img
                            src={
                              liked
                                ? likeFilledIcon
                                : likeEmptyIcon
                            }
                            alt="Like"
                          />

                          {comment.likesCount > 0 && (
                            <span>
                              {comment.likesCount}
                            </span>
                          )}
                        </button>

                        {/* DELETE */}
                        {isOwner && (
                          <button
                            className="icon-btn"
                            onClick={() =>
                              deleteCommentById(
                                comment.id
                              )
                            }
                          >
                            <img
                              src={deleteIcon}
                              alt="Delete"
                            />
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