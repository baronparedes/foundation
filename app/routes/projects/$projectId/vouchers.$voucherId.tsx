import invariant from "tiny-invariant";

import {
  ExclamationCircleIcon,
  LockClosedIcon,
  LockOpenIcon,
} from "@heroicons/react/solid";
import { Form, useLoaderData, useNavigate, useTransition } from "@remix-run/react";
import { json, redirect } from "@remix-run/server-runtime";

import { DialogWithTransition, LabeledCurrency } from "../../../components/@ui";
import { Button } from "../../../components/@windmill";
import { NewVoucherDetails } from "../../../components/forms/NewVoucherDetail";
import { ToggleVoucherCostPlus } from "../../../components/forms/ToggleVoucherCostPlus";
import { FundPicker } from "../../../components/pickers/FundPicker";
import { VoucherDetailTable } from "../../../components/tables/VoucherDetailTable";
import { getDetailCategories } from "../../../models/detail-category.server";
import { getFunds } from "../../../models/fund.server";
import {
  addProjectVoucherDetail,
  deleteProjectVoucherDetail,
  getProjectVoucherDetails,
} from "../../../models/project-voucher-detail.server";
import {
  closeProjectVoucher,
  getProjectVoucher,
  toggleCostPlus,
} from "../../../models/project-voucher.server";
import { requireUserId } from "../../../session.server";
import { formatCurrencyFixed, sum } from "../../../utils";

import type { FundWithBalance } from "../../../models/fund.server";
import type { ProjectVoucherDetailslWithCategory } from "../../../models/project-voucher-detail.server";
import type { ProjectVoucherDetail } from "../../../models/project-voucher.server";
import type { LoaderArgs, ActionArgs } from "@remix-run/server-runtime";
export async function loader({ params, request }: LoaderArgs) {
  const { projectId, voucherId } = params;
  const voucher = await getProjectVoucher({ id: Number(voucherId) });
  const userId = await requireUserId(request);
  const voucherDetails = await getProjectVoucherDetails({
    id: Number(voucherId),
  });
  const categories = await getDetailCategories();

  invariant(projectId, "project not found");
  invariant(voucher, "voucher not found");

  const funds = await getFunds();

  return json({ projectId, voucher, userId, voucherDetails, categories, funds });
}

export async function action({ params, request }: ActionArgs) {
  const { projectId } = params;
  const formData = Object.fromEntries(await request.formData());
  const { _action, updatedById, projectVoucherId, fundId, ...values } = formData;

  if (_action === "create") {
    const data = {
      ...values,
      projectVoucherId: Number(projectVoucherId),
      quantity: values.quantity === "" ? null : values.quantity,
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

  if (_action === "toggle-cost-plus") {
    const { costPlus } = formData;
    await toggleCostPlus(
      Number(projectVoucherId),
      updatedById.toString(),
      costPlus.toString().toLowerCase() === "true"
    );
  }

  return null;
}

export default function VoucherDetails() {
  const { projectId, voucher, userId, voucherDetails, categories, funds } =
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
                  {!voucher.costPlus && (
                    <span title="This is exempted from cost plus">
                      <ExclamationCircleIcon
                        className="inline-block h-5 w-5 text-yellow-600"
                        aria-label="cost plus exempt"
                      />
                    </span>
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
        <div className="my-4 w-full space-x-2 text-right">
          <ToggleVoucherCostPlus
            projectVoucherId={voucher.id}
            userId={userId}
            costPlus={voucher.costPlus}
          />
          {!voucher.isClosed && (
            <NewVoucherDetails
              projectVoucherId={voucher.id}
              userId={userId}
              maxAmount={remainingAmount}
              categories={categories}
            />
          )}
        </div>
        <VoucherDetailTable
          data={voucherDetails as unknown as ProjectVoucherDetailslWithCategory}
          projectVoucherId={voucher.id}
          userId={userId}
          isClosed={voucher.isClosed}
        />
        <hr className="my-4" />
        <div className="text-right">
          {!voucher.isClosed && (
            <Form method="post">
              <input type="hidden" value={userId} name="updatedById" />
              <input type="hidden" value={voucher.id} name="projectVoucherId" />

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
        </div>
      </DialogWithTransition>
    </>
  );
}
