import type { Project } from "@prisma/client";
import classNames from "classnames";

import { LabeledCurrency } from "./@ui";

type Props = {
  project: Project;
  totalProjectCost: number;
  remainingFunds: number;
};

export function ProjectHeader({ project, totalProjectCost, remainingFunds }: Props) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <h4 className="text-lg">{project.code}</h4>
          <h3 className="text-2xl font-bold">{project.name}</h3>
        </div>
        <div className="text-right">
          <h5>{project.description}</h5>
          <h5>📍 {project.location}</h5>
        </div>
      </div>
      <hr className="my-4" />
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center">
          <LabeledCurrency
            label="total project cost"
            value={totalProjectCost}
            valueClassName={classNames("text-4xl")}
          />
        </div>
        <div className="text-center">
          <LabeledCurrency
            label="remaining funds"
            value={remainingFunds}
            valueClassName={classNames(
              "text-4xl",
              remainingFunds < 200000 ? "text-red-500" : "text-green-500"
            )}
          />
        </div>
      </div>
    </>
  );
}
