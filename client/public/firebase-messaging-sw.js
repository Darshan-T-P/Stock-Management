/* eslint-disable no-undef */
// public/firebase-messaging-sw.js
import firebase from "firebase/app";
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB7S8JDdjW4VotslPVgLEFOi1X_oRCs0u0",
  authDomain: "stock-management-1823d.firebaseapp.com",
  projectId: "stock-management-1823d",
  storageBucket: "stock-management-1823d.firebasestorage.app",
  messagingSenderId: "226717060855",
  appId: "1:226717060855:web:6ee35a731ea6a6c5f14df2",
});

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png',  // Customize icon if needed
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});