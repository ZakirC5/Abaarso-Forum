import { Link } from "react-router-dom";
import "./SideBar.css";

function SideBar() {
  const items = [
    { label: "Dashboard", location: "/dashboard", icon: "https://www.svgrepo.com/show/502603/dashboard-2.svg" },
    { label: "Explore", location: "/explore", icon: "https://www.svgrepo.com/show/505378/explore.svg" },
    { label: "Create", location: "/create", icon: "https://www.svgrepo.com/show/463478/create-note.svg" },
    { label: "Saved", location: "/saved", icon: "https://www.svgrepo.com/show/533035/bookmark.svg" },
    { label: "Account", location: "/account", icon: "https://www.svgrepo.com/show/527946/user-circle.svg" },
    // { label: "Settings", location: "/settings", icon: "https://www.svgrepo.com/show/528592/settings.svg" },
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
