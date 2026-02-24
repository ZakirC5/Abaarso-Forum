import { useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import "./Account.css";
import SideBar from "./components/SideBar";
import Header from "./components/Header";

function Account() {
  const auth = getAuth();
  const db = getFirestore();

  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({
    description: "",
    twoFA: false,
    phone_number: "",
  });

  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [showPhoneNumberPopup, setShowPhoneNumberPopup] = useState(false);

  const [status, setStatus] = useState("");

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Description state
  const [descriptionEdit, setDescriptionEdit] = useState("");

  // Phone state
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setDescriptionEdit(data.description || "");
          setPhoneNumber(data.phone_number || "");
        } else {
          await setDoc(userRef, {
            description: "",
            twoFA: false,
            phone_number: "",
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

  const handlePhoneNumberSave = async () => {
    setStatus("");

    if (!phoneNumber) {
      setStatus("Phone number cannot be empty.");
      return;
    }

    const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

    if (!phoneRegex.test(phoneNumber)) {
      setStatus("Please enter a valid phone number.");
      return;
    }

    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);

      await updateDoc(userRef, {
        phone_number: phoneNumber,
      });

      setUserData((prev) => ({
        ...prev,
        phone_number: phoneNumber,
      }));

      setStatus("Phone number updated!");
      setShowPhoneNumberPopup(false);
    } catch (err) {
      setStatus("Error updating phone number: " + err.message);
    }
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
      <main>
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
              <p>
                <strong>Email:</strong> {user.email}
              </p>

              <div className="account-row">
                <span>
                  <strong>Password:</strong> {"•".repeat(10)}
                </span>
                <button
                  className="account-row-btn"
                  onClick={() => {
                    setStatus("");
                    setShowPasswordPopup(true);
                  }}
                >
                  Change
                </button>
              </div>

              <div className="account-row">
                <span>
                  <strong>Phone number:</strong>{" "}
                  {userData.phone_number || "Not added"}
                </span>
                <button
                  className="account-row-btn"
                  onClick={() => {
                    setStatus("");
                    setShowPhoneNumberPopup(true);
                  }}
                >
                  {userData.phone_number ? "Change" : "Add"}
                </button>
              </div>
            </div>

            <div className="account-description">
              <h3>About Me</h3>
              <textarea
                value={descriptionEdit}
                onChange={(e) => setDescriptionEdit(e.target.value)}
                placeholder="Tell us about yourself..."
              />
              <button className="description-save-btn" onClick={handleDescriptionSave}>
                Save
              </button>
            </div>

            <button className="account-logout-btn" onClick={handleLogout}>
              Log Out
            </button>
          </div>

          {/* Password Popup */}
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

          {/* Phone Number Popup */}
          {showPhoneNumberPopup && (
            <div className="popup-overlay">
              <div className="popup-card">
                <h3>
                  {userData.phone_number ? "Change Phone Number" : "Add Phone Number"}
                </h3>

                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />

                <div className="popup-buttons">
                  <button onClick={handlePhoneNumberSave}>Save</button>
                  <button onClick={() => setShowPhoneNumberPopup(false)}>
                    Cancel
                  </button>
                </div>

                {status && <p className="popup-status">{status}</p>}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default Account;
