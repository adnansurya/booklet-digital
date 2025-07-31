// js/firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyDMvmngMtzOwqdCXwkS1ruNnapkOoquSDs",
  authDomain: "booklet-digital.firebaseapp.com",
  databaseURL: "https://booklet-digital-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "booklet-digital",
  storageBucket: "booklet-digital.firebasestorage.app",
  messagingSenderId: "414662158261",
  appId: "1:414662158261:web:5e7fc1459885372e2f5bfc"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

