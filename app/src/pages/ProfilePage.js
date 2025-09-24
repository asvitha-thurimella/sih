
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase.js";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useLanguage } from "../contexts/LanguageContext.js";
import translations from "../translations.js";
import { useAuth } from "../contexts/AuthContext.js";
import { auth } from "../firebase.js";
import { signOut } from "firebase/auth";
import { Button, Box } from "@mui/material";
import PhoneIcon from '@mui/icons-material/Phone';
import WcIcon from '@mui/icons-material/Wc';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ProfilePage() {
  const { currentUser, profile: myProfile } = useAuth();
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const { lang } = useLanguage();
  const t = translations[lang];
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editCaption, setEditCaption] = useState("");
  const [editFile, setEditFile] = useState(null);
  const isOwnProfile = (!userId && currentUser) || (userId && currentUser && userId === currentUser.uid);

  useEffect(() => {
    const uid = userId || (currentUser && currentUser.uid);
    if (!uid) {
      setProfile(null);
      setPosts([]);
      return;
    }
    // Fetch profile
    const unsubProfile = onSnapshot(doc(db, "profiles", uid), (docSnap) => {
      setProfile(docSnap.exists() ? docSnap.data() : null);
    });
    // Fetch posts
    const q = query(collection(db, "activities"), where("userId", "==", uid));
    const unsubPosts = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubProfile(); unsubPosts(); };
  }, [userId, currentUser]);

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "activities", id));
  };

  const handleEdit = async (id) => {
    const updates = { caption: editCaption };
    // If replacing file, upload to Cloudinary and update fileURL/fileType
    if (editFile) {
      // ...upload logic here...
      // updates.fileURL = uploadedUrl;
      // updates.fileType = editFile.type.startsWith("video") ? "video" : "image";
    }
    await updateDoc(doc(db, "activities", id), updates);
    setEditId(null);
    setEditCaption("");
    setEditFile(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%)', padding: '32px 0' }}>
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e0c3fc 100%)',
          borderRadius: 28,
          boxShadow: '0 8px 32px 0 rgba(124,58,237,0.12), 0 1.5px 8px 0 #e9d5ff',
          padding: 36,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 40,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Profile Card Gradient Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 120,
          background: 'linear-gradient(90deg, #a78bfa 0%, #f3e8ff 100%)',
          zIndex: 0,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
        }} />
        {profile ? (
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              zIndex: 1,
              textAlign: 'center',
            }}
          >
            <div
              style={{ cursor: isOwnProfile ? 'default' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              onClick={() => {
                if (!isOwnProfile) navigate(`/profile/${profile.uid || userId}`);
              }}
            >
              <img
                src={profile.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(profile.name || "User")}
                alt="Profile"
                style={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover', marginBottom: 10, border: '4px solid #fff', boxShadow: '0 2px 12px #c4b5fd' }}
              />
              <div style={{ fontWeight: 700, fontSize: '1.5em', color: '#6d28d9', marginBottom: 2 }}>{profile.name}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: '100%' }}>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: '#7c3aed', fontWeight: 500 }}><PhoneIcon sx={{ mr: 0.5 }} fontSize="small" />{profile.phone || 'N/A'}</Box>
                <Box sx={{ display: 'flex', alignItems: 'center', color: '#7c3aed', fontWeight: 500 }}><WcIcon sx={{ mr: 0.5 }} fontSize="small" />{profile.gender || 'N/A'}</Box>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: '#7c3aed', fontWeight: 500 }}><LocationOnIcon sx={{ mr: 0.5 }} fontSize="small" />{profile.location || 'N/A'}</Box>
                <Box sx={{ display: 'flex', alignItems: 'center', color: '#7c3aed', fontWeight: 500 }}><WorkIcon sx={{ mr: 0.5 }} fontSize="small" />{profile.experience || 'N/A'} yrs</Box>
              </div>
            </div>
            {isOwnProfile && (
              <div style={{ display: 'flex', gap: 16, marginTop: 10, width: '100%', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  sx={{
                    background: 'linear-gradient(90deg, #a78bfa 0%, #7c3aed 100%)',
                    color: 'white',
                    borderRadius: 3,
                    px: 3,
                    py: 1.2,
                    fontWeight: 600,
                    fontSize: 16,
                    boxShadow: '0 2px 8px #e9d5ff',
                    textTransform: 'none',
                    transition: 'background 0.2s',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #7c3aed 0%, #a78bfa 100%)',
                    },
                  }}
                  onClick={() => navigate("/edit-profile")}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="contained"
                  startIcon={<LogoutIcon />}
                  sx={{
                    background: 'linear-gradient(90deg, #f472b6 0%, #a78bfa 100%)',
                    color: 'white',
                    borderRadius: 3,
                    px: 3,
                    py: 1.2,
                    fontWeight: 600,
                    fontSize: 16,
                    boxShadow: '0 2px 8px #e9d5ff',
                    textTransform: 'none',
                    transition: 'background 0.2s',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #a78bfa 0%, #f472b6 100%)',
                    },
                  }}
                  onClick={async () => {
                    await signOut(auth);
                    navigate('/login');
                  }}
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#9333ea', fontWeight: 500, fontSize: '1.2em', margin: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            Profile not found.<br />
            This user may not have set up their profile yet.<br />
            <Button
              variant="contained"
              color="secondary"
              style={{ marginTop: 16, fontWeight: 600, fontSize: '1.1em', borderRadius: 8, padding: '10px 28px' }}
              onClick={() => navigate('/create-profile')}
            >
              Create Profile
            </Button>
          </div>
        )}
      </div>

  <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
  <h3 style={{ fontWeight: 600, fontSize: '1.4em', color: '#7c3aed', marginBottom: 24, textAlign: 'center', width: '100%' }}>{isOwnProfile ? 'My Posts' : 'Posts'}</h3>
        {posts.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, justifyContent: 'center', width: '100%' }}>
            {posts.map(post => {
              const isPostOwner = currentUser && post.userId === currentUser.uid;
              // Support new structure: post.media (array of {url, type}), fallback to fileURL/fileType
              let mediaArr = [];
              if (Array.isArray(post.media) && post.media.length > 0) {
                mediaArr = post.media;
              } else if (post.fileURL && post.fileType) {
                mediaArr = [{ url: post.fileURL, type: post.fileType.startsWith('video') ? 'video' : 'image' }];
              }
              return (
                <div key={post.id} style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 16px #e9d5ff', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', transition: '0.2s', minHeight: 340, position: 'relative' }}>
                  <div style={{ fontWeight: 600, color: '#7c3aed', marginBottom: 8, textAlign: 'center', fontSize: '1.1em' }}>{profile?.name} &bull; {profile?.location}</div>
                  {mediaArr.map((media, idx) =>
                    media.type === 'video' ? (
                      <video key={idx} controls style={{ borderRadius: 14, marginBottom: 14, boxShadow: '0 1px 8px #e9d5ff', width: 220, height: 160, objectFit: 'cover', background: '#f3f4f6' }}>
                        <source src={media.url} type="video/mp4" />
                      </video>
                    ) : (
                      <img key={idx} src={media.url} alt="post" style={{ borderRadius: 14, marginBottom: 14, boxShadow: '0 1px 8px #e9d5ff', width: 220, height: 160, objectFit: 'cover', background: '#f3f4f6' }} />
                    )
                  )}
                  {/* Show description if available, else fallback to caption */}
                  <div style={{ color: '#444', marginBottom: 10, textAlign: 'center', fontSize: '1em', minHeight: 32 }}>{post.description || post.caption}</div>
                  {editId === post.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                      <input
                        type="text"
                        value={editCaption}
                        onChange={e => setEditCaption(e.target.value)}
                        style={{ border: '1px solid #ddd', borderRadius: 8, padding: '8px 10px', fontSize: '1em' }}
                        placeholder="Edit caption"
                      />
                      <input
                        type="file"
                        onChange={e => setEditFile(e.target.files[0])}
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'center' }}>
                        <Button variant="contained" color="primary" size="small" onClick={() => handleEdit(post.id)} sx={{ fontWeight: 600 }}>Save</Button>
                        <Button variant="outlined" size="small" onClick={() => setEditId(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : null}
                  {isPostOwner && editId !== post.id && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'center' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => {
                          setEditId(post.id);
                          setEditCaption(post.caption);
                          setEditFile(null);
                        }}
                        sx={{ fontWeight: 600 }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(post.id)}
                        sx={{ fontWeight: 600 }}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
      {/* Centered MESSAGES button if present below profile card */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 24, marginBottom: 0 }}>
        {/* If you have a MESSAGES button component, place it here. Example: */}
        {/* <Button variant="outlined" style={{ fontWeight: 700, fontSize: '1.2em', color: '#7c3aed', borderColor: '#a78bfa', borderRadius: 12, padding: '12px 36px', background: '#faf5ff' }}>MESSAGES</Button> */}
      </div>
    </div>
  );
}
