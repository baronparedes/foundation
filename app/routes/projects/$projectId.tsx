import type { LoaderArgs } from "@remix-run/node";
import invariant from 'tiny-invariant';
import {getProject} from '~/models/project.server';

import {json} from '@remix-run/node';
import {Outlet, useCatch, useLoaderData, useNavigate} from '@remix-run/react';

import {Button} from '../../components/@windmill';
import LabeledCurrency from '../../components/LabeledCurrency';

export async function loader({ params }: LoaderArgs) {
  invariant(params.projectId, "projectId not found");

  const project = await getProject({ id: params.projectId });
  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ project });
}

export default function ProjectDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <h4 className="text-lg">{data.project.code}</h4>
      <h3 className="text-2xl font-bold">{data.project.name}</h3>
      <hr className="my-4" />
      <p className="py-4">{data.project.description}</p>
      <p className="py-4">📍 {data.project.location}</p>
      <LabeledCurrency
        label="estimated cost"
        value={Number(data.project.estimatedCost)}
      />
      <hr className="my-4" />
      <div className="w-full space-x-2 text-right">
        <Button onClick={() => navigate("./vouchers")}>New Voucher</Button>
        <Outlet />
      </div>
      <hr className="my-4" />
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
