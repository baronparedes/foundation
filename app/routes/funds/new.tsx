import { Form, useActionData, useNavigate, useTransition } from "@remix-run/react";
import { json, redirect } from "@remix-run/server-runtime";

import { DialogWithTransition, TextArea, TextInput } from "../../components/@ui";
import { Button } from "../../components/@windmill";
import { createFund } from "../../models/fund.server";
import { validateRequiredString } from "../../utils";

import type { Fund } from "../../models/fund.server";
import type { ActionArgs } from "@remix-run/server-runtime";

type FormErrors = {
  name?: string;
  code?: string;
};

function getFormData(formData: FormData) {
  const errors: FormErrors = {};
  const { name, code, description } = Object.fromEntries(formData);

  let hasErrors = false;
  if (!validateRequiredString(name)) {
    errors.name = "Name is required";
    hasErrors = true;
  }
  if (!validateRequiredString(code)) {
    errors.code = "Code is required";
    hasErrors = true;
  }

  return {
    errors: hasErrors ? errors : undefined,
    data: {
      name,
      code,
      description,
    } as unknown as Fund,
  };
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const { errors, data } = getFormData(formData);

  if (errors) return json({ errors }, { status: 400 });

  const fund = await createFund({
    ...data,
  });

  return redirect(`/funds/${fund.id}`);
}

export default function NewFundPage() {
  const actionData = useActionData<typeof action>();
  const transition = useTransition();
  const navigate = useNavigate();

  function onCloseModal() {
    navigate("/funds");
  }

  return (
    <>
      <DialogWithTransition
        isOpen={true}
        title="Create New Wallet"
        onCloseModal={onCloseModal}
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
          <TextInput name="name" label="Name" error={actionData?.errors?.name} required />
          <TextInput
            name="code"
            label="Code"
            error={actionData?.errors?.code}
            required
            textTransform="uppercase"
          />
          <TextArea name="description" label="Description: " />
          <hr className="my-4" />
          <div className="text-right">
            <Button type="submit" disabled={transition.state === "submitting"}>
              Save
            </Button>
          </div>
        </Form>
      </DialogWithTransition>
    </>
  );
}
