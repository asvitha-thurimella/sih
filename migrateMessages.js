const admin = require('firebase-admin');
const fs = require('fs');

// Load service account key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateMessages() {
  const messagesSnapshot = await db.collection('messages').get();

  for (const doc of messagesSnapshot.docs) {
    const data = doc.data();
    const senderId = data.senderId;
    const receiverId = data.receiverId;
    if (!senderId || !receiverId) {
      console.log(`Skipping message ${doc.id}: missing senderId or receiverId`);
      continue;
    }
    // Consistent conversationId (sorted order)
    const ids = [senderId, receiverId].sort();
    const conversationId = `${ids[0]}_${ids[1]}`;

    // Copy message to new location
    await db
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .doc(doc.id)
      .set(data);

    console.log(`Migrated message ${doc.id} to conversations/${conversationId}/messages`);
  }
  console.log('Migration complete!');
}

migrateMessages().catch(console.error);
