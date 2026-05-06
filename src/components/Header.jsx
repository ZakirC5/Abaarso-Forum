import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from "../firebase.js";
import "./Header.css";

import logo from "../assets/logo.webp";
import searchIcon from "../assets/search.svg";

const auth = getAuth(app);
const db = getFirestore(app);

function Header() {
  const location = useLocation();
  
  // Auth state from Code #2
  const [user, setUser] = useState(null);
  
  // Search states from Code #1
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // 1. Auth Listener Logic
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  // 2. Search Scope Logic (from Code #1)
  const getSearchScope = () => {
    const path = location.pathname;
    if (path.startsWith("/community")) return "communities";
    if (path.startsWith("/dashboard")) return "userPosts";
    return "posts"; // Default for explore/home
  };

  // 3. Search Execution with Debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(delay);
  }, [searchTerm, location.pathname]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    try {
      // 1. Determine the collection to fetch
      const scope = getSearchScope(); 
      // Note: If dashboard search uses the same 'posts' collection, 
      // ensure getSearchScope() returns "posts" for the dashboard too.
      const collectionName = scope === "userPosts" ? "posts" : scope;
      
      const ref = collection(db, collectionName);
      const snapshot = await getDocs(ref);
      const term = searchTerm.toLowerCase();

      const list = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((item) => {
          // 2. DASHBOARD FILTER: If on dashboard, only show posts owned by this user
          if (location.pathname.startsWith("/dashboard")) {
            if (item.userId !== user?.uid) return false;
          }

          // 3. TEXT FILTER: Match title, body, or name
          const title = item.title?.toLowerCase() || "";
          const body = item.body?.toLowerCase() || "";
          const name = item.name?.toLowerCase() || "";

          return (
            title.includes(term) ||
            body.includes(term) ||
            name.includes(term)
          );
        })
        .slice(0, 5);

      setResults(list);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  return (
    <header className="header">
      <a href="/">
        <img src={logo} alt="logo" id="logo" />
      </a>

      {/* Search Bar Section */}
      <div className="searchbar">
        <img src={searchIcon} alt="search" width={35} height={35} />
        <input
          type="search"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onBlur={() => {
            // Delay hide so user can click a link before it disappears
            setTimeout(() => setShowResults(false), 200);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") setShowResults(false);
          }}
        />

        {showResults && results.length > 0 && (
          <ul className="search-results">
            {results.map((item) => (
              <li key={item.id}>
                <a
                  href={
                    getSearchScope() === "communities"
                      ? `/community/${item.id}`
                      : `/view/${item.id}`
                  }
                >
                  {item.title || item.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Auth Button Logic from Code #2 */}
      <div className="header-actions">
        {user && (location.pathname === "/" || location.pathname === "/community" || location.pathname === "/admin") ? (
          <a href="/dashboard" id="login-btn">
            Open Dashboard
          </a>
        ) : !user ? (
          <a href="/login" id="login-btn">
            Login
          </a>
        ) : null}
      </div>
    </header>
  );
}

export default Header;