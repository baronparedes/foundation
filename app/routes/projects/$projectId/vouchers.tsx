import moment from 'moment';
import React, {useState} from 'react';
import invariant from 'tiny-invariant';

import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useTransition,
} from '@remix-run/react';
import {json, redirect} from '@remix-run/server-runtime';

import {DialogWithTransition, SelectInput, TextArea, TextInput} from '../../../components/@ui';
import {Button} from '../../../components/@windmill';
import {getFunds} from '../../../models/fund.server';
import {getProject} from '../../../models/project.server';
import {requireUserId} from '../../../session.server';
import {formatCurrencyFixed, validateRequiredString} from '../../../utils';

import type { FundTransaction } from "@prisma/client";
import type { LoaderArgs, ActionArgs } from "@remix-run/server-runtime";
type FormErrors = {
  amount?: string;
  description?: string;
};

function getFormData(formData: FormData) {
  const errors: FormErrors = {};
  const fields = [
    "amount",
    "description",
    "fundId",
    "projectId",
    "createdById",
    "createdAt",
  ];
  const [amount, description, fundId, projectId, createdById, createdAt] =
    fields.map((field) => formData.get(field));

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
  invariant(params.projectId, "project not found");

  const formData = await request.formData();
  const { errors, data } = getFormData(formData);

  if (errors) return json({ errors }, { status: 400 });

  console.log(data);

  return redirect(`/projects/${params.projectId}`);
}

export async function loader({ params, request }: LoaderArgs) {
  invariant(params.projectId, "project not found");

  const project = await getProject({ id: params.projectId });
  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }

  const userId = await requireUserId(request);
  const funds = await getFunds();

  return json({ project, funds, userId });
}

export default function VoucherPage() {
  const actionData = useActionData<typeof action>();
  const { project, userId, funds } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const transition = useTransition();
  const today = moment().format("yyyy-MM-DD");

  const [maxBalance, setMaxBalance] = useState(0);

  const handleOnSelectFund = (e: React.FormEvent<HTMLSelectElement>) => {
    const index = e.currentTarget.selectedIndex;
    const optionElement = e.currentTarget.childNodes[
      index
    ] as HTMLOptionElement;
    const dataBalance = optionElement.dataset.balance;

    // const dataBalance = e.currentTarget.getAttribute("data-balance");
    console.log(dataBalance);
    setMaxBalance(Number(dataBalance) ?? 0);
  };

  return (
    <DialogWithTransition
      isOpen={true}
      title={<>New voucher for project {project.code}</>}
      onCloseModal={() => navigate(`/projects/${project.id}`)}
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
          label="Amount: "
          error={actionData?.errors?.amount}
          type="number"
          required
          max={maxBalance}
        />
        <TextArea
          name="description"
          label="Description: "
          error={actionData?.errors?.description}
          required
        />
        <TextInput
          name="createdAt"
          label="Transaction Date: "
          error={actionData?.errors?.amount}
          required
          type="date"
          defaultValue={today}
        />
        <SelectInput
          name="fundId"
          label="Fund: "
          defaultValue={""}
          required
          onChange={handleOnSelectFund}
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
        <div className="disable hidden">
          <TextInput name="createdById" required defaultValue={userId} />
          <TextInput name="projectId" required defaultValue={project.id} />
        </div>
        <div className="text-right">
          <Button type="submit" disabled={transition.state === "submitting"}>
            Save Voucher
          </Button>
        </div>
      </Form>
    </DialogWithTransition>
  );
}
