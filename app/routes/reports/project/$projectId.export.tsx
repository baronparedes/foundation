import type { LoaderArgs } from "@remix-run/server-runtime";
import moment from "moment";
import invariant from "tiny-invariant";

import { getProjectDashboard } from "../../../models/project-dashboard.server";
import { formatCurrencyFixed } from "../../../utils";

import type { ProjectDashboard } from "../../../models/project-dashboard.server";

interface Dictionary<T> {
  [key: string]: T;
}

const NEW_LINE = "\n";

function toProjectHeader(projectDashboard: ProjectDashboard) {
  const { project } = projectDashboard;

  const rows = [];
  rows.push(["Project Code", project.code]);
  rows.push(["Project Name", project.name]);
  // rows.push(["Description", project.description ?? ""]);
  // rows.push(["Location", project.location]);

  const csv = rows.map((row) => row.map((d) => `"${d.toString()}"`).join(","));
  return csv.join(NEW_LINE);
}

function toProjectCostSummary(projectDashboard: ProjectDashboard) {
  const {
    totalProjectCost,
    remainingFunds,
    collectedFunds,
    disbursedFunds,
    addOnTotals,
    costPlusTotals,
    contingencyTotals,
  } = projectDashboard;
  const data = {
    "Total Disbursed": formatCurrencyFixed(disbursedFunds),
    "Add On Expenses": formatCurrencyFixed(addOnTotals),
    "Admin & Professional Fee": formatCurrencyFixed(costPlusTotals),
    "Contingency Reserve": formatCurrencyFixed(contingencyTotals),
    "Collected Funds": formatCurrencyFixed(collectedFunds),
    "Total Project Cost": formatCurrencyFixed(totalProjectCost),
    "Remaining Funds": formatCurrencyFixed(remainingFunds),
  };

  const csv: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    csv.push(`"${key}","${value}"`);
  }

  return csv.join(NEW_LINE);
}

function toProjectCollectedFunds(projectDashboard: ProjectDashboard) {
  const { collectedFundsData } = projectDashboard;
  const csv: string[] = [];

  const header = ["Date Collected", "Collection Description", "Amount"];
  csv.push(header.join(","));

  collectedFundsData.forEach((f) => {
    const row: string[] = [
      f.createdAt.toLocaleDateString(),
      f.description,
      formatCurrencyFixed(Number(f.amount)),
    ];
    csv.push(toCsvLine(row));
  });
  return csv.join(NEW_LINE);
}

function toProjectSummaryOfTotals(projectDashboard: ProjectDashboard) {
  const { uncategorizedDisbursement, categorizedDisbursement } = projectDashboard;

  const data: Dictionary<string> = {};
  if (uncategorizedDisbursement.totalDisbursements > 0)
    data.Uncategorized = formatCurrencyFixed(uncategorizedDisbursement.totalDisbursements);

  categorizedDisbursement
    .filter((_) => _.totalDisbursements > 0)
    .forEach((item) => {
      data[item.category.description] = formatCurrencyFixed(item.totalDisbursements);
    });

  const csv: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    csv.push(`"${key}","${value}"`);
  }

  return csv.join(NEW_LINE);
}

function toProjectDisbursementsRaw(projectDashboard: ProjectDashboard) {
  const { categorizedDisbursementRaw } = projectDashboard;
  const csv: string[] = [];

  const header = [
    "Transaction Date",
    "Supplier Name",
    "Description",
    "Reference Number",
    "Category",
    "Amount",
    "Voucher Number",
  ];
  csv.push(header.join(","));

  categorizedDisbursementRaw.forEach((d) => {
    const row = [
      d.transactionDate.toLocaleDateString(),
      d.supplierName,
      d.description,
      d.referenceNumber,
      d.category,
      formatCurrencyFixed(Number(d.amount)),
      d.voucherNumber,
    ];
    csv.push(toCsvLine(row));
  });

  return csv.join(NEW_LINE);
}

function toProjectAddOns(projectDashboard: ProjectDashboard) {
  const { addOnExpenses } = projectDashboard;
  const csv: string[] = [];

  const header = ["Date", "Qty", "Description", "Amount", "Total"];
  csv.push(header.join(","));

  addOnExpenses.addOns.forEach((a) => {
    const row: string[] = [
      a.updatedAt.toLocaleDateString(),
      a.quantity.toString(),
      a.description,
      formatCurrencyFixed(Number(a.amount)),
      formatCurrencyFixed(Number(a.total)),
    ];
    csv.push(toCsvLine(row));
  });

  return csv.join(NEW_LINE);
}

function toProjectCostPlus(projectDashboard: ProjectDashboard) {
  const { costPlusTotalsData } = projectDashboard;
  const csv: string[] = [];

  const header = ["Start Date", "End Date", "Description", "Amount"];
  csv.push(header.join(","));

  costPlusTotalsData.forEach((cp) => {
    const row = [
      cp.startDate.toLocaleDateString(),
      cp.endDate?.toLocaleDateString() ?? "",
      cp.description,
      formatCurrencyFixed(Number(cp.total)),
    ];
    csv.push(toCsvLine(row));
  });
  return csv.join(NEW_LINE);
}

function toCsvLine(row: string[]) {
  return row.map((row) => `"${row.replace(/"/g, '""')}"`).join(",");
}

export async function loader({ params }: LoaderArgs) {
  invariant(params.projectId, "project not found");
  const data = await getProjectDashboard({ id: params.projectId });

  const { project } = data;
  const timestamp = moment().format("YYYY-MMM-DD-h:mm:ss-a");
  const fileName = `${project.name}_${project.code}_${timestamp}.csv`;

  const csv: string[] = [];
  csv.push(toProjectHeader(data));

  csv.push(toProjectCostSummary(data));
  csv.push(toProjectSummaryOfTotals(data));

  csv.push(toProjectCollectedFunds(data));
  csv.push(toProjectDisbursementsRaw(data));

  csv.push(toProjectAddOns(data));
  csv.push(toProjectCostPlus(data));

  return new Response(csv.join(NEW_LINE + NEW_LINE), {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${fileName.toLowerCase()}"`,
    },
  });
}
