import { TrashIcon } from "@heroicons/react/solid";
import { Form, useFetcher } from "@remix-run/react";

import { TextInput } from "../@ui";
import { Button } from "../@windmill";

type Props = {
  projectVoucherId: number;
  projectVoucherDetailId: number;
  userId: string;
};

export function DeleteVoucherDetail({
  userId,
  projectVoucherId,
  projectVoucherDetailId,
}: Props) {
  const fetcher = useFetcher();
  const isDeleting =
    fetcher.state === "submitting" &&
    Number(fetcher.submission.formData.get("projectVoucherDetailId")) ===
      projectVoucherDetailId;

  return (
    <>
      <Form method="post">
        <div className="disable hidden">
          <TextInput name="updatedById" required defaultValue={userId} />
          <TextInput name="projectVoucherId" required defaultValue={projectVoucherId} />
          <TextInput
            name="projectVoucherDetailId"
            required
            defaultValue={projectVoucherDetailId}
          />
        </div>
        <Button
          name="_action"
          value="delete"
          disabled={isDeleting}
          className="cursor-pointer "
          size="small"
          type="submit"
          aria-label="delete"
        >
          <TrashIcon className="h-5 w-5" />
        </Button>
      </Form>
    </>
  );
}
