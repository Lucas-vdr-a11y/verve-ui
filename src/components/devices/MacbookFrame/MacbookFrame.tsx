import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./MacbookFrame.css";

export interface MacbookFrameProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Render the notch in the top bezel. Defaults to `true`. */
  notch?: boolean;
  /** Apply a subtle 3D perspective tilt. Defaults to `false`. */
  tilt?: boolean;
  /** Screen content (screenshot / img / node). */
  children?: React.ReactNode;
}

/**
 * MacbookFrame — laptop mockup with a notched screen bezel and a base wedge.
 * Content fills the screen. Optional `tilt` adds a subtle 3D perspective.
 */
export const MacbookFrame = forwardRef<HTMLDivElement, MacbookFrameProps>(
  function MacbookFrame({ notch = true, tilt = false, children, className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn("nova-macbook", tilt && "nova-macbook--tilt", className)}
        {...rest}
      >
        <div className="nova-macbook__lid">
          <div className="nova-macbook__bezel">
            {notch && <span className="nova-macbook__notch" aria-hidden="true" />}
            <div className="nova-macbook__screen">{children}</div>
          </div>
        </div>
        <div className="nova-macbook__base" aria-hidden="true">
          <span className="nova-macbook__notch-cut" />
        </div>
      </div>
    );
  },
);
