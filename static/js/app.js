// ✅ Import Firebase SDK modules properly
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ✅ Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCC0xmPvF2L91K9-etHiSPOedFQRG878_M",
  authDomain: "clipcap-1f178.firebaseapp.com",
  projectId: "clipcap-1f178",
  storageBucket: "clipcap-1f178.firebasestorage.app",
  messagingSenderId: "182360573813",
  appId: "1:182360573813:web:e7bd2826738152080df53c",
  measurementId: "G-MZ4V8X80HB"
};

// ✅ Initialize Firebase app, auth, and Firestore
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Check if the user is logged in and fetch their name
onAuthStateChanged(auth, async (user) => {
  if (user) {
    let displayName = user.displayName; // Default Firebase Auth name
    const userDocRef = doc(db, "users", user.uid); // Reference to Firestore user data

    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        displayName = docSnap.data().name || displayName; // Get name from Firestore if available
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }

    // ✅ Update homepage greeting with user's name
    if (displayName) {
      document.getElementById("welcomeMessage").innerText = `Welcome, ${displayName}!`;
    }
  }
});


// Toggle the logout menu when the profile button is clicked
document.getElementById("profileBtn").addEventListener("click", function() {
    const logoutMenu = document.getElementById("logoutMenu");
    logoutMenu.style.display = logoutMenu.style.display === "block" ? "none" : "block";
  });
  
  // Hide the logout menu if clicked outside of it
  window.addEventListener("click", function(event) {
    const logoutMenu = document.getElementById("logoutMenu");
    if (!event.target.closest("#profileBtn") && !event.target.closest(".logout-menu")) {
      logoutMenu.style.display = "none";
    }
  });

  // ✅ Logout function
document.getElementById("logoutBtn").addEventListener("click", function () {
  // ✅ Sign out the user from Firebase Auth
  auth.logoutOut().then(() => {
    // ✅ Redirect to index.html in the templates folder
    window.location.href = "/index"; 
  }).catch((error) => {
    console.error("Logout failed:", error);
  });
});

function logout() {
  firebase.auth().signOut().then(() => {
      console.log("User signed out.");
      window.location.href = "/"; // Redirect to the Flask route that serves index.html
  }).catch((error) => {
      console.error("Error signing out:", error);
  });
}
  