import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Create from "./Create";
import Account from "./Account";
import EditPost from "./EditPost";
import ViewPost from "./ViewPost";
import SavedPosts from "./SavedPosts";
import Explore from "./Explore";
import Settings from "./Settings";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/create" element={<Create />} />
        <Route path="/account" element={<Account />} />
        <Route path="/edit/:id" element={<EditPost />} />
        <Route path="/view/:id" element={<ViewPost />} />
        <Route path="/saved" element={<SavedPosts />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
