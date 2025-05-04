const admin = require('firebase-admin');

// Path to your service account key JSON file
const serviceAccount = require('./config/soundlibrarystore-firebase-adminsdk-osp7b-87c20b61a7.json');

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://soundlibrarystore.firebaseio.com', // Replace with your database URL
});

// Function to set custom user claims
const setCustomUserClaims = async (uid, role) => {
  try {
    await admin.auth().setCustomUserClaims(uid, { role: role });
    console.log(`Custom claims set for user ${uid}`);
  } catch (error) {
    console.error('Error setting custom claims:', error);
  }
};

// Example usage for setting moderator role
const userId = 'v6INzHAPz2QBbQWxmRvEobbWGrG3'; // Replace with the actual user's UID
setCustomUserClaims(userId, 'moderator');
