import { useState, useEffect } from 'react';
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, query, orderBy, Timestamp, where, increment,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../services/firebase';
import type { Promotion } from '../types';

export const usePromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, COLLECTIONS.PROMOTIONS), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setPromotions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Promotion[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPromotions(); }, []);

  const validatePromoCode = async (code: string): Promise<Promotion | null> => {
    const q = query(
      collection(db, COLLECTIONS.PROMOTIONS),
      where('code', '==', code.toUpperCase()),
      where('active', '==', true)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const promo = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Promotion;
    const now = Timestamp.now();
    if (promo.startDate > now || promo.endDate < now) return null;
    if (promo.currentUses >= promo.maxUses) return null;
    return promo;
  };

  const applyDiscount = (price: number, promo: Promotion, participants: number = 1): number => {
    switch (promo.type) {
      case 'percentage': return price * (1 - promo.value / 100);
      case 'fixed': return Math.max(0, price - promo.value);
      case 'group': return participants >= (promo.minParticipants || 2) ? price * (1 - promo.value / 100) : price;
      default: return price;
    }
  };

  const usePromoCode = async (promoId: string): Promise<void> => {
    const ref = doc(db, COLLECTIONS.PROMOTIONS, promoId);
    await updateDoc(ref, { currentUses: increment(1) });
  };

  const createPromotion = async (data: Omit<Promotion, 'id' | 'createdAt' | 'currentUses'>): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTIONS.PROMOTIONS), {
      ...data,
      code: data.code.toUpperCase(),
      currentUses: 0,
      createdAt: Timestamp.now(),
    });
    await fetchPromotions();
    return docRef.id;
  };

  const updatePromotion = async (id: string, updates: Partial<Promotion>): Promise<void> => {
    await updateDoc(doc(db, COLLECTIONS.PROMOTIONS, id), updates);
    await fetchPromotions();
  };

  const deletePromotion = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.PROMOTIONS, id));
    await fetchPromotions();
  };

  return { promotions, loading, fetchPromotions, validatePromoCode, applyDiscount, usePromoCode, createPromotion, updatePromotion, deletePromotion };
};
