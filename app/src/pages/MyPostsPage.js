import React, { useEffect, useState } from "react";
import LinkedInPostsFeed from "../components/LinkedInPostsFeed.js";
import { auth, db } from "../firebase.js";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Card, Typography } from "@mui/material";

export default function MyPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const q = query(
          collection(db, "activities"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const userPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched posts:', userPosts);
        setPosts(userPosts);
      } catch (err) {
        console.error("Error fetching user posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <Card sx={{ width: '100%', maxWidth: 1000, mt: 4, background: '#fff', borderRadius: 3, boxShadow: 4, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h4" fontWeight={700} mb={3} color="#7c3aed" textAlign="center" letterSpacing={1}>My Posts</Typography>
      {loading ? (
        <Typography color="#888" textAlign="center" fontSize={18} my={4}>Loading...</Typography>
      ) : posts.length === 0 ? (
        <>
          <Typography color="#888" textAlign="center" fontSize={18} my={4}>No posts found.</Typography>
          <pre style={{ maxWidth: 800, overflowX: 'auto', background: '#f3f4f6', color: '#9333ea', fontSize: 14, padding: 12, borderRadius: 8 }}>
            {JSON.stringify(posts, null, 2)}
          </pre>
        </>
      ) : (
        <LinkedInPostsFeed posts={posts.map(act => ({
          id: act.id,
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
          }
        }))} />
      )}
    </Card>
  );
}
