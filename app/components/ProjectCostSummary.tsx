import {LabeledCurrency} from './@ui';

type Props = {
  estimatedCost?: number;
  collectedFunds: number;
  disbursedFunds: number;
  addOnTotals: number;
  costPlusTotals: number;
};

export function ProjectCostSummary({
  estimatedCost,
  collectedFunds,
  disbursedFunds,
  addOnTotals,
  costPlusTotals,
}: Props) {
  return (
    <>
      <div className={`flex flex-wrap justify-center gap-9 text-center`}>
        {estimatedCost && <LabeledCurrency label="estimated cost" value={estimatedCost} />}
        <LabeledCurrency
          label="collected funds"
          value={collectedFunds}
          valueClassName="text-green-500"
        />
        <LabeledCurrency
          label="disbursed funds"
          value={Math.abs(disbursedFunds)}
          valueClassName="text-red-500"
        />
        <LabeledCurrency
          label="additional expenses"
          value={addOnTotals}
          valueClassName="text-red-500"
        />
        <LabeledCurrency
          label="project expenses"
          value={costPlusTotals}
          valueClassName="text-purple-500"
        />
      </div>
    </>
  );
}
