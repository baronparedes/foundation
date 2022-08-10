import type { LoaderArgs } from "@remix-run/node";
import invariant from 'tiny-invariant';
import {getFund} from '~/models/fund.server';

import {json} from '@remix-run/node';
import {useCatch, useLoaderData} from '@remix-run/react';

import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
  TableRow,
} from '../../components/@windmill';
import AvailableBalance from '../../components/AvailableBalance';

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
      <h4 className="text-sm">{data.fund.code}</h4>
      <h3 className="text-2xl font-bold">{data.fund.name}</h3>
      <AvailableBalance className="mt-4" value={6000000} />
      <p className="py-4">{data.fund.description}</p>
      <hr className="my-4" />
      <Button>Cash In</Button>
      <Button className="ml-1">Cash Out</Button>
      <hr className="my-4" />
      <div>
        <TableContainer>
          <Table>
            <TableHeader>
              <tr>
                <TableCell>Client</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </tr>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <div>
                      <p className="font-semibold">asdasd</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        test
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">$ 100000</span>
                </TableCell>
                <TableCell>
                  <Badge type="success">success</Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {new Date().toLocaleDateString()}
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <TableFooter>asdasd</TableFooter>
        </TableContainer>
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
