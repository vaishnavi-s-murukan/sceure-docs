import { useState } from 'react';
import { auth } from '../firebase/firebaseConfig';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
      });
      window.recaptchaVerifier.render();
    }
  };

  const handleSendOtp = async () => {
    let cleanedPhone = form.phone.trim().replace(/\D/g, '');

    if (cleanedPhone.startsWith('0')) {
      cleanedPhone = cleanedPhone.substring(1);
    }

    const phoneWithCode = '+91' + cleanedPhone;

    if (cleanedPhone.length !== 10) {
      alert("Enter a valid 10-digit phone number");
      return;
    }

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;

      const confirmation = await signInWithPhoneNumber(auth, phoneWithCode, appVerifier);
      setConfirmationResult(confirmation);
      alert('OTP Sent (test number only)');
    } catch (err) {
      console.error('OTP send error:', err);
      alert(err.message);
    }
  };

  const handleVerifyOtpAndRegister = async () => {
    if (!confirmationResult) {
      alert('Please send the OTP first');
      return;
    }

    if (!otp) {
      alert('Please enter the OTP');
      return;
    }

    try {
      await confirmationResult.confirm(otp);
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(userCredential.user, { displayName: form.name });
      alert('Registered successfully!');
      navigate('/login');
    } catch (err) {
      console.error('OTP verification error:', err);
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Register</h2>
        <div className="space-y-4">
          <input
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
          <input
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="tel"
            maxLength="10"
            pattern="[0-9]*"
            inputMode="numeric"
            placeholder="Phone (10-digit test number)"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
          />

          <div id="recaptcha-container"></div>

          <button
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
            onClick={handleSendOtp}
          >
            Send OTP
          </button>

          <input
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
          />

          <button
            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
            onClick={handleVerifyOtpAndRegister}
            disabled={!confirmationResult}
          >
            Verify OTP & Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
