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
import { onAuthStateChanged } from "firebase/auth";

const db = getFirestore(app);
const auth = getAuth(app);

const Community = () => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [communities, setCommunities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  const DeleteCommunity = async (communityId) => {
    const user = auth.currentUser;

    if (!user) {
      alert("You must be logged in");
      return;
    }

    try {
      const communityRef = doc(db, "communities", communityId);
      const communitySnap = await getDocs(communityRef);
      const communityData = communitySnap.data();

      if (communityData.modId !== user.uid) {
        alert("Only the creator can delete this community");
        return;
      }

      await deleteDoc(communityRef);

      console.log("Deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
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
      { authLoading ? <div style={{ paddingTop: "120px", textAlign: "center" }}> Loading... </div> 
      : <div className="community-list">
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

                <div className="community-actions">
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

                  {isMod && (
                    <button
                      className="delete-btn"
                      onClick={() => DeleteCommunity(community.id)}
                    >
                      DELETE
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>}
    </div>
  );
};

export default Community;