import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext.js";
import { AuthProvider } from "./contexts/AuthContext.js";

import LanguageSelector from "./components/LanguageSelector.js";
import LandingPage from "./pages/LandingPage.js";
import Login from "./pages/Login.js";
import Signup from "./pages/Signup.js";
import WelcomePage from "./pages/WelcomePage.js";


import MessagingPage from "./pages/MessagingPage.js";
import MainPage from "./pages/MainPage.js";
import CreateProfile from "./pages/CreateProfile.js";
import ProfilePage from "./pages/ProfilePage.js";
import EditProfile from "./pages/EditProfile.js";
import MyPostsPage from "./pages/MyPostsPage.js";
import UserPostsPage from "./pages/UserPostsPage.js";

export default function App() {

  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing page as entry point */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/select-language" element={<LanguageSelector />} />
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/create-profile" element={<CreateProfile />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/messages" element={<MessagingPage />} />
            <Route path="/my-posts" element={<MyPostsPage />} />
            <Route path="/profile/:userId/posts" element={<UserPostsPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
