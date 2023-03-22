import classNames from 'classnames';
import invariant from 'tiny-invariant';

import {useLoaderData, useNavigate} from '@remix-run/react';
import {json} from '@remix-run/server-runtime';

import {DialogWithTransition, LabeledCurrency} from '../../../components/@ui';
import {Button, Card, CardBody} from '../../../components/@windmill';
import {AddOnExpenseCard} from '../../../components/cards/AddOnExpenseCard';
import {DisbursementCard} from '../../../components/cards/DisbursementCard';
import {getProjectDashboard} from '../../../models/project-dashboard.server';
import {requireUserId} from '../../../session.server';
import {formatCurrencyFixed, sum} from '../../../utils';

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
    costPlusTotals,
    totalProjectCost,
    totalExempt,
  } = await getProjectDashboard({ id: params.projectId });

  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }

  const userId = await requireUserId(request);

  return json({
    project,
    userId,
    categorizedDisbursement,
    uncategorizedDisbursement,
    addOnExpenses,
    costPlusTotals,
    totalProjectCost,
    totalExempt,
  });
}

export default function ProjectDashboard() {
  const {
    project,
    categorizedDisbursement,
    uncategorizedDisbursement,
    addOnExpenses,
    costPlusTotals,
    totalProjectCost,
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
      <div className="m-6 text-center">
        <LabeledCurrency
          label="total project cost"
          value={totalProjectCost}
          valueClassName={classNames("text-4xl")}
        />
      </div>
      <hr className="my-4" />
      <AddOnExpenseCard
        colored
        className="m-2 cursor-pointer bg-purple-50 hover:bg-purple-100"
        description="Total Add On Expenses"
        total={addOnExpenses.totalAddOns}
        addOns={addOnExpenses.addOns as unknown as ProjectAddOn[]}
      />
      {costPlusTotals?.length > 0 && (
        <>
          <hr className="my-4" />
          <div className="my-4">
            <div className="flex">
              {costPlusTotals.map((cp, key) => {
                return (
                  <>
                    <Card colored className="m-2 flex-auto bg-purple-100" key={key}>
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
        </>
      )}
      <hr className="my-4" />
      <Card colored className="m-2 bg-purple-600 text-white">
        <CardBody>
          <p className="mb-4 font-semibold">Total Disbursed</p>
          <p className="currency">{formatCurrencyFixed(totalDisbursed)}</p>
        </CardBody>
      </Card>
      <div>
        <div className="m-2 flex-none">
          <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-3">
            {categorizedDisbursement
              .filter((data) => data.totalDisbursements > 0)
              .map((data, i) => {
                return (
                  <DisbursementCard
                    key={i}
                    colored
                    className="hover:bg-purple-100"
                    total={data.totalDisbursements}
                    description={data.category.description}
                    disbursements={
                      data.disbursements as unknown as ProjectVoucherDetailsWithVoucherNumber[]
                    }
                  />
                );
              })}
            {uncategorizedDisbursement.totalDisbursements > 0 && (
              <DisbursementCard
                colored
                className="bg-gray-100 hover:bg-gray-300"
                total={uncategorizedDisbursement.totalDisbursements}
                description="Uncategorized"
                vouchers={uncategorizedDisbursement.vouchers as unknown as ProjectVoucher[]}
              />
            )}
          </div>
        </div>
      </div>
      <hr className="my-4" />
      <div className="text-right">
        <Button
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
