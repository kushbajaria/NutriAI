import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { deleteUserData } from './firestore';
import { clearAllCache } from './cache';

// Configure Google Sign-In — call once on app start
export function configureGoogleSignIn() {
  GoogleSignin.configure({
    // The webClientId comes from your Firebase Console > Authentication > Sign-in method > Google
    // It's the "Web client ID" (not the iOS client ID)
    webClientId: '848884747844-l8relgrgc8v6gqkdhorro32hnnelejoa.apps.googleusercontent.com',
    iosClientId: '848884747844-9peqkcis2ufkgd9o704lru99phu6qb0r.apps.googleusercontent.com',
  });
}

export async function signUp(email, password, name) {
  const { user } = await auth().createUserWithEmailAndPassword(email, password);
  if (name) {
    await user.updateProfile({ displayName: name });
  }
  return user;
}

export async function signIn(email, password) {
  const { user } = await auth().signInWithEmailAndPassword(email, password);
  return user;
}

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const signInResult = await GoogleSignin.signIn();
  const idToken = signInResult?.data?.idToken;
  if (!idToken) throw new Error('Google Sign-In failed: no ID token');
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  const { user } = await auth().signInWithCredential(googleCredential);
  return user;
}

export async function signOutUser() {
  try { await GoogleSignin.signOut(); } catch (_) { /* not signed in with Google */ }
  await clearAllCache();
  await auth().signOut();
}

export async function resetPassword(email) {
  await auth().sendPasswordResetEmail(email);
}

export async function deleteAccount() {
  const user = auth().currentUser;
  if (!user) throw new Error('No user signed in');
  await deleteUserData(user.uid);
  await clearAllCache();
  await user.delete();
}

export async function reauthenticateWithPassword(password) {
  const user = auth().currentUser;
  if (!user?.email) throw new Error('No email on current user');
  const credential = auth.EmailAuthProvider.credential(user.email, password);
  await user.reauthenticateWithCredential(credential);
}
