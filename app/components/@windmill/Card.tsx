import classNames from "classnames";
import React from "react";

import theme from "./theme";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Removes default styles (if true) so you can override with your own background styles
   */
  colored?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(props, ref) {
  const { className, children, colored = false, ...other } = props;
  const { card } = theme;

  const baseStyle = card.base;
  const uncoloredStyle = card.default;

  const cls = classNames(baseStyle, !colored && uncoloredStyle, className);

  return (
    <div className={cls} ref={ref} {...other}>
      {children}
    </div>
  );
});

export default Card;
