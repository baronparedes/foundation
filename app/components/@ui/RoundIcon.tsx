import classNames from 'classnames';
import React from 'react';

type Props = {
  icon: React.FC<{ className: string }>;
  iconColorClass?: string;
  bgColorClass?: string;
  className: string;
};

export default function RoundIcon({
  icon: Icon,
  iconColorClass = "text-purple-600 dark:text-purple-100",
  bgColorClass = "bg-purple-100 dark:bg-purple-600",
  className,
}: Props) {
  const baseStyle = "p-3 rounded-full";

  const cls = classNames(baseStyle, iconColorClass, bgColorClass, className);
  return (
    <div className={cls}>
      <Icon className="h-5 w-5" />
    </div>
  );
}
