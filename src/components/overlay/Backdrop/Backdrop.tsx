import { forwardRef, type ReactNode } from "react";
import ReactDOM from "react-dom";
import { cn } from "../../../utils/cn";
import "./Backdrop.css";

export interface BackdropProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the backdrop is shown. */
  open: boolean;
  /** Called when the backdrop is clicked. */
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  /** Apply a backdrop blur to content behind. Defaults to `false`. */
  blur?: boolean;
  /** Whether the backdrop should be invisible (transparent). Defaults to `false`. */
  invisible?: boolean;
  /** Render into a portal at document.body. Defaults to `false`. */
  portal?: boolean;
  /** Optional content rendered above the dim layer (e.g. a spinner). */
  children?: ReactNode;
}

const canUseDOM = (): boolean =>
  typeof document !== "undefined" && typeof window !== "undefined";

export const Backdrop = forwardRef<HTMLDivElement, BackdropProps>(
  function Backdrop(
    { open, onClick, blur = false, invisible = false, portal = false, className, children, ...rest },
    ref
  ) {
    if (!open) return null;
    if (portal && !canUseDOM()) return null;

    const node = (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(
          "nova-backdrop",
          blur && "nova-backdrop--blur",
          invisible && "nova-backdrop--invisible",
          className
        )}
        onClick={onClick}
        {...rest}
      >
        {children}
      </div>
    );

    if (portal && canUseDOM()) {
      return ReactDOM.createPortal(node, document.body);
    }
    return node;
  }
);
