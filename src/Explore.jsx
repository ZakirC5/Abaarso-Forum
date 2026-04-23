import { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./components/Header";
const Posts = lazy(() => import("./components/Posts"));
import "./Explore.css";
import GoBackIcon from "../public/go-back.svg";

function Explore() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  return (
    <>
      <Header />

      <main>
        <div className="explore-container">
          <button className="go-back-btn" onClick={handleGoBack}>
            <img src={GoBackIcon} alt="Go Back" />
            <span>Go Back</span>
          </button>

          <Suspense fallback={<div className="loader">Loading posts…</div>}>
            <Posts />
          </Suspense>
        </div>
      </main>
    </>
  );
}

export default Explore;
