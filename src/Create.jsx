import { lazy, useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import app from "./firebase.js";
import "./Create.css";
import SideBar from "./components/SideBar";
import Header from "./components/Header";
import GeminiLogo from "./assets/gemini-logo.webp"
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
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
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
      console.error(e);
      setStatus("Error creating post.");
    }
  };

  const generateAI = async () => {
    if (!aiPrompt.trim()) return;

    setAiLoading(true);

    try {
      const structuredPrompt = `
Return the response EXACTLY in this format:

TITLE: <title>
SUBTITLE: <subtitle>
TAGS: <comma separated tags>
BODY: <main content>

Topic:
${aiPrompt}
      `.trim();

      const response = await model.generateContent(structuredPrompt);

      let text = "";
      if (response?.response?.text) {
        text =
          typeof response.response.text === "function"
            ? response.response.text()
            : response.response.text;
      }

      if (!text || typeof text !== "string") return;

      const titleMatch = text.match(/^TITLE:\s*(.+)$/m);
      const subtitleMatch = text.match(/^SUBTITLE:\s*(.+)$/m);
      const tagsMatch = text.match(/^TAGS:\s*(.+)$/m);
      const bodyMatch = text.match(/^BODY:\s*([\s\S]*)$/m);

      if (titleMatch) setTitle(titleMatch[1].trim());
      if (subtitleMatch) setSubtitle(subtitleMatch[1].trim());
      if (tagsMatch) setTags(tagsMatch[1].trim());
      if (bodyMatch) setBody(bodyMatch[1].trim());

      setAiPopupOpen(false);

    } catch (err) {
      console.error("AI Generation Error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      <Header />
      <SideBar />
      <main>
        <div className="create-container">
          <div className="create-card">
            <h2>Create New Post</h2>

            <abbr title="Create with Gemini">
              <img
                src={GeminiLogo}
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

        {aiPopupOpen && (
          <div
            className="ai-popup-backdrop"
            onClick={() => !aiLoading && setAiPopupOpen(false)}
          >
            <div
              className="ai-popup"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>AI Assistant</h3>

              <textarea
                className="ai-prompt"
                placeholder="Enter prompt here..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={aiLoading}
              />

              <button
                className="create-btn"
                onClick={generateAI}
                disabled={aiLoading}
              >
                Generate
              </button>

              {aiLoading && (
                <p style={{ marginTop: "10px" }}>
                  Generating...
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default Create;