import {Link, NavLink, Outlet, useLoaderData} from '@remix-run/react';
import {json} from '@remix-run/server-runtime';

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
      <div className="sm:py-4 md:flex">
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
            <ol>
              {data.funds.map((fund) => (
                <li key={fund.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block p-4 text-xl hover:bg-sky-100 ${
                        isActive ? "bg-white" : ""
                      }`
                    }
                    to={fund.id}
                  >
                    🏢 {fund.name}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    </Page>
  );
}
