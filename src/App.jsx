import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebaseConfig";

import Register from "./components/Register";
import Login from "./components/Login";
import UploadDoc from "./components/UploadDoc";
import Home from "./pages/Home"; // Dashboard page
import ViewDocs from "./pages/ViewDocs"; // View documents page
import UserProfile from "./pages/UserProfile";
import HomePage from "./pages/HomePage"; // Public landing page

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        {!user && (
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}

        {/* Authenticated Routes */}
        {user && (
          <>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/upload" element={<UploadDoc user={user} />} />
            <Route path="/view" element={<ViewDocs user={user} />} />
            <Route path="/profile" element={<UserProfile user={user} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
