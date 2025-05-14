import { useState } from "react";
import axios from "axios";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function UploadDoc({ user }) {
    const [file, setFile] = useState(null);
    const [docType, setDocType] = useState("");
    const [hint, setHint] = useState("");
    const [docId, setDocId] = useState(""); // 🔄 changed from aadhaar
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file || !docType || !docId) {
            alert("❗ Please fill all fields");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "secure-docs");

        try {
            setLoading(true);
            const res = await axios.post(
                "https://api.cloudinary.com/v1_1/dak9pbg4o/auto/upload",
                formData
            );

            const fileUrl = res.data.secure_url;

            await addDoc(collection(db, "documents"), {
                userId: user.uid,
                email: user.email,
                docId, // ✅ now storing docId
                docType,
                hint,
                fileUrl,
                createdAt: serverTimestamp(),
            });

            alert("✅ Document uploaded successfully!");
            setFile(null);
            setDocType("");
            setHint("");
            setDocId(""); // reset
        } catch (err) {
            alert("❌ Upload failed");
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
            <div className="bg-white shadow-md border border-gray-200 rounded p-6 w-full max-w-sm">
                <h2 className="text-lg font-bold text-center mb-4">Upload Document</h2>

                <label className="block text-sm mb-1">Document ID</label>
                <input
                    type="text"
                    placeholder="Enter Document ID"
                    value={docId}
                    onChange={(e) => setDocId(e.target.value)}
                    className="w-full mb-3 px-3 py-2 border rounded"
                />

                <label className="block text-sm mb-1">Type</label>
                <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full mb-3 px-3 py-2 border rounded"
                >
                    <option value="">Select Document Type</option>
                    <option value="Proof">Proof</option>
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Certificate">Certificate</option>
                    <option value="Ration Card">Ration Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Birth Certificate">Birth Certificate</option>
                    <option value="Electricity Bill">Electricity Bill</option>
                    <option value="Income Certificate">Income Certificate</option>
                    <option value="Caste Certificate">Caste Certificate</option>
                    <option value="Domicile Certificate">Domicile Certificate</option>
                </select>

                <label className="block text-sm mb-1">Hint</label>
                <input
                    type="text"
                    placeholder="Hint"
                    value={hint}
                    onChange={(e) => setHint(e.target.value)}
                    className="w-full mb-3 px-3 py-2 border rounded"
                />

                <label className="block text-sm mb-1">Select File</label>
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full mb-4"
                />

                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="w-full bg-blue-600 text-black py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Uploading..." : "Upload"}
                </button>
            </div>
        </div>
    );
}
