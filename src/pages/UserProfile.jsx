import { useState } from "react";
import { auth } from "../firebase/firebaseConfig";
import { updateProfile, updateEmail, updatePassword, updatePhoneNumber, PhoneAuthProvider, signInWithPhoneNumber } from "firebase/auth";
import { FiEdit } from "react-icons/fi";

export default function UserProfile({ user }) {
  const [editField, setEditField] = useState(null);
  const [formData, setFormData] = useState({
    name: user.displayName || "",
    email: user.email || "",
    phone: user.phoneNumber || "",
    password: ""
  });

  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleEditClick = (field) => {
    setEditField(field);
  };

  const handleSave = async (field) => {
    try {
      if (field === "name") {
        await updateProfile(auth.currentUser, { displayName: formData.name });
      } else if (field === "email") {
        await updateEmail(auth.currentUser, formData.email);
      } else if (field === "password") {
        await updatePassword(auth.currentUser, formData.password);
      }
      setEditField(null);
      alert(`${field} updated successfully!`);
    } catch (error) {
      console.error(error);
      alert(`Failed to update ${field}`);
    }
  };

  const handleSendOtp = async () => {
    const appVerifier = window.recaptchaVerifier;
    const provider = new PhoneAuthProvider(auth);
    try {
      const verificationId = await provider.verifyPhoneNumber(formData.phone, appVerifier);
      setConfirmationResult({ verificationId });
      setOtpSent(true);
      alert("OTP sent!");
    } catch (error) {
      console.error(error);
      alert("Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const credential = PhoneAuthProvider.credential(
        confirmationResult.verificationId,
        otp
      );
      await updatePhoneNumber(auth.currentUser, credential);
      alert("Phone number updated successfully!");
      setEditField(null);
    } catch (error) {
      console.error(error);
      alert("OTP verification failed");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-6">User Profile</h2>

      {['name', 'email', 'phone', 'password'].map((field) => (
        <div key={field} className="mb-4">
          <label className="block font-semibold capitalize mb-1">{field === 'phone' ? 'Phone Number' : field}</label>
          {editField === field ? (
            <div className="flex gap-2 items-center">
              <input
                type={field === 'password' ? 'password' : 'text'}
                value={formData[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                className="border p-2 flex-1 rounded"
              />
              {field === 'phone' ? (
                otpSent ? (
                  <>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className="border p-2 rounded"
                    />
                    <button
                      onClick={handleVerifyOtp}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Verify
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSendOtp}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Send OTP
                  </button>
                )
              ) : (
                <button
                  onClick={() => handleSave(field)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Save
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span>{field === 'password' ? '••••••••' : formData[field]}</span>
              <FiEdit
                onClick={() => handleEditClick(field)}
                className="text-gray-600 cursor-pointer"
              />
            </div>
          )}
        </div>
      ))}

      <div id="recaptcha-container"></div>
    </div>
  );
}
