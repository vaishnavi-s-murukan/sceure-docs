import { useState } from 'react';
import { auth } from "../firebase/firebaseConfig";
import { signInWithEmailAndPassword, signInWithPhoneNumber } from "firebase/auth";

const Login = () => {
  const [loginData, setLoginData] = useState({ login: '', password: '' });

  const handleLogin = async () => {
    if (isNaN(loginData.login)) {
      // Email login
      try {
        await signInWithEmailAndPassword(auth, loginData.login, loginData.password);
        alert('Logged in with Email!');
      } catch (err) {
        alert(err.message);
      }
    } else {
      // Phone login
      const phoneWithCode = '+91' + loginData.login;
      try {
        await signInWithPhoneNumber(auth, phoneWithCode, window.recaptchaVerifier);
        alert('Phone login initiated, OTP required!');
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
        <div className="space-y-4">
          <input
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            placeholder="Email or Phone"
            value={loginData.login}
            onChange={e => setLoginData({ ...loginData, login: e.target.value })}
          />
          <input
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={e => setLoginData({ ...loginData, password: e.target.value })}
          />

          <button
            className="w-full bg-blue-500 text-black py-2 rounded-md hover:bg-blue-600"
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
