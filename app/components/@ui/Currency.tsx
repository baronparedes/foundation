import classNames from "classnames";

import { formatCurrency, formatCurrencyFixed } from "../../utils";

type Props = {
  value: number;
  className?: string;
};

export default function Currency({ value, className }: Props) {
  return (
    <p className={classNames("currency inline text-lg font-semibold", className)}>
      {value % 1 === 0 ? formatCurrency(value) : formatCurrencyFixed(value)}
    </p>
  );
}
