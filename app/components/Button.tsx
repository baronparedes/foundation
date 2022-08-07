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
  className,
  ...rest
}: React.PropsWithChildren<Props>) {
  const variantColor = () => {
    switch (variant) {
      case "success":
        return "bg-teal-500 text-white hover:bg-teal-600 focus:bg-teal-400";
      case "danger":
        return "bg-rose-500 text-white hover:bg-rose-600 focus:bg-rose-400";
      case "secondary":
        return "bg-cyan-500 text-white hover:bg-cyan-600 focus:bg-cyan-400";
      case "primary":
      default:
        return "bg-sky-500 text-white hover:bg-sky-600 focus:bg-sky-400";
    }
  };

  return (
    <button
      className={classNames("rounded py-2 px-4", variantColor(), className)}
      {...rest}
    >
      {children}
    </button>
  );
}
