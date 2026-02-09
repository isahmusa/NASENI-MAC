
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, UserCredential } from "firebase/auth";
import { Project, User, UserRole } from "../types";

// Official config for project smartdeck-f4f7d
const firebaseConfig = {
  apiKey: "AIzaSyCteS6RrJQl8EDqunnEUrDaktuS5m75E_A",
  authDomain: "smartdeck-f4f7d.firebaseapp.com",
  projectId: "smartdeck-f4f7d",
  storageBucket: "smartdeck-f4f7d.firebasestorage.app",
  messagingSenderId: "874974167844",
  appId: "1:874974167844:web:96b0f4706a0015a608e9b1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export const firebaseService = {
  // --- Admin Authentication ---
  async loginAdmin(email: string, password: string): Promise<User> {
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const fbUser = userCredential.user;
    
    // Construct local user object
    const parts = (fbUser.email || email).split('@')[0].split('.') || ['Admin', 'User'];
    const lastName = parts[0] || 'Admin';
    const firstName = parts[1] || 'User';
    
    return {
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1),
      email: fbUser.email || email,
      role: UserRole.ADMIN
    };
  },

  async createAdminAccount(email: string, password: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const fbUser = userCredential.user;

    const parts = email.split('@')[0].split('.') || ['Admin', 'User'];
    const lastName = parts[0] || 'Admin';
    const firstName = parts[1] || 'User';

    const adminUser: User = {
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      lastName: lastName.charAt(0).toUpperCase() + lastName.slice(1),
      email: email.toLowerCase().trim(),
      role: UserRole.ADMIN
    };

    try {
      await setDoc(doc(db, "staff", email.toLowerCase().trim()), adminUser);
    } catch (e) {
      console.warn("Firestore setDoc failed during admin init, API probably disabled:", e);
    }
    
    return adminUser;
  },

  // --- Staff Management ---
  listenToStaff(callback: (staff: User[]) => void) {
    return onSnapshot(collection(db, "staff"), 
      (snapshot) => {
        const staff = snapshot.docs.map(doc => doc.data() as User);
        callback(staff);
      },
      (error) => {
        console.error("Firestore listen error (API possibly disabled):", error);
        callback([]); // Return empty list so app doesn't crash
      }
    );
  },

  async addStaffMember(user: User) {
    await setDoc(doc(db, "staff", user.email.toLowerCase().trim()), user);
  },

  // --- Project Management ---
  async saveProject(project: Omit<Project, 'id' | 'userId' | 'createdAt'>, userId: string): Promise<string> {
    let dataUrl = project.data;

    if (project.type !== 'script') {
      const storageRef = ref(storage, `projects/${userId}/${Date.now()}_${project.name}`);
      await uploadString(storageRef, project.data, 'data_url');
      dataUrl = await getDownloadURL(storageRef);
    }

    const docRef = await addDoc(collection(db, "projects"), {
      ...project,
      userId,
      data: dataUrl,
      createdAt: new Date().toISOString()
    });
    
    return docRef.id;
  },

  listenToUserProjects(userId: string, callback: (projects: Project[]) => void) {
    const q = query(collection(db, "projects"), where("userId", "==", userId));
    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project));
      projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(projects);
    }, (err) => {
      console.error("Project list error:", err);
      callback([]);
    });
  },

  async deleteProject(projectId: string, storageUrl?: string) {
    await deleteDoc(doc(db, "projects", projectId));
    if (storageUrl && storageUrl.includes('firebasestorage')) {
      try {
        const fileRef = ref(storage, storageUrl);
        await deleteObject(fileRef);
      } catch (e) {}
    }
  }
};
