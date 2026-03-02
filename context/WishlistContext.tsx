import React, { createContext, useContext, useState } from 'react';

export type WishlistContextType = {
  likedProductIds: Set<string | number>;
  savedProductIds: Set<string | number>;
  addLikedProduct: (productId: string | number) => void;
  removeLikedProduct: (productId: string | number) => void;
  addSavedProduct: (productId: string | number) => void;
  removeSavedProduct: (productId: string | number) => void;
  isProductLiked: (productId: string | number) => boolean;
  isProductSaved: (productId: string | number) => boolean;
  refreshWishlist: () => void;
  shouldRefresh: boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [likedProductIds, setLikedProductIds] = useState<Set<string | number>>(new Set());
  const [savedProductIds, setSavedProductIds] = useState<Set<string | number>>(new Set());
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const addLikedProduct = (productId: string | number) => {
    setLikedProductIds(prev => new Set(prev).add(productId));
    setShouldRefresh(true);
    console.log('[WishlistContext] Added to liked:', productId);
  };

  const removeLikedProduct = (productId: string | number) => {
    setLikedProductIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
    console.log('[WishlistContext] Removed from liked:', productId);
  };

  const addSavedProduct = (productId: string | number) => {
    setSavedProductIds(prev => new Set(prev).add(productId));
    setShouldRefresh(true);
    console.log('[WishlistContext] Added to saved:', productId);
  };

  const removeSavedProduct = (productId: string | number) => {
    setSavedProductIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
    console.log('[WishlistContext] Removed from saved:', productId);
  };

  const isProductLiked = (productId: string | number): boolean => {
    return likedProductIds.has(productId);
  };

  const isProductSaved = (productId: string | number): boolean => {
    return savedProductIds.has(productId);
  };

  const refreshWishlist = () => {
    setShouldRefresh(true);
  };

  const resetRefreshFlag = () => {
    setShouldRefresh(false);
  };

  return (
    <WishlistContext.Provider
      value={{
        likedProductIds,
        savedProductIds,
        addLikedProduct,
        removeLikedProduct,
        addSavedProduct,
        removeSavedProduct,
        isProductLiked,
        isProductSaved,
        refreshWishlist,
        shouldRefresh,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
