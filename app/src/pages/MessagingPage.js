import DeleteIcon from '@mui/icons-material/Delete';
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { db } from "../firebase.js";
import { useAuth } from "../contexts/AuthContext.js";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";

function MessagingPage() {
  // --- State and refs ---
  const [messages, setMessages] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [otherUserId, setOtherUserId] = useState(null);
  const [otherUserName, setOtherUserName] = useState("");
  const bottomRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const { currentUser: user, profile } = useAuth();
  const t = {}; // TODO: Replace with actual translation context or prop
  const navigate = useNavigate();
  const location = useLocation();

  // On mount, check if navigation state or query param provides a user to chat with
  useEffect(() => {
    async function fetchOtherUserName(uid, fallbackName) {
      if (!uid) return fallbackName || "User";
      try {
        const docRef = doc(db, "profiles", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().name) {
          return docSnap.data().name;
        }
      } catch {}
      return fallbackName || "User";
    }
    // If coming from a post message button, state will be set
    if (location.state && location.state.otherUser) {
      setOtherUserId(location.state.otherUser);
      fetchOtherUserName(location.state.otherUser, location.state.otherUserName).then(setOtherUserName);
    } else {
      // Fallback: check query param
      const params = new URLSearchParams(window.location.search);
      const userParam = params.get("user");
      if (userParam) {
        setOtherUserId(userParam);
        fetchOtherUserName(userParam, "User").then(setOtherUserName);
      }
    }
  }, [location.state]);


  // --- Audio Recording & Upload ---
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    setRecording(true);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new window.MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        setRecording(false);
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        console.log("[AUDIO DEBUG] audioBlob:", audioBlob);
        // Upload to Cloudinary
        setLoading(true);
        const formData = new FormData();
        formData.append("file", audioBlob);
        formData.append("upload_preset", "unsigned_preset");
        formData.append("resource_type", "auto");
        try {
          const res = await fetch("https://api.cloudinary.com/v1_1/djlhr8crw/auto/upload", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          console.log("[AUDIO DEBUG] Cloudinary response:", data);
          if (data.secure_url) {
            await sendMessage({ audioUrl: data.secure_url });
          } else {
            alert("Cloudinary upload failed: " + (data.error?.message || JSON.stringify(data)));
          }
        } catch (err) {
          alert("Audio upload failed");
          console.error("[AUDIO DEBUG] Cloudinary upload error:", err);
        }
        setLoading(false);
        audioChunksRef.current = [];
      };
      mediaRecorder.start();
    } catch (err) {
      alert("Microphone access denied");
      setRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  // --- Send Message (text or audio) ---
  const sendMessage = async (audio = null) => {
    if (!user.uid || !otherUserId) {
      alert("User not logged in or recipient missing");
      console.error("user.uid or otherUserId missing", { user, otherUserId });
      return;
    }
    if (!audio && !text.trim()) {
      alert("Cannot send empty message");
      return;
    }
    setLoading(true);
    try {
      const msgObj = {
        senderId: user.uid,
        senderName: profile?.name || user.displayName || user.email || "User",
        receiverId: otherUserId,
        receiverName: otherUserName,
        createdAt: serverTimestamp(),
        type: audio && audio.audioUrl ? "audio" : "text",
        text: audio ? "" : (typeof text === "string" ? text : ""),
        audioUrl: audio && audio.audioUrl ? audio.audioUrl : "",
        read: false, // Mark as unread for receiver
      };
      console.log("Sending message:", msgObj);
      await addDoc(collection(db, "messages"), msgObj);
  setText("");
    } catch (err) {
      alert("Failed to send message");
      console.error("Send message error:", err);
    }
    setLoading(false);
  };

  // --- Load All Messages for Inbox and Current Chat ---
  useEffect(() => {
    if (!user.uid) return;
    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, async (snapshot) => {
      const allMsgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // Group messages by conversation partner
      const conversations = {};
      // Collect all unique partnerIds for profile lookup
      const partnerIdSet = new Set();
      allMsgs.forEach((msg) => {
        let partnerId = null;
        if (msg.senderId === user.uid) {
          partnerId = msg.receiverId;
        } else if (msg.receiverId === user.uid) {
          partnerId = msg.senderId;
        }
        if (partnerId) partnerIdSet.add(partnerId);
      });
      // Fetch all partner profiles in parallel
      const partnerIdArr = Array.from(partnerIdSet);
      const partnerProfiles = {};
      await Promise.all(partnerIdArr.map(async (pid) => {
        try {
          const docRef = doc(db, "profiles", pid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().name) {
            partnerProfiles[pid] = docSnap.data().name;
          }
        } catch {}
      }));
      allMsgs.forEach((msg) => {
        let partnerId = null;
        let partnerName = null;
        let isUnread = false;
        if (msg.senderId === user.uid) {
          partnerId = msg.receiverId;
          partnerName = partnerProfiles[msg.receiverId] || msg.receiverName;
        } else if (msg.receiverId === user.uid) {
          partnerId = msg.senderId;
          partnerName = partnerProfiles[msg.senderId] || msg.senderName;
          // Only count as unread if message is to current user and not read
          isUnread = msg.read === false;
        }
        if (partnerId) {
          if (!conversations[partnerId]) {
            conversations[partnerId] = {
              otherUserId: partnerId,
              otherUserName: partnerName,
              latestMsg: msg,
              unreadCount: 0,
              conversationId: partnerId,
            };
          }
          // Update latest message
          if (
            !conversations[partnerId].latestMsg.createdAt ||
            (msg.createdAt && msg.createdAt.seconds > (conversations[partnerId].latestMsg.createdAt?.seconds || 0))
          ) {
            conversations[partnerId].latestMsg = msg;
          }
          // Count unread messages for this conversation
          if (isUnread) {
            conversations[partnerId].unreadCount = (conversations[partnerId].unreadCount || 0) + 1;
          }
        }
      });
      setInbox(Object.values(conversations));
      // Set messages for current chat, and update otherUserName if needed
      if (otherUserId) {
        const chatMsgs = allMsgs.filter(
          (msg) =>
            (msg.senderId === user.uid && msg.receiverId === otherUserId) ||
            (msg.senderId === otherUserId && msg.receiverId === user.uid)
        );
        setMessages(chatMsgs);
        // If we have a display name for the chat partner, update it
        if (partnerProfiles[otherUserId]) {
          setOtherUserName(partnerProfiles[otherUserId]);
        }
        // Mark all unread messages in this chat as read
        const unreadMsgIds = chatMsgs
          .filter((msg) => msg.receiverId === user.uid && msg.read === false)
          .map((msg) => msg.id);
        if (unreadMsgIds.length > 0) {
          unreadMsgIds.forEach(async (msgId) => {
            try {
              const msgRef = doc(db, "messages", msgId);
              await getDoc(msgRef) // ensure exists
              await import("firebase/firestore").then(({ updateDoc }) => updateDoc(msgRef, { read: true }));
            } catch (e) {
              // ignore
            }
          });
        }
      }
    });
    return () => unsub();
  }, [user.uid, otherUserId]);

  // --- Render ---
  // Determine if we should show the inbox sidebar
  const showInbox = !(
    (location.state && location.state.otherUser) ||
    (new URLSearchParams(window.location.search).get("user"))
  );

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", display: "flex", gap: 32 }}>
      {showInbox && (
        <div style={{ width: 280, background: "#f3e8ff", borderRadius: 16, boxShadow: "0 2px 8px #e9d5ff", padding: 18, minHeight: 400 }}>
          <h3 style={{ color: "#9333ea", marginBottom: 16, textAlign: "center" }}>Inbox</h3>
          {inbox.length === 0 ? (
            <div style={{ color: "#a78bfa", textAlign: "center" }}>No conversations yet.</div>
          ) : (
            inbox.map(conv => (
              <div
                key={conv.conversationId}
                style={{
                  padding: '10px 8px',
                  borderBottom: '1px solid #e9d5ff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  position: 'relative',
                  background: conv.conversationId === otherUserId ? '#ede9fe' : 'transparent',
                  borderRadius: 8
                }}
                onClick={() => {
                  setOtherUserId(conv.otherUserId);
                  setOtherUserName(conv.otherUserName || conv.otherUserId || 'User');
                }}
              >
                <span style={{ fontWeight: 500, color: '#6d28d9' }}>
                  {conv.otherUserName || conv.otherUserId || 'User'}
                </span>
                <span style={{ color: '#6b21a8', fontSize: '0.95em', marginLeft: 4, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {conv.latestMsg?.text || (conv.latestMsg?.audioUrl ? '[Voice message]' : '')}
                </span>
                {conv.unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    background: '#9333ea',
                    color: 'white',
                    borderRadius: 8,
                    padding: '2px 8px',
                    fontSize: '0.85em',
                    fontWeight: 600
                  }}>{conv.unreadCount}</span>
                )}
              </div>
            ))
          )}
        </div>
      )}
      {/* Chat Area */}
      <div style={{ flex: 1 }}>
        {otherUserId ? (
          <>
            <h2 style={{ color: "#25D366", marginBottom: 18 }}>Chat with {otherUserName}</h2>
            <div style={{ minHeight: 320, maxHeight: 400, overflowY: "auto", marginBottom: 18, background: "#ece5dd", borderRadius: 10, padding: 16, boxShadow: "0 2px 8px #eee" }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", color: "#888", marginTop: 40 }}>
                  No messages yet.
                </div>
              ) : (
                messages.map((msg) => {
                  const isSender = msg.senderId === user.uid;
                  return (
                    <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isSender ? "flex-end" : "flex-start", marginBottom: 12 }}>
                      <div style={{ fontWeight: 600, color: isSender ? "#075e54" : "#128c7e", marginBottom: 2, fontSize: "1em" }}>
                        {isSender
                          ? (profile?.name || user.displayName || user.email || "You")
                          : (msg.senderName || msg.senderId || "User")}
                      </div>
                      {msg.type === "audio" && msg.audioUrl ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <audio controls src={msg.audioUrl} style={{ marginTop: 4, maxWidth: 300 }} />
                          {isSender && (
                            <button
                              onClick={async () => {
                                if (window.confirm('Delete this audio message?')) {
                                  await import('firebase/firestore').then(({ deleteDoc, doc }) =>
                                    deleteDoc(doc(db, 'messages', msg.id))
                                  );
                                }
                              }}
                              style={{ background: 'none', border: 'none', color: '#e11d48', fontSize: 22, cursor: 'pointer', marginLeft: 4, display: 'flex', alignItems: 'center' }}
                              title="Delete audio message"
                            >
                              <DeleteIcon style={{ fontSize: 22, color: '#e11d48' }} />
                            </button>
                          )}
                        </div>
                      ) : (typeof msg.text === "string" && msg.text.length > 0) ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ background: isSender ? "#dcf8c6" : "#fff", borderRadius: 8, padding: "8px 16px", fontSize: "1.1em", textAlign: "left", boxShadow: isSender ? "0 2px 8px #b2f5ea" : "0 2px 8px #eee", border: isSender ? "1px solid #b2f5ea" : "1px solid #eee", marginLeft: isSender ? "auto" : 0, marginRight: isSender ? 0 : "auto" }}>{msg.text}</div>
                          {isSender && (
                            <button
                              onClick={async () => {
                                if (window.confirm('Delete this message?')) {
                                  await import('firebase/firestore').then(({ deleteDoc, doc }) =>
                                    deleteDoc(doc(db, 'messages', msg.id))
                                  );
                                }
                              }}
                              style={{ background: 'none', border: 'none', color: '#e11d48', fontSize: 22, cursor: 'pointer', marginLeft: 4, display: 'flex', alignItems: 'center' }}
                              title="Delete message"
                            >
                              <DeleteIcon style={{ fontSize: 22, color: '#e11d48' }} />
                            </button>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t.typeMessage || "Type a message..."}
                style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc", fontSize: "1.1em" }}
                disabled={loading}
              />
              <button onClick={() => sendMessage()} disabled={loading || !text.trim()} style={{ background: "#0077b5", color: "white", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? t.uploading || "Sending..." : t.message || "Send"}
              </button>
              {!recording ? (
                <button onClick={startRecording} style={{ background: "#ff9800", color: "white", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: "bold", cursor: "pointer" }}>
                  🎤 Record
                </button>
              ) : (
                <button onClick={stopRecording} style={{ background: "#e11d48", color: "white", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: "bold", cursor: "pointer" }}>
                  ⏹️ Stop
                </button>
              )}
            </div>
          </>
        ) : (
          <div style={{ color: '#888', textAlign: 'center', marginTop: 80, fontSize: 20 }}>Select a conversation from the inbox to start chatting.</div>
        )}
      </div>
    </div>
  );
}

export default MessagingPage;
