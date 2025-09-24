const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migratePosts() {
  const postsSnapshot = await db.collection('posts').get();

  for (const doc of postsSnapshot.docs) {
    const data = doc.data();
    // Skip if already migrated
    if (Array.isArray(data.media) && data.media.length > 0) {
      console.log(`Post ${doc.id} already has media array, skipping.`);
      continue;
    }
    const media = [];
    if (data.imageUrl) {
      media.push({ url: data.imageUrl, type: 'image' });
    }
    if (data.videoUrl) {
      media.push({ url: data.videoUrl, type: 'video' });
    }
    if (media.length === 0) {
      console.log(`Post ${doc.id} has no legacy media fields, skipping.`);
      continue;
    }
    await db.collection('posts').doc(doc.id).update({ media });
    console.log(`Migrated post ${doc.id} to new media array format.`);
  }
  console.log('Post migration complete!');
}

migratePosts().catch(console.error);
