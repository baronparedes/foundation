import classNames from "classnames";
import React from "react";

import { Link } from "@remix-run/react";

type Props = React.ComponentProps<typeof Link>;

export default function LinkStyled({
  children,
  className,
  ...rest
}: React.PropsWithChildren<Props>) {
  return (
    <Link
      className={classNames("text-sm font-medium text-sky-600 hover:underline", className)}
      {...rest}
    >
      {children}
    </Link>
  );
}
