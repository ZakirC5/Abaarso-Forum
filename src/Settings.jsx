import { useState } from "react";
import Header from "./components/Header";
import SideBar from "./components/SideBar";
import "./Settings.css";

function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState("blue");
  const [fontSize, setFontSize] = useState("medium");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showImages, setShowImages] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoPlayVideos, setAutoPlayVideos] = useState(false);

  const handleSave = () => {
    alert("Preferences saved!");
    // Optionally save to Firestore or localStorage
  };

  return (
    <>
      <Header />
      <SideBar />

      <div className="settings-container">
        <h2>Site Preferences</h2>

        <div className="settings-card">
          {/* Dark Mode */}
          <div className="settings-item">
            <label>Dark Mode</label>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
          </div>

          {/* Theme Color */}
          <div className="settings-item">
            <label>Theme Color</label>
            <select
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
            >
              <option value="blue">Blue</option>
              <option value="red">Red</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
            </select>
          </div>

          {/* Font Size */}
          <div className="settings-item">
            <label>Font Size</label>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          {/* Sidebar visibility */}
          <div className="settings-item">
            <label>Show Sidebar</label>
            <input
              type="checkbox"
              checked={showSidebar}
              onChange={() => setShowSidebar(!showSidebar)}
            />
          </div>

          {/* Show Images */}
          <div className="settings-item">
            <label>Show Images</label>
            <input
              type="checkbox"
              checked={showImages}
              onChange={() => setShowImages(!showImages)}
            />
          </div>

          {/* Notifications */}
          <div className="settings-item">
            <label>Enable Notifications</label>
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
            />
          </div>

          {/* Auto-play videos */}
          <div className="settings-item">
            <label>Auto-play Videos</label>
            <input
              type="checkbox"
              checked={autoPlayVideos}
              onChange={() => setAutoPlayVideos(!autoPlayVideos)}
            />
          </div>

          <button className="settings-save-btn" onClick={handleSave}>
            Save Preferences
          </button>
        </div>
      </div>
    </>
  );
}

export default Settings;
