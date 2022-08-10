import {Form, useActionData} from '@remix-run/react';
import {json, redirect} from '@remix-run/server-runtime';

import {Button} from '../../components/@windmill';
import TextArea from '../../components/TextArea';
import TextInput from '../../components/TextInput';
import {createFund} from '../../models/fund.server';
import {validateRequiredString} from '../../utils';

import type { Fund } from "../../models/fund.server";
import type { ActionArgs } from "@remix-run/server-runtime";
type FormErrors = {
  name?: string;
  code?: string;
};

function getFormData(formData: FormData) {
  const errors: FormErrors = {};
  const fields = ["name", "code", "description"];
  const [name, code, description] = fields.map((field) => formData.get(field));

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

  return (
    <>
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
          name="name"
          label="Name: "
          error={actionData?.errors?.name}
          required
        />
        <TextInput
          name="code"
          label="Code: "
          error={actionData?.errors?.code}
          required
        />
        <TextArea name="description" label="Description: " />
        <div className="text-right">
          <Button type="submit">Save</Button>
        </div>
      </Form>
    </>
  );
}
