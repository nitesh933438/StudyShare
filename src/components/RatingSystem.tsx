import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';
import { User } from 'firebase/auth';

interface RatingSystemProps {
  resourceId: string;
  initialAverage?: number;
  initialCount?: number;
  isDarkCard?: boolean;
  user: User | null;
}

export function RatingSystem({ resourceId, initialAverage = 0, initialCount = 0, isDarkCard, user }: RatingSystemProps) {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [average, setAverage] = useState(initialAverage);
  const [count, setCount] = useState(initialCount);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Listen to resource stats
    const unsubResource = onSnapshot(doc(db, 'resources', resourceId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setAverage(data.averageRating || 0);
        setCount(data.ratingCount || 0);
      }
    }, (error) => {
      console.error("RatingSystem: Resource snapshot error:", error);
    });

    // Listen to user's personal rating if logged in
    let unsubUserRating = () => {};
    if (user) {
      unsubUserRating = onSnapshot(doc(db, 'resources', resourceId, 'ratings', user.uid), (snapshot) => {
        if (snapshot.exists()) {
          setUserRating(snapshot.data().rating);
        } else {
          setUserRating(null);
        }
      }, (error) => {
        console.warn("RatingSystem: User rating access restricted or error:", error.message);
      });
    } else {
      setUserRating(null);
    }

    return () => {
      unsubResource();
      unsubUserRating();
    };
  }, [resourceId, user?.uid]);

  const handleRate = async (rating: number) => {
    if (!user) {
      toast.error('Please login to rate resources');
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const ratingRef = doc(db, 'resources', resourceId, 'ratings', user.uid);
      const resourceRef = doc(db, 'resources', resourceId);

      const oldRatingDoc = await getDoc(ratingRef);
      const isInitialRating = !oldRatingDoc.exists();
      const oldRatingValue = isInitialRating ? 0 : oldRatingDoc.data()?.rating || 0;

      // 1. Update the individual rating
      await setDoc(ratingRef, {
        rating,
        userId: user.uid,
        timestamp: serverTimestamp()
      });

      // 2. Update resource aggregate stats
      // New Average = ((Current Avg * Current Count) - Old Rating + New Rating) / New Count
      let newCount = count;
      if (isInitialRating) {
        newCount += 1;
      }
      
      const currentSum = (average * count);
      const totalScore = currentSum - oldRatingValue + rating;
      const newAverage = newCount > 0 ? parseFloat((totalScore / newCount).toFixed(1)) : 0;

      await updateDoc(resourceRef, {
        averageRating: newAverage,
        ratingCount: newCount
      });

      toast.success('Rating submitted!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `resources/${resourceId}/ratings`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 mt-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            onClick={() => handleRate(star)}
            disabled={isLoading}
            className="transition-transform hover:scale-125 disabled:opacity-50"
          >
            <Star
              className={`w-4 h-4 transition-colors ${
                (hoveredStar !== null ? star <= hoveredStar : userRating !== null ? star <= userRating : star <= Math.round(average))
                  ? 'fill-amber-400 text-amber-400'
                  : isDarkCard ? 'text-white/20' : 'text-slate-200'
              }`}
            />
          </button>
        ))}
        <span className={`text-[10px] font-bold ml-1 ${isDarkCard ? 'text-white/60' : 'text-slate-400'}`}>
          {average > 0 ? `${average} (${count})` : 'No ratings'}
        </span>
      </div>
    </div>
  );
}
