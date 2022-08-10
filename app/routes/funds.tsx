import {DocumentIcon} from '@heroicons/react/solid';
import {Link, NavLink, Outlet, useLoaderData} from '@remix-run/react';
import {json} from '@remix-run/server-runtime';

import AvailableBalance from '../components/AvailableBalance';
import Card from '../components/Card';
import CardContainer from '../components/CardContainer';
import Page from '../components/Page';
import {getFunds} from '../models/fund.server';

import type { LoaderArgs } from "@remix-run/server-runtime";
export async function loader({ request }: LoaderArgs) {
  const funds = await getFunds();
  return json({ funds });
}

export default function FundsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <Page currentPage="Funds">
      <div className="py-4">
        <div className="flex-none">
          <Link
            to="new"
            className="block p-4 text-xl text-blue-500 hover:bg-sky-100"
          >
            + Wallet
          </Link>
          {data.funds.length === 0 ? (
            <p className="p-4">No wallets yet</p>
          ) : (
            <CardContainer>
              {data.funds.map((fund) => (
                <Card key={fund.id}>
                  <div className="mr-4 rounded-full bg-sky-100 p-3">
                    <DocumentIcon className="h-5 w-5" />
                  </div>
                  <div className="w-full">
                    <p className="mb-2 font-medium text-gray-600">
                      <NavLink className="block text-lg" to={fund.id}>
                        {fund.name}
                      </NavLink>
                    </p>
                    <AvailableBalance value={46760.89} />
                  </div>
                </Card>
              ))}
            </CardContainer>
          )}
        </div>
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    </Page>
  );
}
