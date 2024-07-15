import classNames from "classnames";
import { requireUserId } from "~/session.server";

import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { LabeledCurrency, LinkStyled } from "../../../components/@ui";
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
} from "../../../components/@windmill";
import Page from "../../../components/Page";
import { getProjectDashboard } from "../../../models/project-dashboard.server";
import { getProjectsByUserId } from "../../../models/project.server";
import { getStudioDashboard } from "../../../models/studio-dashboard.server";
import { formatCurrencyFixed, sum } from "../../../utils";

import type { LoaderArgs } from "@remix-run/node";
export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const projects = await getProjectsByUserId({ userId });

  const projectDashboards = await Promise.all(
    projects.map(async (p) => {
      const item = await getProjectDashboard({ id: p.id });
      return item;
    })
  );

  const studioDashboard = await getStudioDashboard({
    id: "clim7plmg0000qk0j4h09cw8o",
  });

  return json({ projectDashboards, studioDashboard });
}

export default function ReportsIndexPage() {
  const { projectDashboards, studioDashboard } = useLoaderData<typeof loader>();

  const calculateProjectNetRevenue = (dashboard: typeof projectDashboards[number]) => {
    const { remainingFunds, costPlusTotals, contingencyTotals } = dashboard;
    if (remainingFunds >= 0) return costPlusTotals;
    if (remainingFunds < 0) {
      const balanceAfterContingency = remainingFunds + contingencyTotals;
      if (balanceAfterContingency >= 0) {
        return costPlusTotals;
      }
      if (balanceAfterContingency < 0) {
        const balanceAfterCostPlus = balanceAfterContingency + costPlusTotals;
        return balanceAfterCostPlus;
      }
    }
    return 0;
  };

  const totalProjectRevenue = sum(
    projectDashboards.map((d) => calculateProjectNetRevenue(d))
  );

  const totalNetRevenue = totalProjectRevenue - studioDashboard.disbursedFunds;

  return (
    <Page currentPage={"Reports"}>
      <div className="w-full py-4">
        <div className="grid grid-cols-3 gap-3 py-4">
          <div className="text-center">
            <LabeledCurrency
              label="total project revenue"
              value={totalProjectRevenue}
              valueClassName={classNames("text-4xl")}
            />
          </div>
          <div className="text-center">
            <LabeledCurrency
              label="studio expense"
              value={studioDashboard.disbursedFunds}
              valueClassName={classNames("text-4xl", "text-red-500")}
            />
          </div>
          <div className="text-center">
            <LabeledCurrency
              label="net revenue"
              value={totalNetRevenue}
              valueClassName={classNames(
                "text-4xl",
                totalNetRevenue > 0 ? "text-green-500" : "text-red-500"
              )}
            />
          </div>
        </div>
        <TableContainer>
          <Table>
            <TableHeader>
              <tr>
                <TableCell>Project</TableCell>
                <TableCell>Total Project Cost</TableCell>
                <TableCell>Supervision & Purchasing</TableCell>
                <TableCell>Remaining Funds</TableCell>
                <TableCell>Contingency Amount</TableCell>
                <TableCell>Costplus Ampount</TableCell>
                <TableCell>Projected Revenue</TableCell>
              </tr>
            </TableHeader>
            <TableBody>
              {projectDashboards.map((dashboard) => {
                const projectedRevenue = calculateProjectNetRevenue(dashboard);
                return (
                  <TableRow key={dashboard.project.id}>
                    <TableCell>
                      <LinkStyled to={`/projects/${dashboard.project.id}`} target="_blank">
                        {dashboard.project.name}
                      </LinkStyled>
                    </TableCell>
                    <TableCell>
                      <Badge className="currency" type="neutral">
                        {formatCurrencyFixed(dashboard.totalProjectCost)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="currency" type="neutral">
                        {formatCurrencyFixed(dashboard.addOnTotals)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        type={dashboard.remainingFunds < 0 ? "danger" : "success"}
                        className="currency"
                      >
                        {formatCurrencyFixed(dashboard.remainingFunds)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="currency">
                        {formatCurrencyFixed(dashboard.contingencyTotals)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="currency">
                        {formatCurrencyFixed(dashboard.costPlusTotals)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        type={projectedRevenue < 0 ? "danger" : "success"}
                        className="currency"
                      >
                        {formatCurrencyFixed(projectedRevenue)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </Page>
  );
}
