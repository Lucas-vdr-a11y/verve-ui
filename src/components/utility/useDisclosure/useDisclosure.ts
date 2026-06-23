import { useCallback } from "react";
import { useControllableState } from "../useControllableState";

export interface UseDisclosureOptions {
  /** Initial open state in uncontrolled mode. Defaults to `false`. */
  defaultOpen?: boolean;
  /** Controlled open state. When provided, the hook is controlled. */
  open?: boolean;
  /** Called whenever the open state changes. */
  onChange?: (open: boolean) => void;
}

export interface UseDisclosureReturn {
  /** Whether the disclosure is currently open. */
  open: boolean;
  /** Open it. */
  onOpen: () => void;
  /** Close it. */
  onClose: () => void;
  /** Toggle it. */
  onToggle: () => void;
  /** Set the open state directly (value or updater). */
  setOpen: (next: boolean | ((prev: boolean) => boolean)) => void;
}

/**
 * Manage boolean open/closed state for disclosures (modals, drawers, menus…).
 *
 * Supports both controlled (`open` + `onChange`) and uncontrolled
 * (`defaultOpen`) usage via {@link useControllableState}.
 */
export function useDisclosure(
  options: UseDisclosureOptions = {}
): UseDisclosureReturn {
  const { defaultOpen = false, open, onChange } = options;

  const [isOpen, setOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange,
  });

  const onOpen = useCallback(() => setOpen(true), [setOpen]);
  const onClose = useCallback(() => setOpen(false), [setOpen]);
  const onToggle = useCallback(() => setOpen((prev) => !prev), [setOpen]);

  return { open: isOpen, onOpen, onClose, onToggle, setOpen };
}
