import { db } from "../config";
import { 
  doc, 
  setDoc, 
  addDoc, 
  collection, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp 
} from "firebase/firestore";

export async function updateHealthProfile(userId: string, data: any) {
  const userRef = doc(db, "users", userId);
  
  const allowedColumns = ['age', 'gender', 'weight_kg', 'height_cm', 'conditions', 'medications', 'allergies', 'goals'];
  const filteredData: any = {};
  Object.keys(data).forEach(key => {
    if (allowedColumns.includes(key)) {
      filteredData[key] = data[key];
    }
  });

  await setDoc(userRef, { 
    ...filteredData, 
    updatedAt: serverTimestamp() 
  }, { merge: true });
  
  return { success: true };
}

export async function logVital(userId: string, data: { type: string, value: number, unit?: string, source?: string }) {
  const vitalsRef = collection(db, "users", userId, "vitals");
  
  await addDoc(vitalsRef, {
    ...data,
    recordedAt: serverTimestamp()
  });
  
  return { success: true };
}

export async function logSymptom(userId: string, data: { symptom: string, severity: number, notes?: string }) {
  const symptomsRef = collection(db, "users", userId, "symptoms");
  
  await addDoc(symptomsRef, {
    ...data,
    recordedAt: serverTimestamp()
  });
  
  return { success: true };
}

export async function getHealthProfile(userId: string) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data();
  } else {
    return null;
  }
}

export async function getRecentVitals(userId: string, lim = 5) {
  const vitalsRef = collection(db, "users", userId, "vitals");
  const q = query(vitalsRef, orderBy("recordedAt", "desc"), limit(lim));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
