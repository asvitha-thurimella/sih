// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBIqGrshMr-ldL4NtUVXD_GvsemMDLizq0",
  authDomain: "sihhackathon-99e58.firebaseapp.com",
  projectId: "sihhackathon-99e58",
  storageBucket: "sihhackathon-99e58.appspot.com",
  messagingSenderId: "267813906231",
  appId: "1:267813906231:web:46153eb275d60856759cb2",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const realtimeDb = getDatabase(app);

export { auth, db, storage, realtimeDb };
