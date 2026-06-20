import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
const navigate = useNavigate();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);

const handleLogin = async (e) => {
e.preventDefault();

if (!email || !password) {
  alert("Please fill all fields");
  return;
}

try {
  setLoading(true);

  const res = await api.post("/auth/login", {
    email,
    password,
  });

  const token =
    res.data.token ||
    res.data.accessToken ||
    res.data.jwt ||
    res.data.data?.token;

  if (token) {
    localStorage.setItem("token", token);
  }

  navigate("/dashboard");
} catch (err) {
  console.log(err);
  alert("Login Failed ❌");
} finally {
  setLoading(false);
}

};

return ( <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-950 px-4">

  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute w-72 h-72 bg-green-500/20 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>

    <div className="absolute w-72 h-72 bg-blue-500/20 rounded-full blur-3xl bottom-10 right-10 animate-pulse"></div>
  </div>

  <div className="relative w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">

    <div className="text-center mb-8">
      <h1 className="text-4xl font-extrabold text-white">
        ResumeIQ AI 🚀
      </h1>

      <p className="text-gray-300 mt-2">
        Smart Resume Analysis & Interview Preparation
      </p>
    </div>

    <form onSubmit={handleLogin} className="space-y-4">

      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 rounded-xl bg-black/30 border border-gray-600 text-white outline-none focus:border-green-400"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-3 rounded-xl bg-black/30 border border-gray-600 text-white outline-none focus:border-green-400"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-500 hover:bg-green-600 transition-all duration-300 text-white font-semibold py-3 rounded-xl"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>

    <p className="text-center text-gray-300 mt-6">
      Don't have an account?{" "}
      <Link
        to="/register"
        className="text-green-400 hover:text-green-300 font-semibold"
      >
        Register
      </Link>
    </p>
  </div>
</div>

);
}
