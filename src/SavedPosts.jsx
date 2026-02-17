import { Suspense, useState, lazy } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Header from "./components/Header";
import SideBar from "./components/SideBar";
const Posts = lazy(() => import("./components/Posts"));
import "./SavedPosts.css";

function SavedPosts() {
  const auth = getAuth();

  const [user, setUser] = useState(0)

  onAuthStateChanged(auth, (user) => {
    if (user) {
        setUser(user)
    } else {
        window.location.href = "/login"
    }
  })

  return (
    <div className="savedposts-wrapper">
      <Header />
      <SideBar />

      <div className="dashboard-main">
        <Suspense fallback={<div className="loader">Loading your bookmarked feed…</div>}>
            <h1>Welcome, {user.displayName}!</h1>
            <Posts userId={user.id} bookmark={true} />
        </Suspense>
      </div>
    </div>
  );
}

export default SavedPosts;
