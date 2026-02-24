import { useState } from "react";
import app from "./firebase.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
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

  // Recovery states
  const [showRecover, setShowRecover] = useState(false);
  const [recoverMode, setRecoverMode] = useState(""); // "email" or "phone"
  const [recoverEmail, setRecoverEmail] = useState("");
  const [recoverPhone, setRecoverPhone] = useState("");
  const [recoverStatus, setRecoverStatus] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [otp, setOtp] = useState("");

  // ---------------------------
  // Google Sign In
  // ---------------------------
  async function signInWithGoogle() {
    setError("");
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
          phone_number: user.phoneNumber || "",
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

  // ---------------------------
  // Email Recovery
  // ---------------------------
  async function handleEmailRecovery() {
    setRecoverStatus("");

    if (!recoverEmail) {
      setRecoverStatus("Please enter your email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, recoverEmail);
      setRecoverStatus("Password reset email sent.");
    } catch (err) {
      console.error(err);
      setRecoverStatus("Email recovery failed.");
    }
  }

  // ---------------------------
  // Phone Recovery (Send OTP)
  // ---------------------------
  async function handlePhoneRecovery() {
    setRecoverStatus("");

    if (!recoverPhone) {
      setRecoverStatus("Enter your phone number in +country format.");
      return;
    }

    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          { size: "invisible" }
        );
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        recoverPhone,
        window.recaptchaVerifier
      );

      setVerificationId(confirmationResult.verificationId);
      setRecoverStatus("Verification code sent to your phone.");
    } catch (err) {
      console.error(err);
      setRecoverStatus("Phone recovery failed.");
    }
  }

  // ---------------------------
  // Verify OTP
  // ---------------------------
  async function verifyOtp() {
    try {
      const credential = PhoneAuthProvider.credential(
        verificationId,
        otp
      );

      await signInWithCredential(auth, credential);
      setRecoverStatus("Phone verified. You are now signed in.");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setRecoverStatus("Invalid verification code.");
    }
  }

  return (
    <main>
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

          {/* ---------------- Recover Section ---------------- */}
          <button
            className="recover-btn"
            onClick={() => {
              setShowRecover(!showRecover);
              setRecoverMode("");
              setRecoverStatus("");
              setVerificationId("");
            }}
          >
            Forgot Account?
          </button>

          {showRecover && (
            <div className="recover-box">
              {!recoverMode && (
                <>
                  <button onClick={() => setRecoverMode("email")}>
                    Recover with Email
                  </button>

                  <button onClick={() => setRecoverMode("phone")}>
                    Recover with Phone
                  </button>
                </>
              )}

              {recoverMode === "email" && (
                <>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={recoverEmail}
                    onChange={(e) => setRecoverEmail(e.target.value)}
                  />
                  <button onClick={handleEmailRecovery}>
                    Send Reset Email
                  </button>
                </>
              )}

              {recoverMode === "phone" && (
                <>
                  <input
                    type="tel"
                    placeholder="Enter phone number (+123...)"
                    value={recoverPhone}
                    onChange={(e) => setRecoverPhone(e.target.value)}
                  />
                  <button onClick={handlePhoneRecovery}>
                    Send Verification Code
                  </button>

                  {verificationId && (
                    <>
                      <input
                        type="text"
                        placeholder="Enter SMS code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                      <button onClick={verifyOtp}>
                        Verify Code
                      </button>
                    </>
                  )}

                  <div id="recaptcha-container"></div>
                </>
              )}

              {recoverStatus && (
                <div className="login-error">{recoverStatus}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Login;
