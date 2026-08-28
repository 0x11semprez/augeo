import type { ReactNode } from "react";

/**
 * Labelled form cell. Renders as a `div` (`as="div"`) when it wraps a control
 * that owns its own label, so the label is not associated twice.
 */
export function Field({
  label,
  required,
  className,
  as = "label",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  as?: "label" | "div";
  children: ReactNode;
}) {
  const Tag = as;
  return (
    <Tag className={`field ${className ?? ""}`}>
      <span>
        {label}
        {required ? <b>*</b> : null}
      </span>
      {children}
    </Tag>
  );
}
