import invariant from "tiny-invariant";

import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

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
import { ProjectCostSummary } from "../../../components/ProjectCostSummary";
import { ProjectHeader } from "../../../components/ProjectHeader";
import { getProjectDashboard } from "../../../models/project-dashboard.server";
import { requireUserId } from "../../../session.server";
import { formatCurrencyFixed } from "../../../utils";

import type { Project } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/server-runtime";
export async function loader({ params, request }: LoaderArgs) {
  invariant(params.projectId, "project not found");

  const data = await getProjectDashboard({ id: params.projectId });

  if (!data.project) {
    throw new Response("Not Found", { status: 404 });
  }

  const userId = await requireUserId(request);

  return json({
    ...data,
    userId,
  });
}

export default function ReportProjectPage() {
  const {
    project,
    totalProjectCost,
    remainingFunds,
    collectedFunds,
    disbursedFunds,
    costPlusTotals,
    addOnTotals,
    categorizedDisbursement,
    uncategorizedDisbursement,
    addOnExpenses,
    costPlusTotalsData,
    netProjectCost,
    contingencyTotals,
    collectedFundsData,
  } = useLoaderData<typeof loader>();
  return (
    <Page currentPage="Report - Projects">
      <div className="mt-2 mb-2 space-x-2 text-center print:hidden">
        <a href={`/reports/project/${project.id}/export`} tabIndex={-1}>
          <Button className="w-40" tabIndex={-1}>
            Export Data
          </Button>
        </a>
        <Button className="w-40" tabIndex={-1} onClick={() => window.print()}>
          Print
        </Button>
      </div>
      <div className="w-full py-4 text-xs">
        <ProjectHeader
          project={project as unknown as Project}
          netProjectCost={netProjectCost}
          totalProjectCost={totalProjectCost}
          remainingFunds={remainingFunds}
        />
        <hr className="my-4" />
        <div className="space-y-6">
          <div>
            <ProjectCostSummary
              collectedFunds={Number(collectedFunds)}
              disbursedFunds={Number(disbursedFunds)}
              addOnTotals={Number(addOnTotals)}
              costPlusTotals={Number(costPlusTotals)}
              contingencyTotals={Number(contingencyTotals)}
            />
          </div>
          <>
            <div>
              <h1 className="text-2xl">Summary of Totals</h1>
            </div>
            <div>
              <TableContainer>
                <Table>
                  <TableHeader>
                    <tr>
                      <TableCell>Description</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Type</TableCell>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="w-2/3">
                        <div className="flex items-center text-sm">
                          <div>
                            <p className="break-all text-gray-600 dark:text-gray-400">
                              Uncategorized
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          type={
                            uncategorizedDisbursement.totalDisbursements < 0
                              ? "danger"
                              : "success"
                          }
                          className="currency"
                        >
                          {formatCurrencyFixed(
                            uncategorizedDisbursement.totalDisbursements
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge>Disbursements</Badge>
                      </TableCell>
                    </TableRow>
                    {categorizedDisbursement
                      .filter((_) => _.totalDisbursements > 0)
                      .map((data) => {
                        const amount = Number(data.totalDisbursements);
                        const isNegative = amount < 0;
                        return (
                          <TableRow key={`project-voucher-detail-${data}`}>
                            <TableCell className="w-2/3">
                              <div className="flex items-center text-sm">
                                <div>
                                  <p className="break-all text-gray-600 dark:text-gray-400">
                                    {data.category.description}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                type={isNegative ? "danger" : "success"}
                                className="currency"
                              >
                                {formatCurrencyFixed(amount)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge>Disbursements</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {addOnExpenses.addOns.map((data) => {
                      const amount = Number(data.total);
                      const isNegative = amount < 0;
                      return (
                        <TableRow key={`add-on-${data.id}`}>
                          <TableCell className="w-2/3">
                            <div className="flex items-center text-sm">
                              <div>
                                <p className="break-all text-gray-600 dark:text-gray-400">
                                  {data.description}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              type={isNegative ? "danger" : "success"}
                              className="currency"
                            >
                              {formatCurrencyFixed(amount)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge>Addl Expenses</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {costPlusTotalsData.map((data) => {
                      const amount = Number(data.total);
                      const isNegative = amount < 0;
                      return (
                        <TableRow key={`add-on-${data.id}`}>
                          <TableCell className="w-2/3">
                            <div className="flex items-center text-sm">
                              <div>
                                <p className="break-all text-gray-600 dark:text-gray-400">
                                  {data.description}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              type={isNegative ? "danger" : "success"}
                              className="currency"
                            >
                              {formatCurrencyFixed(amount)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge>Admin & Professional Fee Expense</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </>
          <>
            <div>
              <h1 className="text-2xl">Collected Funds</h1>
            </div>
            <div>
              <TableContainer>
                <Table>
                  <TableHeader>
                    <tr>
                      <TableCell>Description</TableCell>
                      <TableCell>Date Collected</TableCell>
                      <TableCell>Amount</TableCell>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {collectedFundsData?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <p className="text-center">No details yet</p>
                        </TableCell>
                      </TableRow>
                    )}
                    {collectedFundsData &&
                      collectedFundsData.length > 0 &&
                      collectedFundsData?.map((data, key) => {
                        return (
                          <TableRow key={key}>
                            <TableCell>
                              <div className="flex items-center text-sm">
                                <div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {data.description}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <small>{new Date(data.createdAt).toLocaleDateString()}</small>
                            </TableCell>
                            <TableCell>
                              <Badge type="success" className="currency">
                                {formatCurrencyFixed(Number(data.amount))}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </>
          <>
            <div>
              <h1 className="text-2xl">Detailed Disbursements</h1>
            </div>
            <div>
              <TableContainer>
                <Table className="w-full table-auto">
                  <TableHeader>
                    <tr>
                      <TableCell colSpan={8} className="text-xl">
                        <h1 className="text-center">Uncategorized</h1>
                      </TableCell>
                    </tr>
                    <tr>
                      <TableCell>Transaction Date</TableCell>
                      <TableCell>Voucher Number</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Amount</TableCell>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {uncategorizedDisbursement.vouchers?.map((v) => {
                      const amount = Number(v.disbursedAmount);
                      const isNegative = amount < 0;
                      return (
                        <TableRow key={`project-voucher-${v.id}`}>
                          <TableCell>
                            <span className="text-sm">
                              {new Date(v.transactionDate).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell>{v.voucherNumber}</TableCell>
                          <TableCell className="w-72">
                            <div className="flex items-center text-sm">
                              <div>
                                <p className="break-all text-xs text-gray-600 dark:text-gray-400">
                                  {v.description}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              type={isNegative ? "danger" : "success"}
                              className="currency"
                            >
                              {formatCurrencyFixed(amount)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div className="space-y-6">
              {categorizedDisbursement
                .filter((_) => _.disbursements.length > 0)
                .map((item) => {
                  return (
                    <div key={`category-${item.category.id}`}>
                      <TableContainer>
                        <Table className="w-full table-auto">
                          <TableHeader>
                            <tr>
                              <TableCell colSpan={8} className="text-lg">
                                <h1 className="text-center">{item.category.description}</h1>
                              </TableCell>
                            </tr>
                            <tr>
                              <TableCell>Transaction Date</TableCell>
                              <TableCell>Voucher Number</TableCell>
                              <TableCell>Description</TableCell>
                              <TableCell>Category</TableCell>
                              <TableCell>Amount</TableCell>
                              <TableCell>Qty</TableCell>
                              <TableCell>Supplier</TableCell>
                              <TableCell>Ref #</TableCell>
                            </tr>
                          </TableHeader>
                          <TableBody>
                            {item.disbursements?.map((d) => {
                              const amount = Number(d.amount);
                              const isNegative = amount < 0;

                              return (
                                <TableRow key={`project-voucher-detail-${d.id}`}>
                                  <TableCell>
                                    <span className="text-sm">
                                      {new Date(
                                        d.voucher.transactionDate
                                      ).toLocaleDateString()}
                                    </span>
                                  </TableCell>
                                  <TableCell>{d.voucher.voucherNumber}</TableCell>
                                  <TableCell className="w-72">
                                    <div className="flex items-center text-sm">
                                      <div>
                                        <p className="break-all text-xs text-gray-600 dark:text-gray-400">
                                          {d.description}
                                        </p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge>{item.category.description}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      type={isNegative ? "danger" : "success"}
                                      className="currency"
                                    >
                                      {formatCurrencyFixed(amount)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {Number(d.quantity) !== 0 && (
                                      <Badge>{Number(d.quantity)}</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>{d.supplierName}</TableCell>
                                  <TableCell>{d.referenceNumber}</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>
                  );
                })}
            </div>
          </>
        </div>
      </div>
    </Page>
  );
}
