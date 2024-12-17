import IconButton from "@/components/ui/IconButton";
import Typography from "@/components/ui/typography";
import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX, FiMaximize, FiMinimize } from "react-icons/fi";
import { useModal } from "@/context/ModalContext";

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  handleClose: () => void;
  modalTitle?: string;
  isFullScreen?: boolean;
  toggleFullScreen?: () => void;
}

const Modal = ({
  children,
  isOpen,
  modalTitle = "modal",
  handleClose,
  isFullScreen = false,
  toggleFullScreen,
}: ModalProps) => {
  const { addModal, removeModal } = useModal();

  useEffect(() => {
    if (isOpen) {
      addModal(modalTitle);
    } else {
      removeModal(modalTitle);
    }

    return () => {
      if (isOpen) {
        removeModal(modalTitle);
      }
    };
  }, [isOpen, modalTitle]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`
          bg-white dark:bg-gray-900 text-gray-800 dark:text-white
          border border-green-500 shadow-lg shadow-green-500/50
          transition-all duration-300 ease-in-out
          ${
            isFullScreen
              ? "fixed inset-0 w-screen h-screen max-w-none rounded-none"
              : "w-full max-w-7xl rounded-lg"
          }
        `}
      >
        <div className="absolute inset-0 bg-grid-gray-200/50 dark:bg-grid-white/[0.05] bg-[size:40px_40px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-center p-6 border-b border-green-500/30">
            <Typography
              variant="h3"
              className="text-4xl font-bold text-secondary-600"
            >
              {modalTitle}
            </Typography>
            <div className="flex items-center space-x-2">
              {toggleFullScreen && (
                <IconButton onClick={toggleFullScreen}>
                  {isFullScreen ? <FiMinimize /> : <FiMaximize />}
                </IconButton>
              )}
              <IconButton
                onClick={handleClose}
                className="hover:bg-red-100 dark:hover:bg-red-900"
              >
                <FiX size={24} />
              </IconButton>
            </div>
          </div>
          <div className="flex-grow overflow-auto p-6">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
