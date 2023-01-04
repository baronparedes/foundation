import { DocumentIcon } from "@heroicons/react/solid";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

import { LabeledCurrency, RoundIcon } from "../components/@ui";
import { Card, CardBody } from "../components/@windmill";
import Page from "../components/Page";
import { getFunds } from "../models/fund.server";

export async function loader() {
  const funds = await getFunds();
  return json({ funds });
}

export default function FundsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <Page currentPage="Funds">
      <div className="py-4">
        <div className="flex-none">
          <Link to="new" className="block p-4 text-xl text-blue-500 hover:bg-sky-100">
            + Wallet
          </Link>
          {data.funds.length === 0 ? (
            <p className="p-4">No wallets yet</p>
          ) : (
            <div className="m-4 mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {data.funds.map((fund) => (
                <Card key={fund.id}>
                  <NavLink to={fund.id}>
                    <CardBody className="m-1 flex items-center">
                      <RoundIcon icon={DocumentIcon} className="mr-4" />
                      <div>
                        <p className="mb-2 text-lg font-medium text-gray-600">
                          {fund.name}
                        </p>
                        <LabeledCurrency label="balance" value={Number(fund.balance)} />
                      </div>
                    </CardBody>
                  </NavLink>
                </Card>
              ))}
            </div>
          )}
        </div>
        <hr />
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    </Page>
  );
}
