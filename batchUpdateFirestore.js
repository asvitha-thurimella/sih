// batchUpdateFirestore.js
// Usage: node batchUpdateFirestore.js
// This script updates all posts and profiles in Firestore to ensure required fields exist for LinkedIn-style navigation.

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function updateProfiles() {
  const profilesRef = db.collection('profiles');
  const snapshot = await profilesRef.get();
  const updates = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    const required = {
      name: data.name || 'Anonymous',
      profession: data.profession || 'N/A',
      location: data.location || 'N/A',
      photoURL: data.photoURL || '',
      experience: data.experience || '',
      phone: data.phone || '',
      email: data.email || '',
      gender: data.gender || '',
      age: data.age || '',
    };
    updates.push(doc.ref.update(required));
  });
  await Promise.all(updates);
  console.log('Profiles updated.');
}

async function updatePosts() {
  const postsRef = db.collection('activities');
  const snapshot = await postsRef.get();
  const updates = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    // Try to get profile for this user
    updates.push((async () => {
      let profile = null;
      if (data.userId) {
        const profileSnap = await db.collection('profiles').doc(data.userId).get();
        profile = profileSnap.exists ? profileSnap.data() : {};
      } else {
        profile = {};
      }
      const required = {
        userId: data.userId || '',
        userName: data.userName || profile.name || 'Anonymous',
        userPhoto: data.userPhoto || profile.photoURL || '',
        profession: data.profession || profile.profession || 'N/A',
        location: data.location || profile.location || 'N/A',
      };
      await doc.ref.update(required);
    })());
  });
  await Promise.all(updates);
  console.log('Posts updated.');
}

async function main() {
  await updateProfiles();
  await updatePosts();
  console.log('Batch update complete.');
}

main().catch(console.error);
