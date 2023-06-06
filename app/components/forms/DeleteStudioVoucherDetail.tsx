import {TrashIcon} from '@heroicons/react/solid';
import {Form, useFetcher} from '@remix-run/react';

import {TextInput} from '../@ui';
import {Button} from '../@windmill';

type Props = {
  studioVoucherId: number;
  studioVoucherDetailId: number;
  userId: string;
};

export function DeleteVoucherDetail({
  userId,
  studioVoucherId,
  studioVoucherDetailId,
}: Props) {
  const fetcher = useFetcher();
  const isDeleting =
    fetcher.state === "submitting" &&
    Number(fetcher.submission.formData.get("studioVoucherDetailId")) ===
      studioVoucherDetailId;

  return (
    <>
      <Form method="post">
        <div className="disable hidden">
          <TextInput name="updatedById" required defaultValue={userId} />
          <TextInput name="studioVoucherId" required defaultValue={studioVoucherId} />
          <TextInput
            name="studioVoucherDetailId"
            required
            defaultValue={studioVoucherDetailId}
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
