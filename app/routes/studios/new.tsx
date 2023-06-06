import {Form, useActionData, useNavigate, useTransition} from '@remix-run/react';
import {json, redirect} from '@remix-run/server-runtime';

import {DialogWithTransition, TextArea, TextInput} from '../../components/@ui';
import {Button} from '../../components/@windmill';
import {createStudio} from '../../models/studio.server';
import {validateRequiredString} from '../../utils';

import type { Studio } from "../../models/studio.server";
import type { ActionArgs } from "@remix-run/server-runtime";

type FormErrors = {
  name?: string;
  code?: string;
  location?: string;
};

function getFormData(formData: FormData) {
  const errors: FormErrors = {};
  const { name, code, description, location } = Object.fromEntries(formData);

  let hasErrors = false;
  if (!validateRequiredString(name)) {
    errors.name = "Name is required";
    hasErrors = true;
  }
  if (!validateRequiredString(code)) {
    errors.code = "Code is required";
    hasErrors = true;
  }
  if (!validateRequiredString(location)) {
    errors.location = "Location is required";
    hasErrors = true;
  }

  return {
    errors: hasErrors ? errors : undefined,
    data: {
      name,
      code,
      location,
      description,
    } as unknown as Studio,
  };
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const { errors, data } = getFormData(formData);

  if (errors) return json({ errors }, { status: 400 });

  const studio = await createStudio({
    ...data,
  });

  return redirect(`/studios/${studio.id}`);
}

export default function NewStudioPage() {
  const actionData = useActionData<typeof action>();
  const transition = useTransition();
  const navigate = useNavigate();

  function onCloseModal() {
    navigate("/studios");
  }

  return (
    <>
      <DialogWithTransition
        isOpen={true}
        isStatic={true}
        title="Create New Studio"
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
          <TextArea name="description" label="Description" />
          <TextArea
            name="location"
            label="Location"
            error={actionData?.errors?.location}
            required
          />
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
