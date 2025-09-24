// src/pages/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase.js";
import { useLanguage } from "../contexts/LanguageContext.js";
import translations from "../translations.js";

export default function Login() {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate("/main");
    } catch (err) {
      console.error(err);
      alert("Login failed: " + err.message);
    }
  }

  async function handleGoogleLogin() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/main");
    } catch (err) {
      console.error("Google login error:", err);
      alert("Google login failed: " + err.message);
    }
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>{t.login}</h2>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={formStyle}>
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

        <div style={dividerStyle}>or</div>

        {/* Google Login Button */}
        <button onClick={handleGoogleLogin} style={googleButtonStyle}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 533.5 544.3"
            style={{ width: 18, height: 18, marginRight: 8 }}
          >
            <path
              fill="#4285F4"
              d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.2H272v95h147.5c-6.4 34.4-25.5 63.5-54.5 83.1v68h87.9c51.6-47.6 80.6-118 80.6-195.9z"
            />
            <path
              fill="#34A853"
              d="M272 544.3c73.7 0 135.6-24.4 180.8-66.1l-87.9-68c-24.5 16.5-55.8 26-92.9 26-71.4 0-132-48.1-153.7-112.8H27.1v70.9C72.3 486.7 164.8 544.3 272 544.3z"
            />
            <path
              fill="#FBBC05"
              d="M118.3 323.4c-10.8-32.4-10.8-67.6 0-100l-91.2-70.9c-39.8 78.8-39.8 164 0 242.8l91.2-71.9z"
            />
            <path
              fill="#EA4335"
              d="M272 107.6c39.9-.6 77.8 14.4 106.9 41.7l79.8-79.8C407.6 24.3 345.7 0 272 0 164.8 0 72.3 57.5 27.1 150.6l91.2 70.9C140 155.6 200.6 107.6 272 107.6z"
            />
          </svg>
          Continue with Google
        </button>

        <p style={textBelowStyle}>Don't have an account?</p>
        <button
          type="button"
          onClick={() => navigate("/signup")}
          style={secondaryButtonStyle}
        >
          {t.signup}
        </button>
      </div>
    </div>
  );
}

// ✅ Updated Styles (White Background + Purple Buttons)
const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: "#ffffff", // White background
  padding: "20px",
};

const cardStyle = {
  width: "100%",
  maxWidth: 380,
  background: "#ffffff",
  padding: "35px 28px",
  borderRadius: 20,
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  textAlign: "center",
};

const titleStyle = {
  marginBottom: 25,
  color: "#222",
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
  border: "1px solid #ddd",
  background: "#fafafa",
  fontSize: "1rem",
  outline: "none",
  transition: "all 0.2s ease",
};

const submitButtonStyle = {
  marginTop: 10,
  padding: "14px",
  borderRadius: 10,
  border: "none",
  background: "#a855f7", // Purple button color
  color: "#fff",
  fontSize: "1rem",
  fontWeight: "600",
  cursor: "pointer",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  boxShadow: "0px 4px 8px rgba(0,0,0,0.12)",
};

const dividerStyle = {
  margin: "15px 0",
  textAlign: "center",
  fontSize: "0.9rem",
  color: "#aaa",
};

const googleButtonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  padding: "12px",
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: "500",
  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
  marginBottom: 12,
  transition: "all 0.2s ease",
};

const secondaryButtonStyle = {
  marginTop: 12,
  padding: "12px",
  borderRadius: 10,
  border: "1px solid #a855f7",
  background: "#f9f5ff", // very light purple background
  color: "#a855f7",
  fontSize: "0.95rem",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const textBelowStyle = {
  marginTop: 18,
  fontSize: "0.9rem",
  color: "#555",
};
