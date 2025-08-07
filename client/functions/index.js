/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// In functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.notifyLowStock = functions.firestore
    .document("stores/{storeId}/products/{productId}")
    .onUpdate(async (change, context) => {
      const before = change.before.data();
      const after = change.after.data();
      const {storeId} = context.params;

      // Detect low stock threshold crossing (e.g., falling to < 10)
      if (after.stock < 10 && before.stock >= 10) {
      // Fetch user/store profile to get FCM token(s)
        const storeSnap = await admin.firestore()
            .doc(`stores/${storeId}`).get();
        const ownerId = storeSnap.data().ownerId;
        const userDoc = await admin.firestore().doc(`users/${ownerId}`).get();
        const fcmToken = userDoc.data().fcmToken;
        if (fcmToken) {
          await admin.messaging().send({
            token: fcmToken,
            notification: {
              title: "Low Stock Alert!",
              body: `Product "${after.name}" is running low (Stock:${after.stock}).`,
            },
          });
        }
      }
    });
