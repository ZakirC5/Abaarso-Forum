import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  getFirestore,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import app from "./firebase.js";
import { Link, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import "./Community.css";
import { getAuth } from "firebase/auth";

const db = getFirestore(app);
const auth = getAuth(app);

const Community = () => {
  const [communities, setCommunities] = useState([]);
  const navigate = useNavigate();

  const JoinCommunity = async (communityId) => {
    const user = auth.currentUser;

    if (!user) {
      alert("You must be logged in");
      return;
    }

    try {
      // update community
      const communityRef = doc(db, "communities", communityId);
      await updateDoc(communityRef, {
        members: arrayUnion(user.uid),
      });

      // update user
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        joinedCommunities: arrayUnion(communityId),
      });

      console.log("Joined successfully");
    } catch (err) {
      console.error("Join error:", err);
    }
  };

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "communities"));
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

  const user = auth.currentUser;

  return (
    <div className="community-page">
      <Header />

      {/* Create Button */}
      <div className="community-header">
        <button
          className="create-btn"
          onClick={() => navigate("/create-community")}
        >
          Create Community
        </button>
      </div>

      {/* Communities List */}
      <div className="community-list">
        {communities.map((community) => {
          const isMod = community.modId === user?.uid;
          const isMember = community.members?.includes(user?.uid);
          const isJoined = isMod || isMember;

          return (
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
                    {community.members?.length || 0} people
                  </div>
                </div>

                {isJoined ? (
                  <button
                    className="join-btn"
                    onClick={() => navigate(`/community/${community.id}`)}
                  >
                    VIEW
                  </button>
                ) : (
                  <button
                    className="join-btn"
                    onClick={() => JoinCommunity(community.id)}
                  >
                    JOIN
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Community;