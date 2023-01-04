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
import {createProjectVoucher} from '../../../models/project-voucher.server';
import {getProject} from '../../../models/project.server';
import {requireUserId} from '../../../session.server';
import {formatCurrencyFixed, validateRequiredString} from '../../../utils';

import type { ProjectVoucher } from "@prisma/client";
import type { LoaderArgs, ActionArgs } from "@remix-run/server-runtime";

type FormErrors = {
  disbursedAmount?: string;
  description?: string;
  transactionDate?: string;
  fundId?: string;
  voucherNumber?: string;
};

function getFormData(formData: FormData) {
  const errors: FormErrors = {};
  const {
    voucherNumber,
    description,
    disbursedAmount,
    transactionDate,
    updatedById,
    projectId,
    code,
    fundId,
  } = Object.fromEntries(formData);

  let hasErrors = false;
  if (!validateRequiredString(description)) {
    errors.description = "Description is required";
    hasErrors = true;
  }
  if (!validateRequiredString(disbursedAmount)) {
    errors.disbursedAmount = "Amount is required";
    hasErrors = true;
  }
  if (Number(disbursedAmount) === 0) {
    errors.disbursedAmount = "Amount cannot be zero";
    hasErrors = true;
  }
  if (!validateRequiredString(fundId)) {
    errors.fundId = "Fund is required";
    hasErrors = true;
  }
  if (!validateRequiredString(voucherNumber)) {
    errors.disbursedAmount = "Voucher number is required";
    hasErrors = true;
  }
  if (!validateRequiredString(transactionDate)) {
    errors.disbursedAmount = "Transaction date is required";
    hasErrors = true;
  }

  return {
    errors: hasErrors ? errors : undefined,
    data: {
      voucherNumber,
      description,
      disbursedAmount,
      transactionDate,
      updatedById,
      projectId,
      code,
      fundId,
    } as unknown as ProjectVoucher & { code: string },
  };
}

export async function action({ params, request }: ActionArgs) {
  invariant(params.projectId, "project not found");

  const formData = await request.formData();
  const { errors, data } = getFormData(formData);

  if (errors) return json({ errors }, { status: 400 });

  const newVoucher = await createProjectVoucher({
    ...data,
  });

  return redirect(`/projects/${params.projectId}/vouchers/${newVoucher.id}`);
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

  function handleOnSelectFund(e: React.FormEvent<HTMLSelectElement>) {
    const index = e.currentTarget.selectedIndex;
    const optionElement = e.currentTarget.childNodes[index] as HTMLOptionElement;
    const dataBalance = optionElement.dataset.balance;
    setMaxBalance(Number(dataBalance) ?? 0);
  }

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
          name="voucherNumber"
          label="Voucher Number"
          error={actionData?.errors?.voucherNumber}
          textTransform="uppercase"
          required
        />
        <TextInput
          name="disbursedAmount"
          label="Amount to Disburse"
          error={actionData?.errors?.disbursedAmount}
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
          name="transactionDate"
          label="Transaction Date"
          error={actionData?.errors?.transactionDate}
          required
          type="date"
          defaultValue={today}
        />
        <SelectInput
          name="fundId"
          label="Fund"
          defaultValue={""}
          required
          error={actionData?.errors?.fundId}
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
          <TextInput name="updatedById" required defaultValue={userId} />
          <TextInput name="projectId" required defaultValue={project.id} />
          <TextInput name="code" required defaultValue={project.code} />
        </div>
        <hr className="my-4" />
        <div className="text-right">
          <Button type="submit" disabled={transition.state === "submitting"}>
            Save Voucher
          </Button>
        </div>
      </Form>
    </DialogWithTransition>
  );
}
