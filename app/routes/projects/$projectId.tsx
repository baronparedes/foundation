import invariant from "tiny-invariant";
import { getProject } from "~/models/project.server";

import { json } from "@remix-run/node";
import { Form, Outlet, useCatch, useLoaderData, useNavigate } from "@remix-run/react";

import { SearchInput } from "../../components/@ui/SearchInput";
import { Button } from "../../components/@windmill";
import { ProjectCostSummary } from "../../components/ProjectCostSummary";
import { ProjectHeader } from "../../components/ProjectHeader";
import { ProjectVoucherTable } from "../../components/tables/ProjectVoucherTable";
import { getProjectDashboard } from "../../models/project-dashboard.server";
import { getProjectVouchers } from "../../models/project-voucher.server";

import type { Project } from "~/models/project.server";
import type { LoaderArgs } from "@remix-run/node";
import type { ProjectVoucherWithDetails } from "../../models/project-voucher.server";
export async function loader({ params, request }: LoaderArgs) {
  invariant(params.projectId, "projectId not found");

  const project = await getProject({ id: params.projectId });
  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }

  const url = new URL(request.url);
  const urlParams = new URLSearchParams(url.search);
  const criteria = urlParams.get("search") ?? undefined;

  const projectVouchers = await getProjectVouchers({
    id: params.projectId,
    criteria,
  });

  const {
    collectedFunds,
    disbursedFunds,
    remainingFunds,
    addOnTotals,
    costPlusTotals,
    totalProjectCost,
    netProjectCost,
    contingencyTotals,
  } = await getProjectDashboard({ id: params.projectId });

  return json({
    project,
    collectedFunds,
    disbursedFunds,
    remainingFunds,
    projectVouchers,
    addOnTotals,
    costPlusTotals,
    totalProjectCost,
    netProjectCost,
    contingencyTotals,
  });
}

export default function ProjectDetailsPage() {
  const {
    project,
    collectedFunds,
    disbursedFunds,
    remainingFunds,
    projectVouchers,
    addOnTotals,
    costPlusTotals,
    totalProjectCost,
    netProjectCost,
    contingencyTotals,
  } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <ProjectHeader
        project={project as unknown as Project}
        totalProjectCost={totalProjectCost}
        netProjectCost={netProjectCost}
        remainingFunds={remainingFunds}
      />
      <hr className="my-4" />
      <ProjectCostSummary
        estimatedCost={Number(project.estimatedCost)}
        collectedFunds={Number(collectedFunds)}
        disbursedFunds={Number(disbursedFunds)}
        addOnTotals={Number(addOnTotals)}
        costPlusTotals={Number(costPlusTotals)}
        contingencyTotals={Number(contingencyTotals)}
      />
      <hr className="my-4" />
      <div className="flex w-full flex-wrap justify-end space-x-2">
        <Button onClick={() => navigate("./settings")}>Settings</Button>
        <Button onClick={() => navigate("./dashboard")}>Dashboard</Button>
        <Button
          tabIndex={-1}
          onClick={() => {
            window.open(`/reports/project/${project.id}`);
          }}
        >
          Report Preview
        </Button>
        <Button onClick={() => navigate("./vouchers")}>New Voucher</Button>
        <Outlet />
      </div>
      <hr className="my-4" />
      <Form>
        <SearchInput placeholder="search vouchers" />
      </Form>
      <hr className="my-4" />
      <div>
        <ProjectVoucherTable
          data={projectVouchers as unknown as ProjectVoucherWithDetails}
        />
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>404 not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
