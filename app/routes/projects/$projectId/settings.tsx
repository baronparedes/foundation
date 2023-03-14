import invariant from "tiny-invariant";

import { useLoaderData, useNavigate } from "@remix-run/react";
import { json, redirect } from "@remix-run/server-runtime";

import { DialogWithTransition } from "../../../components/@ui";
import {
  getNewProjectAddOnFormData,
  NewProjectAddOn,
} from "../../../components/forms/NewProjectAddOn";
import {
  getProjectSettingFormData,
  NewProjectSetting,
} from "../../../components/forms/NewProjectSetting";
import { ProjectAddOnTable } from "../../../components/tables/ProjectAddOnTable";
import { ProjectSettingTable } from "../../../components/tables/ProjectSettingTable";
import {
  createProjectAddOn,
  deleteProjectAddOn,
  getProjectAddOns,
} from "../../../models/project-add-on.server";
import {
  createProjectSetting,
  deleteProjectSetting,
  getProjectSettings,
} from "../../../models/project-setting.server";
import { getProject } from "../../../models/project.server";
import { requireUserId } from "../../../session.server";

import type { ProjectAddOnWithDetails } from "../../../models/project-add-on.server";
import type { ProjectSettingWithDetails } from "../../../models/project-setting.server";
import type { LoaderArgs, ActionArgs } from "@remix-run/server-runtime";
export async function loader({ params, request }: LoaderArgs) {
  invariant(params.projectId, "project not found");

  const project = await getProject({ id: params.projectId });
  const projectSettings = await getProjectSettings({ id: params.projectId });
  const projectAddOns = await getProjectAddOns({ id: params.projectId });

  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }

  const userId = await requireUserId(request);

  return json({
    projectId: params.projectId,
    project,
    userId,
    projectSettings,
    projectAddOns,
  });
}

export async function action({ params, request }: ActionArgs) {
  invariant(params.projectId, "project not found");

  const formData = await request.formData();
  const { _action, projectSettingId, projectAddOnId } = Object.fromEntries(formData);

  if (_action === "delete-project-add-on") {
    await deleteProjectAddOn({ id: Number(projectAddOnId) });
    return json({ state: "deleted project add on", projectAddOnId });
  }

  if (_action === "delete-project-setting") {
    await deleteProjectSetting({ id: Number(projectSettingId) });
    return json({ state: "deleted project setting", projectSettingId });
  }

  if (_action === "create-project-setting") {
    const costPlusFormData = getProjectSettingFormData(formData);
    if (!costPlusFormData.errors) {
      await createProjectSetting(costPlusFormData.data);
      return redirect(`/projects/${params.projectId}/settings`);
    }
  }

  if (_action === "create-project-add-on") {
    const addOnFormData = getNewProjectAddOnFormData(formData);
    if (!addOnFormData.errors) {
      await createProjectAddOn(addOnFormData.data);
      return redirect(`/projects/${params.projectId}/settings`);
    }
  }

  return null;
}

export default function ProjectSettings() {
  const { project, projectSettings, projectAddOns, projectId, userId } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <DialogWithTransition
      size="xl"
      isOpen={true}
      title={<>Project Settings for {project.code}</>}
      onCloseModal={() => navigate(`/projects/${project.id}`)}
    >
      <div className="text-right">
        <NewProjectSetting projectId={projectId} userId={userId} />
      </div>
      <br />
      <ProjectSettingTable data={projectSettings as unknown as ProjectSettingWithDetails} />
      <hr className="my-4" />
      <div className="text-right">
        <NewProjectAddOn projectId={projectId} userId={userId} />
      </div>
      <br />
      <ProjectAddOnTable data={projectAddOns as unknown as ProjectAddOnWithDetails} />
      <br />
    </DialogWithTransition>
  );
}
