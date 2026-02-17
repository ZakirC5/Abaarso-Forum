import { useEffect, useState } from "react";
import app from '../firebase.js'
import { getFirestore, collection, onSnapshot, doc, deleteDoc, getDoc, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "./Posts.css";

function Posts({ bookmark = false, userId = null }) {
  const db = getFirestore(app);
  const auth = getAuth(app);
  const [posts, setPosts] = useState([]);
  const [userBookmarks, setUserBookmarks] = useState([]);

  // Fetch current user's bookmarks if needed
  useEffect(() => {
    if (!bookmark) return;

    const fetchBookmarks = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserBookmarks(userDoc.data().bookmarks || []);
      }
    };

    fetchBookmarks();
  }, [auth, db, bookmark]);

  // Fetch posts with filtering
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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deleteDoc(doc(db, "posts", id));
    }
  };

  return (
    <>
      <h2>
        {userId ? "Your Posts" : "All Posts"}
      </h2>
      <div className="posts-container">
        {posts.length === 0 ? (
          <p className="posts-empty">{ bookmark ?  "No saved posts yet…" : "No posts yet…" }</p>
        ) : (
          posts.map((post) => (
            <div className="post-card" key={post.id}>
              <img src={post.image} alt={post.title} className="post-image" />

              <div className="post-content">
                <h3 className="post-title">
                  <a href={"/view/" + post.id}>{post.title}</a>
                </h3>
                <p className="post-subtitle">{post.subtitle}</p>

                <div className="post-tags">
                  {post.tags?.map((tag, idx) => (
                    <span className="post-tag" key={idx}>#{tag}</span>
                  ))}
                </div>

                <div className="post-actions">
                  <abbr title="Edit">
                    <button className="icon-btn" onClick={() => window.location.href = "/edit/"+post.id }>
                      <img src="https://www.svgrepo.com/show/497964/edit-2.svg" alt="Edit" />
                    </button>
                  </abbr>

                  <abbr title="Delete">
                    <button className="icon-btn" onClick={() => handleDelete(post.id)}>
                      <img src="https://www.svgrepo.com/show/499905/delete.svg" alt="Delete" />
                    </button>
                  </abbr>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Posts;
