import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { auth } from "./config.js";

export const signUpUser = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
};

export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
};

export const initAuth = () => {
    onAuthStateChanged(auth, (user) => {
        const authSection = document.getElementById('auth-section');
        const dashboard = document.getElementById('dashboard');
        const userInfo = document.getElementById('user-info');
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const loginContainer = document.getElementById('login-container');
        const signupContainer = document.getElementById('signup-container');
        const socialAuth = document.getElementById('social-auth');
        const authCard = document.getElementById('auth-card');

        if (user) {
            // User is signed in
            console.log("Utilisateur connecté:", user.email);
            dashboard.style.display = 'block';
            userInfo.style.display = 'flex';
            userInfo.innerHTML = `
                <img src="${user.photoURL || 'https://via.placeholder.com/40'}" alt="Avatar" width="40">
                <span>${user.displayName || user.email}</span>
            `;
            logoutBtn.style.display = 'inline-flex';
            
            // Hide auth card
            if (authCard) authCard.style.display = 'none';

            // Dispatch event for other modules
            const event = new CustomEvent('userLoggedIn', { detail: user });
            window.dispatchEvent(event);
        } else {
            // User is signed out
            console.log("Utilisateur déconnecté");
            dashboard.style.display = 'none';
            userInfo.style.display = 'none';
            logoutBtn.style.display = 'none';
            
            // Show auth card only — tab state managed by inline script
            if (authCard) authCard.style.display = 'block';
        }
    });
};

export { auth, onAuthStateChanged };
