import { useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Posts from "./components/Posts";
import "./Explore.css";

const goBackIcon = "https://www.svgrepo.com/show/376074/go-back.svg";

function Explore() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  return (
    <>
      <Header />

      <div className="explore-container">
        <button className="go-back-btn" onClick={handleGoBack}>
          <img src={goBackIcon} alt="Go Back" />
          <span>Go Back</span>
        </button>

        {/* Show all posts */}
        <Posts />
      </div>
    </>
  );
}

export default Explore;
