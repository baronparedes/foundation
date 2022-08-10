import classNames from 'classnames';
import React from 'react';

import theme from './theme';

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

const TableFooter = React.forwardRef<HTMLDivElement, Props>(
  function TableFooter(props, ref) {
    const { className, children, ...other } = props;

    const { tableFooter } = theme;

    const baseStyle = tableFooter.base;

    const cls = classNames(baseStyle, className);

    return (
      <div className={cls} ref={ref} {...other}>
        {children}
      </div>
    );
  }
);

export default TableFooter;
