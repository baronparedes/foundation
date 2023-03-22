import invariant from 'tiny-invariant';

import {useLoaderData} from '@remix-run/react';
import {json} from '@remix-run/server-runtime';

import Page from '../../components/Page';
import {ProjectCostSummary} from '../../components/ProjectCostSummary';
import {ProjectHeader} from '../../components/ProjectHeader';
import {getProjectDashboard} from '../../models/project-dashboard.server';
import {requireUserId} from '../../session.server';
import {sum} from '../../utils';

import type { Project } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/server-runtime";
export async function loader({ params, request }: LoaderArgs) {
  invariant(params.projectId, "project not found");

  const data = await getProjectDashboard({ id: params.projectId });

  if (!data.project) {
    throw new Response("Not Found", { status: 404 });
  }

  const userId = await requireUserId(request);

  return json({
    ...data,
    userId,
  });
}

export default function ReportProjectPage() {
  const {
    project,
    totalProjectCost,
    remainingFunds,
    collectedFunds,
    disbursedFunds,
    costPlusTotals,
    addOnTotals,
  } = useLoaderData<typeof loader>();
  return (
    <Page currentPage="Report - Projects">
      <div className="w-full py-4">
        <ProjectHeader
          project={project as unknown as Project}
          totalProjectCost={totalProjectCost}
          remainingFunds={remainingFunds}
        />
        <hr className="my-4" />
        <div className="text-10xl">
          <ProjectCostSummary
            estimatedCost={Number(project.estimatedCost)}
            collectedFunds={Number(collectedFunds)}
            disbursedFunds={Number(disbursedFunds)}
            addOnTotals={Number(addOnTotals)}
            costPlusTotals={Number(sum(costPlusTotals.map((_) => _.total)))}
          />
        </div>
      </div>
    </Page>
  );
}
