import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import app from './firebase.js'
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "./Create.css"; // reuse your Create.css
import SideBar from "./components/SideBar";
import Header from "./components/Header";

function EditPost() {
  const { id } = useParams(); // get post ID from URL
  const db = getFirestore(app);
  const auth = getAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      const postRef = doc(db, "posts", id);
      const postSnap = await getDoc(postRef);

      if (!postSnap.exists()) {
        setStatus("Post not found!");
        return;
      }

      const data = postSnap.data();
      // optional: check if current user is owner
      if (auth.currentUser?.uid !== data.userId) {
        setStatus("You cannot edit this post.");
        return;
      }

      setTitle(data.title || "");
      setSubtitle(data.subtitle || "");
      setTags((data.tags || []).join(", "));
      setImage(data.image || "");
      setBody(data.body || "");
    };

    fetchPost();
  }, [id, db, auth.currentUser]);

  const handleUpdate = async () => {
    if (!title.trim()) {
      setStatus("Title is required.");
      return;
    }

    try {
      const postRef = doc(db, "posts", id);
      await updateDoc(postRef, {
        title,
        subtitle,
        tags: tags.split(",").map((t) => t.trim()).filter((t) => t),
        image,
        body,
      });
      setStatus("Post updated!");
      navigate("/dashboard"); // redirect back to dashboard or posts page
    } catch (err) {
      setStatus("Error updating post: " + err.message);
    }
  };

  return (
    <>
      <Header />
      <SideBar />

      <div className="create-container">
        <div className="create-card">
          <h2>Edit Post</h2>

          <input
            className="create-input"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="create-input"
            placeholder="Subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />

          <input
            className="create-input"
            placeholder="Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />

          <input
            className="create-input"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <textarea
            className="create-textarea"
            placeholder="Write your post body..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />

          <button className="create-btn" onClick={handleUpdate}>
            Save Changes
          </button>

          {status && <p className="create-status">{status}</p>}
        </div>
      </div>
    </>
  );
}

export default EditPost;
