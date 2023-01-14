import classNames from 'classnames';
import {useState} from 'react';
import invariant from 'tiny-invariant';

import {useLoaderData, useNavigate} from '@remix-run/react';
import {json} from '@remix-run/server-runtime';

import {DialogWithTransition} from '../../../components/@ui';
import {
  Badge,
  Card,
  CardBody,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
  TableRow,
} from '../../../components/@windmill';
import {getProjectDashboard} from '../../../models/project.server';
import {requireUserId} from '../../../session.server';
import {formatCurrencyFixed, sum} from '../../../utils';

import type { CardProps } from "../../../components/@windmill/Card";
import type { ProjectVoucherDetailsWithVoucherNumber } from "../../../models/project-voucher-detail.server";
import type { ProjectVoucher } from "../../../models/project-voucher.server";
import type { LoaderArgs } from "@remix-run/server-runtime";
export async function loader({ params, request }: LoaderArgs) {
  invariant(params.projectId, "project not found");

  const { project, categorizedDisbursement, uncategorizedDisbursement } =
    await getProjectDashboard({ id: params.projectId });

  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }

  const userId = await requireUserId(request);

  return json({ project, userId, categorizedDisbursement, uncategorizedDisbursement });
}

export default function ProjectDashboard() {
  const { project, categorizedDisbursement, uncategorizedDisbursement } =
    useLoaderData<typeof loader>();
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
      <Card colored className="bg-purple-600 text-white">
        <CardBody>
          <p className="mb-4 font-semibold">Total Disbursed</p>
          <p className="currency">{formatCurrencyFixed(totalDisbursed)}</p>
        </CardBody>
      </Card>
      <hr className="my-4" />
      <div>
        <div className="flex-none">
          <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-3">
            {categorizedDisbursement
              .filter((data) => data.totalDisbursements > 0)
              .map((data, i) => {
                return (
                  <ProjectDashboardCard
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
            <ProjectDashboardCard
              colored
              className="bg-gray-100 hover:bg-gray-300"
              total={uncategorizedDisbursement.totalDisbursements}
              description="Uncategorized"
              vouchers={uncategorizedDisbursement.vouchers as unknown as ProjectVoucher[]}
            />
          </div>
        </div>
      </div>
    </DialogWithTransition>
  );
}

type ProjectDashboardCardProps = {
  description: string;
  total: number;
  disbursements?: ProjectVoucherDetailsWithVoucherNumber[];
  vouchers?: ProjectVoucher[];
};

function ProjectDashboardCard({
  description,
  total,
  disbursements,
  vouchers,
  ...cardProps
}: ProjectDashboardCardProps & CardProps) {
  const [toggle, setToggle] = useState(false);

  function handleOnClick() {
    setToggle(true);
  }

  return (
    <>
      <Card
        {...cardProps}
        onClick={handleOnClick}
        className={classNames(cardProps.className, "cursor-pointer")}
      >
        <CardBody>
          <p className="mb-4 font-semibold">{description}</p>
          <p className="currency">{formatCurrencyFixed(Number(total))}</p>
        </CardBody>
      </Card>
      <DialogWithTransition
        isOpen={toggle}
        title={description}
        onCloseModal={() => setToggle(false)}
      >
        {disbursements && disbursements.length > 0 && (
          <>
            <TableContainer>
              <Table className="table-auto">
                <TableHeader>
                  <tr>
                    <TableCell>Voucher Number</TableCell>
                    <TableCell>Ref #</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell></TableCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {disbursements?.map((data, key) => {
                    const amount = Number(data.amount);
                    const isNegative = amount < 0;

                    return (
                      <TableRow key={key}>
                        <TableCell>{data.projectVoucher.voucherNumber}</TableCell>
                        <TableCell>{data.referenceNumber}</TableCell>
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
                          <Badge
                            type={isNegative ? "danger" : "success"}
                            className="currency text-sm"
                          >
                            {formatCurrencyFixed(amount)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <TableFooter />
            </TableContainer>
          </>
        )}
        {vouchers && vouchers.length > 0 && (
          <>
            <TableContainer>
              <Table className="table-auto">
                <TableHeader>
                  <tr>
                    <TableCell>Voucher Number</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell></TableCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {vouchers?.map((data, key) => {
                    const amount = Number(data.disbursedAmount);
                    const isNegative = amount < 0;

                    return (
                      <TableRow key={key}>
                        <TableCell>{data.voucherNumber}</TableCell>
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
                          <Badge
                            type={isNegative ? "danger" : "success"}
                            className="currency text-sm"
                          >
                            {formatCurrencyFixed(amount)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <TableFooter />
            </TableContainer>
          </>
        )}
      </DialogWithTransition>
    </>
  );
}
