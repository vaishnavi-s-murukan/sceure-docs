import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { Link } from "react-router-dom";
import { getDocs, query, where, collection } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export default function Home({ user }) {
  const [showProfile, setShowProfile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [uploadedDocsCount, setUploadedDocsCount] = useState(0);
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user-specific documents
  useEffect(() => {
    const fetchDocumentData = async () => {
      try {
        const userId = auth.currentUser.uid;
        const docsRef = collection(db, "documents");
        const q = query(docsRef, where("userId", "==", userId));
        const snap = await getDocs(q);
        const docsData = snap.docs.map(d => {
          const data = d.data();
          return {
            ...data,
            createdAt: data.createdAt?.toDate?.() || null, // 👈 convert to JS Date
          };
        });
        setUploadedDocsCount(docsData.length);
        setRecentDocs(docsData.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDocumentData();
  }, []);

  const handleSignOut = () => signOut(auth).catch(console.error);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`
          bg-blue-400 text-white flex flex-col
          ${sidebarCollapsed ? 'w-16' : 'w-64'} 
          transition-width duration-300 ease-in-out
        `}
      >
        <div className="flex items-center justify-between p-4">
          {!sidebarCollapsed && <h2 className="text-lg font-bold">Secure Docs</h2>}
          <button
            onClick={() => setSidebarCollapsed(sc => !sc)}
            className="p-1 rounded hover:bg-blue-700 focus:outline-none"
          >
            {sidebarCollapsed ? '➤' : '⬅️'}
          </button>
        </div>

        <nav className="flex-1 px-2 space-y-2">
          <Link
            to="/upload"
            className="flex items-center gap-3 px-2 py-2 rounded hover:bg-blue-700"
          >
            <span className="text-xl">⬆️</span>
            {!sidebarCollapsed && <span>Upload</span>}
          </Link>
          <Link
            to="/view"
            className="flex items-center gap-3 px-2 py-2 rounded hover:bg-blue-700"
          >
            <span className="text-xl">📁</span>
            {!sidebarCollapsed && <span>My Docs</span>}
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-3 px-2 py-2 rounded hover:bg-blue-700"
          >
            <span className="text-xl">👤</span>
            {!sidebarCollapsed && <span>Profile</span>}
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="bg-blue-200 text-white flex items-center justify-between px-6 py-4 shadow-md">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-1 rounded hover:bg-blue-500 focus:outline-none"
              onClick={() => setSidebarCollapsed(sc => !sc)}
            >
              ☰
            </button>
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          <div className="relative">
            <div
              className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center font-bold cursor-pointer"
              onClick={() => setShowProfile(p => !p)}
            >
              {(user.displayName || user.email || 'U')[0].toUpperCase()}
            </div>
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg p-3 z-50">
                <p className="font-medium">
                  Hi, {user.displayName || user.email.split('@')[0]}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <button
                  onClick={handleSignOut}
                  className="mt-3 w-full text-red-600 hover:underline text-left"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 overflow-auto">
          <h2 className="text-xl font-semibold mb-4">Welcome to your Dashboard</h2>
          {loading ? (
            <p>Loading stats…</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium">Total Documents</h3>
                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {uploadedDocsCount}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium">Recent Documents</h3>
                <ul className="mt-2 space-y-1 text-gray-600">
                  {recentDocs.length === 0
                    ? <li>No recent docs</li>
                    : recentDocs.map((d, i) => (
                      <li key={i}>
                        <strong>{d.docType}</strong> – {new Date(d.createdAt).toLocaleDateString()}
                      </li>
                    ))}
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium">Account Status</h3>
                <p className="mt-2 text-xl font-bold text-green-600">Active</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
