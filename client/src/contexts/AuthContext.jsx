// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  // Try to rehydrate profile and store from sessionStorage on init
  const [profile, setProfile] = useState(() => {
    const stored = sessionStorage.getItem("profile");
    return stored ? JSON.parse(stored) : null;
  });

  const [store, setStore] = useState(() => {
    const stored = sessionStorage.getItem("store");
    return stored ? JSON.parse(stored) : null;
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          // Attempt to restore profile and store from sessionStorage first
          let cachedProfile = sessionStorage.getItem("profile");
          if (cachedProfile) {
            cachedProfile = JSON.parse(cachedProfile);
            setProfile(cachedProfile);
          } else {
            // Fetch profile from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              setProfile(data);
              sessionStorage.setItem("profile", JSON.stringify(data));
              cachedProfile = data;
            } else {
              setProfile(null);
              sessionStorage.removeItem("profile");
              cachedProfile = null;
            }
          }

          // If profile has storeId, do the same for store data
          if (cachedProfile?.storeId) {
            let cachedStore = sessionStorage.getItem("store");
            if (cachedStore) {
              setStore(JSON.parse(cachedStore));
            } else {
              const storeDoc = await getDoc(doc(db, "stores", cachedProfile.storeId));
              if (storeDoc.exists()) {
                const storeData = storeDoc.data();
                setStore(storeData);
                sessionStorage.setItem("store", JSON.stringify(storeData));
              } else {
                setStore(null);
                sessionStorage.removeItem("store");
              }
            }
          } else {
            setStore(null);
            sessionStorage.removeItem("store");
          }
        } catch (error) {
          console.error("Error fetching profile or store:", error);
          setProfile(null);
          setStore(null);
          sessionStorage.removeItem("profile");
          sessionStorage.removeItem("store");
        }
      } else {
        // If no user logged in, clear profile and store
        setProfile(null);
        setStore(null);
        sessionStorage.removeItem("profile");
        sessionStorage.removeItem("store");
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // On logout, clear profile/store caches and sign out
  const logout = () => {
    sessionStorage.removeItem("profile");
    sessionStorage.removeItem("store");
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ currentUser, profile, store, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
