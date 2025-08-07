// src/utils/notificationService.js
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function sendInAppNotification(uid, title, body, type = "info") {
  try {
    await addDoc(collection(db, "users", uid, "notifications"), {
      title,
      body,
      createdAt: serverTimestamp(),
      read: false,
      type,
    });
    console.log("Notification sent successfully.");
  } catch (err) {
    console.error("Failed to send notification:", err);
  }
}
