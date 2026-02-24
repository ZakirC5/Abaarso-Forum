import { Link } from "react-router-dom";
import "./SideBar.css";

import DashboardIcon from "../../public/dashboard-2.svg"
import ExploreIcon from "../../public/explore.svg"
import CreateNoteIcon from "../../public/create-note.svg"
import BookmarkIcon from "../../public/bookmark.svg"
import AccountIcon from "../../public/user-circle.svg"
import SettingsIcon from "../../public/settings.svg"

function SideBar() {
  const items = [
    { label: "Dashboard", location: "/dashboard", icon: DashboardIcon },
    { label: "Explore", location: "/explore", icon: ExploreIcon },
    { label: "Create", location: "/create", icon: CreateNoteIcon },
    { label: "Saved", location: "/saved", icon: BookmarkIcon },
    { label: "Account", location: "/account", icon: AccountIcon },
    { label: "Settings", location: "/settings", icon: SettingsIcon },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-title">Abaarso Forum</div>

      <ul className="sidebar-list">
        {items.map((item) => (
          <li className="sidebar-item" key={item.label}>
            <Link to={item.location} className="sidebar-link">
              <img src={item.icon} alt={item.label} className="sidebar-icon" />
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SideBar;
