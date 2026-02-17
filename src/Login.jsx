import { useState } from "react";
import app from "./firebase.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import "./Login.css";

const auth = getAuth(app);
const db = getFirestore(app);

const ALLOWED_DOMAINS = ["studentabaarso.org", "abaarso.org"];

function Login() {
  const [error, setError] = useState("");

  async function signInWithGoogle() {
    setError(""); // reset old error
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const email = user.email || "";
      const domain = email.split("@")[1];

      if (!ALLOWED_DOMAINS.includes(domain)) {
        await signOut(auth);
        setError(
          "Please sign in using your @studentabaarso.org or @abaarso.org email."
        );
        return;
      }

      await setDoc(
        doc(db, "users", user.uid),
        {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );

      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setError("Google sign-in failed. Please try again.");
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>Sign in</h2>
        <p className="login-subtext">abaarso accounts only</p>

        <button className="google-btn" onClick={signInWithGoogle}>
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
          />
          <span>Continue with Google</span>
        </button>

        {error && <div className="login-error">{error}</div>}
      </div>
    </div>
  );
}

export default Login;
