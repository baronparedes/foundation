import type { LoaderArgs } from "@remix-run/node";
import invariant from 'tiny-invariant';
import {getProject} from '~/models/project.server';

import {json} from '@remix-run/node';
import {useCatch, useLoaderData} from '@remix-run/react';

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

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.project.name}</h3>
      <p className="py-6">{data.project.description}</p>
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
    return <div>Project not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
