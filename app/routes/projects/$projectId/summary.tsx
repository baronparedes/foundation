import invariant from 'tiny-invariant';

import {useLoaderData, useNavigate} from '@remix-run/react';
import {json} from '@remix-run/server-runtime';

import {DialogWithTransition} from '../../../components/@ui';
import {getProject} from '../../../models/project.server';
import {requireUserId} from '../../../session.server';

import type { LoaderArgs } from "@remix-run/server-runtime";
export async function loader({ params, request }: LoaderArgs) {
  invariant(params.projectId, "project not found");

  const project = await getProject({ id: params.projectId });
  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }

  const userId = await requireUserId(request);

  return json({ project, userId });
}

export default function ProjectSummary() {
  const { project } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <DialogWithTransition
      size="xl"
      isOpen={true}
      title={<>Project Summary for {project.code}</>}
      onCloseModal={() => navigate(`/projects/${project.id}`)}
    >
      Project Summary
    </DialogWithTransition>
  );
}
