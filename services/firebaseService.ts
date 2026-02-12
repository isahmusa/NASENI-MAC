
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL, deleteObject, uploadBytes } from "firebase/storage";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, onAuthStateChanged, sendPasswordResetEmail, User as FirebaseUser } from "firebase/auth";
import { Project, User, UserRole } from "../types";

// New Firebase project configuration for mac-app-93e74
const firebaseConfig = {
  apiKey: "AIzaSyAgoptf_VqWbNZ-U_IwhTvHZ-fnZ219dkQ",
  authDomain: "mac-app-93e74.firebaseapp.com",
  projectId: "mac-app-93e74",
  storageBucket: "mac-app-93e74.firebasestorage.app",
  messagingSenderId: "512823909071",
  appId: "1:512823909071:web:ee5151d84f3621f3d075ba"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export const firebaseService = {
  // --- Authentication ---
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = userCredential.user;
      
      const [firstName, lastName] = (fbUser.displayName || "User.Member").split('.');
      
      return {
        firstName: firstName || 'User',
        lastName: lastName || 'Member',
        email: fbUser.email || email,
        role: email.toLowerCase().includes('admin') ? UserRole.ADMIN : UserRole.MEMBER
      };
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error("Password or Email Incorrect");
      }
      throw error;
    }
  },

  async signUp(email: string, password: string, firstName: string, lastName: string, photoFile?: File): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = userCredential.user;

      let photoURL = "";
      if (photoFile) {
        const storageRef = ref(storage, `profiles/${fbUser.uid}`);
        await uploadBytes(storageRef, photoFile);
        photoURL = await getDownloadURL(storageRef);
      }

      await updateProfile(fbUser, {
        displayName: `${firstName}.${lastName}`,
        photoURL: photoURL
      });

      const newUser: User = {
        firstName,
        lastName,
        email: email.toLowerCase(),
        role: UserRole.MEMBER
      };

      // Ensure staff record exists for directory purposes
      await setDoc(doc(db, "staff", email.toLowerCase().trim()), newUser);
      
      return newUser;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error("User already exists. Sign in?");
      }
      throw error;
    }
  },

  async sendPasswordReset(email: string) {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error("No user found with this email address.");
      }
      throw error;
    }
  },

  async logout() {
    await signOut(auth);
  },

  onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const [firstName, lastName] = (fbUser.displayName || "User.Member").split('.');
        callback({
          firstName: firstName || 'User',
          lastName: lastName || 'Member',
          email: fbUser.email || '',
          role: fbUser.email?.toLowerCase().includes('admin') ? UserRole.ADMIN : UserRole.MEMBER
        });
      } else {
        callback(null);
      }
    });
  },

  // --- Staff Management ---
  listenToStaff(callback: (staff: User[]) => void) {
    return onSnapshot(collection(db, "staff"), 
      (snapshot) => {
        const staff = snapshot.docs.map(doc => doc.data() as User);
        callback(staff);
      },
      (error) => {
        console.error("Firestore listen error:", error);
        callback([]);
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
