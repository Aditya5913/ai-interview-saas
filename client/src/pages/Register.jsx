import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res = await axios.post("http://localhost:4000/api/auth/register", {
        username,
        email,
        password,
      });

      console.log("SUCCESS:", res.data);

      alert("Account Created Successfully 🎉");

      // 👉 redirect to HOME (/)
      navigate("/");
    } catch (error) {
      console.log("ERROR:", error.response?.data || error.message);
      alert("Registration Failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-xl w-96">
        <h1 className="text-white text-2xl mb-5">Register</h1>

        <input
          className="w-full p-2 mb-3 rounded"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="w-full p-2 mb-3 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-2 mb-3 rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          className="w-full bg-green-500 text-white p-2 rounded"
        >
          Create Account
        </button>

        {/* Back to HOME button */}
        <button
          onClick={() => navigate("/")}
          className="w-full mt-3 bg-blue-500 text-white p-2 rounded"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
