import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase"; // Adjust path if necessary

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // For redirecting after login

  useEffect(() => {
    document.title = "Simple Shelf - Login";
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

   const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      // Redirect to home page on successful login
      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{ background: "linear-gradient(135deg, #012A2D, #435355)" }}
    >
      {/* Website Name */}
      <h1 className="text-4xl font-bold mb-6" style={{ color: "white" }}>
        Simple Shelf
      </h1>

      {/* Login Box */}
      <form
        onSubmit={handleSubmit}
        className="border-2 rounded-lg p-8 w-full max-w-md bg-white shadow-lg"
        style={{ borderColor: "#012A2D" }}
      >
        <h2 className="text-3xl font-bold text-center mb-6" style={{ color: "#012A2D" }}>
          Login
        </h2>

        {/* Remove Name field since Email/Password login */}
        {/* Email Input */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="border w-full p-2 rounded mb-3 bg-white placeholder-gray-500 text-black transition-all duration-300"
          style={{ borderColor: "#435355" }}
          onFocus={(e) => (e.target.style.borderColor = "#012A2D")}
          onBlur={(e) => (e.target.style.borderColor = "#435355")}
          onChange={handleChange}
          value={formData.email}
          required
        />
        {/* Password Input */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border w-full p-2 rounded mb-1 bg-white placeholder-gray-500 text-black transition-all duration-300"
          style={{ borderColor: "#435355" }}
          onFocus={(e) => (e.target.style.borderColor = "#012A2D")}
          onBlur={(e) => (e.target.style.borderColor = "#435355")}
          onChange={handleChange}
          value={formData.password}
          required
        />

        <div className="text-right mb-4">
          <Link to="/forgot-password" style={{ color: "#012A2D" }} className="hover:underline text-sm">
            Forgot Password?
          </Link>
        </div>

        {error && <p className="text-red-600 mb-4 text-center font-semibold">{error}</p>}

        <button
          type="submit"
          className="w-full py-2 rounded font-bold transition-all duration-300"
          style={{
            backgroundColor: "#012A2D",
            color: "white",
            border: "2px solid #012A2D",
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          disabled={loading}
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
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-center mt-4 text-black">
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "#012A2D" }} className="hover:underline">
            Go to Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
