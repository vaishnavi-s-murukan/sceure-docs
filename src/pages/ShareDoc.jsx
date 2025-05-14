import { useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import emailjs from "@emailjs/browser";

export default function ShareDoc({ user }) {
  const [email, setEmail] = useState("");
  const [docId, setDocId] = useState("");
  const [docType, setDocType] = useState("");
  const [hint, setHint] = useState("");
  const [permission, setPermission] = useState("view");

  const handleShare = async () => {
    if (!email || !docId || !docType) return alert("All fields required");

    try {
      // Fetch fileUrl from Firestore
      const docRef = doc(db, "documents", docId); // change "documents" to your actual collection name
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return alert("Document not found");
      }

      const fileUrl = docSnap.data().fileUrl;

      const oneTimeLink = `http://localhost:5173/view/${docId}`;

      // Save sharing info to Firestore
      await addDoc(collection(db, "sharedDocs"), {
        sharedBy: user.uid,
        sharedWith: email,
        docId,
        fileUrl,
        docType,
        hint,
        permissions: permission,
        used: false, // for one-time use check
        createdAt: serverTimestamp(),
      });

      // Send email
      await emailjs.send(
        "service_fipjrof",
        "template_byzlyja",
        {
          to_email: email,
          doc_type: docType,
          link: oneTimeLink,
        },
        "SqiYBWkSBp5OGKkeb"
      );

      alert("Document shared and email sent!");
      setEmail("");
      setDocId("");
      setDocType("");
      setHint("");
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">Share Document</h2>

      <input
        className="w-full mb-2 p-2 border rounded"
        placeholder="Receiver's Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full mb-2 p-2 border rounded"
        placeholder="Document ID"
        value={docId}
        onChange={(e) => setDocId(e.target.value)}
      />

      <input
        className="w-full mb-2 p-2 border rounded"
        placeholder="Document Type"
        value={docType}
        onChange={(e) => setDocType(e.target.value)}
      />

      <input
        className="w-full mb-2 p-2 border rounded"
        placeholder="Hint"
        value={hint}
        onChange={(e) => setHint(e.target.value)}
      />

      <select
        className="w-full mb-4 p-2 border rounded"
        value={permission}
        onChange={(e) => setPermission(e.target.value)}
      >
        <option value="view">View Only</option>
        <option value="download">View + Download</option>
      </select>

      <button
        onClick={handleShare}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Share Document
      </button>
    </div>
  );
}
