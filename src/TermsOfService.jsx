import React, { useState, useEffect } from "react";
import { getFirestore, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "./firebase"; 
import "./TermsOfService.css";

const auth = getAuth(app);
const db = getFirestore(app);

const TermsOfService = () => {
  const [showModal, setShowModal] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(true);

  const fullTOS = `ABAARSO FORUM - TERMS OF SERVICE

BACKGROUND & DESCRIPTION
Abaarso forum aims to unify students of Abaarso in an encouraging way with student-based features. This student based website will enable students to assist each other, share their thoughts and provide a positive, entertaining, helpful, and supportive manner. 

The objective is to develop a community in which all members can assist each other, feel safe and valued and motivate each member to be involved. All activity on this site will be appropriate and adhere to the guidelines that are set by the school.

By accessing this website, each student agrees to serve as a contributing member of an inclusive community; where kindness and respect for others come first.

RULES AND GUIDELINES
1. I will treat all users with respect. 
2. I won't insult anyone or make fun of anyone.
3. All conversations will be kept appropriate and school-friendly.
4. I will not share harmful or inappropriate content.
5. I will respect everyone's privacy and I won't share any personal info.
6. I understand that by breaking the rules it may result in consequences or bans depending on the severity.

By checking the box below and clicking "Enter Forum", you acknowledge that you have read, understood, and agreed to be bound by these terms.`;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.termsAccepted !== true) {
              setShowModal(true);
            }
          } else {
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
      // We use setDoc with merge: true just in case the user document 
      // hasn't been initialized yet during signup.
      await setDoc(userRef, {
        termsAccepted: true,
        acceptedAt: new Date()
      }, { merge: true });
      
      setShowModal(false);
    } catch (error) {
      console.error("Update failed:", error);
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
          <textarea 
            className="tos-scroll-box" 
            readOnly 
            value={fullTOS}
          />
        </div>

        <div className="tos-footer">
          <label className="checkbox-container">
            <input 
              type="checkbox" 
              checked={accepted} 
              onChange={(e) => setAccepted(e.target.checked)} 
            />
            <span className="checkbox-text">I agree to the Terms of Service</span>
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