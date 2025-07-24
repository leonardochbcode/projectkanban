// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "chbproject-3iku2",
  "appId": "1:733441477553:web:181e2276d1786a4aa14b90",
  "storageBucket": "chbproject-3iku2.firebasestorage.app",
  "apiKey": "AIzaSyAOUUhnwFWJrvs4-yET1lrYiqlNziqbv9w",
  "authDomain": "chbproject-3iku2.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "733441477553"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
