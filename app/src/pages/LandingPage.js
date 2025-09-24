import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const imageFilenames = ['1.jpg', '2.jpg', '3.jpg', '4.jpg']; 
const sportsImages = imageFilenames.map(
  name => process.env.PUBLIC_URL + '/assets/' + name
);

export default function LandingPage() {
  const [bgIndex, setBgIndex] = useState(() =>
    Math.floor(Math.random() * sportsImages.length)
  );
  const [fade, setFade] = useState(true);
  const intervalRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setBgIndex(idx => (idx + 1) % sportsImages.length);
        setFade(true);
      }, 500);
    }, 2000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleGetStarted = () => {
    navigate("/select-language");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, sans-serif",
        background: "#000",
      }}
    >
      {/* Dynamic background with zoom + fade */}
      <img
        key={bgIndex}
        src={sportsImages[bgIndex]}
        alt="sports background"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 1,
          opacity: fade ? 1 : 0,
          transition: "opacity 1s ease-in-out, transform 6s ease-in-out",
          transform: fade ? "scale(1.08)" : "scale(1)",
          filter: "brightness(0.8) contrast(1.1) saturate(1.2)",
        }}
      />

      {/* Animated gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(147,51,234,0.35), rgba(0,0,0,0.75))",
          backgroundSize: "400% 400%",
          animation: "gradientShift 12s ease infinite",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Centered Content */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 20px",
        }}
      >
        <h1
          style={{
            color: "#fff",
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 900,
            letterSpacing: "2px",
            marginBottom: 20,
            textShadow:
              "0 0 20px rgba(147,51,234,0.7), 0 0 40px rgba(147,51,234,0.5)",
            animation: "floatY 4s ease-in-out infinite",
          }}
        >
          SkillRise
        </h1>

        <p
          style={{
            color: "#e5e7eb",
            fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
            fontWeight: 500,
            maxWidth: 640,
            marginBottom: 40,
            textShadow: "0 2px 10px rgba(0,0,0,0.8)",
            lineHeight: 1.5,
            animation: "fadeInUp 2s ease",
          }}
        >
         {" "}
          <br />
          <span style={{ color: "#a78bfa", fontWeight: 1000 }}>
“SkillRise connects India’s rural talent with real job opportunities – empowering skilled workers to showcase, grow, and shine.”
          </span>
        </p>

        <button
          onClick={handleGetStarted}
          style={{
            background:
              "linear-gradient(90deg, #9333ea 0%, #7c3aed 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "50px",
            padding: "18px 64px",
            fontWeight: 800,
            fontSize: "1.3rem",
            letterSpacing: 1,
            cursor: "pointer",
            boxShadow:
              "0 0 20px rgba(147,51,234,0.7), 0 0 40px rgba(147,51,234,0.5)",
            transition: "all 0.3s ease",
            outline: "none",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.07)";
            e.currentTarget.style.boxShadow =
              "0 0 30px rgba(167,139,250,0.9), 0 0 60px rgba(147,51,234,0.7)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow =
              "0 0 20px rgba(147,51,234,0.7), 0 0 40px rgba(147,51,234,0.5)";
          }}
        >
          Get Started
        </button>
      </div>

      {/* Extra keyframes */}
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes floatY {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
          }
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}