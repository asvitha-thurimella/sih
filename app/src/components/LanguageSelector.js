// src/components/LanguageSelector.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext.js";
import translations from "../translations.js";

export default function LanguageSelector() {
  const navigate = useNavigate();
  const { setLang } = useLanguage();
  const [selectedLang, setSelectedLang] = useState("en");

  // ✅ Languages without flags
  const languages = [
    { label: "English", value: "en" },
    { label: "हिन्दी", value: "hi" },
    { label: "తెలుగు", value: "te" },
    { label: "ಕನ್ನಡ", value: "kn" },
    { label: "മലയാളം", value: "ml" },
    { label: "தமிழ்", value: "ta" },
    { label: "বাংলা", value: "bn" },
  ];

  function handleContinue() {
    setLang(selectedLang);
    navigate("/signup");
  }

  // Styles
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#ffffff",
    padding: "24px 20px",
    fontFamily: "'Segoe UI', sans-serif",
  };

  const contentStyle = {
    width: "100%",
    maxWidth: "340px", // 👈 slightly narrower for mobile look
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  };

  const titleStyle = {
    fontSize: "22px",
    fontWeight: "700",
    textAlign: "center",
    color: "#111827",
  };

  const subtitleStyle = {
    fontSize: "14px",
    textAlign: "center",
    color: "#6b7280",
    marginBottom: "12px",
  };

  const cardStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  };

  const optionStyle = (isSelected) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    border: isSelected ? "2px solid #a855f7" : "1px solid #e5e7eb",
    borderRadius: "12px",
    backgroundColor: isSelected ? "#f5f3ff" : "#f9fafb",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "500",
    color: "#111827",
    transition: "0.2s ease-in-out",
  });

  const continueButton = {
    backgroundColor: "#a855f7",
    color: "#fff",
    padding: "14px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    textAlign: "center",
    cursor: "pointer",
    border: "none",
    marginTop: "8px",
    width: "100%",
    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <h2 style={titleStyle}>Choose your language</h2>
        <p style={subtitleStyle}>Select your preferred language to continue</p>

        <div style={cardStyle}>
          {languages.map((lang) => {
            const isSelected = selectedLang === lang.value;
            return (
              <div
                key={lang.value}
                style={optionStyle(isSelected)}
                onClick={() => setSelectedLang(lang.value)}
              >
                <span>{lang.label}</span>
                <span>{isSelected ? "✅" : "⭕"}</span>
              </div>
            );
          })}
        </div>

        <button style={continueButton} onClick={handleContinue}>
          Continue →
        </button>
      </div>
    </div>
  );
}
