// src/pages/Signup.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase.js";
import { useLanguage } from "../contexts/LanguageContext.js";
import translations from "../translations.js";

export default function Signup() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      await setDoc(doc(db, "users", cred.user.uid), {
        name: form.name,
        email: form.email,
        lang,
        createdAt: serverTimestamp(),
      });

      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        alert("This email is already registered. Please login instead.");
      } else if (err.code === "auth/weak-password") {
        alert("Password should be at least 6 characters.");
      } else {
        alert("Signup failed: " + err.message);
      }
    }
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>{t.signup}</h2>
        <form onSubmit={handleSubmit} style={formStyle}>
          <input
            placeholder={t.name}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            style={inputStyle}
          />
          <input
            placeholder={t.email}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={inputStyle}
          />
          <input
            placeholder={t.password}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            style={inputStyle}
          />
          <button type="submit" style={submitButtonStyle}>
            {t.submit}
          </button>
        </form>

        <p style={textBelowStyle}>
          {t.alreadyHaveAccount || "Already have an account?"}
        </p>
        <button
          type="button"
          onClick={() => navigate("/login")}
          style={secondaryButtonStyle}
        >
          {t.login}
        </button>
      </div>
    </div>
  );
}

// 🎨 Colors changed to match your screenshot
const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: "#f9fafb", // ✅ light gray background (instead of gradient)
  padding: "20px",
};

const cardStyle = {
  width: "100%",
  maxWidth: 380,
  background: "#ffffff", // ✅ pure white card
  padding: "35px 28px",
  borderRadius: 20,
  boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
  textAlign: "center",
};

const titleStyle = {
  marginBottom: 25,
  color: "#111827", // ✅ darker gray for text
  fontSize: "1.9rem",
  fontWeight: "700",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 15,
};

const inputStyle = {
  padding: "14px",
  borderRadius: 10,
  border: "1px solid #d1d5db", // ✅ lighter border
  backgroundColor: "#fff",
  fontSize: "1rem",
  outline: "none",
  transition: "all 0.2s ease",
};

const submitButtonStyle = {
  marginTop: 10,
  padding: "14px",
  borderRadius: 10,
  border: "none",
  background: "#a855f7", // ✅ single flat purple color
  color: "#fff",
  fontSize: "1rem",
  fontWeight: "600",
  cursor: "pointer",
  transition: "background 0.2s ease",
  boxShadow: "0px 4px 6px rgba(124,58,237,0.2)", // ✅ soft purple shadow
};

const secondaryButtonStyle = {
  marginTop: 12,
  padding: "12px",
  borderRadius: 10,
  border: "1px solid #7c3aed", // ✅ purple border
  background: "#fff",
  color: "#a855f7",
  fontSize: "0.95rem",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const textBelowStyle = {
  marginTop: 18,
  fontSize: "0.9rem",
  color: "#6b7280", // ✅ subtle gray
};
