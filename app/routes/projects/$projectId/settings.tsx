import invariant from 'tiny-invariant';

import {useLoaderData, useNavigate} from '@remix-run/react';
import {json} from '@remix-run/server-runtime';

import {DialogWithTransition} from '../../../components/@ui';
import {Button} from '../../../components/@windmill';
import ProjectAddOnTable from '../../../components/tables/ProjectAddOnTable';
import ProjectSettingTable from '../../../components/tables/ProjectSettingTable';
import {getProjectAddOns} from '../../../models/project-add-on.server';
import {getProjectSettings} from '../../../models/project-setting.server';
import {getProject} from '../../../models/project.server';
import {requireUserId} from '../../../session.server';

import type { ProjectAddOnWithDetails } from "../../../models/project-add-on.server";
import type { ProjectSettingWithDetails } from "../../../models/project-setting.server";
import type { LoaderArgs } from "@remix-run/server-runtime";
export async function loader({ params, request }: LoaderArgs) {
  invariant(params.projectId, "project not found");

  const project = await getProject({ id: params.projectId });
  const projectSettings = await getProjectSettings({ id: params.projectId });
  const projectAddOns = await getProjectAddOns({ id: params.projectId });

  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }

  const userId = await requireUserId(request);

  return json({ project, userId, projectSettings, projectAddOns });
}

export default function ProjectSettings() {
  const { project, projectSettings, projectAddOns } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <DialogWithTransition
      size="xl"
      isOpen={true}
      title={<>Project Settings for {project.code}</>}
      onCloseModal={() => navigate(`/projects/${project.id}`)}
    >
      <div className="text-right">
        <Button>New Cost+</Button>
      </div>
      <br />
      <ProjectSettingTable data={projectSettings as unknown as ProjectSettingWithDetails} />
      <hr className="my-4" />
      <div className="text-right">
        <Button>New Add On</Button>
      </div>
      <br />
      <ProjectAddOnTable data={projectAddOns as unknown as ProjectAddOnWithDetails} />
      <br />
    </DialogWithTransition>
  );
}
