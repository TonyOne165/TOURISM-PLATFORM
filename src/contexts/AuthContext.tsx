import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import type { User } from '../types';

export interface AuthContextValue {
  user: User | null;
  currentUser?: User | null; // 🔁 Alias para compatibilidad
  userProfile?: User | null; // 🔁 Alias opcional
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // 🔁 Alias para compatibilidad
  isAdmin?: boolean; // ✅ Control de rol
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 📡 Función para actualizar la presencia del usuario
  const updatePresence = async (uid: string, isOnline: boolean) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        isOnline,
        lastActive: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  // 👀 Escuchar visibilidad de la página para la presencia
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePresence(user.uid, true);
      } else {
        updatePresence(user.uid, false);
      }
    };

    const handleBeforeUnload = () => {
      updatePresence(user.uid, false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [user]);

  // 🔄 Escucha cambios de sesión (login/logout)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<User, 'uid'>;
          setUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            role: userData.role || 'user',
            phone: userData.phone || null,
          });
        } else {
          // Si el usuario no existe en Firestore, se crea
          const now = Timestamp.now();
          const newUser: Omit<User, 'uid'> = {
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            role: 'user',
            createdAt: now,
            updatedAt: now,
          };
          await setDoc(userDocRef, newUser);
          setUser({ uid: firebaseUser.uid, ...newUser });
        }
        
        // ✅ Marcar como conectado
        await updatePresence(firebaseUser.uid, true);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔐 Iniciar sesión con Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  // 🔐 Iniciar sesión con Email
  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  // 🆕 Registro de nuevo usuario con Email
  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      const now = Timestamp.now();
      await setDoc(doc(db, 'users', result.user.uid), {
        displayName,
        email,
        role: 'user',
        createdAt: now,
        updatedAt: now,
      });
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  // 🚪 Cerrar sesión
  const signOut = async () => {
    try {
      if (auth.currentUser) {
        await updatePresence(auth.currentUser.uid, false);
      }
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // 🎯 Valor del contexto (con alias + roles)
  const value: AuthContextValue = {
    user,
    currentUser: user, // 🔁 Alias
    userProfile: user, // 🔁 Alias
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    logout: signOut, // 🔁 Alias
    isAdmin: user?.role === 'admin', // ✅ Rol dinámico
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 🧩 Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
