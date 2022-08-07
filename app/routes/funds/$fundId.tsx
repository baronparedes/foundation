import type { LoaderArgs } from "@remix-run/node";
import invariant from 'tiny-invariant';
import {getFund} from '~/models/fund.server';

import {json} from '@remix-run/node';
import {useCatch, useLoaderData} from '@remix-run/react';

import Button from '../../components/Button';

export async function loader({ params }: LoaderArgs) {
  invariant(params.fundId, "projectId not found");

  const fund = await getFund({ id: params.fundId });
  if (!fund) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ fund });
}

export default function ProjectDetailsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="w-full">
      <h4 className="text-lg">{data.fund.code}</h4>
      <h3 className="text-2xl font-bold">{data.fund.name}</h3>
      <hr className="my-4" />
      <p className="py-4">{data.fund.description}</p>
      <hr className="my-4" />
      <Button variant="success">Cash In</Button>
      <Button variant="danger" className="ml-1">
        Cash Out
      </Button>
      <hr className="my-4" />
      <div>Available Balance: P60000000</div>
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
