import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase.js"; // ✅ Added .js extension
import { useLanguage } from "../contexts/LanguageContext.js";
import translations from "../translations.js";

export const LOCATIONS = [
  "Bhimavaram",
  "Palakollu",
  "Tanuku",
  "Tadepalligudem",
  "Eluru",
  "Jangareddygudem",
  "Narasapuram",
  "Kovvur",
  "Rajahmundry",
  "Kakinada",
  "Samalkot",
  "Pithapuram",
  "Tuni",
  "Annavaram",
  "Amalapuram",
  "Mummidivaram",
];

export const PROFESSIONS = [
  "Beautician",
  "Tailoring",
  "Interior Design",
  "Photography",
  "Painting",
  "Carpentering",
  "HandLooms",
  "HandCrafts",
  "pottery",
  "Other",
];

export default function CreateProfile() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = translations[lang] || translations.en;

  const [photo, setPhoto] = useState(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [profession, setProfession] = useState("Beautician");
  const [customProfession, setCustomProfession] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [phone, setPhone] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setUploading(true);
      const user = auth.currentUser;
      if (!user) {
        alert(t.loginFailed);
        return;
      }

      let finalProfession = profession === "Other" ? customProfession : profession;
      if (!finalProfession) {
        alert("Please enter a profession.");
        return;
      }
      if (!location) {
        alert("Please select a location.");
        return;
      }

      let photoURL = null;
      if (photo) {
        const formData = new FormData();
        formData.append("file", photo);
        formData.append("upload_preset", "unsigned_preset");

        const res = await fetch("https://api.cloudinary.com/v1_1/djlhr8crw/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.secure_url) {
          photoURL = data.secure_url;
        }
      }

      await setDoc(doc(db, "profiles", user.uid), {
        name,
        age,
        gender,
        profession: finalProfession,
        location,
        experience,
        phone,
        photoURL,
        email: user.email,
      });

      alert("✅ " + t.profileCreated);
      navigate("/main");
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={titleStyle}>{t.createProfile}</h2>

        {/* Removed camera icon */}
        <label style={labelStyle}>{t.photo}</label>
        <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />

        <label style={labelStyle}>{t.name}</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />

        <label style={labelStyle}>{t.age}</label>
        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required style={inputStyle} />

        <label style={labelStyle}>{t.gender}</label>
        <select value={gender} onChange={(e) => setGender(e.target.value)} style={inputStyle}>
          <option value="Male">{t.genderMale}</option>
          <option value="Female">{t.genderFemale}</option>
          <option value="Other">{t.genderOther}</option>
        </select>

        <label style={labelStyle}>{t.profession}</label>
        <select value={profession} onChange={(e) => setProfession(e.target.value)} style={inputStyle} required>
          {PROFESSIONS.map((prof) => (
            <option key={prof} value={prof}>{prof}</option>
          ))}
        </select>
        {profession === "Other" && (
          <input
            type="text"
            placeholder="Enter your profession"
            value={customProfession}
            onChange={(e) => setCustomProfession(e.target.value)}
            style={inputStyle}
            required
          />
        )}
        <label style={labelStyle}>{t.location}</label>
        <select value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} required>
          <option value="">Select Location</option>
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        <label style={labelStyle}>{t.experience}</label>
        <input type="text" value={experience} onChange={(e) => setExperience(e.target.value)} style={inputStyle} />

        <label style={labelStyle}>{t.phone}</label>
        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />

        <button
          type="submit"
          disabled={uploading}
          style={{
            ...buttonStyle,
            background: uploading ? "#aaa" : "#a855f7",
            cursor: uploading ? "not-allowed" : "pointer",
          }}
        >
          {uploading ? t.uploading : t.createProfile}
        </button>
      </form>
    </div>
  );
}

// ✅ Styles
const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  background: "#f8f8f8",
  padding: 20,
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  background: "white",
  padding: "30px 25px",
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  width: 340,
  transition: "all 0.3s ease-in-out",
};

const titleStyle = {
  textAlign: "center",
  marginBottom: 15,
  color: "#333",
};

const labelStyle = {
  fontSize: "0.9rem",
  fontWeight: "500",
  color: "#444",
};

const inputStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: 8,
  outline: "none",
  fontSize: "1rem",
};

const buttonStyle = {
  marginTop: 10,
  padding: "12px 0",
  border: "none",
  borderRadius: 8,
  color: "white",
  fontWeight: "bold",
  fontSize: "1rem",
  transition: "all 0.3s ease",
};
