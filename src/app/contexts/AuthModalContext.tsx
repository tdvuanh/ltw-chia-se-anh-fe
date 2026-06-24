import React, { createContext, useContext, useState } from 'react';
import { AuthModal } from '../components/AuthModal';

interface AuthModalContextType {
  openLoginModal: () => void;
  closeLoginModal: () => void;
  isOpen: boolean;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openLoginModal = () => setIsOpen(true);
  const closeLoginModal = () => setIsOpen(false);

  return (
    <AuthModalContext.Provider value={{ openLoginModal, closeLoginModal, isOpen }}>
      {children}
      <AuthModal isOpen={isOpen} onClose={closeLoginModal} />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}
