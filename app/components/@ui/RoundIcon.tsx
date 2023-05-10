import classNames from "classnames";
import React from "react";

type Props = {
  icon: React.FC<{ className: string }>;
  iconColorClass?: string;
  bgColorClass?: string;
  className: string;
};

export default function RoundIcon({
  icon: Icon,
  iconColorClass = "text-gmd-600 dark:text-gmd-100",
  bgColorClass = "bg-gmd-100 dark:bg-gmd-600",
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
