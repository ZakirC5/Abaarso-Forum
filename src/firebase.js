import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Your Firebase config (from Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyBo7iPlzS6tt7Z-lHuIs4rsf0yC1KIMVGM",
  authDomain: "abaarsoforum.firebaseapp.com",
  projectId: "abaarsoforum",
  storageBucket: "abaarsoforum.firebasestorage.app",
  messagingSenderId: "105767925270",
  appId: "1:105767925270:web:0b4567c1c4534114962737",
  measurementId: "G-3ETBJZDKL2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("6Lf1DnYsAAAAACTnI3U0cUKRkkBex4rOeXjDJpjV"),
  isTokenAutoRefreshEnabled: true
});

export default app