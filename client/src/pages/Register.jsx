import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.post("/auth/register", {
        username,
        email,
        password,
      });

      console.log("SUCCESS:", res.data);

      alert("Account Created Successfully 🎉");

      navigate("/login");
    } catch (error) {
      console.log(error);

      alert(error.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-950 px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-72 h-72 bg-green-500/20 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>

        <div className="absolute w-72 h-72 bg-blue-500/20 rounded-full blur-3xl bottom-10 right-10 animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white">ResumeIQ AI 🚀</h1>

          <p className="text-gray-300 mt-2">
            Create your account and start preparing smarter
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            className="w-full p-3 rounded-xl bg-black/30 border border-gray-600 text-white outline-none focus:border-green-400"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className="w-full p-3 rounded-xl bg-black/30 border border-gray-600 text-white outline-none focus:border-green-400"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full p-3 rounded-xl bg-black/30 border border-gray-600 text-white outline-none focus:border-green-400"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 transition-all duration-300 text-white font-semibold py-3 rounded-xl"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-gray-300 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-400 hover:text-green-300 font-semibold"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
