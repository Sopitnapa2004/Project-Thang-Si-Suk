'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth, db } from "@/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import axios from "axios";

export default function PostPage() {
  const router = useRouter();

  // State variables
  const [userName, setUserName] = useState(""); // For storing user name
  const [posts, setPosts] = useState([]); // For storing the list of posts
  const [searchQuery, setSearchQuery] = useState(""); // For storing the search query

  // Sample post data
  const samplePosts = [
    {
      id: 1,
      title: "ต้องการขายขวดพลาสติก",
      description: "ขายขวดพลาสติก 20 กิโลกรัม จำนวน 1 ตัน",
      imgSrc: "/images/cardboard.jpg",
    },
    {
      id: 2,
      title: "ขายกระดาษลัง",
      description: "ต้องการขายกระดาษลัง อยากได้ร้านรับซื้อครับ ลัง 20 กก. ขวด 1 ตันครับ",
      imgSrc: "/images/plastic.jpg",
    },
  ];

  // Effect to check if user is logged in
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

  // Effect to fetch posts from the database or use sample data
  useEffect(() => {
    if (samplePosts.length > 0) {
      setPosts(samplePosts); // If no posts are in Firestore, use the sample data
    } else {
      fetchPosts();
    }
  }, []);

  // Fetching posts from Firebase Firestore
  const fetchPosts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "posts"));
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts: ", error);
    }
  };

  // Handling search query changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filtering posts based on search query
  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle post deletion with confirmation
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("คุณต้องการลบโพสต์นี้หรือไม่?");
    if (isConfirmed) {
      try {
        const docRef = doc(db, "posts", id);
        await deleteDoc(docRef);
        fetchPosts(); // Refresh posts after deletion
        alert("โพสต์ถูกลบเรียบร้อยแล้ว");
      } catch (error) {
        console.error("Error deleting post: ", error);
        alert("เกิดข้อผิดพลาดในการลบโพสต์");
      }
    }
  };

  // Handle user logout
  const handleLogout = () => {
    auth.signOut();
    router.push("/");
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <header style={styles.header}>
        <h2 style={styles.headerTitle}>THANGSISUK</h2>
        <Image src="/minilogo.png" alt="Mini Logo" width={40} height={40} />
      </header>

      {/* Main Content Section */}
      <div style={styles.mainContent}>
        {/* Sidebar Section */}
        <div style={styles.sidebar}>
          <div style={styles.profileContainer}>
            <div style={styles.profileImage}>
              <Image src="/profile.png" alt="Profile" width={50} height={50} />
            </div>
            <span style={styles.profileName}>{userName}</span>
          </div>
          <div style={styles.sidebarButtons}>
            <button style={styles.sidebarButton}>จัดการความรู้ในระบบ</button>
            <button style={styles.sidebarButton} onClick={() => router.push("/shop")}>ร้านค้าในระบบ</button>
            <button style={styles.sidebarButton} onClick={() => router.push("/userlist")}>ผู้ใช้ในระบบ</button>
            <button style={styles.sidebarButton} onClick={() => router.push('/dashboard')}>แดชบอร์ด</button>
            <button style={{ ...styles.sidebarButton, backgroundColor: "red", color: "white" }} onClick={handleLogout}>
              <Image src="/Logout.png" alt="Logout Icon" width={24} height={24} /> ออกจากระบบ
            </button>
          </div>
        </div>

        {/* Post Management Section */}
        <div style={styles.contentArea}>
          <div style={styles.searchAndButtons}>
            {/* Search Input */}
            <input 
              type="text" 
              placeholder="ค้นหาโพส" 
              value={searchQuery} 
              onChange={handleSearchChange} 
              style={styles.searchInput} 
            />

            {/* Post Action Buttons (Moved to the right) */}
            <div style={styles.postButtons}>
              <button onClick={() => router.push("/addpost")} style={styles.actionButton}>โพสซื้อขาย</button>
              <button onClick={() => router.push("/addpost")} style={styles.actionButton}>โพสบริจาค</button>
            </div>
          </div>

          {/* Post List Section */}
          <h1 style={styles.pageTitle}>จัดการโพส</h1>
          <div style={styles.postList}>
            {filteredPosts.length === 0 ? (
              <p>ไม่พบโพสที่ตรงกับคำค้นหา</p>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.id} style={styles.postCard}>
                  <h3 style={styles.postTitle}>ชื่อโพส: {post.title}</h3>
                  <p>รายละเอียด: {post.description}</p>
                  <button style={styles.cardButton} onClick={() => router.push(`/editpost/${post.id}`)}>แก้ไข</button>
                  <button style={{ ...styles.cardButton, backgroundColor: "red", color: "white" }} onClick={() => handleDelete(post.id)}>ลบ</button>
                </div>
              ))
            )}
          </div>

          {/* Navigation Buttons */}
          <div style={styles.navigationButtons}>
            <button style={styles.navButton} onClick={() => console.log('Go Back')}>ย้อนกลับ</button>
            <button style={styles.navButton} onClick={() => console.log('Go Next')}>ถัดไป</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles for components
const styles = {
  container: {
    fontFamily: "sans-serif",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f4f4f9",
  },
  header: {
    backgroundColor: "#91E2FF",
    padding: "0px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "80px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  headerTitle: {
    margin: "0",
    fontWeight: "bold",
    color: "#fff",
  },
  mainContent: {
    display: "flex",
    flex: 1,
    marginTop: "20px",
  },
  sidebar: {
    width: "250px",
    backgroundColor: "#E2E2E2",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    borderRadius: "8px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  profileContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
  },
  profileImage: {
    backgroundColor: "#E0E0E0",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "10px",
  },
  profileName: {
    fontWeight: "bold",
    fontSize: "16px",
  },
  sidebarButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  sidebarButton: {
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
  },
  contentArea: {
    flex: 1,
    backgroundColor: "#FFF9C4",
    padding: "30px",
    marginLeft: "20px",
    borderRadius: "8px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  searchAndButtons: {
    display: "flex",
    justifyContent: "flex-end",  // Align items to the right side
    marginBottom: "20px",
    gap: "10px", // Added gap between search input and buttons
  },
  postButtons: {
    display: "flex",
    gap: "10px",
  },
  actionButton: {
    backgroundColor: "#56A3F5",
    color: "white",
    borderRadius: "8px",
    padding: "10px 20px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  searchInput: {
    border: "none",
    outline: "none",
    padding: "8px",
    fontSize: "14px",
    width: "250px",
    borderRadius: "8px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#333",
  },
  postList: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
  },
  postCard: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    backgroundColor: "#add8e6",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  postTitle: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  cardButton: {
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
  },
  navigationButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },
  navButton: {
    padding: "10px 20px",
    backgroundColor: "#E0E0E0",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    color: "#333",
  },
};
