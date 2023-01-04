import classNames from "classnames";
import React from "react";

import theme from "./theme";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * The type of the badge
   */
  type?: "success" | "danger" | "warning" | "neutral" | "primary";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(props, ref) {
  const { className, children, type = "primary", ...other } = props;

  const { badge } = theme;

  const baseStyle = badge.base;
  const typeStyle = {
    success: badge.success,
    danger: badge.danger,
    warning: badge.warning,
    neutral: badge.neutral,
    primary: badge.primary,
  };

  const cls = classNames(baseStyle, typeStyle[type], className);

  return (
    <span className={cls} ref={ref} {...other}>
      {children}
    </span>
  );
});

export default Badge;
