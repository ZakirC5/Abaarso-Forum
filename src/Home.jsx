import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs
} from "firebase/firestore";
import app from "./firebase.js";
import Header from "./components/Header.jsx";
import Posts from "./components/Posts.jsx"; // 🔥 NEW
import "./Home.css";

function Home() {
  const db = getFirestore(app);

  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const snap = await getDocs(collection(db, "communities"));

        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setCommunities(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCommunities();
  }, []);

  return (
    <>
      <Header />

      <main className="home">

        <section className="hero">
          <h1>Abaarso Forum</h1>
          <p>Discover, connect, and chill.</p>
        </section>

        <div className="layout">

          {/* LEFT (MAIN) */}
          <div className="main">
            {/* 🔥 USE YOUR POSTS COMPONENT */}
            <Posts popular={true} />
          </div>

          {/* RIGHT (COMMUNITIES) */}
          <aside className="sidebar">
            <div className="sidebar-card">
              <h3>Communities</h3>

              {communities.map((community) => (
                <div key={community.id} className="mini-post">
                  <p>{community.name}</p>
                  <div className="mini-meta">
                    {community.members?.length || 0} members
                  </div>
                </div>
              ))}
            </div>
          </aside>

        </div>

      </main>
    </>
  );
}

export default Home;