"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";

interface FormDialogProps {
  trigger: React.ReactNode;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function FormDialog({ trigger, title, description, children, size = "md" }: FormDialogProps) {
  const maxWidth = size === "sm" ? "sm:max-w-md" : size === "lg" ? "sm:max-w-3xl" : "sm:max-w-lg";

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded shadow p-6 ${maxWidth} w-full`}>
          {title && <Dialog.Title className="text-lg font-semibold mb-1">{title}</Dialog.Title>}
          {description && <Dialog.Description className="text-sm text-gray-500 mb-4">{description}</Dialog.Description>}
          <div>{children}</div>
          <Dialog.Close asChild>
            <button className="sr-only">Close</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default FormDialog;