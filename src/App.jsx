import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

// Lazy-loaded pages
const Home = lazy(() => import("./Home"));
const Login = lazy(() => import("./Login"));
const Dashboard = lazy(() => import("./Dashboard"));
const Create = lazy(() => import("./Create"));
const Account = lazy(() => import("./Account"));
const EditPost = lazy(() => import("./EditPost"));
const ViewPost = lazy(() => import("./ViewPost"));
const SavedPosts = lazy(() => import("./SavedPosts"));
const Explore = lazy(() => import("./Explore"));
const Settings = lazy(() => import("./Settings"));

function App() {
  return (
    <Router>
      <Suspense fallback={<div style={{ padding: "2rem" }}>Loading page…</div>}>
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
      </Suspense>
    </Router>
  );
}

export default App;