'use client';

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import axios from "axios";
import { MainLayout } from "../components/layout/MainLayout";

export default function HomePage() {
  const [knowledges, setKnowledges] = useState([]);

  useEffect(() => {
    fetchKnowledges();
  }, []);

  const fetchKnowledges = async () => {
    const querySnapshot = await getDocs(collection(db, "knowledges"));
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setKnowledges(data);
  };

  const handleUpload = async (e, position = "top") => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_upload");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dd0ro6iov/image/upload",
        formData
      );

      const url = res.data.secure_url;
      await addDoc(collection(db, "knowledges"), {
        imageUrl: url,
        position,
      });
      alert("อัปโหลดสำเร็จ");
      fetchKnowledges();
    } catch (error) {
      alert("อัปโหลดล้มเหลว");
    }
  };

  const handleDelete = async (id) => {
    const docRef = doc(db, "knowledges", id);
    await deleteDoc(docRef);
    fetchKnowledges();
  };

  return (
    <MainLayout activeMenu="home">
      <h1 style={titleStyle}>ข้อมูลความรู้ในระบบ</h1>

      {/* ====== BANNER Section ====== */}
      <section style={sectionStyle}>
        <h2 style={sectionTitle}>📌 รูปภาพแถวบน (Banner)</h2>
        <div style={gridStyle}>
          <UploadCard onUpload={(e) => handleUpload(e, "top")} />
          {knowledges
            .filter(item => item.position === 'top')
            .map(item => (
              <ImageCard
                key={item.id}
                imageUrl={item.imageUrl}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
        </div>
      </section>

      {/* ====== INFOGRAPHIC Section ====== */}
      <section style={sectionStyle}>
        <h2 style={sectionTitle}>📌 รูปภาพแถวล่าง (Infographic)</h2>
        <div style={gridStyle}>
          <UploadCard onUpload={(e) => handleUpload(e, "bottom")} />
          {knowledges
            .filter(item => item.position === 'bottom')
            .map(item => (
              <ImageCard
                key={item.id}
                imageUrl={item.imageUrl}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
        </div>
      </section>
    </MainLayout>
  );
}

// ======= COMPONENTS =======

function UploadCard({ onUpload }) {
  return (
    <div style={imageBox}>
      <label style={iconButton}>
        ➕
        <input type="file" hidden onChange={onUpload} />
      </label>
    </div>
  );
}

function ImageCard({ imageUrl, onDelete }) {
  return (
    <div style={imageBox}>
      <img src={imageUrl} alt="Uploaded" style={imageStyle} />
      <button style={closeButton} onClick={onDelete}>❌</button>
    </div>
  );
}

// ======= STYLE =======

const titleStyle = {
  fontSize: "28px",
  fontWeight: "bold",
  marginBottom: "30px",
};

const sectionStyle = {
  marginBottom: "50px",
};

const sectionTitle = {
  fontSize: "20px",
  marginBottom: "15px",
  color: "#333",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
  gap: "20px",
};

const imageBox = {
  width: "100%",
  height: "200px",
  backgroundColor: "#fff",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  overflow: "hidden",
};

const imageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "12px",
};

const iconButton = {
  width: "50px",
  height: "50px",
  borderRadius: "50%",
  backgroundColor: "#e0e0e0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
  cursor: "pointer",
};

const closeButton = {
  position: "absolute",
  top: "10px",
  right: "10px",
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  border: "none",
  fontSize: "18px",
  cursor: "pointer",
  borderRadius: "50%",
  padding: "4px 8px",
};
