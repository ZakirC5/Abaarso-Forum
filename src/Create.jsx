import { useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import app from "./firebase.js";
import "./Create.css";
import SideBar from "./components/SideBar";
import Header from "./components/Header";

const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });

function Create() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");

  const [aiPopupOpen, setAiPopupOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const db = getFirestore();
  const auth = getAuth();

  const submit = async () => {
    const user = auth.currentUser;
    if (!user) {
      setStatus("You must be logged in to post.");
      return;
    }
    if (!title.trim()) {
      setStatus("Title is required.");
      return;
    }

    try {
      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        title,
        subtitle,
        tags: tags.split(",").map(t => t.trim()).filter(t => t.length > 0),
        body,
        image,
        createdAt: serverTimestamp()
      });

      setStatus("Post created successfully!");
      setTitle("");
      setSubtitle("");
      setTags("");
      setImage("");
      setBody("");
    } catch (e) {
      setStatus("Error creating post.");
    }
  };

  const generateAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiOutput("Generating...");

    try {
      const response = await model.generateContent(aiPrompt);
      setAiOutput(response.response.text);
    } catch (err) {
      console.error(err);
      setAiOutput("Error generating AI text.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      <Header />
      <SideBar />

      <div className="create-container">
        <div className="create-card">
          <h2>Create New Post</h2>

          {/* AI Icon */}
          <abbr title="Create with Gemini">
            <img
                src="https://static.vecteezy.com/system/resources/previews/055/687/065/non_2x/gemini-google-icon-symbol-logo-free-png.png"
                alt="AI"
                className="ai-icon"
                onClick={() => setAiPopupOpen(true)}
            />
          </abbr> 

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

          <button className="create-btn" onClick={submit}>
            Publish Post
          </button>

          {status && <p className="create-status">{status}</p>}
        </div>
      </div>

      {/* AI Popup */}
      {aiPopupOpen && (
        <div className="ai-popup-backdrop" onClick={() => setAiPopupOpen(false)}>
          <div className="ai-popup" onClick={(e) => e.stopPropagation()}>
            <h3>AI Assistant</h3>
            <textarea
              className="ai-prompt"
              placeholder="Enter prompt here..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <button className="create-btn" onClick={generateAI} disabled={aiLoading}>
              {aiLoading ? "Generating..." : "Generate"}
            </button>
            <textarea
              className="ai-output"
              placeholder="AI output will appear here..."
              value={aiOutput}
              readOnly
            />
            <button className="create-btn" onClick={() => setAiPopupOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Create;
