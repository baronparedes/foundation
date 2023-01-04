import classNames from "classnames";
import React from "react";

import theme from "./theme";

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

const TableContainer = React.forwardRef<HTMLDivElement, Props>(function TableContainer(
  props,
  ref
) {
  const { className, children, ...other } = props;
  const { tableContainer } = theme;
  const baseStyle = tableContainer.base;
  const cls = classNames(baseStyle, className);

  return (
    <div className={cls} ref={ref} {...other}>
      {children}
    </div>
  );
});

export default TableContainer;
