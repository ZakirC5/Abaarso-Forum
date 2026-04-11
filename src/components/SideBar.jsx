import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./SideBar.css";

// Icons
import DashboardIcon from "../../public/dashboard-2.svg"
import ExploreIcon from "../../public/explore.svg"
import CreateNoteIcon from "../../public/create-note.svg"
import BookmarkIcon from "../../public/bookmark.svg"
import AccountIcon from "../../public/user-circle.svg"
import SettingsIcon from "../../public/settings.svg"
import LogoImage from "../assets/logo.webp"; // Make sure this path is correct

function SideBar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const mainItems = [
    { label: "Dashboard", path: "/dashboard", icon: DashboardIcon },
    { label: "Explore", path: "/explore", icon: ExploreIcon },
    { label: "Create", path: "/create", icon: CreateNoteIcon }
  ];

  const bottomItems = [
    { label: "Account", path: "/account", icon: AccountIcon },
  ];

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Hamburger Button for Mobile */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
      </button>

      {/* Dimmed background when mobile menu is open */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img src={LogoImage} alt="Logo" />
          <span>Abaarso Forum</span>
        </div>

        <ul className="sidebar-list">
          {mainItems.map((item) => (
            <li className="sidebar-item" key={item.label}>
              <Link
                to={item.path}
                className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <img src={item.icon} alt="" className="sidebar-icon" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="sidebar-divider" />

        <ul className="sidebar-list">
          {bottomItems.map((item) => (
            <li className="sidebar-item" key={item.label}>
              <Link
                to={item.path}
                className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <img src={item.icon} alt="" className="sidebar-icon" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

export default SideBar;