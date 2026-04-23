import { Suspense, useState, lazy } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Header from "./components/Header";
import SideBar from "./components/SideBar";
const Posts = lazy(() => import("./components/Posts"));
import "./Dashboard.css";
import TermsOfService from "./TermsOfService";

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
      <TermsOfService />

      <main>
        <div className="dashboard-main">
          <Suspense fallback={<div className="loader">Loading your feed…</div>}>
              <h1>Welcome, {user.displayName}!</h1>
              <Posts userId={user.uid}/>
          </Suspense>
          <Suspense fallback={<div className="loader">Loading your bookmarked feed…</div>}>
              <Posts userId={user.id} bookmark={true} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
