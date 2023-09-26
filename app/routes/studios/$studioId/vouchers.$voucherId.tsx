import invariant from "tiny-invariant";

import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/solid";
import {
  Form,
  useLoaderData,
  useNavigate,
  useTransition,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/server-runtime";

import { DialogWithTransition, LabeledCurrency } from "../../../components/@ui";
import { Button } from "../../../components/@windmill";
import {
  NewStudioVoucherDetails,
} from "../../../components/forms/NewStudioVoucherDetail";
import { FundPicker } from "../../../components/pickers/FundPicker";
import {
  StudioVoucherDetailTable,
} from "../../../components/tables/StudioVoucherDetailTable";
import { getDetailCategories } from "../../../models/detail-category.server";
import { getFunds } from "../../../models/fund.server";
import {
  addStudioVoucherDetail,
  deleteStudioVoucherDetail,
  getStudioVoucherDetails,
} from "../../../models/studio-voucher-detail.server";
import {
  closeStudioVoucher,
  getStudioVoucher,
  reopenStudioVoucher,
} from "../../../models/studio-voucher.server";
import { requireUserId } from "../../../session.server";
import { formatCurrencyFixed, sum } from "../../../utils";

import type { FundWithBalance } from "../../../models/fund.server";
import type { StudioVoucherDetailslWithCategory } from "../../../models/studio-voucher-detail.server";
import type { StudioVoucherDetail } from "../../../models/studio-voucher.server";
import type { LoaderArgs, ActionArgs } from "@remix-run/server-runtime";
export async function loader({ params, request }: LoaderArgs) {
  const { studioId, voucherId } = params;
  const voucher = await getStudioVoucher({ id: Number(voucherId) });
  const userId = await requireUserId(request);
  const voucherDetails = await getStudioVoucherDetails({
    id: Number(voucherId),
  });
  const categories = await getDetailCategories();

  invariant(studioId, "studio not found");
  invariant(voucher, "voucher not found");

  const funds = await getFunds();

  return json({
    studioId,
    voucher,
    userId,
    voucherDetails,
    categories,
    funds,
  });
}

export async function action({ params, request }: ActionArgs) {
  const { studioId } = params;
  const formData = Object.fromEntries(await request.formData());
  const { _action, updatedById, studioVoucherId, fundId, ...values } = formData;

  if (_action === "create") {
    const data = {
      ...values,
      studioVoucherId: Number(studioVoucherId),
      quantity: values.quantity === "" ? null : values.quantity,
    } as unknown as StudioVoucherDetail;

    await addStudioVoucherDetail(data, updatedById as string, Number(studioVoucherId));
    return json({ state: "created" });
  }

  if (_action === "delete") {
    const { studioVoucherDetailId } = formData;
    await deleteStudioVoucherDetail(
      { id: Number(studioVoucherDetailId) },
      updatedById as string,
      Number(studioVoucherId)
    );
    return json({ state: "deleted", studioVoucherDetailId });
  }

  if (_action === "close-voucher") {
    await closeStudioVoucher(
      Number(studioVoucherId),
      fundId as string,
      updatedById as string
    );
    return redirect(`/studios/${studioId}`);
  }

  if (_action === "reopen-voucher") {
    await reopenStudioVoucher(Number(studioVoucherId), updatedById as string);
    return redirect(`/studios/${studioId}`);
  }

  return null;
}

export default function VoucherDetails() {
  const { studioId, voucher, userId, voucherDetails, categories, funds } =
    useLoaderData<typeof loader>();
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
                    <LockClosedIcon
                      className="inline-block h-5 w-5 text-red-600"
                      aria-label="closed"
                    />
                  ) : (
                    <LockOpenIcon
                      className="inline-block h-5 w-5 text-green-600"
                      aria-label="open"
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        }
        onCloseModal={() => navigate(`/studios/${studioId}`)}
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
        <div className="my-4 w-full space-x-2 text-right">
          {!voucher.isClosed && (
            <NewStudioVoucherDetails
              studioVoucherId={voucher.id}
              userId={userId}
              maxAmount={remainingAmount}
              categories={categories}
            />
          )}
        </div>
        <StudioVoucherDetailTable
          data={voucherDetails as unknown as StudioVoucherDetailslWithCategory}
          studioVoucherId={voucher.id}
          userId={userId}
          isClosed={voucher.isClosed}
        />
        <hr className="my-4" />
        <div className="text-right">
          {!voucher.isClosed && (
            <Form method="post">
              <input type="hidden" value={userId} name="updatedById" />
              <input type="hidden" value={voucher.id} name="studioVoucherId" />

              <div className="text-right">
                {remainingAmount === 0 && <input type="hidden" value={""} name="fundId" />}
                {remainingAmount !== 0 && (
                  <>
                    <div className="my-2">
                      <small>
                        <i>
                          Note: Remaining amount of{" "}
                          <span className="currency">
                            {formatCurrencyFixed(remainingAmount)}
                          </span>{" "}
                          will be refunded. Please select a fund.
                        </i>
                      </small>
                    </div>
                    <FundPicker
                      name="fundId"
                      defaultValue={""}
                      required
                      funds={funds as unknown as FundWithBalance[]}
                    />
                  </>
                )}
                <Button
                  className="my-4"
                  name="_action"
                  value="close-voucher"
                  type="submit"
                  disabled={transition.state === "submitting"}
                >
                  {itemizedAmount === 0 ? "Delete Voucher" : "Close Voucher"}
                </Button>
              </div>
            </Form>
          )}
          {voucher.isClosed && (
            <Form method="post">
              <input type="hidden" value={userId} name="updatedById" />
              <input type="hidden" value={voucher.id} name="studioVoucherId" />
              <div className="text-right">
                <Button
                  className="my-4"
                  name="_action"
                  value="reopen-voucher"
                  type="submit"
                  disabled={transition.state === "submitting"}
                >
                  Reopen Voucher
                </Button>
              </div>
            </Form>
          )}
        </div>
      </DialogWithTransition>
    </>
  );
}
