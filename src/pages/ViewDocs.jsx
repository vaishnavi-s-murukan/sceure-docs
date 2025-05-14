import { useEffect, useState, useCallback } from "react";
import { db } from "../firebase/firebaseConfig";
import emailjs from "@emailjs/browser";
import {
    collection,
    query,
    where,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
} from "firebase/firestore";

export default function ViewDocs({ user }) {
    const [docs, setDocs] = useState([]);
    const [editingDoc, setEditingDoc] = useState(null);
    const [hint, setHint] = useState("");
    const [newFile, setNewFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [shareDoc, setShareDoc] = useState(null);
    const [receiverEmail, setReceiverEmail] = useState("");
    const [accessType, setAccessType] = useState("view");

    const generateToken = () => Math.random().toString(36).substring(2, 12);

    const fetchDocs = useCallback(async () => {
        if (!user?.uid) return;
        const q = query(collection(db, "documents"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        const userDocs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setDocs(userDocs);
    }, [user]);

    useEffect(() => {
        fetchDocs();
    }, [fetchDocs]);

    const handleDelete = async () => {
        await deleteDoc(doc(db, "documents", confirmDelete));
        setDocs((prev) => prev.filter((doc) => doc.id !== confirmDelete));
        setConfirmDelete(null);
        alert("Deleted successfully!");
    };

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "secure-docs");

        const res = await fetch("https://api.cloudinary.com/v1_1/dak9pbg4o/upload", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        return data.secure_url;
    };

    const handleUpdate = async () => {
        if (!hint.trim()) return alert("Hint cannot be empty");

        let updatedData = { hint };

        if (newFile) {
            const url = await uploadToCloudinary(newFile);
            updatedData.fileUrl = url;
        }

        await updateDoc(doc(db, "documents", editingDoc.id), updatedData);

        setDocs((prev) =>
            prev.map((d) =>
                d.id === editingDoc.id ? { ...d, ...updatedData } : d
            )
        );

        setEditingDoc(null);
        setHint("");
        setNewFile(null);
        setPreviewUrl("");
        alert("Document updated!");
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setNewFile(file);
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleEmailShare = async () => {
        if (!receiverEmail) return alert("Please enter an email");

        const token = generateToken();
        const expirationTime = 24 * 60 * 60 * 1000; // 1 day
        const expiryTimestamp = Date.now() + expirationTime;
        const expiryDate = new Date(expiryTimestamp).toLocaleString();
        const access = accessType === "view" ? "View Only" : "View + Download";

        try {
            const response = await emailjs.send(
                "service_fipjrof",
                "template_byzlyja",
                {
                    email: receiverEmail,
                    from_email: "securedoc@gmail.com",
                    doc_type: shareDoc.docType,
                    link: `${shareDoc.fileUrl}\n\nToken: ${token}\nExpiry: ${expiryDate}\nAccess Type: ${access}`,
                },
                "SqiYBWkSBp5OGKkeb"
            );

            if (response.status === 200) {
                await updateDoc(doc(db, "documents", shareDoc.id), {
                    sharedToken: token,
                    tokenExpiry: expiryTimestamp,
                    accessType,
                });

                alert("Document shared successfully via email!");
                setShareDoc(null);
                setReceiverEmail("");
                setAccessType("view");
            } else {
                alert("Failed to send email. Please try again.");
            }
        } catch (error) {
            console.error("Email sending error:", error);
            alert("An error occurred while sending the email.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">View Documents</h2>

            {docs.length === 0 ? (
                <p>No documents found for this user.</p>
            ) : (
                docs.map((doc) => (
                    <div
                        key={doc.id}
                        className="border rounded-lg p-4 mb-4 shadow-md bg-white relative"
                    >
                        <p className="text-lg font-semibold">Type: {doc.docType}</p>
                        <p className="text-gray-700 mb-2">Hint: {doc.hint || "nil"}</p>

                        <div className="bg-gray-100 border p-2 mb-3">
                            <img
                                src={doc.fileUrl}
                                alt="Document"
                                className="w-full h-40 object-contain mx-auto"
                            />
                        </div>

                        <div className="flex justify-center gap-4 flex-wrap">
                            <button
                                onClick={() => {
                                    const fileName = `${doc.docType || "document"}.${doc.fileUrl.split(".").pop().split("?")[0]}`;
                                    const link = document.createElement("a");
                                    link.href = doc.fileUrl.replace("/upload/", "/upload/fl_attachment/");
                                    link.download = fileName;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    alert("Download started!");
                                }}
                                className="bg-yellow-500 text-black px-4 py-1 rounded hover:bg-red-700"
                            >
                                Download
                            </button>
                            <button
                                onClick={() => {
                                    setEditingDoc(doc);
                                    setHint(doc.hint || "");
                                    setPreviewUrl(doc.fileUrl);
                                }}
                                className="bg-blue-500 text-black px-4 py-1 rounded hover:bg-blue-600"
                            >
                                Update
                            </button>
                            <button
                                onClick={() => setConfirmDelete(doc.id)}
                                className="bg-red-500 text-black px-4 py-1 rounded hover:bg-blue-600"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setShareDoc(doc)}
                                className="bg-green-500 text-black px-4 py-1 rounded hover:bg-green-600"
                            >
                                Share
                            </button>
                        </div>
                    </div>
                ))
            )}

            {/* --- UPDATE MODAL --- */}
            {editingDoc && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">Update Document</h3>

                        <input
                            type="text"
                            value={hint}
                            onChange={(e) => setHint(e.target.value)}
                            className="border p-2 w-full mb-4"
                            placeholder="Enter new hint"
                        />

                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="mb-4"
                        />

                        {previewUrl && (
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="h-40 w-full object-contain mb-4"
                            />
                        )}

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setEditingDoc(null);
                                    setNewFile(null);
                                    setPreviewUrl("");
                                }}
                                className="px-4 py-1 rounded bg-gray-300 hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="px-4 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- DELETE MODAL --- */}
            {confirmDelete && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm text-center">
                        <p className="mb-4 font-medium">Are you sure you want to delete this document?</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-4 py-1 rounded bg-gray-300 hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SHARE MODAL --- */}
            {shareDoc && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <h3 className="text-xl font-semibold mb-4">Share Document</h3>

                        <input
                            type="email"
                            placeholder="Receiver's email"
                            value={receiverEmail}
                            onChange={(e) => setReceiverEmail(e.target.value)}
                            className="w-full border p-2 mb-3"
                        />

                        <select
                            value={accessType}
                            onChange={(e) => setAccessType(e.target.value)}
                            className="w-full border p-2 mb-3"
                        >
                            <option value="view">View Only</option>
                            <option value="download">View + Download</option>
                        </select>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShareDoc(null)}
                                className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEmailShare}
                                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                            >
                                Share via Email
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
