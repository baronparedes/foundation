import classNames from "classnames";
import moment from "moment";
import { useState } from "react";
import { requireUserId } from "~/session.server";

import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import {
  LabeledCurrency,
  LinkStyled,
  TextInput,
} from "../../../components/@ui";
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
} from "../../../components/@windmill";
import Page from "../../../components/Page";
import { getRevenueDashboard } from "../../../models/reports-revenue.server";
import { formatCurrencyFixed, sum } from "../../../utils";

import type { LoaderArgs } from "@remix-run/node";
export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const fromDate = url.searchParams.get("fromDate");
  const toDate = url.searchParams.get("toDate");
  const { projectDashboards, studioDashboard } = await getRevenueDashboard(
    userId,
    fromDate,
    toDate
  );

  return json({ projectDashboards, studioDashboard, fromDate, toDate });
}

export default function ReportsIndexPage() {
  const { projectDashboards, studioDashboard, fromDate, toDate } =
    useLoaderData<typeof loader>();
  const studioDisbursedFunds = studioDashboard?.disbursedFunds ?? 0;

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
  const totalNetRevenue = totalProjectRevenue - studioDisbursedFunds;

  const [reportFromDate, setReportFromDate] = useState(fromDate);
  const [reportToDate, setReportToDate] = useState(toDate);

  return (
    <Page currentPage={"Reports"}>
      <div className="w-full py-4">
        <div className="align-center grid grid-cols-3 gap-3 py-4">
          <div>
            <TextInput
              name="startDate"
              label="Start Date"
              required
              type="date"
              defaultValue={moment(reportFromDate).format("yyyy-MM-DD")}
              onChange={(e) => {
                setReportFromDate(e.currentTarget.value);
              }}
            />
          </div>
          <div>
            <TextInput
              name="endDate"
              label="End Date"
              type="date"
              defaultValue={moment(reportToDate).format("yyyy-MM-DD")}
              onChange={(e) => {
                setReportToDate(e.currentTarget.value);
              }}
            />
          </div>
          <div>
            <label className="flex w-full flex-col gap-1">
              <br />
              <Link
                to={`/reports/revenue?fromDate=${reportFromDate}&toDate=${reportToDate}`}
              >
                <Button>Filter</Button>
              </Link>
            </label>
          </div>
        </div>
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
              value={studioDisbursedFunds}
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
                <TableCell>Contingency</TableCell>
                <TableCell>Costplus</TableCell>
                <TableCell>Revenue</TableCell>
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
