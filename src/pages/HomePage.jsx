import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 text-center px-4 md:px-0">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
        <div className="flex gap-4 text-sm font-medium text-gray-600">
          <button className="hover:text-black">Businesses</button>
          <button className="hover:text-black">Individuals</button>
        </div>
        <nav className="hidden md:flex gap-6 text-sm text-gray-700 font-medium">
          <Link to="/upload">Upload</Link>
          <Link to="/view">View Docs</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/help">Help</Link>
        </nav>
        <div className="flex gap-2">
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Log In
          </Link>
          <Link
            to="/register"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex flex-col items-center justify-center flex-1 text-center px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-snug">
          Secure your documents with{" "}
          <span className="text-blue-600">encrypted</span> sharing
        </h1>
        <p className="mt-4 text-gray-600 max-w-xl">
          Our platform offers secure document uploads and controlled access
          sharing with advanced encryption, so your files are always protected.
        </p>
        <div className="mt-6 flex gap-4 flex-wrap justify-center">
          <Link
            to="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
          >
            Try Now
          </Link>
          <Link
            to="/about"
            className="border border-blue-600 text-blue-600 px-6 py-3 rounded hover:bg-blue-50"
          >
            Why Us?
          </Link>
        </div>
        <p className="mt-2 text-sm text-gray-400">Free for 14 days</p>
      </main>
    </div>
  );
}
