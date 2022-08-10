import invariant from 'tiny-invariant';
import {getFund} from '~/models/fund.server';

import {json} from '@remix-run/node';
import {useCatch, useLoaderData} from '@remix-run/react';

import {Button} from '../../components/@windmill';
import AvailableBalance from '../../components/AvailableBalance';
import FundTransactionTable from '../../components/fund/FundTransactionTable';
import {sum} from '../../utils';

import type { LoaderArgs } from "@remix-run/node";
import type { FundWithTransaction } from "~/models/fund.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.fundId, "fund not found");

  const fund = await getFund({ id: params.fundId });
  if (!fund) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ fund });
}

export default function FundDetailsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="w-full">
      <h4 className="text-sm">{data.fund.code}</h4>
      <h3 className="text-2xl font-bold">{data.fund.name}</h3>
      <AvailableBalance
        value={sum(data.fund.fundTransaction.map((v) => Number(v)))}
      />
      <p className="py-4">{data.fund.description}</p>
      <hr className="my-4" />
      <Button>Cash In</Button>
      <Button className="ml-1">Cash Out</Button>
      <hr className="my-4" />
      <div>
        <FundTransactionTable
          data={data.fund as unknown as FundWithTransaction}
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
