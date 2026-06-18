import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

    
console.log("LOGIN RESPONSE:", res.data);

const token =
  res.data.token ||
  res.data.accessToken ||
  res.data.jwt ||
  res.data.data?.token;

if (token) {
  localStorage.setItem("token", token);
  console.log("TOKEN SAVED");
}

alert("Login Successful");
navigate("/dashboard");
;
    } catch (err) {
      console.log("LOGIN ERROR:", err.response?.data);
      alert("Login Failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-xl w-96">
        <h1 className="text-white text-2xl mb-5">Login</h1>

        <input
          className="w-full p-2 mb-3 rounded"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-2 mb-3 rounded"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Login
        </button>

        <p className="text-white mt-3 text-sm">
          No account?{" "}
          <Link className="text-blue-400" to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
