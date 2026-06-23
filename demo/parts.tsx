import type { ReactNode } from "react";
import { Card, Heading, Text } from "../src/index";

/** A category section with anchor, number, title and subtitle. */
export function Section({
  id,
  num,
  title,
  subtitle,
  children,
}: {
  id: string;
  num: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="demo-section">
      <div className="demo-section-head">
        <span className="demo-section-num">{num}</span>
        <Heading level={2} size="2xl">
          {title}
        </Heading>
        {subtitle ? (
          <Text tone="muted" size="sm" style={{ marginLeft: "auto" }}>
            {subtitle}
          </Text>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** A bordered card that frames a group of live examples, with an optional label. */
export function Example({
  label,
  children,
  style,
}: {
  label?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <Card variant="outlined" padding={6} style={style}>
      <div className="demo-example">
        {label ? <span className="demo-label">{label}</span> : null}
        {children}
      </div>
    </Card>
  );
}

/** A small captioned wrapper for a single chart. */
export function ChartCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card variant="outlined" padding={5}>
      <div className="demo-chart-card">
        <span className="demo-label">{title}</span>
        {children}
      </div>
    </Card>
  );
}
