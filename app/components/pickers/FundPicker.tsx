import type { FundWithBalance } from "../../models/fund.server";
import {formatCurrencyFixed} from '../../utils';
import {SelectInput} from '../@ui';

type Props = {
  funds: FundWithBalance[];
  onFundSelected?: (fundId: string) => void;
};

export default function FundPicker({
  funds,
  onFundSelected,
  onChange,
  ...props
}: Props & React.ComponentProps<typeof SelectInput>) {
  return (
    <div>
      <SelectInput
        {...props}
        onChange={(e) => {
          const index = e.currentTarget.selectedIndex;
          const optionElement = e.currentTarget.childNodes[index] as HTMLOptionElement;
          onChange && onChange(e);
          onFundSelected && onFundSelected(optionElement.value);
        }}
      >
        <option value={""} data-balance={0}>
          Select a fund
        </option>
        {funds.map((f) => {
          return (
            <option key={f.id} value={f.id} data-balance={f.balance}>
              {f.name} - {formatCurrencyFixed(Number(f.balance))}
            </option>
          );
        })}
      </SelectInput>
    </div>
  );
}
