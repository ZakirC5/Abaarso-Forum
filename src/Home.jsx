import { useEffect, useState } from "react"
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  where
} from "firebase/firestore"
import app from "./firebase.js"
import Header from "./components/Header.jsx"
import "./Home.css"

function Home() {
  const db = getFirestore(app)

  const [recent, setRecent] = useState([])
  const [popular, setPopular] = useState([])
  const [commentCounts, setCommentCounts] = useState({})

  useEffect(() => {
    const fetchPosts = async () => {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      setRecent(data.slice(0, 5))

      const sorted = [...data].sort(
        (a, b) => (b.likesCount || 0) - (a.likesCount || 0)
      )
      setPopular(sorted.slice(0, 5))

      // 🔥 FETCH COMMENT COUNTS
      const counts = {}

      for (const post of data) {
        const commentsQuery = query(
          collection(db, "comments"),
          where("postId", "==", post.id)
        )

        const commentSnap = await getDocs(commentsQuery)
        counts[post.id] = commentSnap.size
      }

      setCommentCounts(counts)
    }

    fetchPosts()
  }, [])

  return (
    <>
      <Header />

      <main className="home">

        <section className="hero">
          <h1>Abaarso Forum</h1>
          <p>Discover, connect, and chill.</p>
        </section>

        <div className="layout">

          {/* LEFT */}
          <div className="main">
            <h2 className="section-title">Recent Posts</h2>

            {recent.map(post => {
              const likes = post.likesCount || 0
              const comments = commentCounts[post.id] || 0

              return (
                <div key={post.id} className="post-card">

                  <div className="post-top">
                    <h3>{post.title}</h3>
                    <span className="post-time">
                      {post.createdAt?.seconds
                        ? new Date(post.createdAt.seconds * 1000).toLocaleDateString()
                        : "recent"}
                    </span>
                  </div>

                  <p className="subtitle">
                    {post.subtitle || "No description provided."}
                  </p>

                  <div className="tags">
                    {post.tags?.map((tag, i) => (
                      <span key={i} className="tag">#{tag}</span>
                    ))}
                  </div>

                  <div className="post-footer">
                    <div className="stat">🔥 {likes}</div>
                    <div className="stat">💬 {comments}</div>
                  </div>

                </div>
              )
            })}
          </div>

          {/* RIGHT */}
          <aside className="sidebar">
            <div className="sidebar-card">
              <h3>🔥 Popular</h3>

              {popular.map(post => {
                const likes = post.likesCount || 0

                return (
                  <div key={post.id} className="mini-post">
                    <p>{post.title}</p>
                    <div className="mini-meta">🔥 {likes}</div>
                  </div>
                )
              })}
            </div>
          </aside>

        </div>

      </main>
    </>
  )
}

export default Home