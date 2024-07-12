

import Currency from "./Currency";

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
        <Currency className={valueClassName} value={value} />
      </div>
    </div>
  );
}
