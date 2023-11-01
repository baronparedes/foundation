import type { LoaderArgs } from "@remix-run/node";
import classNames from "classnames";
import { requireUserId } from "~/session.server";

import { json } from "@remix-run/node";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { LabeledCurrency } from "../components/@ui";
import { Card, CardBody } from "../components/@windmill";
import Page from "../components/Page";
import { getProjectDashboard } from "../models/project-dashboard.server";
import { getProjectsByUserId } from "../models/project.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const projects = await getProjectsByUserId({ userId });

  const projectDashboards = await Promise.all(
    projects.map(async (p) => {
      const item = await getProjectDashboard({ id: p.id });
      return item;
    })
  );

  return json({ projectDashboards });
}

export default function ProjectsPage() {
  const { projectDashboards } = useLoaderData<typeof loader>();

  return (
    <Page currentPage="Projects">
      <div className="py-4 lg:flex">
        <div className="flex-none">
          <Link to="new" className="block p-4 text-xl text-blue-500 hover:bg-sky-100">
            + Project
          </Link>
          {projectDashboards.length === 0 ? (
            <p className="p-4">No projects yet</p>
          ) : (
            <div className="space-y-4">
              {projectDashboards.map((dashboard) => {
                const { project, remainingFunds, totalProjectCost } = dashboard;
                return (
                  <>
                    <Card colored className="m-4 hover:bg-gmd-100" key={project.id}>
                      <NavLink to={project.id}>
                        <CardBody className="flex items-center">
                          <div className="space-y-2">
                            <p className="font-medium text-gray-600">🏢 {project.name}</p>
                            <LabeledCurrency
                              label="remaining funds"
                              value={remainingFunds}
                              valueClassName={classNames(
                                "text-sm",
                                remainingFunds < 200000 ? "text-red-500" : "text-green-500"
                              )}
                            />
                            <LabeledCurrency
                              label="total project cost"
                              value={totalProjectCost}
                              valueClassName="text-sm"
                            />
                          </div>
                        </CardBody>
                      </NavLink>
                    </Card>
                  </>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    </Page>
  );
}
