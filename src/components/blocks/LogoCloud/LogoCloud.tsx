import { forwardRef } from "react";
import { cn } from "../../../utils/cn";
import "./LogoCloud.css";

export interface LogoCloudProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Heading shown above the logo row. @default "Trusted by teams worldwide" */
  title?: React.ReactNode;
  /**
   * Logo slots. Pass `<img>` elements or arbitrary nodes; each is placed in a
   * uniform slot and rendered grayscale until hovered.
   */
  logos: React.ReactNode[];
  /** Apply grayscale-to-color hover treatment. @default true */
  grayscale?: boolean;
  /** Content alignment. @default "center" */
  align?: "start" | "center";
}

/**
 * LogoCloud — a "trusted by" band: a title above a responsive, wrapping row of
 * logo slots. Logos render grayscale-on-light and reveal color on hover.
 */
export const LogoCloud = forwardRef<HTMLElement, LogoCloudProps>(
  function LogoCloud(
    {
      title = "Trusted by teams worldwide",
      logos,
      grayscale = true,
      align = "center",
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <section
        ref={ref}
        className={cn(
          "nova-logo-cloud",
          `nova-logo-cloud--${align}`,
          grayscale && "nova-logo-cloud--grayscale",
          className,
        )}
        {...rest}
      >
        {title && <p className="nova-logo-cloud__title">{title}</p>}
        <ul className="nova-logo-cloud__row" role="list">
          {logos.map((logo, i) => (
            <li key={i} className="nova-logo-cloud__slot">
              {logo}
            </li>
          ))}
        </ul>
      </section>
    );
  },
);
