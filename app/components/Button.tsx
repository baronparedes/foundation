import classNames from 'classnames';
import React from 'react';

type Props = Omit<React.HTMLProps<HTMLButtonElement>, "type"> & {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark";
  type?: "submit" | "reset" | "button";
};

export default function Button({
  children,
  variant,
  ...rest
}: React.PropsWithChildren<Props>) {
  const variantColor = () => {
    switch (variant) {
      case "success":
        return "bg-green-500 text-white hover:bg-green-600 focus:bg-green-400";
      case "primary":
      default:
        return "bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-400";
    }
  };

  return (
    <button
      className={classNames("rounded py-2 px-4", variantColor())}
      {...rest}
    >
      {children}
    </button>
  );
}
