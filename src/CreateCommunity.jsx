import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import app from "./firebase";
import { useNavigate } from "react-router-dom";
import Header from "./components/Header";
import { getFirestore } from "firebase/firestore";
import "./CreateCommunity.css";

const db = getFirestore(app);
const auth = getAuth(app);

const CreateCommunity = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      alert("Please fill in all fields");
      return;
    }

    if (!auth.currentUser) {
      alert("You must be logged in");
      return;
    }

    setLoading(true);

    try {
      const docRef = await addDoc(collection(db, "communities"), {
        name,
        description,
        modId: auth.currentUser.uid,
        members: [auth.currentUser.uid],
        membersCount: 1,
        createdAt: serverTimestamp(),
      });

      navigate(`/community/${docRef.id}`);
    } catch (error) {
      console.error("Error creating community:", error);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="create-community-page">
      <Header />

      <div className="create-community-container">
        <h2>Create Community</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Community Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
            />
          </div>

          <button className="create-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Community"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunity;