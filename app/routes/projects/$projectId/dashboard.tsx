import classNames from "classnames";
import invariant from "tiny-invariant";

import { useLoaderData, useNavigate } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

import { DialogWithTransition, LabeledCurrency } from "../../../components/@ui";
import { Button, Card, CardBody } from "../../../components/@windmill";
import { AddOnExpenseCard } from "../../../components/cards/AddOnExpenseCard";
import { CollectedFundsCard } from "../../../components/cards/CollectedFundsCard";
import { DisbursementCard } from "../../../components/cards/DisbursementCard";
import { getDetailCategories } from "../../../models/detail-category.server";
import { getProjectDashboard } from "../../../models/project-dashboard.server";
import { requireUserId } from "../../../session.server";
import { formatCurrencyFixed, sum } from "../../../utils";

import type { CollectedFunds } from "../../../models/project-dashboard.server";
import type { ProjectAddOn } from "@prisma/client";
import type { ProjectVoucherDetailsWithVoucherNumber } from "../../../models/project-voucher-detail.server";
import type { ProjectVoucher } from "../../../models/project-voucher.server";
import type { LoaderArgs } from "@remix-run/server-runtime";
export async function loader({ params, request }: LoaderArgs) {
  invariant(params.projectId, "project not found");

  const {
    project,
    categorizedDisbursement,
    uncategorizedDisbursement,
    addOnExpenses,
    costPlusTotalsData,
    totalProjectCost,
    netProjectCost,
    collectedFundsData,
    collectedFunds,
  } = await getProjectDashboard({ id: params.projectId });

  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }

  const userId = await requireUserId(request);
  const categories = await getDetailCategories();

  return json({
    project,
    userId,
    categorizedDisbursement,
    uncategorizedDisbursement,
    addOnExpenses,
    costPlusTotalsData,
    totalProjectCost,
    netProjectCost,
    categories,
    collectedFunds,
    collectedFundsData,
  });
}

export default function ProjectDashboard() {
  const {
    project,
    categorizedDisbursement,
    uncategorizedDisbursement,
    addOnExpenses,
    costPlusTotalsData,
    totalProjectCost,
    netProjectCost,
    categories,
    collectedFunds,
    collectedFundsData,
  } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const totalDisbursed =
    sum(categorizedDisbursement.map((_) => _.totalDisbursements)) +
    uncategorizedDisbursement.totalDisbursements;

  return (
    <DialogWithTransition
      size="xl"
      isOpen={true}
      title={<>Project Dashboard for {project.code}</>}
      onCloseModal={() => navigate(`/projects/${project.id}`)}
    >
      <div className="grid text-center md:grid-cols-2">
        <div>
          <LabeledCurrency
            label="total project cost"
            value={totalProjectCost}
            valueClassName={classNames("text-4xl")}
          />
        </div>
        <div>
          <LabeledCurrency
            label="net project cost"
            value={netProjectCost}
            valueClassName={classNames("text-4xl")}
          />
        </div>
      </div>
      <hr className="my-4" />
      {costPlusTotalsData?.length > 0 && (
        <>
          <div>
            <div className="grid sm:grid-cols-1 md:grid-cols-3">
              {costPlusTotalsData.map((cp, key) => {
                return (
                  <>
                    <Card colored className="m-2 bg-gmd-100" key={key}>
                      <CardBody>
                        <p className="mb-4 font-semibold">{cp.description}</p>
                        <p className="currency">{formatCurrencyFixed(cp.total)}</p>
                      </CardBody>
                    </Card>
                  </>
                );
              })}
            </div>
          </div>
          <hr className="my-4" />
        </>
      )}
      <div>
        <CollectedFundsCard
          colored
          className="m-2 cursor-pointer bg-gmd-50 hover:bg-gmd-100"
          description="Collected Funds"
          total={collectedFunds}
          collectedFunds={collectedFundsData as unknown as CollectedFunds}
        />
      </div>
      <hr className="my-4" />
      <div>
        <AddOnExpenseCard
          colored
          className="m-2 cursor-pointer bg-gmd-50 hover:bg-gmd-100"
          description="Total Add On Expenses"
          total={addOnExpenses.totalAddOns}
          addOns={addOnExpenses.addOns as unknown as ProjectAddOn[]}
        />
        <Card colored className="m-2 bg-gmd-600 text-white">
          <CardBody>
            <p className="mb-4 font-semibold">Total Disbursed</p>
            <p className="currency">{formatCurrencyFixed(totalDisbursed)}</p>
          </CardBody>
        </Card>
      </div>
      <hr className="my-4" />
      <div className="grid md:grid-cols-3">
        {uncategorizedDisbursement.totalDisbursements > 0 && (
          <DisbursementCard
            colored
            className="m-2 bg-gray-100 hover:bg-gray-300"
            total={uncategorizedDisbursement.totalDisbursements}
            description="Uncategorized"
            vouchers={uncategorizedDisbursement.vouchers as unknown as ProjectVoucher[]}
          />
        )}
        {categories
          .filter((c) => c.children === null || c.children.length === 0)
          .map((c, i) => {
            const data = categorizedDisbursement.find((cd) => cd.category.id === c.id);
            if (data == null) return null;
            if (data.totalDisbursements === 0) return null;
            return (
              <DisbursementCard
                key={i}
                colored
                className="m-2 bg-gmd-300 hover:bg-gmd-400"
                total={data.totalDisbursements}
                description={data.category.description}
                disbursements={
                  data.disbursements as unknown as ProjectVoucherDetailsWithVoucherNumber[]
                }
              />
            );
          })}
      </div>
      <div className="grid grid-cols-3">
        {categories
          .filter((c) => c.children?.length > 0)
          .map((c, i) => {
            const childrenData = categorizedDisbursement.filter(
              (cd) => cd.category.parentId === c.id
            );
            const totalAmountDisbursedByCategory = sum(
              childrenData.map((_) => _.totalDisbursements)
            );
            if (totalAmountDisbursedByCategory === 0) return null;
            return (
              <>
                <Card colored className="xs:col-span-2 col-span-3 m-2 bg-gmd-300">
                  <CardBody>
                    <p className="font-semibold">{c.description}</p>
                    <p className="currency text-right">
                      {formatCurrencyFixed(totalAmountDisbursedByCategory)}
                    </p>
                  </CardBody>
                </Card>
                {childrenData.map((data) => {
                  if (data.totalDisbursements === 0) return null;
                  return (
                    <DisbursementCard
                      key={i}
                      colored
                      className="m-2 hover:bg-gmd-100"
                      total={data.totalDisbursements}
                      description={data.category.description}
                      disbursements={
                        data.disbursements as unknown as ProjectVoucherDetailsWithVoucherNumber[]
                      }
                    />
                  );
                })}
              </>
            );
          })}
      </div>
      <hr className="my-4" />
      <div className="space-x-2 text-right">
        <a href={`/reports/project/${project.id}/export`} tabIndex={-1}>
          <Button tabIndex={-1}>Export Data</Button>
        </a>
        <Button
          tabIndex={-1}
          onClick={() => {
            window.open(`/reports/project/${project.id}`);
          }}
        >
          Report Preview
        </Button>
      </div>
    </DialogWithTransition>
  );
}
