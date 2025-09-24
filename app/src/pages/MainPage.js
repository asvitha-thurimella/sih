import React, { useEffect, useState, useRef } from "react";
import Avatar from '@mui/material/Avatar';
import UserFilter from "../components/UserFilter.js";
import LinkedInPostsFeed from "../components/LinkedInPostsFeed.js";
import Modal from "react-modal";
import { Box, Card, Typography, Button } from "@mui/material";
import { auth, db } from "../firebase.js";
import { realtimeDb } from "../firebase.js";
import { ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, addDoc, collection, getDocs, query, orderBy, serverTimestamp, updateDoc, deleteDoc } from "firebase/firestore";

import { useLanguage } from "../contexts/LanguageContext.js";
import translations from "../translations.js";

export default function MainPage() {
  // --- State & Hooks ---
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  // Listen to Firebase auth state changes for live user updates
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedProfession, setSelectedProfession] = useState("");
  const [allLocations, setAllLocations] = useState([]);
  const [allProfessions, setAllProfessions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activities, setActivities] = useState([]);
  const [likeLoading, setLikeLoading] = useState({});
  const [rating, setRating] = useState({});
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [inbox, setInbox] = useState([]);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    name: "",
    phone: "",
    gender: "",
    profession: "",
    location: "",
    experience: ""
  });
  const [lastViewed, setLastViewed] = useState(() => {
    try {
      const stored = localStorage.getItem("lastViewed");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const { lang } = useLanguage();
  const t = translations[lang];
  const navigate = useNavigate();

  // --- Effects ---

  useEffect(() => {
    async function fetchOptions() {
      try {
        const profilesSnap = await getDocs(collection(db, "profiles"));
        const profileLocations = [];
        const profileProfessions = [];
        profilesSnap.forEach(doc => {
          const data = doc.data();
          if (data.location) profileLocations.push(data.location);
          if (data.profession) profileProfessions.push(data.profession);
        });
        const activityLocations = activities.map(a => a.location).filter(Boolean);
        const activityProfessions = activities.map(a => a.profession).filter(Boolean);
        const locations = Array.from(new Set([...profileLocations, ...activityLocations]));
        const professions = Array.from(new Set([...profileProfessions, ...activityProfessions]));
        setAllLocations(locations);
        setAllProfessions(professions);
      } catch (err) {
        setAllLocations([]);
        setAllProfessions([]);
      }
    }
    fetchOptions();
  }, [activities]);

  useEffect(() => {
    if (profile) {
      setEditProfileData({
        name: profile.name || "",
        phone: profile.phone || "",
        gender: profile.gender || "",
        profession: profile.profession || "",
        location: profile.location || "",
        experience: profile.experience || ""
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    setLoadingInbox(true);
    const conversationsRef = ref(realtimeDb, "conversations");
    const handleConversations = async (snapshot) => {
      const data = snapshot.val() || {};
      const conversations = [];
      Object.entries(data).forEach(([conversationId, convObj]) => {
        if (!user?.uid) return;
        const ids = conversationId.split("_");
        if (!ids.includes(user.uid)) return;
        const otherUserId = ids.find(id => id !== user.uid) || user.uid;
        const messagesObj = convObj.messages || {};
        const allMessages = Object.values(messagesObj);
        let latestMsg = null;
        if (allMessages.length > 0) {
          allMessages.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          latestMsg = allMessages[0];
        }
        const lastSeen = lastViewed[conversationId] || 0;
        const unreadCount = allMessages.filter(msg =>
          msg.receiverId === user.uid && msg.timestamp > lastSeen
        ).length;
        conversations.push({
          conversationId,
          otherUserId,
          latestMsg,
          unreadCount,
        });
      });
      setInbox(conversations);
    };
    const unsubscribe = onValue(conversationsRef, handleConversations);
    return () => unsubscribe();
  }, [user, lastViewed]);

  useEffect(() => {
    async function fetchProfile() {
      if (!user || !user.uid) {
        setProfile(null);
        setLoadingProfile(false);
        return;
      }
      try {
        const docRef = doc(db, "profiles", user.uid);
        const docSnap = await getDoc(docRef);
        setProfile(docSnap.exists() ? docSnap.data() : null);
      } catch (err) {
        console.error("Error loading profile:", err);
      }
      setLoadingProfile(false);
    }
    fetchProfile();
    setLoadingInbox(false);
  }, [user]);

  useEffect(() => {
    async function fetchActivities() {
      try {
        setLoadingActivities(true);
        const q = query(collection(db, "activities"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setActivities(data);
      } catch (err) {
        console.error("Error fetching activities:", err);
      }
      setLoadingActivities(false);
    }
    fetchActivities();
  }, []);

  // --- Handlers ---

  async function handleUpload() {
    if (!selectedFile || (Array.isArray(selectedFile) && selectedFile.length === 0)) return alert(t.chooseFiles);
    if (!user) return;
    setUploading(true);
    try {
      const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/djlhr8crw/upload";
      const CLOUDINARY_UPLOAD_PRESET = "unsigned_preset";
      const files = Array.isArray(selectedFile) ? selectedFile : [selectedFile];
      const mediaArr = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
        const data = await res.json();
        if (!data.secure_url) throw new Error("Cloudinary upload failed");
        mediaArr.push({
          url: data.secure_url,
          type: file.type.startsWith("video") ? "video" : "image"
        });
      }
      await addDoc(collection(db, "activities"), {
        userId: user.uid,
        userName: profile?.name || "Anonymous",
        userPhoto: profile?.photoURL || null,
        media: mediaArr,
        createdAt: serverTimestamp(),
        location: profile?.location?.toLowerCase() || "",
        profession: profile?.profession || ""
      });
      setSelectedFile(null);
      setUploading(false);
    } catch (err) {
      setUploading(false);
      alert("Upload failed");
    }
  }

  async function handleDeletePost(postId) {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteDoc(doc(db, "activities", postId));
      setActivities((prev) => prev.filter((a) => a.id !== postId));
    } catch (err) {
      alert("Failed to delete post");
    }
  }


  // --- Render ---
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f3ff" }}>
      {/* Sidebar/Profile Card */}
      <div style={{
        zIndex: 2,
        overflow: "visible",
        marginRight: 0,
        boxShadow: "2px 0 16px #e9d5ff33",
        borderRight: "1px solid #e9d5ff",
        minWidth: 370,
        maxWidth: 370,
        background: "#faf7ff",
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
        height: '100vh',
      }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            boxShadow: "0 4px 24px #d1d5db55",
            padding: "32px 28px 24px 28px",
            width: 320,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: "24px auto 0 auto",
            cursor: user && user.uid ? "pointer" : "default",
            transition: "box-shadow 0.2s",
            ...(user && user.uid ? { boxShadow: "0 8px 32px #a78bfa33" } : {})
          }}
          onClick={() => { if (user && user.uid) navigate(`/profile/${user.uid}`); }}
        >
          <Avatar
            src={profile?.photoURL || undefined}
            alt={profile?.name || "User"}
            sx={{ width: 120, height: 120, mb: 2, boxShadow: "0 2px 16px #c4b5fd88", border: "5px solid #a78bfa", bgcolor: '#a78bfa', fontSize: 48 }}
          >
            {!profile?.photoURL && profile?.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : (
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="#a78bfa" />
                <circle cx="12" cy="10" r="4" fill="#ede9fe" />
                <rect x="6" y="16" width="12" height="4" rx="2" fill="#ede9fe" />
              </svg>
            )}
          </Avatar>
          {profile && (
            profile ? (
              <>
                <Typography variant="h5" fontWeight={700} color="#7c3aed" mb={1} style={{ textAlign: "center" }}>{profile.name || "User"}</Typography>
                <Typography fontWeight={500} color="#7c3aed" mb={0.5}>Phone Number: <span style={{ color: "#6b21a8" }}>{profile.phone || "N/A"}</span></Typography>
                <Typography fontWeight={500} color="#7c3aed" mb={0.5}>{profile.gender || "N/A"}</Typography>
                <Typography fontWeight={500} color="#7c3aed" mb={0.5}>{profile.profession || "N/A"}</Typography>
                <Typography fontWeight={500} color="#7c3aed" mb={0.5}>{profile.location || "N/A"}</Typography>
                <Typography fontWeight={500} color="#7c3aed" mb={2}>Experience (in years): <span style={{ color: "#6b21a8" }}>{profile.experience || "N/A"}</span></Typography>
                <div style={{ display: "flex", gap: 16, marginTop: 10, width: "100%", justifyContent: "center" }}>
                  <Button
                    variant="contained"
                    sx={{
                      background: "linear-gradient(90deg, #a78bfa 0%, #7c3aed 100%)",
                      color: "#fff",
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: "1em",
                      px: 4,
                      boxShadow: "0 2px 8px #ede9fe",
                      textTransform: "none"
                    }}
                    onClick={() => navigate('/edit-profile', { state: { fromMain: true } })}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      background: "linear-gradient(90deg, #f472b6 0%, #a78bfa 100%)",
                      color: "#fff",
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: "1em",
                      px: 4,
                      boxShadow: "0 2px 8px #fde68a",
                      textTransform: "none"
                    }}
                    onClick={async () => {
                      await signOut(auth);
                      navigate('/login');
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <Typography color="#aaa" fontWeight={500} mt={2} mb={2}>No profile found for this user.</Typography>
            )
          )}
        </div>
        <Button
          variant="outlined"
          sx={{
            width: 320,
            background: "#ede9fe",
            color: "#7c3aed",
            border: "2px solid #a78bfa",
            borderRadius: 2,
            fontWeight: 700,
            fontSize: "1.1em",
            letterSpacing: 1,
            mt: 3,
            mb: 2,
            boxShadow: "0 1px 4px #ede9fe",
            textTransform: "none"
          }}
          onClick={() => navigate('/messages')}
        >
          MESSAGES
        </Button>
        <Modal
          isOpen={editModalOpen}
          onRequestClose={() => setEditModalOpen(false)}
          ariaHideApp={false}
          style={{ content: { maxWidth: 400, margin: 'auto', borderRadius: 12, padding: 24 } }}
        >
          <div>
            <h2>Edit Profile</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={editProfileData.name} onChange={e => setEditProfileData(d => ({ ...d, name: e.target.value }))} placeholder="Name" />
              <input value={editProfileData.phone} onChange={e => setEditProfileData(d => ({ ...d, phone: e.target.value }))} placeholder="Phone" />
              <input value={editProfileData.gender} onChange={e => setEditProfileData(d => ({ ...d, gender: e.target.value }))} placeholder="Gender" />
              <input value={editProfileData.profession} onChange={e => setEditProfileData(d => ({ ...d, profession: e.target.value }))} placeholder="Profession" />
              <input value={editProfileData.location} onChange={e => setEditProfileData(d => ({ ...d, location: e.target.value }))} placeholder="Location" />
              <input value={editProfileData.experience} onChange={e => setEditProfileData(d => ({ ...d, experience: e.target.value }))} placeholder="Experience" />
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
              <button
                onClick={() => {/* save profile handler */}}
                style={{ background: '#9333ea', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}
              >
                Save
              </button>
              <button
                onClick={() => setEditModalOpen(false)}
                style={{ background: '#e5e7eb', color: '#9333ea', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '32px 0 0 0', minHeight: '100vh', background: '#f8f7fc' }}>
        <Card sx={{
          width: '100%',
          maxWidth: 1000,
          mt: 4,
          background: '#fff',
          borderRadius: 3,
          boxShadow: 4,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: '0 auto'
        }}>
          {/* Upload section for logged-in users */}
          {user && profile && (
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', width: '100%' }}>
              <Button
                variant="outlined"
                component="label"
                color="secondary"
                sx={{ borderRadius: 2, fontWeight: 500, fontSize: '1.1em', mr: 2 }}
                disabled={uploading}
              >
                {selectedFile
                  ? (Array.isArray(selectedFile)
                      ? selectedFile.map(f => f.name).join(', ')
                      : selectedFile.name)
                  : t.chooseFiles}
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={e => {
                    const files = Array.from(e.target.files);
                    setSelectedFile(files.length > 1 ? files : files[0]);
                  }}
                  disabled={uploading}
                  hidden
                />
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleUpload}
                disabled={uploading || !selectedFile || (Array.isArray(selectedFile) && selectedFile.length === 0)}
                sx={{ borderRadius: 2, fontWeight: 600, fontSize: '1.1em', px: 4 }}
              >
                {uploading ? t.uploading : t.upload}
              </Button>
            </Box>
          )}
          <Typography variant="h4" fontWeight={700} mb={3} color="#7c3aed" textAlign="center" letterSpacing={1}>
            Discovery Feed
          </Typography>
          {/* Filter options below Discovery Feed removed to prevent duplicate display */}
          {loadingActivities ? (
            <Typography color="#888" textAlign="center" fontSize={18} my={4}>Loading...</Typography>
          ) : (
            <LinkedInPostsFeed
              posts={
                activities
                  .filter(act => {
                    // Exclude logged-in user's own posts
                    if (user && act.userId === user.uid) return false;
                    const locationMatch = selectedLocation ? (act.location && act.location.toLowerCase() === selectedLocation.toLowerCase()) : true;
                    const professionMatch = selectedProfession ? (act.profession && act.profession.toLowerCase() === selectedProfession.toLowerCase()) : true;
                    return locationMatch && professionMatch;
                  })
                  .map(act => {
                    let media = [];
                    if (Array.isArray(act.media) && act.media.length > 0) {
                      media = act.media;
                    } else {
                      if (act.imageUrl) media.push({ url: act.imageUrl, type: "image" });
                      if (act.videoUrl) media.push({ url: act.videoUrl, type: "video" });
                      if (act.fileURL && act.fileType) media.push({ url: act.fileURL, type: act.fileType.startsWith('video') ? 'video' : 'image' });
                    }
                    // Fix createdAt for timeAgo
                    let createdAt = act.createdAt;
                    if (createdAt && createdAt.seconds) {
                      createdAt = new Date(createdAt.seconds * 1000);
                    } else if (typeof createdAt === "string" || typeof createdAt === "number") {
                      createdAt = new Date(createdAt);
                    } else {
                      createdAt = new Date();
                    }
                    return {
                      ...act,
                      media,
                      createdAt,
                      userProfilePic: act.userPhoto || "https://ui-avatars.com/api/?name=" + encodeURIComponent(act.userName || "User"),
                      canDelete: user && act.userId === user.uid,
                      onDelete: handleDeletePost,
                      onEdit: (postId) => alert("Edit functionality coming soon for post: " + postId)
                    };
                  })
              }
              currentUser={user}
              onDelete={handleDeletePost}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
