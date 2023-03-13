import { useState } from "react";

import { useFetcher } from "@remix-run/react";

import { validateRequiredString } from "../../utils";
import { DialogWithTransition, LabeledCurrency, TextArea, TextInput } from "../@ui";
import { Button } from "../@windmill";

import type { ProjectAddOn } from "@prisma/client";
export type AddOnFormErrors = {
  description?: string;
  amount?: string;
  quantity?: string;
  total?: string;
};

export function getNewAddOnFormData(formData: FormData) {
  const errors: AddOnFormErrors = {};
  const { description, amount, quantity, total, costPlus, projectId, updatedById } =
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
  if (Number(amount) === 0) {
    errors.amount = "Amount cannot be zero";
    hasErrors = true;
  }
  if (!validateRequiredString(quantity)) {
    errors.amount = "Quantity is required";
    hasErrors = true;
  }
  if (Number(quantity) === 0) {
    errors.amount = "Quantity cannot be zero";
    hasErrors = true;
  }

  return {
    errors: hasErrors ? errors : undefined,
    data: {
      description,
      amount,
      quantity,
      total,
      costPlus: costPlus ? true : false,
      projectId,
      updatedById,
    } as unknown as ProjectAddOn,
  };
}

type Props = {
  projectId: string;
  userId: string;
  errors?: AddOnFormErrors;
};

export function NewAddOn({ projectId, userId, errors }: Props) {
  const [toggle, setToggle] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [amount, setAmount] = useState(0);

  const fetcher = useFetcher();
  const isAdding =
    fetcher.submission?.formData.get("_action") === "create" &&
    fetcher.state === "submitting";

  const totalAmount = quantity * amount;

  return (
    <>
      <Button
        disabled={isAdding}
        onClick={() => {
          setToggle(true);
        }}
      >
        New Add On
      </Button>
      <DialogWithTransition isOpen={toggle} title={<>Fill add on details</>}>
        <fetcher.Form
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: "100%",
          }}
          method="post"
          onSubmit={() => {
            setToggle(false);
          }}
        >
          <div className="disable hidden">
            <TextInput name="updatedById" required defaultValue={userId} />
            <TextInput name="projectId" required defaultValue={projectId} />
            <TextInput name="total" required value={totalAmount} />
          </div>
          <TextArea
            name="description"
            label="Description"
            required
            error={errors?.description}
          />
          <TextInput
            name="amount"
            label="Amount"
            type="number"
            required
            error={errors?.amount}
            onChange={(e) => {
              setAmount(Number(e.currentTarget.value));
            }}
          />
          <TextInput
            name="quantity"
            label="Quantity"
            type="number"
            required
            error={errors?.quantity}
            onChange={(e) => {
              setQuantity(Number(e.currentTarget.value));
            }}
          />
          <TextInput
            name="costPlus"
            label="Included in Cost Plus?"
            type="checkbox"
            defaultChecked={true}
          />
          <hr className="my-4" />
          <LabeledCurrency label={"Total Amount"} value={totalAmount} />
          <hr className="my-4" />
          <div className="text-right">
            <Button
              disabled={fetcher.state === "submitting"}
              name="_action"
              value="create-project-add-on"
              type="submit"
            >
              Add
            </Button>
          </div>
        </fetcher.Form>
      </DialogWithTransition>
    </>
  );
}
