import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useParams } from "react-router-dom";
import app from "./firebase";
import Header from "./components/Header";
import "./ViewCommunity.css";
import Posts from "./components/Posts";

const db = getFirestore(app);
const auth = getAuth(app);

const ViewCommunity = () => {
  const { id } = useParams();

  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // COMMUNITY
        const communityRef = doc(db, "communities", id);
        const snap = await getDoc(communityRef);

        if (!snap.exists()) {
          setCommunity(null);
          setLoading(false);
          return;
        }

        const data = { id: snap.id, ...snap.data() };
        setCommunity(data);

        // POSTS
        const q = query(
          collection(db, "posts"),
          where("communityId", "==", id)
        );

        const postsSnap = await getDocs(q);

        const postsData = postsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPosts(postsData);
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleJoin = async () => {
    if (!auth.currentUser) return;

    const uid = auth.currentUser.uid;

    if (community.members?.includes(uid)) return;

    const ref = doc(db, "communities", id);

    await updateDoc(ref, {
      members: arrayUnion(uid),
    });

    setCommunity((prev) => ({
      ...prev,
      members: [...(prev.members || []), uid],
    }));
  };

  if (loading) return <p className="loading-text">Loading...</p>;
  if (!community) return <p className="not-found-text">Not found</p>;

  const isMod = community.modId === auth.currentUser?.uid;
  const isMember = community.members?.includes(auth.currentUser?.uid);

  return (
    <div className="view-community-page">
      <Header />

      <div className="view-community-container">
        <div className="view-community-card">
          <h1 className="view-community-title">{community.name}</h1>

          <p className="view-community-description">
            {community.description}
          </p>

          <p className="view-community-members">
            {community.members?.length || 0} members
          </p>

          {!isMod && !isMember && (
            <button className="join-btn" onClick={handleJoin}>
              JOIN
            </button>
          )}
        </div>

        <Posts communityId={id} />
      </div>
    </div>
  );
};

export default ViewCommunity;