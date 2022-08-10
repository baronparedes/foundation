import {formatCurrency} from '../utils';

type Props = {
  value: number;
  className?: string;
};

export default function AvailableBalance({ value, className }: Props) {
  return (
    <div className={className}>
      <p className="mr-2 inline text-sm font-medium text-gray-400">Balance</p>
      <p className="currency inline text-lg font-semibold text-gray-700 dark:text-gray-200">
        {formatCurrency(value)}
      </p>
    </div>
  );
}
