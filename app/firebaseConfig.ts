
import { initializeApp } from 'firebase/app';

import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
    apiKey: "AIzaSyA8m8Z68xGXWSal5nQsp7BhFr2eUSNYUzM",
    authDomain: "places-to-stay-project.firebaseapp.com",
    projectId: "places-to-stay-project",
    storageBucket: "places-to-stay-project.appspot.com",
    messagingSenderId: "843501248849",
    appId: "1:843501248849:web:72cd80cac05d922e793370",
    measurementId: "G-FP3YQF07FG"
  };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);
export { auth };

