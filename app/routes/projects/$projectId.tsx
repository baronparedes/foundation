import classNames from "classnames";
import invariant from "tiny-invariant";
import { getProject } from "~/models/project.server";

import { json } from "@remix-run/node";
import { Form, Outlet, useCatch, useLoaderData, useNavigate } from "@remix-run/react";

import { LabeledCurrency } from "../../components/@ui";
import { SearchInput } from "../../components/@ui/SearchInput";
import { Button } from "../../components/@windmill";
import ProjectVoucherTable from "../../components/tables/ProjectVoucherTable";
import { getProjectFundDetails } from "../../models/project-dashboard.server";
import { getProjectVouchers } from "../../models/project-voucher.server";

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

  const projectVouchers = await getProjectVouchers({
    id: params.projectId,
    criteria: urlParams.get("search") ?? undefined,
  });

  const {
    collectedFunds,
    disbursedFunds,
    remainingFunds,
    addOnTotals,
    costPlusTotals,
    totalProjectCost,
  } = await getProjectFundDetails(params.projectId);

  return json({
    project,
    collectedFunds,
    disbursedFunds,
    remainingFunds,
    projectVouchers,
    addOnTotals,
    costPlusTotals,
    totalProjectCost,
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
  } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <h4 className="text-lg">{project.code}</h4>
          <h3 className="text-2xl font-bold">{project.name}</h3>
        </div>
        <div className="text-right">
          <h5>{project.description}</h5>
          <h5>📍 {project.location}</h5>
        </div>
      </div>

      <hr className="my-4" />
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center">
          <LabeledCurrency
            label="total project cost"
            value={totalProjectCost}
            valueClassName={classNames("text-4xl")}
          />
        </div>
        <div className="text-center">
          <LabeledCurrency
            label="remaining funds"
            value={remainingFunds}
            valueClassName={classNames(
              "text-4xl",
              remainingFunds < 200000 ? "text-red-500" : "text-green-500"
            )}
          />
        </div>
      </div>
      <hr className="my-4" />
      <div className="grid grid-cols-5 text-center">
        <LabeledCurrency label="estimated cost" value={Number(project.estimatedCost)} />
        <LabeledCurrency
          label="collected funds"
          value={Number(collectedFunds)}
          valueClassName="text-green-500"
        />
        <LabeledCurrency
          label="disbursed funds"
          value={Math.abs(Number(disbursedFunds))}
          valueClassName="text-red-500"
        />
        <LabeledCurrency
          label="additional expenses"
          value={Number(addOnTotals)}
          valueClassName="text-red-500"
        />
        <LabeledCurrency
          label="project expenses"
          value={Number(costPlusTotals)}
          valueClassName="text-purple-500"
        />
      </div>
      <hr className="my-4" />
      <div className="w-full space-x-2 text-right">
        <Button onClick={() => navigate("./settings")}>Settings</Button>
        <Button onClick={() => navigate("./dashboard")}>Dashboard</Button>
        <Button onClick={() => navigate("./vouchers")}>New Voucher</Button>
        <Outlet />
      </div>
      <hr className="my-4" />
      <Form>
        <SearchInput />
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
