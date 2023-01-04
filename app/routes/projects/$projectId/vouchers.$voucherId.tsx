import invariant from 'tiny-invariant';

import {LockClosedIcon, LockOpenIcon} from '@heroicons/react/solid';
import {Form, useLoaderData, useNavigate, useTransition} from '@remix-run/react';
import {json, redirect} from '@remix-run/server-runtime';

import {DialogWithTransition, LabeledCurrency} from '../../../components/@ui';
import {Button} from '../../../components/@windmill';
import {AddVoucherDetails} from '../../../components/forms/AddVoucherDetail';
import VoucherDetailTable from '../../../components/tables/VoucherDetailTable';
import {
  addProjectVoucherDetail,
  deleteProjectVoucherDetail,
  getProjectVoucherDetails,
} from '../../../models/project-voucher-detail.server';
import {closeProjectVoucher, getProjectVoucher} from '../../../models/project-voucher.server';
import {requireUserId} from '../../../session.server';
import {formatCurrencyFixed, sum} from '../../../utils';

import type { ProjectVoucherDetail } from "../../../models/project-voucher.server";
import type { LoaderArgs, ActionArgs } from "@remix-run/server-runtime";
export async function loader({ params, request }: LoaderArgs) {
  const { projectId, voucherId } = params;
  const voucher = await getProjectVoucher({ id: Number(voucherId) });
  const userId = await requireUserId(request);
  const voucherDetails = await getProjectVoucherDetails({
    id: Number(voucherId),
  });

  invariant(projectId, "project not found");
  invariant(voucher, "voucher not found");

  return json({ projectId, voucher, userId, voucherDetails });
}

export async function action({ params, request }: ActionArgs) {
  const { projectId } = params;
  const formData = Object.fromEntries(await request.formData());
  const { _action, updatedById, projectVoucherId, fundId, ...values } = formData;

  if (_action === "create") {
    const data = {
      projectVoucherId: Number(projectVoucherId),
      ...values,
    } as unknown as ProjectVoucherDetail;

    await addProjectVoucherDetail(data, updatedById as string, Number(projectVoucherId));
    return json({ state: "created" });
  }

  if (_action === "delete") {
    const { projectVoucherDetailId } = formData;
    await deleteProjectVoucherDetail(
      { id: Number(projectVoucherDetailId) },
      updatedById as string,
      Number(projectVoucherId)
    );
    return json({ state: "deleted", projectVoucherDetailId });
  }

  if (_action === "close-voucher") {
    await closeProjectVoucher(
      Number(projectVoucherId),
      fundId as string,
      updatedById as string
    );
    return redirect(`./projects/${projectId}`);
  }

  return null;
}

export default function VoucherDetails() {
  const { projectId, voucher, userId, voucherDetails } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const transition = useTransition();
  const itemizedAmount = sum(voucherDetails.map((d) => Number(d.amount)));
  const remainingAmount = Number(voucher.disbursedAmount) - Number(itemizedAmount);

  return (
    <>
      <DialogWithTransition
        size="xl"
        isOpen={true}
        title={
          <>
            Input voucher details
            <div className="mt-4 flex">
              <h1 className="flex-1">{voucher.voucherNumber}</h1>
              <div className="flex-1">
                <div className="float-right">
                  {voucher.isClosed ? (
                    <LockClosedIcon className="h-5 w-5 text-red-600" aria-label="closed" />
                  ) : (
                    <LockOpenIcon className="h-5 w-5 text-green-600" aria-label="open" />
                  )}
                </div>
              </div>
            </div>
          </>
        }
        onCloseModal={() => navigate(`/projects/${projectId}`)}
      >
        <div className="grid grid-cols-3 gap-3 text-center">
          <LabeledCurrency
            label="disbursed amount"
            value={Number(voucher.disbursedAmount)}
          />
          <LabeledCurrency label="itemized amount" value={Number(itemizedAmount)} />
          {!voucher.isClosed && (
            <LabeledCurrency label="remaining amount" value={remainingAmount} />
          )}
          {voucher.isClosed && (
            <LabeledCurrency label="refunded amount" value={remainingAmount} />
          )}
        </div>
        <hr className="my-4" />
        {!voucher.isClosed && (
          <div className="my-4 mx-4">
            <AddVoucherDetails
              projectVoucherId={voucher.id}
              userId={userId}
              maxAmount={remainingAmount}
            />
          </div>
        )}
        <VoucherDetailTable
          data={voucherDetails as unknown as ProjectVoucherDetail[]}
          projectVoucherId={voucher.id}
          userId={userId}
          isClosed={voucher.isClosed}
        />
        <hr className="my-4" />
        <div className="text-right">
          {!voucher.isClosed && remainingAmount !== 0 && (
            <div className="my-2">
              <small>
                <i>
                  Note: Remaining amount of{" "}
                  <span className="currency">{formatCurrencyFixed(remainingAmount)}</span>{" "}
                  will be refunded.
                </i>
              </small>
            </div>
          )}
          {!voucher.isClosed && (
            <Form method="post">
              <input type="hidden" value={userId} name="updatedById" />
              <input type="hidden" value={voucher.id} name="projectVoucherId" />
              <input type="hidden" value={"clcet6qzs0015sozariu53pba"} name="fundId" />
              <Button
                name="_action"
                value="close-voucher"
                type="submit"
                disabled={transition.state === "submitting"}
                onClick={(e) => {
                  if (
                    remainingAmount !== 0 &&
                    !confirm(
                      `Remaining amount of ${formatCurrencyFixed(
                        remainingAmount
                      )} will be refunded.`
                    )
                  )
                    e.preventDefault();
                }}
              >
                {itemizedAmount === 0 ? "Delete Voucher" : "Close Voucher"}
              </Button>
            </Form>
          )}
        </div>
      </DialogWithTransition>
    </>
  );
}
