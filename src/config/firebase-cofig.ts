import admin from "firebase-admin";
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import dotenv from "dotenv";

dotenv.config();

const fireBaseApp = initializeApp({
  apiKey: process.env.APIKEY,
  authDomain: process.env.AUTHDOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGEBUCKET,
  messagingSenderId: process.env.MESSAGESENDERID,
  appId: process.env.APPID,
  measurementId: process.env.MEASUREMENTID
});

export const auth = getAuth(fireBaseApp);
const credentials = process.env.CREEDENTIALSDK!

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(credentials)),
});

console.log("Connected to Firebase")
export const firebaseAdmin = admin.auth();
