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

const signupBtn = document.querySelector("#signupBtn");

// Sign-Up Event Listener
signupBtn.addEventListener("click", async () => {
  const fullName = document.querySelector("#fullName").value.trim();
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value;
  const confirmPassword = document.querySelector("#confirmPassword").value;
  const errorMessage = document.querySelector("#error-message");

  // Validate inputs
  if (!fullName || !email || !password || !confirmPassword) {
    errorMessage.style.display = "block";
    errorMessage.textContent = "All fields are required.";
    return;
  }

  if (password !== confirmPassword) {
    errorMessage.style.display = "block";
    errorMessage.textContent = "Passwords do not match.";
    return;
  }

  if (password.length < 6) {
    errorMessage.style.display = "block";
    errorMessage.textContent = "Password must be at least 6 characters long.";
    return;
  }

  try {
    // Create user with email and password
    const res = await auth.createUserWithEmailAndPassword(email, password);
    const user = res.user;

    // Update user profile with display name
    await user.updateProfile({
      displayName: fullName,
    });

    console.log("Display name set:", user.displayName); // Debugging

    // Add user information to Firestore
    await db.collection("users").doc(user.uid).set({
      fullName,
      email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // Store the user's full name in localStorage
    localStorage.setItem("userFullName", fullName);
    console.log("Full name stored in localStorage:", fullName); // Debugging

    window.location.href = "/login";

    // Redirect to login page
  } catch (error) {
    errorMessage.style.display = "block";
    errorMessage.textContent = error.message;
    console.error("Error during sign-up:", error.message);
  }
});

const googleSignUpBtn = document.querySelector("#googleSignUpBtn");

// Google Sign-Up Event Listener
googleSignUpBtn.addEventListener("click", async () => {
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

    // Log the user and redirect to the homepage
    console.log("Google User Signed Up:", user);
    window.location.href = "/login";

;
  } catch (error) {
    alert(error.message);
    console.error("Error during Google Sign-Up:", error.message);
  }
});
