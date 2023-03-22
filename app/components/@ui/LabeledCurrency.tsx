import classNames from 'classnames';

import {formatCurrency, formatCurrencyFixed} from '../../utils';

type Props = {
  label: string;
  value: number;
  className?: string;
  valueClassName?: string;
};

export default function LabeledCurrency({
  label,
  value,
  className,
  valueClassName,
}: Props) {
  return (
    <div className={className}>
      <div>
        <p className="mr-2 inline text-sm font-medium text-gray-400">{label}</p>
      </div>
      <div>
        <p className={classNames("currency inline text-lg font-semibold", valueClassName)}>
          {value % 1 === 0 ? formatCurrency(value) : formatCurrencyFixed(value)}
        </p>
      </div>
    </div>
  );
}
