import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import app from "./firebase.js"; // you forgot this earlier
import { Link } from "react-router-dom";
import Header from "./components/Header";
import "./Community.css";

const Community = () => {
  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const querySnapshot = await getDocs(collection(app, "communities"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCommunities(data);
      } catch (error) {
        console.error("Error fetching communities:", error);
      }
    };

    fetchCommunities();
  }, []);

  return (
    <div className="community-page">
      <Header />

      {/* Create Button */}
      <div className="community-header">
        <button
          className="create-btn"
          onClick={() => (window.location.href = "/create-community")}
        >
          Create Community
        </button>
      </div>

      {/* Communities List */}
      <div className="community-list">
        {communities.map((community) => (
          <div key={community.id} className="community-item">
            <div className="community-row">
              <div className="community-info">
                <Link
                  to={`/community/${community.id}`}
                  className="community-name"
                >
                  {community.name}
                </Link>

                <div className="community-description">
                  {community.description}
                </div>

                <div className="community-members">
                  {community.membersCount || 0} people
                </div>
              </div>

              <button className="join-btn">JOIN</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;