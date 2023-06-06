import invariant from 'tiny-invariant';

import {useLoaderData, useNavigate} from '@remix-run/react';
import {json} from '@remix-run/server-runtime';

import {DialogWithTransition} from '../../../components/@ui';
import {Card, CardBody} from '../../../components/@windmill';
import {DisbursementCard} from '../../../components/cards/DisbursementCard';
import {getStudioDashboard} from '../../../models/studio-dashboard.server';
import {requireUserId} from '../../../session.server';
import {formatCurrencyFixed, sum} from '../../../utils';

import type { StudioVoucherDetailsWithVoucherNumber } from "../../../models/studio-voucher-detail.server";
import type { StudioVoucher } from "../../../models/studio-voucher.server";
import type { LoaderArgs } from "@remix-run/server-runtime";
export async function loader({ params, request }: LoaderArgs) {
  invariant(params.studioId, "studio not found");

  const { studio, categorizedDisbursement, uncategorizedDisbursement } =
    await getStudioDashboard({ id: params.studioId });

  if (!studio) {
    throw new Response("Not Found", { status: 404 });
  }

  const userId = await requireUserId(request);

  return json({
    studio,
    userId,
    categorizedDisbursement,
    uncategorizedDisbursement,
  });
}

export default function StudioDashboard() {
  const { studio, categorizedDisbursement, uncategorizedDisbursement } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const totalDisbursed =
    sum(categorizedDisbursement.map((_) => _.totalDisbursements)) +
    uncategorizedDisbursement.totalDisbursements;

  return (
    <DialogWithTransition
      size="xl"
      isOpen={true}
      title={<>Studio Dashboard for {studio.code}</>}
      onCloseModal={() => navigate(`/studios/${studio.id}`)}
    >
      <hr className="my-4" />
      <Card colored className="m-2 bg-gmd-600 text-white">
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
                    className="hover:bg-gmd-100"
                    total={data.totalDisbursements}
                    description={data.category.description}
                    disbursements={
                      data.disbursements as unknown as StudioVoucherDetailsWithVoucherNumber[]
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
                vouchers={uncategorizedDisbursement.vouchers as unknown as StudioVoucher[]}
              />
            )}
          </div>
        </div>
      </div>
    </DialogWithTransition>
  );
}
