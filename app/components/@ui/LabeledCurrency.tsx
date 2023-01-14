import classNames from 'classnames';

import {formatCurrency} from '../../utils';

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
        <p
          className={classNames(
            "currency inline text-lg font-semibold text-gray-700 dark:text-gray-200",
            valueClassName
          )}
        >
          {formatCurrency(value)}
        </p>
      </div>
    </div>
  );
}