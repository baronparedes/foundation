import moment from "moment";
import { useState } from "react";

import { useFetcher } from "@remix-run/react";

import { validateRequiredString } from "../../utils";
import { DialogWithTransition, TextArea, TextInput } from "../@ui";
import { Button } from "../@windmill";

import type { ProjectSetting } from "@prisma/client";
const today = moment().format("yyyy-MM-DD");

export type CostPlusFormErrors = {
  description?: string;
  percentageAddOn?: string;
  startDate?: string;
  onCostPlusCreated?: () => void;
};

export function getAddCostPlusFormData(formData: FormData) {
  const errors: CostPlusFormErrors = {};
  const { description, percentageAddOn, startDate, endDate, projectId, updatedById } =
    Object.fromEntries(formData);

  let hasErrors = false;
  if (!validateRequiredString(description)) {
    errors.description = "Description is required";
    hasErrors = true;
  }
  if (!validateRequiredString(percentageAddOn)) {
    errors.percentageAddOn = "Percentage add on is required";
    hasErrors = true;
  }
  if (Number(percentageAddOn) === 0) {
    errors.percentageAddOn = "Percentage add on cannot be zero";
    hasErrors = true;
  }
  if (Number(percentageAddOn) > 100) {
    errors.percentageAddOn = "Percentage add on cannot exceed 100%";
    hasErrors = true;
  }
  if (!validateRequiredString(startDate)) {
    errors.startDate = "Start date is required";
    hasErrors = true;
  }

  return {
    errors: hasErrors ? errors : undefined,
    data: {
      description,
      percentageAddOn,
      startDate,
      endDate,
      updatedById,
      projectId,
    } as unknown as ProjectSetting,
  };
}

type Props = {
  projectId: string;
  userId: string;
  errors?: CostPlusFormErrors;
};

export function AddCostPlus({ projectId, userId, errors }: Props) {
  const [toggle, setToggle] = useState(false);
  const fetcher = useFetcher();
  const isAdding =
    fetcher.submission?.formData.get("_action") === "create" &&
    fetcher.state === "submitting";

  return (
    <>
      <Button
        disabled={isAdding}
        onClick={() => {
          setToggle(true);
        }}
      >
        New Cost Plus
      </Button>
      <DialogWithTransition isOpen={toggle} title={<>Fill cost plus details</>}>
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
          </div>
          <TextArea
            name="description"
            label="Description"
            required
            error={errors?.description}
          />
          <TextInput
            name="percentageAddOn"
            label="Percentage add on"
            type="number"
            required
            step={0.1}
            min={1}
            max={100}
            error={errors?.percentageAddOn}
          />
          <hr className="my-4" />
          <TextInput
            name="startDate"
            label="Start Date"
            error={errors?.startDate}
            required
            type="date"
            defaultValue={today}
          />
          <TextInput name="endDate" label="End Date?" type="date" />
          <hr className="my-4" />
          <div className="text-right">
            <Button
              disabled={fetcher.state === "submitting"}
              name="_action"
              value="create-project-setting"
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
