import React, { useState, useEffect } from "react";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "../firebase"; // Ensure this exports 'app'
import "./TermsOfService.css";

// 1. Move these OUTSIDE the component function
// This prevents the "getProvider" error by initializing them once globally
const auth = getAuth(app);
const db = getFirestore(app);

const TermsOfService = () => {
  const [showModal, setShowModal] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. State listener to handle the async nature of Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            // If they haven't accepted, lock the screen
            if (userData.termsAccepted !== true) {
              setShowModal(true);
            }
          } else {
            // New user with no doc yet? Show them the terms.
            setShowModal(true);
          }
        } catch (error) {
          console.error("Firestore lookup failed:", error);
        }
      } else {
        setShowModal(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAccept = async () => {
    if (!accepted) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        termsAccepted: true,
        acceptedAt: new Date()
      });
      setShowModal(false);
    } catch (error) {
      console.error("Update failed:", error);
      // If updateDoc fails (e.g. doc doesn't exist), you might need setDoc
    }
  };

  if (loading || !showModal) return null;

  return (
    <div className="tos-overlay">
      <div className="tos-modal">
        <div className="tos-header">
          <h2>Terms of Service</h2>
          <span className="tos-brand">Abaarso Forum</span>
        </div>
        <div className="tos-body">
          <p>Abaarso forum aims to unify students of Abaarso in an encouraging way...</p>
          <ul className="tos-list">
            <li>I will treat all users with respect.</li>
            <li>I won't insult anyone or make fun of anyone.</li>
            <li>All conversations will be school-friendly.</li>
          </ul>
        </div>
        <div className="tos-footer">
          <label className="checkbox-container">
            <input 
              type="checkbox" 
              checked={accepted} 
              onChange={(e) => setAccepted(e.target.checked)} 
            />
            I agree to the Terms of Service
          </label>
          <button 
            className="accept-btn" 
            disabled={!accepted} 
            onClick={handleAccept}
          >
            Enter Forum
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;