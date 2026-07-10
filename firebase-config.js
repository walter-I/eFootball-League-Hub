const firebaseConfig = {
  apiKey: '"AIzaSyAEbJZxEJy5ct-m2K_z2cD_V0rxkCA5Cb0"',
  authDomain: 'efootballhub-61f27.firebaseapp.com',
  projectId: 'efootballhub-61f27',
  storageBucket: 'efootballhub-61f27.appspot.com',
  messagingSenderId: '681958465100',
  appId: '1:681958465100:web:abcdef123456',
  measurementId: 'G-WC4RGFR6KM'
};

let app = null;
let auth = null;
let db = null;
let storage = null;
let isDemoMode = true;

const shouldUseFirebase = window.__USE_FIREBASE__ === true;

if (shouldUseFirebase && window.firebase?.apps?.length) {
  app = window.firebase.apps[0];
} else if (shouldUseFirebase && window.firebase) {
  app = window.firebase.initializeApp(firebaseConfig);
}

if (app && shouldUseFirebase) {
  auth = window.firebase.auth();
  db = window.firebase.firestore();
  storage = window.firebase.storage();
  isDemoMode = false;
}

export { firebaseConfig, app, auth, db, storage, isDemoMode };
