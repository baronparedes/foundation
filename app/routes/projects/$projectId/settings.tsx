import invariant from "tiny-invariant";

import { useLoaderData, useNavigate } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

import { DialogWithTransition } from "../../../components/@ui";
import {
  getNewProjectAddOnFormData,
  NewProjectAddOn,
} from "../../../components/forms/NewProjectAddOn";
import {
  getProjectSettingFormData,
  NewProjectSetting,
} from "../../../components/forms/NewProjectSetting";
import {
  ProjectAddOnTable,
} from "../../../components/tables/ProjectAddOnTable";
import {
  ProjectSettingTable,
} from "../../../components/tables/ProjectSettingTable";
import {
  createProjectAddOn,
  deleteProjectAddOn,
  getProjectAddOns,
  updateProjectAddOn,
} from "../../../models/project-add-on.server";
import {
  createProjectSetting,
  deleteProjectSetting,
  getProjectSettings,
  updateProjectSetting,
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
  if (_action === "create-project-add-on") {
    const projectAddOnFormData = getNewProjectAddOnFormData(formData);
    if (!projectAddOnFormData.errors) {
      const { id } = await createProjectAddOn(projectAddOnFormData.data);
      return json({
        state: "created project add on",
        projectAddOnId: id,
      });
    }
  }
  if (_action === "update-project-add-on") {
    const projectAddOnFormData = getNewProjectAddOnFormData(formData, true);
    if (!projectAddOnFormData.errors) {
      await updateProjectAddOn(projectAddOnFormData.data);
      return json({
        state: "updated project add on",
        projectAddOnId: projectAddOnFormData.data.id,
      });
    }
  }

  if (_action === "delete-project-setting") {
    await deleteProjectSetting({ id: Number(projectSettingId) });
    return json({ state: "deleted project setting", projectSettingId });
  }

  if (_action === "create-project-setting") {
    const projectSettingFormData = getProjectSettingFormData(formData);
    if (!projectSettingFormData.errors) {
      const { id } = await createProjectSetting(projectSettingFormData.data);
      return json({
        state: "created project setting",
        projectSettingId: id,
      });
    }
  }

  if (_action === "update-project-setting") {
    const projectSettingFormData = getProjectSettingFormData(formData, true);
    if (!projectSettingFormData.errors) {
      await updateProjectSetting(projectSettingFormData.data);
      return json({
        state: "updated project setting",
        projectSettingId: projectSettingFormData.data.id,
      });
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
      <ProjectSettingTable
        data={projectSettings as unknown as ProjectSettingWithDetails}
        newComponent={
          <div>
            <NewProjectSetting projectId={projectId} userId={userId} />
          </div>
        }
      />
      <br />
      <ProjectAddOnTable
        data={projectAddOns as unknown as ProjectAddOnWithDetails}
        newComponent={
          <div>
            <NewProjectAddOn projectId={projectId} userId={userId} />
          </div>
        }
      />
      <br />
    </DialogWithTransition>
  );
}
