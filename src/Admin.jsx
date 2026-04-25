import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import app from "./firebase";
import Header from "./components/Header";
import "./Admin.css";

const db = getFirestore(app);
const auth = getAuth(app);

/* ---------------- SHA-256 ---------------- */
const hash = async (text) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const buffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const Admin = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [isAdmin, setIsAdmin] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [communities, setCommunities] = useState([]);
  const [orphanPosts, setOrphanPosts] = useState([]);

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });

    return () => unsub();
  }, []);

  /* ---------------- LOGIN ---------------- */
  const handleLogin = async () => {
    try {
      const snap = await getDocs(collection(db, "admin"));

      if (snap.empty) {
        alert("Admin config missing");
        return;
      }

      const adminDoc = snap.docs[0].data();
      const hashedInput = await hash(password);

      const isValid =
        adminDoc.username === username.trim() &&
        adminDoc.password === hashedInput;

      if (!isValid) {
        alert("Wrong credentials");
        return;
      }

      setIsAdmin(true);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      const [communitySnap, postSnap] = await Promise.all([
        getDocs(collection(db, "communities")),
        getDocs(collection(db, "posts")),
      ]);

      const communitiesData = communitySnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const postsData = postSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // ✅ FIXED orphan detection (safe)
      const orphan = postsData.filter((p) =>
        !p.communityId || p.communityId === "" || p.communityId === "null"
      );

      setCommunities(communitiesData);
      setOrphanPosts(orphan);
    };

    fetchData();
  }, [isAdmin]);

  /* ---------------- DELETE COMMUNITY ---------------- */
  const deleteCommunity = async (id) => {
    if (!window.confirm("Delete this community?")) return;

    await deleteDoc(doc(db, "communities", id));

    setCommunities((prev) =>
      prev.filter((c) => c.id !== id)
    );
  };

  /* ---------------- DELETE POST ---------------- */
  const deletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;

    await deleteDoc(doc(db, "posts", id));

    setOrphanPosts((prev) =>
      prev.filter((p) => p.id !== id)
    );
  };

  /* ---------------- LOADING ---------------- */
  if (authLoading) {
    return (
      <div style={{ paddingTop: "120px", textAlign: "center" }}>
        Loading...
      </div>
    );
  }

  /* ---------------- LOGIN SCREEN ---------------- */
  if (!isAdmin) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <h2>Admin Login</h2>

          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleLogin}>Login</button>
        </div>
      </div>
    );
  }

  /* ---------------- ADMIN PANEL ---------------- */
  return (
    <div className="admin-page">
      <Header />

      <div className="admin-container">
        <div className="admin-topbar">
          <h1>Admin Panel</h1>

          <button className="logout-btn" onClick={() => { setIsAdmin(false); window.location.href = "/dashboard" }}>
            Logout
          </button>
        </div>

        {/* COMMUNITIES */}
        <h2 className="section-title">Communities</h2>

        <div className="admin-list">
          {communities.map((c) => (
            <div key={c.id} className="admin-card">
              <div className="admin-info">
                <h3>{c.name}</h3>
                <p>{c.description}</p>
              </div>

              <button
                className="delete-btn"
                onClick={() => deleteCommunity(c.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* ORPHAN POSTS */}
        <h2 className="section-title">
          Posts (No Community)
        </h2>

        <div className="admin-list">
          {orphanPosts.length === 0 ? (
            <p style={{ color: "#777" }}>
              No orphan posts found
            </p>
          ) : (
            orphanPosts.map((p) => (
              <div key={p.id} className="admin-card">
                <div className="admin-info">
                  <h3>{p.title || "Untitled Post"}</h3>
                  <p>{p.content}</p>
                </div>

                <button
                  className="delete-btn"
                  onClick={() => deletePost(p.id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;