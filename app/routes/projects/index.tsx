import type { LoaderArgs } from "@remix-run/server-runtime";
import classNames from "classnames";

import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

import { Currency, LinkStyled } from "../../components/@ui";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
} from "../../components/@windmill";
import Page from "../../components/Page";
import { getProjectDashboard } from "../../models/project-dashboard.server";
import { getProjectsByUserId } from "../../models/project.server";
import { requireUserId } from "../../session.server";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const projects = await getProjectsByUserId({ userId });

  const projectDashboards = await Promise.all(
    projects.map(async (p) => {
      const item = await getProjectDashboard({ id: p.id });
      return {
        ...item,
        sorter: item.project.name,
      };
    })
  );

  return json({ projectDashboards });
}

export default function ProjectsPage() {
  const { projectDashboards } = useLoaderData<typeof loader>();
  const sortedProjectDashboards = projectDashboards.sort((a, b) => {
    if (a.sorter < b.sorter) return -1;
    if (a.sorter > b.sorter) return 1;
    return 0;
  });
  const hasProjects = projectDashboards.length > 0;

  return (
    <Page currentPage="Projects">
      <div className="py-4">
        <div>
          <TableContainer>
            <Table className="w-full table-auto">
              <TableHeader>
                <tr>
                  <TableCell>Code</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Remaining Funds</TableCell>
                  <TableCell>Total Project Cost</TableCell>
                </tr>
              </TableHeader>
              <TableBody>
                {!hasProjects && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <p className="text-center">
                        No projects yet{" "}
                        <Link to="new" className="text-blue-500 underline">
                          create a new one.
                        </Link>
                      </p>
                    </TableCell>
                  </TableRow>
                )}
                {hasProjects &&
                  sortedProjectDashboards.map((dashboard) => {
                    const { project, remainingFunds, totalProjectCost } = dashboard;

                    return (
                      <TableRow key={`dashboard-project-${project.id}`}>
                        <TableCell>{project.code}</TableCell>
                        <TableCell className="w-96">
                          <LinkStyled to={`./${dashboard.project.id}`}>
                            🏢 {project.name}
                          </LinkStyled>
                        </TableCell>
                        <TableCell>
                          <Currency
                            value={remainingFunds}
                            className={classNames(
                              remainingFunds < 200000 ? "text-red-500" : "text-green-500"
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Currency value={totalProjectCost} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </Page>
  );
}
