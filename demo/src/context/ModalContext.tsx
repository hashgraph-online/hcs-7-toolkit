"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface ModalContextType {
  openModals: Record<string, boolean>;
  addModal: (title: string) => void;
  removeModal: (title: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [openModals, setOpenModals] = useState<Record<string, boolean>>({});

  const addModal = (title: string) => {
    setOpenModals((prev) => ({ ...prev, [title]: true }));
  };

  const removeModal = (title: string) => {
    setOpenModals((prev) => {
      const next = { ...prev };
      delete next[title];
      return next;
    });
  };

  useEffect(() => {
    const hasOpenModals = Object.keys(openModals).length > 0;

    if (hasOpenModals) {
      document.documentElement.classList.add("modal-open");
      document.body.classList.add("modal-open");
    } else {
      document.documentElement.classList.remove("modal-open");
      document.body.classList.remove("modal-open");
    }
  }, [openModals]);

  return (
    <ModalContext.Provider value={{ openModals, addModal, removeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
