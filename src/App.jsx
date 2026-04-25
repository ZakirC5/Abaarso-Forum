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
const Community = lazy(() => import("./Community"));
const CreateCommunity = lazy(() => import("./CreateCommunity"));
const ViewCommunity = lazy(() => import("./ViewCommunity"));
const Admin = lazy(() => import("./Admin"));

function App() {
  return (
    <Router>
      <Suspense fallback={<div style={{ padding: "2rem" }}>Loading page…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/:id" element={<ViewCommunity />} />
          <Route path="/create-community" element={<CreateCommunity />} />
          <Route path="/create" element={<Create />} />
          <Route path="/account" element={<Account />} />
          <Route path="/edit/:id" element={<EditPost />} />
          <Route path="/view/:id" element={<ViewPost />} />
          <Route path="/saved" element={<SavedPosts />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;