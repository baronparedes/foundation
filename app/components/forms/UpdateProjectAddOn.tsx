import { useState } from "react";

import { PencilIcon } from "@heroicons/react/solid";
import { useFetcher } from "@remix-run/react";

import {
  DialogWithTransition,
  LabeledCurrency,
  TextArea,
  TextInput,
} from "../@ui";
import { Button } from "../@windmill";

import type { ProjectAddOn } from "@prisma/client";
import type { ProjectAddOnFormErrors } from "./NewProjectAddOn";
type Props = {
  data: ProjectAddOn;
  errors?: ProjectAddOnFormErrors;
};

export function UpdateProjectAddOn({ data, errors }: Props) {
  const [quantity, setQuantity] = useState(Number(data.quantity));
  const [amount, setAmount] = useState(Number(data.amount));
  const [toggle, setToggle] = useState(false);
  const fetcher = useFetcher();
  const isUpdating =
    fetcher.state === "submitting" &&
    Number(fetcher.submission.formData.get("id")) === data.id;

  const totalAmount = quantity * amount;

  return (
    <>
      <Button size="small" aria-label="update" onClick={() => setToggle(true)}>
        <PencilIcon className="h-5 w-5" />
      </Button>
      <DialogWithTransition
        isOpen={toggle}
        title="Update project add on"
        onCloseModal={() => setToggle(false)}
      >
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
            <TextInput name="updatedById" required value={data.updatedById} readOnly />
            <TextInput name="projectId" required value={data.projectId} readOnly />
            <TextInput name="id" required value={data.id} readOnly />
            <TextInput name="total" required value={totalAmount} readOnly />
          </div>
          <TextArea
            name="description"
            label="Description"
            required
            error={errors?.description}
            defaultValue={data.description}
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
            defaultValue={Number(data.amount)}
            step={0.01}
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
            defaultValue={Number(data.quantity)}
            step={0.01}
          />
          <TextInput
            name="costPlus"
            label="Included in Cost Plus?"
            type="checkbox"
            defaultChecked={data.costPlus}
          />
          <hr className="my-4" />
          <LabeledCurrency label={"Total Amount"} value={totalAmount} />
          <hr className="my-4" />
          <div className="text-right">
            <Button
              disabled={isUpdating}
              name="_action"
              value="update-project-add-on"
              type="submit"
            >
              Update
            </Button>
          </div>
        </fetcher.Form>
      </DialogWithTransition>
    </>
  );
}
