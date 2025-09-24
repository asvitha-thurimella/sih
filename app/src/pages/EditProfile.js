import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { useAuth } from "../contexts/AuthContext.js";


export default function EditProfile() {
  const { currentUser, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "",
    profession: "",
    location: "",
    experience: "",
  });
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(profile?.photoURL || "");

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        phone: profile.phone || "",
        gender: profile.gender || "",
        profession: profile.profession || "",
        location: profile.location || "",
        experience: profile.experience || "",
      });
      setPhotoPreview(profile.photoURL || "");
    }
  }, [profile]);

  async function handleSave(e) {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);

    let photoURL = photoPreview;

    // Upload to Cloudinary if new photo is selected
    if (photoFile) {
      try {
        const CLOUDINARY_URL =
          "https://api.cloudinary.com/v1_1/djlhr8crw/upload";
        const CLOUDINARY_UPLOAD_PRESET = "unsigned_preset";

        const formData = new FormData();
        formData.append("file", photoFile);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const res = await fetch(CLOUDINARY_URL, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.secure_url) photoURL = data.secure_url;
      } catch (err) {
        alert("Photo upload failed");
      }
    }

    try {
      await updateDoc(doc(db, "profiles", currentUser.uid), {
        ...form,
        photoURL,
      });

      // Navigate back depending on source
      if (location.state && location.state.fromMain) {
        navigate("/");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      alert("Error saving profile");
    }

    setSaving(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form
        onSubmit={handleSave}
        style={{
          background: "#fff",
          borderRadius: 24,
          boxShadow: "0 4px 24px #e9d5ff",
          padding: 32,
          minWidth: 340,
          maxWidth: 400,
          width: "100%",
        }}
      >
        <h2
          style={{
            fontWeight: 700,
            fontSize: "1.5em",
            color: "#7c3aed",
            marginBottom: 18,
            textAlign: "center",
          }}
        >
          Edit Profile
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Profile photo upload */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <label
              style={{ fontWeight: 500, color: "#7c3aed", marginBottom: 4 }}
            >
              Profile Photo
            </label>
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                overflow: "hidden",
                boxShadow: "0 2px 8px #ddd",
                marginBottom: 4,
              }}
            >
              <img
                src={photoPreview || "/default-avatar.png"}
                alt="Preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files[0]) {
                  setPhotoFile(e.target.files[0]);
                  setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                }
              }}
              style={{ marginTop: 2 }}
            />
          </div>

          {/* Form fields */}
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Name"
            style={inputStyle}
          />
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="Phone"
            style={inputStyle}
          />
          <input
            value={form.gender}
            onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
            placeholder="Gender"
            style={inputStyle}
          />
          <input
            value={form.profession}
            onChange={(e) =>
              setForm((f) => ({ ...f, profession: e.target.value }))
            }
            placeholder="Profession"
            style={inputStyle}
          />
          <input
            value={form.location}
            onChange={(e) =>
              setForm((f) => ({ ...f, location: e.target.value }))
            }
            placeholder="Location"
            style={inputStyle}
          />
          <input
            value={form.experience}
            onChange={(e) =>
              setForm((f) => ({ ...f, experience: e.target.value }))
            }
            placeholder="Experience (years)"
            style={inputStyle}
          />
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 24,
            justifyContent: "center",
          }}
        >
          <button
            type="submit"
            disabled={saving}
            style={{
              background: "#9333ea",
              color: "white",
              border: "none",
              borderRadius: 12,
              padding: "10px 28px",
              fontWeight: 500,
              fontSize: "1.1em",
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: "0 2px 8px #e9d5ff",
              transition: "0.2s",
            }}
          >
            {saving ? "Saving..." : "💾 Save"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (location.state && location.state.fromMain) {
                navigate("/");
              } else {
                navigate("/profile");
              }
            }}
            style={{
              background: "#e5e7eb",
              color: "#9333ea",
              border: "none",
              borderRadius: 12,
              padding: "10px 28px",
              fontWeight: 500,
              fontSize: "1.1em",
              cursor: "pointer",
              boxShadow: "0 2px 8px #e9d5ff",
              transition: "0.2s",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  border: "1px solid #ddd",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: "1em",
  outline: "none",
  boxShadow: "0 1px 4px #f3e8ff",
};
