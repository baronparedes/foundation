import { useFetcher } from "@remix-run/react";

import { TextInput } from "../@ui";
import { Button } from "../@windmill";

type Props = {
  projectVoucherId: number;
  userId: string;
  costPlus: boolean;
};
export function ToggleProjectVoucherCostPlus({
  projectVoucherId,
  userId,
  costPlus,
}: Props) {
  const fetcher = useFetcher();
  return (
    <>
      <fetcher.Form method="post" className="inline-block">
        <div className="disable hidden">
          <TextInput name="updatedById" required defaultValue={userId} />
          <TextInput name="projectVoucherId" required defaultValue={projectVoucherId} />
          <TextInput
            name="costPlus"
            required
            value={(!costPlus as boolean).toString()}
            readOnly
          />
        </div>
        <Button
          disabled={fetcher.state === "submitting"}
          name="_action"
          value="toggle-cost-plus"
          type="submit"
        >
          {costPlus ? "Exclude from Cost Plus?" : "Include to Cost Plus?"}
        </Button>
      </fetcher.Form>
    </>
  );
}
