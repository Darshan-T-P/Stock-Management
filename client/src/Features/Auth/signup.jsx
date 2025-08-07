import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { setDoc, doc, collection, addDoc } from "firebase/firestore";

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mobile: "",
    storeName: "",   // New field for store name
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "SimpleShelf - Sign Up";
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validations
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("Email and password fields are required");
      return;
    }
    if (!formData.storeName || formData.storeName.trim() === "") {
      setError("Store name is required");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // 2. Create a store document for this user with the provided storeName
      const storeData = {
        ownerId: user.uid,
        storeName: formData.storeName,
        createdAt: new Date(),
      };
      const storeRef = await addDoc(collection(db, "stores"), storeData);

      // 3. Store user profile in Firestore including the storeId reference
      await setDoc(doc(db, "users", user.uid), {
        username: formData.username,
        email: formData.email,
        mobile: formData.mobile,
        storeId: storeRef.id,   // Link the store document with this user
        createdAt: new Date(),
      });

      // Reset form and error
      setFormData({
        username: "",
        email: "",
        mobile: "",
        storeName: "",
        password: "",
        confirmPassword: "",
      });
      setError("");

      // Navigate to login AFTER successful signup and Firestore writes
      navigate("/login");
      console.log("User and store created successfully!");
    } catch (error) {
      setError(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{ background: "linear-gradient(135deg, #012A2D, #435355)" }}
    >
      {/* Signup Form */}
      <form
        onSubmit={handleSubmit}
        className="border-2 rounded-lg p-8 w-full max-w-md bg-white shadow-lg"
        style={{ borderColor: "#012A2D" }}
      >
        <h2
          className="text-3xl font-bold text-center mb-6"
          style={{ color: "#012A2D" }}
        >
          Sign Up
        </h2>

        <input
          type="text"
          name="username"
          placeholder="Username"
          className="border w-full p-2 rounded mb-3 bg-white placeholder-gray-500 text-black"
          style={{ borderColor: "#435355" }}
          onFocus={(e) => (e.target.style.borderColor = "#012A2D")}
          onBlur={(e) => (e.target.style.borderColor = "#435355")}
          onChange={handleChange}
          value={formData.username}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="border w-full p-2 rounded mb-3 bg-white placeholder-gray-500 text-black"
          style={{ borderColor: "#435355" }}
          onFocus={(e) => (e.target.style.borderColor = "#012A2D")}
          onBlur={(e) => (e.target.style.borderColor = "#435355")}
          onChange={handleChange}
          value={formData.email}
          required
        />

        <input
          type="text"
          name="mobile"
          placeholder="Mobile No"
          className="border w-full p-2 rounded mb-3 bg-white placeholder-gray-500 text-black"
          style={{ borderColor: "#435355" }}
          onFocus={(e) => (e.target.style.borderColor = "#012A2D")}
          onBlur={(e) => (e.target.style.borderColor = "#435355")}
          onChange={handleChange}
          value={formData.mobile}
        />

        <input
          type="text"
          name="storeName"
          placeholder="Store Name"
          className="border w-full p-2 rounded mb-3 bg-white placeholder-gray-500 text-black"
          style={{ borderColor: "#435355" }}
          onFocus={(e) => (e.target.style.borderColor = "#012A2D")}
          onBlur={(e) => (e.target.style.borderColor = "#435355")}
          onChange={handleChange}
          value={formData.storeName}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border w-full p-2 rounded mb-3 bg-white placeholder-gray-500 text-black"
          style={{ borderColor: "#435355" }}
          onFocus={(e) => (e.target.style.borderColor = "#012A2D")}
          onBlur={(e) => (e.target.style.borderColor = "#435355")}
          onChange={handleChange}
          value={formData.password}
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          className="border w-full p-2 rounded mb-4 bg-white placeholder-gray-500 text-black"
          style={{ borderColor: "#435355" }}
          onFocus={(e) => (e.target.style.borderColor = "#012A2D")}
          onBlur={(e) => (e.target.style.borderColor = "#435355")}
          onChange={handleChange}
          value={formData.confirmPassword}
          required
        />

        {error && (
          <p className="text-red-600 mb-4 text-center font-semibold">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded font-bold transition-all duration-300"
          style={{
            backgroundColor: "#012A2D",
            color: "white",
            border: "2px solid #012A2D",
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = "white";
              e.target.style.color = "#012A2D";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.backgroundColor = "#012A2D";
              e.target.style.color = "white";
            }
          }}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        <p className="text-sm text-center mt-4 text-black">
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "#012A2D" }}
            className="hover:underline"
          >
            Go to Login
          </Link>
        </p>
      </form>
    </div>
  );
}
