import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import "./Account.css";
import SideBar from "./components/SideBar";
import Header from "./components/Header";

function Account() {
  const auth = getAuth();
  const db = getFirestore();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ description: "", twoFA: false });
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [status, setStatus] = useState("");

  // Password popup states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Description edit state
  const [descriptionEdit, setDescriptionEdit] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
          setDescriptionEdit(docSnap.data().description || "");
        } else {
          await setDoc(userRef, {
            description: "",
            twoFA: false,
          });
        }
      }
    });

    return () => unsub();
  }, [auth, db]);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  const handlePasswordChange = async () => {
    setStatus("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setStatus("Please fill all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus("New passwords do not match.");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setStatus("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordPopup(false);
    } catch (err) {
      setStatus("Error updating password: " + err.message);
    }
  };

  const handleDescriptionSave = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { description: descriptionEdit });
    setUserData((prev) => ({ ...prev, description: descriptionEdit }));
    setStatus("Description updated!");
  };

  if (!user) {
    return (
      <div className="account-loading">
        <h2>Loading account...</h2>
      </div>
    );
  }

  return (
    <>
      <Header />
      <SideBar />

      <div className="account-container">
        <div className="account-card">
          <img
            className="account-profile"
            src={
              user.photoURL ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMY39csS26WQTGf0yIsPCWJFklLUt7AWFL7Q&s"
            }
            alt="Profile"
          />

          <h2>{user.displayName || "Anonymous User"}</h2>

          <div className="account-info">
            <p><strong>Email:</strong> {user.email}</p>

            <div className="account-row">
              <span><strong>Password:</strong> {"•".repeat(10)}</span>
              <button
                className="account-row-btn"
                onClick={() => setShowPasswordPopup(true)}
              >
                Change
              </button>
            </div>

            <div className="account-row">
              <span><strong>2FA:</strong> {userData.twoFA ? "Enabled" : "Disabled"}</span>
              <button className="account-row-btn">Enable</button>
            </div>
          </div>

          <div className="account-description">
            <h3>About Me</h3>
            <textarea
              value={descriptionEdit}
              onChange={(e) => setDescriptionEdit(e.target.value)}
              placeholder="Tell us about yourself..."
            />
            <button className="description-save-btn" onClick={handleDescriptionSave}>Save</button>
          </div>

          <button className="account-logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </div>

        {/* Password popup */}
        {showPasswordPopup && (
          <div className="popup-overlay">
            <div className="popup-card">
              <h3>Change Password</h3>
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div className="popup-buttons">
                <button onClick={handlePasswordChange}>Save</button>
                <button onClick={() => setShowPasswordPopup(false)}>Cancel</button>
              </div>
              {status && <p className="popup-status">{status}</p>}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Account;
