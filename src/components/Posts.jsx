import { useEffect, useState } from "react";
import app from '../firebase.js'
import { 
  getFirestore, collection, onSnapshot, doc, 
  deleteDoc, getDoc, query, where, updateDoc, arrayUnion, arrayRemove, increment 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "./Posts.css";

const likeEmptyIcon = "https://www.svgrepo.com/show/489499/like.svg";
const likeFilledIcon = "https://www.svgrepo.com/show/488268/like.svg";

function Posts({ bookmark = false, userId = null }) {
  const db = getFirestore(app);
  const auth = getAuth(app);
  const [posts, setPosts] = useState([]);
  const [userBookmarks, setUserBookmarks] = useState([]);
  const currentUser = auth.currentUser;

  // 1. Fetch current user's bookmarks
  useEffect(() => {
    if (!bookmark || !currentUser) return;

    const fetchBookmarks = async () => {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        setUserBookmarks(userDoc.data().bookmarks || []);
      }
    };

    fetchBookmarks();
  }, [currentUser, db, bookmark]);

  // 2. Real-time Posts Listener
  useEffect(() => {
    let q = collection(db, "posts");

    if (userId) {
      q = query(q, where("userId", "==", userId));
    }

    const unsub = onSnapshot(q, (snapshot) => {
      let list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      if (bookmark) {
        list = list.filter((post) => userBookmarks.includes(post.id));
      }

      setPosts(list);
    });

    return () => unsub();
  }, [db, bookmark, userBookmarks, userId]);

  // 3. Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteDoc(doc(db, "posts", id));
      } catch (err) {
        console.error("Error deleting post:", err);
      }
    }
  };

  // 4. Handle Like
  const handleLike = async (postId, currentLikes = []) => {
    if (!currentUser) return alert("Please log in to like posts!");

    const postRef = doc(db, "posts", postId);
    const hasLiked = currentLikes.includes(currentUser.uid);

    try {
      await updateDoc(postRef, {
        likes: hasLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid),
        likesCount: hasLiked ? increment(-1) : increment(1)
      });
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  // 5. Image Error Helper
  const handleImageError = (e) => {
    const container = e.target.closest('.post-image-container');
    if (container) container.style.display = 'none';
  };

  return (
    <>
      <h2 className="section-title" style={{ marginLeft: '40px' }}>
        {bookmark ? "Saved Bookmarks" : userId ? "Your Posts" : "All Posts"}
      </h2>
      
      <div className="posts-container">
        {posts.length === 0 ? (
          <p className="posts-empty">{bookmark ? "No saved posts yet…" : "No posts yet…"}</p>
        ) : (
          posts.map((post) => {
            const isOwner = currentUser && post.userId === currentUser.uid;
            const hasLiked = post.likes?.includes(currentUser?.uid);

            return (
              <div className="post-card" key={post.id}>
                <div className="post-content">
                  <div className="post-header">
                    <h3 className="post-title">
                      <a href={"/view/" + post.id}>{post.title}</a>
                    </h3>
                    <p className="post-subtitle">{post.subtitle}</p>
                  </div>

                  <div className="post-tags">
                    {post.tags?.map((tag, idx) => (
                      <span className="post-tag" key={idx}>#{tag}</span>
                    ))}
                  </div>

                  <div className="post-actions">
                    {/* Like Button toggles icon based on hasLiked */}
                    <button 
                      className={`icon-btn ${hasLiked ? 'active' : ''}`}
                      onClick={() => handleLike(post.id, post.likes)}
                    >
                      <img src={hasLiked ? likeFilledIcon : likeEmptyIcon} alt="Like" />
                      <span className="action-count">{post.likesCount || 0}</span>
                    </button>

                    {/* ONLY SHOW Edit/Delete if user created the post */}
                    {isOwner && (
                      <>
                        <abbr title="Edit">
                          <button className="icon-btn" onClick={() => window.location.href = "/edit/" + post.id}>
                            <img src="https://www.svgrepo.com/show/497964/edit-2.svg" alt="Edit" />
                          </button>
                        </abbr>

                        <abbr title="Delete">
                          <button className="icon-btn" onClick={() => handleDelete(post.id)}>
                            <img src="https://www.svgrepo.com/show/499905/delete.svg" alt="Delete" />
                          </button>
                        </abbr>
                      </>
                    )}
                  </div>
                </div>

                {post.image && post.image.trim() !== "" && (
                  <div className="post-image-container">
                    <img 
                      src={post.image} 
                      alt="" 
                      className="post-image" 
                      onError={handleImageError} 
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

export default Posts;