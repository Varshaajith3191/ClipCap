const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyCC0xmPvF2L91K9-etHiSPOedFQRG878_M",
    authDomain: "clipcap-1f178.firebaseapp.com",
    projectId: "clipcap-1f178",
    storageBucket: "clipcap-1f178.firebasestorage.app",
    messagingSenderId: "182360573813",
    appId: "1:182360573813:web:e7bd2826738152080df53c",
    measurementId: "G-MZ4V8X80HB"
  });
  
  const db = firebaseApp.firestore();
  const auth = firebaseApp.auth();
  
  const loginBtn = document.querySelector("#loginBtn");
  
  // Login Event Listener
  loginBtn.addEventListener("click", async () => {
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value;
  
    try {
      const res = await auth.signInWithEmailAndPassword(email, password);
      const user = res.user;
  
      // Fetch user's full name from Firestore
      const userDoc = await db.collection("users").doc(user.uid).get();
      if (userDoc.exists) {
        const { fullName } = userDoc.data();
        localStorage.setItem("userFullName", fullName);
        console.log("Full name retrieved from Firestore:", fullName);
      } else {
        console.warn("User document does not exist in Firestore.");
      }
  
      window.location.href ="/home"; // Redirect to homepage
    } catch (error) {
      alert(error.message);
      console.error("Error during login:", error.message);
    }
  });
  
  const googleSignInBtn = document.querySelector("#googleSignInBtn");
  
  // Google Sign-In Event Listener
  googleSignInBtn.addEventListener("click", async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      const result = await auth.signInWithPopup(provider);
      const user = result.user;
  
      // Add user information to Firestore if it doesn't already exist
      const userDoc = await db.collection("users").doc(user.uid).get();
      if (!userDoc.exists) {
        await db.collection("users").doc(user.uid).set({
          fullName: user.displayName || "Google User",
          email: user.email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }
  
      // Store user's full name in localStorage
      const fullName = user.displayName || "Google User";
      localStorage.setItem("userFullName", fullName);
      console.log("Full name stored in localStorage:", fullName);
  
      window.location.href = "/home"; // Redirect to homepage
    } catch (error) {
      alert(error.message);
      console.error("Error during Google Sign-In:", error.message);
    }
  });
  