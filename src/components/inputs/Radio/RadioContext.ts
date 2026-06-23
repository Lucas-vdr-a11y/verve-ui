import { createContext, useContext } from "react";

export type RadioSize = "sm" | "md" | "lg";

export interface RadioContextValue {
  name?: string;
  value?: string;
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  size: RadioSize;
  disabled?: boolean;
}

export const RadioContext = createContext<RadioContextValue | null>(null);

export function useRadioContext(): RadioContextValue | null {
  return useContext(RadioContext);
}
