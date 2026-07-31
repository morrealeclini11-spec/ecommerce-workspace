// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZYeT-qqAdDil22tYqfx3Pa0WVqD1AjdQ",
  authDomain: "ecommerce-workspace.firebaseapp.com",
  projectId: "ecommerce-workspace",
  storageBucket: "ecommerce-workspace.firebasestorage.app",
  messagingSenderId: "871733401972",
  appId: "1:871733401972:web:7beb873dfdea530da4b421"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;