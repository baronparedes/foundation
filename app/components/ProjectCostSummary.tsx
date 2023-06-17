import { LabeledCurrency } from "./@ui";

type Props = {
  estimatedCost?: number;
  collectedFunds: number;
  disbursedFunds: number;
  addOnTotals: number;
  costPlusTotals: number;
  contingencyTotals: number;
};

export function ProjectCostSummary({
  estimatedCost,
  collectedFunds,
  disbursedFunds,
  addOnTotals,
  costPlusTotals,
  contingencyTotals,
}: Props) {
  return (
    <>
      <div className={`flex flex-wrap justify-center gap-12 text-center`}>
        {estimatedCost && <LabeledCurrency label="estimated cost" value={estimatedCost} />}
        <LabeledCurrency
          label="collected funds"
          value={collectedFunds}
          valueClassName="text-green-500"
        />
        <LabeledCurrency
          label="disbursements"
          value={Math.abs(disbursedFunds)}
          valueClassName="text-red-500"
        />
        <LabeledCurrency
          label="additional expenses"
          value={addOnTotals}
          valueClassName="text-red-500"
        />
        <LabeledCurrency
          label="admin & professional fee expense"
          value={costPlusTotals}
          valueClassName="text-gmd-500"
        />
        <LabeledCurrency
          label="contingency reserve"
          value={contingencyTotals}
          valueClassName="text-gmd-500"
        />
      </div>
    </>
  );
}
