import { toast } from "sonner";

export const toaster = {
  create: ({
    title,
    description,
    type,
    duration,
  }: {
    title: string;
    description?: string;
    type?: string;
    duration?: number;
  }) => {
    const opts = { description, duration: duration ?? 4000 };
    if (type === "success") toast.success(title, opts);
    else if (type === "error") toast.error(title, opts);
    else if (type === "warning") toast.warning(title, opts);
    else toast(title, opts);
  },
};

export { Toaster } from "sonner";
