import moment from "moment";
import { useState } from "react";

import { PencilIcon } from "@heroicons/react/solid";
import { useFetcher } from "@remix-run/react";

import { DialogWithTransition, TextArea, TextInput } from "../@ui";
import { Button } from "../@windmill";

import type { ProjectSetting } from "@prisma/client";
import type { ProjectSettingFormErrors } from "./NewProjectSetting";
type Props = {
  data: ProjectSetting;
  errors?: ProjectSettingFormErrors;
};

export function UpdateProjectSetting({ data, errors }: Props) {
  const [toggle, setToggle] = useState(false);
  const fetcher = useFetcher();
  const isUpdating =
    fetcher.state === "submitting" &&
    Number(fetcher.submission.formData.get("id")) === data.id;

  return (
    <>
      <Button size="small" aria-label="update" onClick={() => setToggle(true)}>
        <PencilIcon className="h-5 w-5" />
      </Button>
      <DialogWithTransition
        isOpen={toggle}
        title="Update project setting"
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
          </div>
          <TextArea
            name="description"
            label="Description"
            required
            error={errors?.description}
            defaultValue={data.description}
          />
          <TextInput
            name="percentageAddOn"
            label="Percentage add on"
            type="number"
            required
            step={0.01}
            min={1}
            max={100}
            error={errors?.percentageAddOn}
            defaultValue={Number(data.percentageAddOn)}
          />
          <TextInput
            name="isContingency"
            label="For Contingency?"
            type="checkbox"
            defaultChecked={data.isContingency}
          />
          <hr className="my-4" />
          <TextInput
            name="startDate"
            label="Start Date"
            error={errors?.startDate}
            required
            type="date"
            defaultValue={moment(data.startDate).format("yyyy-MM-DD")}
          />
          <TextInput
            name="endDate"
            label="End Date?"
            type="date"
            defaultValue={moment(data.endDate).format("yyyy-MM-DD")}
          />
          <hr className="my-4" />
          <div className="text-right">
            <Button
              disabled={isUpdating}
              name="_action"
              value="update-project-setting"
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
