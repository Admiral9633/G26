import { toast } from "sonner";

export function useSonner() {
  return {
    toast,
    success: (message: string, title?: string) => {
      return toast.success(title || "Erfolg", {
        description: message,
      });
    },
    error: (message: string, title?: string) => {
      return toast.error(title || "Fehler", {
        description: message,
      });
    },
    info: (message: string, title?: string) => {
      return toast.info(title || "Info", {
        description: message,
      });
    },
    warning: (message: string, title?: string) => {
      return toast.warning(title || "Warnung", {
        description: message,
      });
    },
  };
}
