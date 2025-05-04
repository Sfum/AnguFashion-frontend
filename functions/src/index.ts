const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Function to set custom claims
// @ts-ignore
exports.setUserRole = functions.https.onCall(async (data, context) => {
  // Ensure the request is made by an authenticated user with admin rights
  if (!context.auth || !context.auth.token.admin) {
    return { error: 'Request not authorized. User must be an admin.' };
  }

  const email = data.email;
  const role = data.role;

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { role: role });
    return { message: `Success! ${email} has been given the ${role} role.` };
  } catch (error) {
    // @ts-ignore
    return { error: error.message };
  }
});
