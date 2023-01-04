import invariant from 'tiny-invariant';
import {getProject} from '~/models/project.server';

import {json} from '@remix-run/node';
import {Outlet, useCatch, useLoaderData, useNavigate} from '@remix-run/react';

import {LabeledCurrency} from '../../components/@ui';
import {Button} from '../../components/@windmill';
import ProjectVoucherTable from '../../components/tables/ProjectVoucherTable';
import {getProjectFundDetails} from '../../models/fund-transaction.server';
import {getProjectVouchers} from '../../models/project-voucher.server';

import type { LoaderArgs } from "@remix-run/node";
import type { ProjectVoucherWithDetails } from "../../models/project-voucher.server";
export async function loader({ params }: LoaderArgs) {
  invariant(params.projectId, "projectId not found");

  const project = await getProject({ id: params.projectId });
  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }

  const projectVouchers = await getProjectVouchers({ id: params.projectId });
  const { collectedFunds, disbursedFunds } = await getProjectFundDetails(
    params.projectId
  );

  return json({ project, collectedFunds, disbursedFunds, projectVouchers });
}

export default function ProjectDetailsPage() {
  const { project, collectedFunds, disbursedFunds, projectVouchers } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const remainingFunds = Number(collectedFunds) - Number(disbursedFunds) * -1;

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <h4 className="text-lg">{project.code}</h4>
          <h3 className="text-2xl font-bold">{project.name}</h3>
        </div>
        <div className="text-right">
          <LabeledCurrency label="remaining funds" value={remainingFunds} />
        </div>
      </div>
      <hr className="my-4" />
      <p className="py-4">{project.description}</p>
      <p className="py-4">📍 {project.location}</p>
      <div className="grid grid-cols-3 gap-3 text-center">
        <LabeledCurrency
          label="estimated cost"
          value={Number(project.estimatedCost)}
        />
        <LabeledCurrency
          label="collected funds"
          value={Number(collectedFunds)}
        />
        <LabeledCurrency
          label="disbursed funds"
          value={Number(disbursedFunds)}
        />
      </div>

      <hr className="my-4" />
      <div className="w-full space-x-2 text-right">
        <Button onClick={() => navigate("./vouchers")}>New Voucher</Button>
        <Outlet />
      </div>
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
