import { TrashIcon } from "@heroicons/react/solid";
import { Form, useFetcher } from "@remix-run/react";

import { TextInput } from "../@ui";
import { Button } from "../@windmill";

type Props = {
  projectAddOnId: number;
};

export function DeleteProjectAddOn({ projectAddOnId }: Props) {
  const fetcher = useFetcher();
  const isDeleting =
    fetcher.state === "submitting" &&
    Number(fetcher.submission.formData.get("projectAddOnId")) === projectAddOnId;

  return (
    <>
      <Form method="post">
        <div className="disable hidden">
          <TextInput name="projectAddOnId" required defaultValue={projectAddOnId} />
        </div>
        <Button
          name="_action"
          value="delete-project-add-on"
          disabled={isDeleting}
          className="cursor-pointer"
          size="small"
          type="submit"
          aria-label="delete"
          onClick={(e) => !confirm("continue?") && e.preventDefault()}
        >
          <TrashIcon className="h-5 w-5" />
        </Button>
      </Form>
    </>
  );
}
