'use client';  // Ensure this file works on the client-side

import React, { useEffect, useState } from 'react';
import { auth, db } from "@/firebase";
import { useRouter } from 'next/navigation';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Image from 'next/image';

export default function ShopPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [shops, setShops] = useState([
    { id: 1, name: 'ร้าน A', address: 'ที่อยู่ A', category: 'ประเภท 1', contact: '789-101' },
    { id: 2, name: 'ร้าน B', address: 'ที่อยู่ B', category: 'ประเภท 2', contact: '123-456' },
    { id: 3, name: 'ร้าน C', address: 'ที่อยู่ C', category: 'ประเภท 3', contact: '987-654' },
    { id: 4, name: 'ร้าน D', address: 'ที่อยู่ D', category: 'ประเภท 4', contact: '321-654' },
  ]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserName(user.displayName || user.email.split("@")[0]);
      } else {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, []);

  // Function to simulate fetching shops from database (use Firebase or other API in production)
  const fetchShops = async () => {
    const querySnapshot = await getDocs(collection(db, "shops"));
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setShops(data);
  };

  const handleDelete = async (id) => {
    const docRef = doc(db, "shops", id);
    await deleteDoc(docRef);
    fetchShops();
  };

  const handleLogout = () => {
    auth.signOut();
    router.push("/");
  };

  const filteredShops = shops.filter(shop =>
    shop.name && shop.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "sans-serif", height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#f4f4f9" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#91E2FF", padding: "0px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "80px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <h2 style={{ margin: "0", fontWeight: "bold", color: "#fff" }}>THANGSISUK</h2>
        <Image src="/minilogo.png" alt="Mini Logo" width={40} height={40} />
      </div>

      <div style={{ display: "flex", flex: 1, marginTop: "20px" }}>
        {/* Sidebar */}
        <div style={{ width: "250px", backgroundColor: "#E2E2E2", padding: "20px", display: "flex", flexDirection: "column", borderRadius: "8px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ backgroundColor: "#E0E0E0", width: "50px", height: "50px", borderRadius: "50%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "10px" }}>
              <Image src="/profile.png" alt="Profile" width={50} height={50} />
            </div>
            <span style={{ fontWeight: "bold", fontSize: "16px" }}>{userName}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button style={buttonStyle}>จัดการความรู้ในระบบ</button>
            <button style={buttonStyle} onClick={() => router.push("/shop")}>ร้านค้าในระบบ</button>
            <button style={buttonStyle}>จัดการโพส</button>
            <button style={buttonStyle} onClick={() => router.push("/userlist")}>ผู้ใช้ในระบบ</button>
            <button style={buttonStyle} onClick={() => router.push('/dashboard')}>แดชบอร์ด</button>
            <button onClick={handleLogout} style={{ ...buttonStyle, backgroundColor: "red", color: "white", marginTop: "10px" }}>
              <Image src="/Logout.png" alt="Logout Icon" width={24} height={24} /> ออกจากระบบ
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, backgroundColor: "#FFF9C4", padding: "30px", marginLeft: "20px", borderRadius: "8px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
          {/* Top Right Search and Add Shop */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginRight: "20px" }}>
              <input
                type="text"
                placeholder="ค้นหาร้านค้า"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={searchInputStyle}
              />
              <button onClick={() => router.push("/addshop")} style={addButtonStyle}>เพิ่มร้านค้า</button>
            </div>
          </div>
          
          <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px", color: "#333" }}>ร้านค้าในระบบ</h1>

          {/* Grid Layout: 3 Shops per row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "20px" }}>
            {filteredShops.slice(0, 6).map((shop) => (
              <div key={shop.id} style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#add8e6", padding: "15px", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>ชื่อร้าน: {shop.name}</h3>
                  <p>ที่อยู่: {shop.address}</p>
                  <p>ประเภทที่รับ: {shop.category}</p>
                  <p>เบอร์โทรติดต่อ: {shop.phone}</p>
                </div>
                <button style={buttonStyle} onClick={() => router.push(`/editshop/${shop.id}`)}>แก้ไข</button>
                <button style={{ ...buttonStyle, backgroundColor: "red", color: "white" }} onClick={() => handleDelete(shop.id)}>ลบ</button>
              </div>
            ))}
          </div>

          {/* Navigation Buttons: Back and Next */}
          <div style={navigationButtonsStyle}>
            <button style={navButtonStyle}>ย้อนกลับ</button>
            <button style={navButtonStyle}>ถัดไป</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: "10px",
  backgroundColor: "#ffffff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  fontWeight: "bold",
};

const addButtonStyle = {
  backgroundColor: "#56A3F5",
  color: "white",
  borderRadius: "8px",
  padding: "10px 20px",
  fontWeight: "bold",
  cursor: "pointer",
};

const searchInputStyle = {
  border: "none",
  outline: "none",
  padding: "8px",
  fontSize: "14px",
  width: "250px",
  borderRadius: "8px",
  marginRight: "10px",
};

const navigationButtonsStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "20px",
};

const navButtonStyle = {
  padding: "10px 20px",
  backgroundColor: "#E0E0E0",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  color: "#333",
};
