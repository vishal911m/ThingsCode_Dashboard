"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Cross1Icon } from "@radix-ui/react-icons";
import { ReactNode } from "react";

export default function Modal({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal forceMount>
        {/* Overlay */}
        <Dialog.Overlay
          className="
            fixed inset-0 bg-black/40
            data-[state=open]:animate-[overlay-show_200ms_ease-out]
            data-[state=closed]:animate-[overlay-hide_200ms_ease-in]
          "
        />

        {/* Content wrapper */}
        <Dialog.Content
          className="
            fixed left-1/2 top-1/2 w-full max-w-md
            -translate-x-1/2 -translate-y-1/2
            rounded-xl bg-white shadow-lg
            data-[state=open]:animate-[content-show_200ms_ease-out]
            data-[state=closed]:animate-[content-hide_200ms_ease-in]
          "
        >
          {children}

          {/* Optional close button */}
          <Dialog.Close className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
            <Cross1Icon />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
