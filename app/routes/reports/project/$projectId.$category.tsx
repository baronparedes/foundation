import classNames from "classnames";
import invariant from "tiny-invariant";

import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

import { LabeledCurrency } from "../../../components/@ui";
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
import { ProjectHeader } from "../../../components/ProjectHeader";
import { getProjectDashboard } from "../../../models/project-dashboard.server";
import { requireUserId } from "../../../session.server";
import { formatCurrencyFixed } from "../../../utils";

import type { Project } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/server-runtime";
export async function loader({ params, request }: LoaderArgs) {
  invariant(params.projectId, "project not found");

  const data = await getProjectDashboard({
    id: params.projectId,
  });

  if (!data.project) {
    throw new Response("Not Found", { status: 404 });
  }

  const targetCategory = data.categorizedDisbursement.find(
    (c) => c.category.description.toLowerCase() === params.category?.toLowerCase()
  );

  if (!targetCategory) {
    throw new Response("Not Found", { status: 404 });
  }

  const userId = await requireUserId(request);

  return json({
    ...data,
    targetCategory,
    userId,
    category: params.category,
  });
}

export default function ReportProjectByCategoryPage() {
  const {
    project,
    totalProjectCost,
    remainingFunds,
    netProjectCost,
    targetCategory,
    category,
  } = useLoaderData<typeof loader>();
  return (
    <Page currentPage={`Report - Projects - ${category.toUpperCase()}`}>
      <div className="mt-2 mb-2 space-x-2 text-center print:hidden">
        <Button className="w-40" tabIndex={-1} onClick={() => window.print()}>
          Print
        </Button>
      </div>
      <div className="w-full py-4">
        <ProjectHeader
          project={project as unknown as Project}
          netProjectCost={netProjectCost}
          totalProjectCost={totalProjectCost}
          remainingFunds={remainingFunds}
          basicDetails
        />
        <hr className="my-4" />
        <div className="space-y-6">
          <>
            <div className="text-center">
              <div>
                <LabeledCurrency
                  label="total"
                  value={targetCategory.totalDisbursements}
                  valueClassName={classNames("text-2xl")}
                />
              </div>
            </div>
            <hr className="my-4" />
            <div className="space-y-6 text-xs">
              <div key={`category-${targetCategory.category.id}`}>
                <TableContainer>
                  <Table className="w-full table-auto">
                    <TableHeader>
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
                      {targetCategory.disbursements?.map((d) => {
                        const amount = Number(d.amount);
                        const isNegative = amount < 0;

                        return (
                          <TableRow key={`project-voucher-detail-${d.id}`}>
                            <TableCell>
                              <span className="text-sm">
                                {new Date(d.voucher.transactionDate).toLocaleDateString()}
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
                              <Badge>{targetCategory.category.description}</Badge>
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
            </div>
          </>
        </div>
      </div>
    </Page>
  );
}
