import moment from "moment";
import invariant from "tiny-invariant";

import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useTransition,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/server-runtime";

import {
  DialogWithTransition,
  SelectInput,
  TextArea,
  TextInput,
} from "../../../components/@ui";
import { Button } from "../../../components/@windmill";
import { createFundTransaction } from "../../../models/fund-transaction.server";
import { getFund } from "../../../models/fund.server";
import { getProjectsByUserId } from "../../../models/project.server";
import { requireUserId } from "../../../session.server";
import { validateRequiredString } from "../../../utils";

import type { FundTransaction } from "@prisma/client";
import type { LoaderArgs, ActionArgs } from "@remix-run/server-runtime";

type FormErrors = {
  amount?: string;
  description?: string;
};

function getFormData(formData: FormData) {
  const errors: FormErrors = {};
  const { amount, description, fundId, projectId, createdById, createdAt } =
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

  return {
    errors: hasErrors ? errors : undefined,
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

export async function action({ params, request }: ActionArgs) {
  invariant(params.fundId, "fund not found");

  const formData = await request.formData();
  const { errors, data } = getFormData(formData);

  if (errors) return json({ errors }, { status: 400 });

  await createFundTransaction({
    ...data,
    projectId: data.projectId === "" ? null : data.projectId,
    type: "collection",
  });

  return redirect(`/funds/${params.fundId}`);
}

export async function loader({ params, request }: LoaderArgs) {
  invariant(params.fundId, "fund not found");

  const fund = await getFund({ id: params.fundId });
  if (!fund) {
    throw new Response("Not Found", { status: 404 });
  }

  const userId = await requireUserId(request);
  const projects = await getProjectsByUserId({ userId });

  return json({ fund, projects, userId });
}

export default function CollectionsPage() {
  const actionData = useActionData<typeof action>();
  const { fund, projects, userId } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const transition = useTransition();
  const today = moment().format("yyyy-MM-DD");

  return (
    <DialogWithTransition
      isOpen={true}
      title={<>Collection for {fund.code} fund</>}
      onCloseModal={() => navigate(`/funds/${fund.id}`)}
    >
      <Form
        method="post"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "100%",
        }}
      >
        <TextInput
          name="amount"
          label="Amount"
          error={actionData?.errors?.amount}
          type="number"
          required
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
        <SelectInput name="projectId" label="Project" defaultValue={""}>
          <option value={""}>Select a project</option>
          {projects.map((p) => {
            return (
              <option key={p.id} value={p.id}>
                {p.code}
              </option>
            );
          })}
        </SelectInput>
        <div className="disable hidden">
          <TextInput name="createdById" required defaultValue={userId} />
          <TextInput name="fundId" required defaultValue={fund.id} />
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
