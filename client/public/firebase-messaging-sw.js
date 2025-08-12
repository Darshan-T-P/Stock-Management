/* eslint-disable no-undef */
// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB7SJDjW4OTS",
  authDomain: "stock-management-1823.firebaseapp.com",
  projectId: "stock-management-1823",
  storageBucket: "stock-management-1823.appspot.com",
  messagingSenderId: "226717060855",
  appId: "1:226717060855:web:xxxxxxxxxxxxxx",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png',  // Customize this path to your app icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
