// src/pages/WelcomePage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext.js";
import translations from "../translations.js";

export default function WelcomePage() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #0077b5, #00c6ff)",
        color: "white",
        textAlign: "center",
        padding: 20,
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: 20 }}>{t.welcome}</h1>

      <p style={{ fontSize: "1.2rem", maxWidth: 500, marginBottom: 30 }}>
        {lang === "en"
          ? "Create your profile, connect with others, and share your skills with the world!"
          : lang === "hi"
          ? "अपनी प्रोफ़ाइल बनाएँ, दूसरों से जुड़ें और अपनी स्किल्स दुनिया के साथ साझा करें!"
          : "మీ ప్రొఫైల్ సృష్టించండి, ఇతరులతో కనెక్ట్ అవ్వండి మరియు మీ నైపుణ్యాలను ప్రపంచంతో పంచుకోండి!"}
      </p>

      <button
        onClick={() => navigate("/create-profile")}
        style={{
          padding: "12px 20px",
          borderRadius: 8,
          background: "#fff",
          color: "#0077b5",
          border: "none",
          fontSize: "18px",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          transition: "all 0.2s ease-in-out",
        }}
        onMouseOver={(e) => (e.target.style.background = "#f0f0f0")}
        onMouseOut={(e) => (e.target.style.background = "#fff")}
      >
        {t.createProfile}
      </button>
    </div>
  );
}
