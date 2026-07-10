const firebaseConfig = {
  apiKey: 'AIzaSyCnCdPpyZ0wExMketB4E4uQ2XmV94V0QdY',
  authDomain: 'efootball-tms.firebaseapp.com',
  projectId: 'efootball-tms',
  storageBucket: 'efootball-tms.appspot.com',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abcdef123456'
};

let app = null;
let auth = null;
let db = null;
let storage = null;
let isDemoMode = false;

if (window.firebase?.apps?.length) {
  app = window.firebase.apps[0];
} else if (window.firebase) {
  app = window.firebase.initializeApp(firebaseConfig);
}

if (app) {
  auth = window.firebase.auth();
  db = window.firebase.firestore();
  storage = window.firebase.storage();
} else {
  isDemoMode = true;
}

export { firebaseConfig, app, auth, db, storage, isDemoMode };
