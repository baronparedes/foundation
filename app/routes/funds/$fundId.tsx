import invariant from 'tiny-invariant';
import {getFund} from '~/models/fund.server';

import {json} from '@remix-run/node';
import {Outlet, useCatch, useLoaderData, useNavigate} from '@remix-run/react';

import {Button} from '../../components/@windmill';
import LabeledCurrency from '../../components/LabeledCurrency';
import FundTransactionTable from '../../components/tables/FundTransactionTable';
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
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <h4 className="text-sm">{data.fund.code}</h4>
      <h3 className="mb-4 text-2xl font-bold">{data.fund.name}</h3>
      <LabeledCurrency
        label="balance"
        value={sum(data.fund.fundTransaction.map((v) => Number(v.amount)))}
      />
      <p className="py-4">{data.fund.description}</p>
      <hr className="my-4" />
      <div className="w-full space-x-2 text-right">
        <Button onClick={() => navigate("./collections")}>Collect</Button>
        <Button onClick={() => navigate("./transfers")}>Transfer</Button>
      </div>
      <Outlet />
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
