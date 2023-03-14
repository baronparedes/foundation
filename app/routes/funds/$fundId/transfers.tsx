import moment from "moment";
import invariant from "tiny-invariant";

import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
  useTransition,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/server-runtime";

import {
  DialogWithTransition,
  LabeledCurrency,
  TextArea,
  TextInput,
} from "../../../components/@ui";
import { Button } from "../../../components/@windmill";
import { FundPicker } from "../../../components/pickers/FundPicker";
import { transferFundTransaction } from "../../../models/fund-transaction.server";
import { getFund, getFunds } from "../../../models/fund.server";
import { requireUserId } from "../../../session.server";
import { validateRequiredString } from "../../../utils";

import type { FundWithBalance } from "../../../models/fund.server";
import type { FundTransaction } from "../../../models/fund-transaction.server";
import type { LoaderArgs, ActionArgs } from "@remix-run/server-runtime";
type FormErrors = {
  amount?: string;
  description?: string;
  fundId?: string;
};

function getFormData(formData: FormData) {
  const errors: FormErrors = {};
  const { amount, description, fundId, projectId, createdById, createdAt, selectedFundId } =
    Object.fromEntries(formData);

  let hasErrors = false;
  if (!validateRequiredString(description)) {
    errors.description = "Description is required";
    hasErrors = true;
  }
  if (!validateRequiredString(amount)) {
    errors.amount = "Amount is required";
    hasErrors = true;
  }
  if (!validateRequiredString(fundId)) {
    errors.fundId = "Fund is required";
    hasErrors = true;
  }

  return {
    errors: hasErrors ? errors : undefined,
    selectedFundId,
    data: {
      amount,
      description,
      fundId,
      projectId,
      createdById,
      createdAt,
    } as unknown as FundTransaction,
  };
}

export async function loader({ params, request }: LoaderArgs) {
  invariant(params.fundId, "fund not found");

  const fund = await getFund({ id: params.fundId });
  if (!fund) {
    throw new Response("Not Found", { status: 404 });
  }

  const userId = await requireUserId(request);
  const funds = await getFunds();

  return json({ fund, funds, userId });
}

export async function action({ params, request }: ActionArgs) {
  invariant(params.fundId, "fund not found");

  const formData = await request.formData();
  const { errors, data, selectedFundId } = getFormData(formData);

  if (errors) return json({ errors }, { status: 400 });

  await transferFundTransaction({
    selectedFundId: selectedFundId as string,
    ...data,
  });

  return redirect(`/funds/${params.fundId}`);
}

export default function CashInPage() {
  const { fundId } = useParams();
  const navigate = useNavigate();
  const transition = useTransition();
  const { fund, funds, userId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const today = moment().format("yyyy-MM-DD");

  const selectedFund = funds.find((f) => f.id === fundId);

  return (
    <DialogWithTransition
      isOpen={true}
      title={<>Transfers for {fund.code} fund</>}
      onCloseModal={() => navigate(`/funds/${fundId}`)}
    >
      <LabeledCurrency
        label="available fund value"
        value={Number(selectedFund?.balance ?? 0)}
        className="text-center"
      />
      <Form
        method="post"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "100%",
        }}
      >
        <hr className="my-4" />
        <FundPicker
          name="fundId"
          label="Transfer to"
          defaultValue={""}
          required
          error={actionData?.errors?.fundId}
          funds={funds.filter((f) => f.id !== fundId) as unknown as FundWithBalance[]}
        />
        <hr className="my-4" />
        <TextInput
          name="amount"
          label="Amount"
          error={actionData?.errors?.amount}
          type="number"
          required
          max={selectedFund?.balance}
        />
        <TextArea
          name="description"
          label="Description"
          error={actionData?.errors?.description}
          required
        />
        <TextInput
          name="createdAt"
          label="Transaction Date"
          error={actionData?.errors?.amount}
          required
          type="date"
          defaultValue={today}
        />
        <div className="disable hidden">
          <TextInput name="createdById" required defaultValue={userId} />
          <TextInput name="selectedFundId" required defaultValue={fund.id} />
        </div>
        <hr className="my-4" />
        <div className="text-right">
          <Button type="submit" disabled={transition.state === "submitting"}>
            Save Transaction
          </Button>
        </div>
      </Form>
    </DialogWithTransition>
  );
}
