import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { app, db } from '../firebase';

const auth = getAuth(app);
const USERS_COLLECTION = 'users';

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function toProfile(authUser, userDocData, fallbackColor = '#7dd3fc') {
  return {
    clientId: authUser.uid,
    name: userDocData?.displayName ?? authUser.displayName ?? '',
    email: authUser.email ?? userDocData?.email ?? '',
    color: userDocData?.color ?? fallbackColor
  };
}

async function ensureUserDoc(authUser, color, displayName) {
  const userRef = doc(db, USERS_COLLECTION, authUser.uid);
  const existing = await getDoc(userRef);

  if (!existing.exists()) {
    await setDoc(userRef, {
      uid: authUser.uid,
      email: authUser.email ?? '',
      displayName,
      color,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return {
      displayName,
      color
    };
  }

  return existing.data();
}

export async function registerAccount({ email, passwordName, color }) {
  const normalizedEmail = normalizeEmail(email);
  const authResult = await createUserWithEmailAndPassword(auth, normalizedEmail, passwordName);

  await updateProfile(authResult.user, {
    displayName: passwordName
  });

  const profileData = await ensureUserDoc(authResult.user, color, passwordName);

  return toProfile(authResult.user, profileData, color);
}

export async function loginAccount({ email, passwordName }) {
  const normalizedEmail = normalizeEmail(email);
  const authResult = await signInWithEmailAndPassword(auth, normalizedEmail, passwordName);
  const userRef = doc(db, USERS_COLLECTION, authResult.user.uid);
  const existing = await getDoc(userRef);

  return toProfile(authResult.user, existing.exists() ? existing.data() : null);
}