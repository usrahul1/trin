import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyDmTvE329YT0p3TMRcVUZRMTF-tgBBeu90", 
  authDomain: "agrofix-bulk-orders.firebaseapp.com",
  projectId: "agrofix-bulk-orders",
  storageBucket: "agrofix-bulk-orders.appspot.com",
  messagingSenderId: "123456789012",             
  appId: "1:123456789012:web:abcdef1234567890"     
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
