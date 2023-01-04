import classNames from "classnames";
import React from "react";

import theme from "./theme";

interface Props extends React.TdHTMLAttributes<HTMLTableCellElement> {}

const TableCell = React.forwardRef<HTMLTableCellElement, Props>(function TableCell(
  props,
  ref
) {
  const { className, children, ...other } = props;
  const { tableCell } = theme;
  const baseStyle = tableCell.base;

  const cls = classNames(baseStyle, className);

  return (
    <td className={cls} ref={ref} {...other}>
      {children}
    </td>
  );
});

export default TableCell;
