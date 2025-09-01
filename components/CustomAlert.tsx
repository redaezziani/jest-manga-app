import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Text } from "@/components/ui/text";
import React, { createContext, useContext, useState } from "react";

interface AlertConfig {
  title: string;
  message: string;
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertContextType {
  showAlert: (config: AlertConfig) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export const useCustomAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useCustomAlert must be used within an AlertProvider");
  }
  return context;
};

interface AlertProviderProps {
  children: React.ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  const showAlert = (config: AlertConfig) => {
    setAlertConfig(config);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    alertConfig?.onConfirm?.();
    setIsOpen(false);
    setAlertConfig(null);
  };

  const handleCancel = () => {
    alertConfig?.onCancel?.();
    setIsOpen(false);
    setAlertConfig(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Text style={{ fontFamily: "Arabic" }}>
                {alertConfig?.title || ""}
              </Text>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <Text style={{ fontFamily: "Arabic" }}>
                {alertConfig?.message || ""}
              </Text>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {alertConfig?.showCancel !== false && (
              <AlertDialogCancel onPress={handleCancel}>
                <Text style={{ fontFamily: "Arabic" }}>
                  {alertConfig?.cancelText || "إلغاء"}
                </Text>
              </AlertDialogCancel>
            )}
            <AlertDialogAction onPress={handleConfirm}>
              <Text style={{ fontFamily: "Arabic" }}>
                {alertConfig?.confirmText || "موافق"}
              </Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertContext.Provider>
  );
};

// Helper function for simple alerts (similar to Alert.alert)
export const showSimpleAlert = (
  title: string,
  message: string,
  onConfirm?: () => void
) => {
  // This will be set up in the component that uses it
  return { title, message, onConfirm, showCancel: false };
};
