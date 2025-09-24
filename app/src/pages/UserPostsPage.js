import React, { useEffect, useState } from "react";
import LinkedInPostsFeed from "../components/LinkedInPostsFeed.js";
import { db } from "../firebase.js";
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import { Card, Typography } from "@mui/material";
import Avatar from '@mui/material/Avatar';

import { useParams } from "react-router-dom";
import { auth } from "../firebase.js";

export default function UserPostsPage() {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  useEffect(() => {
    async function fetchProfile() {
      if (!userId) {
        setProfile(null);
        setLoadingProfile(false);
        return;
      }
      try {
        const docRef = doc(db, "profiles", userId);
        const docSnap = await getDoc(docRef);
        setProfile(docSnap.exists() ? docSnap.data() : null);
      } catch (err) {
        setProfile(null);
      }
      setLoadingProfile(false);
    }
    fetchProfile();
  }, [userId]);
  // Delete post handler
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteDoc(doc(db, "activities", postId));
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  const { userId } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch posts for this user
  useEffect(() => {
    async function fetchPosts() {
      if (!userId) {
        setPosts([]);
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, "activities"),
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        setPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setPosts([]);
      }
      setLoading(false);
    }
    fetchPosts();
  }, [userId]);

  // Get logged-in userId from Firebase Auth
  const loggedInUserId = auth.currentUser ? String(auth.currentUser.uid) : null;

  // Placeholder for edit handler
  const handleEditPost = (postId) => {
    alert("Edit functionality coming soon for post: " + postId);
  };

  return (
    <>
      <Card sx={{ width: 370, background: '#fff', borderRadius: 4, boxShadow: 4, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '32px auto 24px auto' }}>
        {loadingProfile ? (
          <Typography color="#888" textAlign="center" fontSize={18} my={4}>Loading profile...</Typography>
        ) : profile ? (
          <>
            <Avatar
              src={profile.photoURL || undefined}
              alt={profile.name || "User"}
              sx={{ width: 120, height: 120, mb: 2, boxShadow: "0 2px 16px #c4b5fd88", border: "5px solid #a78bfa", bgcolor: '#a78bfa', fontSize: 48 }}
            >
              {!profile.photoURL && profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : null}
            </Avatar>
            <Typography variant="h5" fontWeight={700} color="#7c3aed" mb={1} style={{ textAlign: "center" }}>{profile.name || "User"}</Typography>
            <Typography fontWeight={500} color="#7c3aed" mb={0.5}>Phone Number: <span style={{ color: "#6b21a8" }}>{profile.phone || "N/A"}</span></Typography>
            <Typography fontWeight={500} color="#7c3aed" mb={0.5}>{profile.gender || "N/A"}</Typography>
            <Typography fontWeight={500} color="#7c3aed" mb={0.5}>{profile.profession || "N/A"}</Typography>
            <Typography fontWeight={500} color="#7c3aed" mb={0.5}>{profile.location || "N/A"}</Typography>
            <Typography fontWeight={500} color="#7c3aed" mb={2}>Experience (in years): <span style={{ color: "#6b21a8" }}>{profile.experience || "N/A"}</span></Typography>
          </>
        ) : (
          <Typography color="#aaa" fontWeight={500} mt={2} mb={2}>No profile found for this user.</Typography>
        )}
      </Card>
      <Card sx={{ width: '100%', maxWidth: 1000, mt: 2, background: '#fff', borderRadius: 3, boxShadow: 4, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={700} mb={3} color="#7c3aed" textAlign="center" letterSpacing={1}>User's Posts</Typography>
        {loading ? (
          <Typography color="#888" textAlign="center" fontSize={18} my={4}>Loading...</Typography>
        ) : (
          <LinkedInPostsFeed
            posts={posts.map(act => {
              console.log('DEBUG POST:', {
                loggedInUserId,
                actUserId: act.userId,
                eq: loggedInUserId && String(loggedInUserId) === String(act.userId)
              });
              return {
                id: act.id,
                userId: act.userId,
                userName: act.userName,
                userProfilePic: act.userPhoto || "https://ui-avatars.com/api/?name=" + encodeURIComponent(act.userName),
                profession: act.profession || "",
                location: act.location || "",
                caption: act.caption || "",
                imageUrl: act.fileType === "image" ? act.fileURL : "",
                videoUrl: act.fileType === "video" ? act.fileURL : "",
                likes: act.likes || Math.floor(Math.random() * 50),
                comments: act.comments || Math.floor(Math.random() * 20),
                createdAt: act.createdAt?.seconds ? new Date(act.createdAt.seconds * 1000) : new Date(),
                cardStyle: {
                  background: '#fff',
                  borderRadius: 16,
                  boxShadow: '0 2px 12px #e0e7ef',
                  padding: '24px',
                  marginBottom: '24px',
                  border: '1px solid #f3f4f6'
                },
                canDelete: loggedInUserId && String(loggedInUserId) === String(act.userId),
                onDelete: handleDeletePost,
                onEdit: handleEditPost
              };
            })}
          />
        )}
      </Card>
    </>
  );
}
