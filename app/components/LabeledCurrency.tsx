import {formatCurrency} from '../utils';

type Props = {
  label: string;
  value: number;
  className?: string;
};

export default function LabeledCurrency({ label, value, className }: Props) {
  return (
    <div className={className}>
      <div>
        <p className="mr-2 inline text-sm font-medium text-gray-400">{label}</p>
      </div>
      <div>
        <p className="currency inline text-lg font-semibold text-gray-700 dark:text-gray-200">
          {formatCurrency(value)}
        </p>
      </div>
    </div>
  );
}
