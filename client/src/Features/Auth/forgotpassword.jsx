import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import SiteTitle from "./SiteTitle";
import { auth } from "../../firebase"; // adjust path if needed
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");   // To show success/error messages
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "SimpleShelf - Forgot Password";
  }, []);

  const handleSubmit = async () => {
    setMessage("");
    setError("");
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
  await sendPasswordResetEmail(auth, email);
  setMessage(`If an account exists for ${email}, a reset link has been sent.`);
} catch (err) {
  if (err.code === 'auth/user-not-found') {
    setError("No user found with this email.");
  } else {
    setError(err.message);
  }
}
 finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{ background: "linear-gradient(135deg, #012A2D, #435355)" }}
    >
      {/* <SiteTitle /> */}

      <div
        className="border-2 rounded-lg p-8 w-full max-w-md bg-white shadow-lg"
        style={{ borderColor: "#012A2D" }}
      >
        <h2
          className="text-3xl font-bold text-center mb-6"
          style={{ color: "#012A2D" }}
        >
          Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border w-full p-2 rounded mb-4 bg-white placeholder-gray-500 text-black"
          style={{ borderColor: "#435355" }}
          onFocus={(e) => (e.target.style.borderColor = "#012A2D")}
          onBlur={(e) => (e.target.style.borderColor = "#435355")}
          disabled={loading}
        />

        <button
          onClick={handleSubmit}
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
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {/* Show success or error message */}
        {message && <p className="text-green-600 mt-4 text-center">{message}</p>}
        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

        <p className="text-sm text-center mt-4 text-black">
          Remembered your password?{" "}
          <Link to="/login" style={{ color: "#012A2D" }} className="hover:underline">
            Go to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
