import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { useRouter } from 'next/navigation';
import { getDoc, doc } from 'firebase/firestore';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, 'Users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRole(userData.role);
          sessionStorage.setItem('userRole', userData.role);
          sessionStorage.setItem('userEmail', user.email || '');
        }
      } else {
        setUser(null);
        setRole(null);
        sessionStorage.clear();
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return { user, role };
}
