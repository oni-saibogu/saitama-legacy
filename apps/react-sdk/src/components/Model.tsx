import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { MdClose } from "react-icons/md";

type ModalProps = {
  open: boolean;
  header?: React.ReactNode;
  closeIcon?: React.ElementType;
  onBack?: () => unknown;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Modal({
  open,
  onClose,
  onBack,
  children,
  closeIcon,
  header,
}: React.PropsWithChildren<ModalProps>) {
  const CloseIcon = closeIcon ? closeIcon : MdClose;

  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 flex items-center justify-center">
        <DialogPanel className="w-9/11 h-xl flex flex-col space-y-2 bg-white rounded-md lt-md:flex-col md:max-w-sm md:w-10/11 dark:bg-dark dark:text-white">
          <div className="flex items-center md:px-4 py-4">
            <button
              className="p-2 rounded-full dark:bg-dark-200/75"
              onClick={() =>  onBack ? onBack() : onClose(false)}
            >
              <CloseIcon className="text-xl md:text-base" />
            </button>
            {header}
          </div>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
