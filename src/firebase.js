import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Your Firebase config (from Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyAEk1sKclRtpRS2_NG-497W9MvHO8nIGXc",
  authDomain: "forumvibe-4cd2d.firebaseapp.com",
  projectId: "forumvibe-4cd2d",
  storageBucket: "forumvibe-4cd2d.firebasestorage.app",
  messagingSenderId: "68181642274",
  appId: "1:68181642274:web:da2e416c794205d5788e7b",
  measurementId: "G-CDEFDZ1SEW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("6Ledom4sAAAAAAFPz2vO16310SjInzobJQXhxVYM"),
  isTokenAutoRefreshEnabled: true
});

export default app