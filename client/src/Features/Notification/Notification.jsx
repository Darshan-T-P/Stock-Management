// src/Features/Notification/NotificationPage.jsx
import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";

export default function NotificationPage() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const notificationsQuery = query(
      collection(db, "users", currentUser.uid, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notiData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notiData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Mark notification as read
  const markAsRead = async (id) => {
    if (!currentUser) return;
    await updateDoc(doc(db, "users", currentUser.uid, "notifications", id), {
      read: true,
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>

      {notifications.length === 0 && <p>No notifications.</p>}

      <ul>
        {notifications.map((noti) => (
          <li
            key={noti.id}
            className={`mb-3 p-4 rounded border cursor-pointer transition
              ${noti.read ? "bg-gray-100 border-gray-300" : "bg-yellow-50 border-yellow-500"}`}
            onClick={() => !noti.read && markAsRead(noti.id)}
            title="Click to mark as read"
          >
            <strong className="block text-lg mb-1">{noti.title}</strong>
            <span>{noti.body}</span>
            <div className="text-xs text-gray-500 mt-1">
              {noti.createdAt?.toDate?.().toLocaleString() || ""}
              {!noti.read && <b className="ml-4 text-yellow-600">(Unread)</b>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
