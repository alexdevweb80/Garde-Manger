// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };