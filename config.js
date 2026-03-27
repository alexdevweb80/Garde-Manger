// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCKRzwnTebsnCJUtXvWBKJyGXmksOgtOt8",
    authDomain: "garde-manger-1b01a.firebaseapp.com",
    projectId: "garde-manger-1b01a",
    storageBucket: "garde-manger-1b01a.firebasestorage.app",
    messagingSenderId: "154344726544",
    appId: "1:154344726544:web:ec1fd0214c520ad531aa95",
    measurementId: "G-6P4LTX7SRB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };