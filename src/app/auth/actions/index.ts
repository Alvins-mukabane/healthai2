import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    return redirect('/auth/login?error=' + encodeURIComponent(error.message));
  }

  return redirect('/');
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const consent = formData.get('consent') as string;

  if (consent !== 'on') {
    return redirect('/auth/register?error=' + encodeURIComponent('You must accept the medical disclaimer.'));
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: fullName });
  } catch (error: any) {
    return redirect('/auth/register?error=' + encodeURIComponent(error.message));
  }

  return redirect('/auth/login?message=' + encodeURIComponent('Account created successfully. Please log in.'));
}

export async function signOut() {
  await firebaseSignOut(auth);
  return redirect('/auth/login');
}
