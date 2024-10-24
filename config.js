// Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyChCQ6mvdv4BKhfbclhgUehkYRl97umaLM",
  authDomain: "login-form-eplq.firebaseapp.com",
  projectId: "login-form-eplq",
  storageBucket: "login-form-eplq.appspot.com",
  messagingSenderId: "678447886805",
  appId: "1:678447886805:web:cf8e92b9825707939d8d5c",
  measurementId: "G-7V1H4F1Y21"
};

// Initialize Firebase

firebase.initializeApp(firebaseConfig);
 

// Initialize Firestore
var db = firebase.firestore();

// Initialize Firebase Authentication
var auth = firebase.auth();

// Initialize Firebase Storage
var storageRef = firebase.storage().ref();