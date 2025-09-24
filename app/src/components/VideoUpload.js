// src/components/VideoUpload.js
import React, { useState } from "react";
import { auth, db } from "../firebase.js";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function VideoUpload({ profile }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState("");

  async function handleUpload() {
    try {
      if (!file) {
        alert("Please select a file first.");
        return;
      }

      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to upload.");
        return;
      }

      setUploading(true);

      // ✅ Upload file to Cloudinary
      const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/djlhr8crw/upload";
      const CLOUDINARY_UPLOAD_PRESET = "unsigned_preset";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.secure_url) throw new Error("Cloudinary upload failed");
      const fileURL = data.secure_url;

      // ✅ Save metadata to Firestore
      await addDoc(collection(db, "activities"), {
        userId: user.uid,
        userName: profile?.name || "Anonymous",
        userPhoto: profile?.photoURL || null,
        fileURL,
        fileType: file.type.startsWith("video") ? "video" : "image",
        createdAt: serverTimestamp(),
        location: profile?.location || "",
        profession: profile?.profession || "",
        description: description.trim(),
      });

      alert("✅ Uploaded successfully!");
      setFile(null);
      setDescription("");
    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ Error uploading file: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      style={{
        padding: 20,
        display: "flex",
        alignItems: "center",
        gap: 10,
        border: "1px solid #ddd",
        borderRadius: 10,
        marginBottom: 15,
        flexDirection: "column"
      }}
    >
      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      {/* Image preview */}
      {file && file.type.startsWith("image") && (
        <img
          src={URL.createObjectURL(file)}
          alt="preview"
          style={{ width: "100%", maxWidth: 400, margin: "10px 0", borderRadius: 8 }}
        />
      )}
      {/* Video preview */}
      {file && file.type.startsWith("video") && (
        <video
          src={URL.createObjectURL(file)}
          controls
          style={{ width: "100%", maxWidth: 400, margin: "10px 0", borderRadius: 8 }}
        />
      )}
      <textarea
        placeholder="Add a description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        rows={3}
        style={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 6,
          border: '1px solid #ccc',
          padding: '8px 10px',
          margin: '8px 0',
          fontSize: '1em',
          resize: 'vertical',
        }}
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{
          padding: "6px 12px",
          borderRadius: 6,
          background: uploading ? "#aaa" : "#28a745",
          color: "white",
          border: "none",
          cursor: uploading ? "not-allowed" : "pointer",
        }}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
} 