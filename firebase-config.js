import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC-6paauhYwAv8Vo2jL7VTbp61mlXk9RgY",
  authDomain: "my-tools-c62a1.firebaseapp.com",
  projectId: "my-tools-c62a1",
  storageBucket: "my-tools-c62a1.firebasestorage.app",
  messagingSenderId: "66998849404",
  appId: "1:66998849404:web:a58c51fb78a144b0009ef9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
