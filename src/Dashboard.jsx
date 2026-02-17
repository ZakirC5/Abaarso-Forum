import { Suspense, useState, lazy } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Header from "./components/Header";
import SideBar from "./components/SideBar";
const Posts = lazy(() => import("./components/Posts"));
import "./Dashboard.css";

function Dashboard() {
  const auth = getAuth();

  const [user, setUser] = useState({})

  onAuthStateChanged(auth, (user) => {
    if (user) {
        setUser(user)
    } else {
        window.location.href = "/login"
    }
  })

  return (
    <div className="dashboard-wrapper">
      <Header />
      <SideBar />

      <div className="dashboard-main">
        <Suspense fallback={<div className="loader">Loading your feed…</div>}>
            <h1>Welcome, {user.displayName}!</h1>
            <Posts userId={user.uid}/>
        </Suspense>
      </div>
    </div>
  );
}

export default Dashboard;
