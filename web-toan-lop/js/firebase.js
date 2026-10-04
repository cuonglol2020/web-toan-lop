const firebaseConfig = {
  apiKey:"AIzaSyDRkE7rqFMP1X2WYny7vn9Q-ITlRIh2PSo",
  authDomain:"web-toan-lop.firebaseapp.com",
  databaseURL:"https://web-toan-lop-default-rtdb.firebaseio.com",
  projectId:"web-toan-lop",
  storageBucket:"web-toan-lop.firebasestorage.app",
  messagingSenderId:"359002597389",
  appId:"1:359002597389:web:8bb1110550762a43b04d44"
};

firebase.initializeApp(firebaseConfig);

const db=firebase.database();
const auth=firebase.auth();

const CLOUDINARY_CLOUD_NAME="wjq2c29";
const CLOUDINARY_UPLOAD_PRESET="web_toan_lop";