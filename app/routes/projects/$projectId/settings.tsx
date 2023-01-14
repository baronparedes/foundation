import invariant from 'tiny-invariant';

import {useLoaderData, useNavigate} from '@remix-run/react';
import {json} from '@remix-run/server-runtime';

import {DialogWithTransition} from '../../../components/@ui';
import {getProjectDashboard} from '../../../models/project.server';
import {requireUserId} from '../../../session.server';
import {sum} from '../../../utils';

import type { LoaderArgs } from "@remix-run/server-runtime";
export async function loader({ params, request }: LoaderArgs) {
  invariant(params.projectId, "project not found");

  const { project, categorizedDisbursement, uncategorizedDisbursement } =
    await getProjectDashboard({ id: params.projectId });

  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }

  const userId = await requireUserId(request);

  return json({ project, userId, categorizedDisbursement, uncategorizedDisbursement });
}

export default function ProjectSettings() {
  const { project, categorizedDisbursement, uncategorizedDisbursement } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const totalDisbursed =
    sum(categorizedDisbursement.map((_) => _.totalDisbursements)) +
    uncategorizedDisbursement;

  return (
    <DialogWithTransition
      size="xl"
      isOpen={true}
      title={<>Project Settings for {project.code}</>}
      onCloseModal={() => navigate(`/projects/${project.id}`)}
    >
      Project Settings
    </DialogWithTransition>
  );
}
