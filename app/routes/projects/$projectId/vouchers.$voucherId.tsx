import {useState} from 'react';
import invariant from 'tiny-invariant';

import {useLoaderData, useNavigate, useTransition} from '@remix-run/react';
import {json} from '@remix-run/server-runtime';

import {DialogWithTransition} from '../../../components/@ui';
import {Button} from '../../../components/@windmill';
import {AddVoucherDetails} from '../../../components/forms/AddVoucherDetail';
import LabeledCurrency from '../../../components/LabeledCurrency';
import VoucherDetailTable from '../../../components/tables/VoucherDetailTable';
import {getProjectVoucher} from '../../../models/project-voucher.server';

import type { AddVoucher } from "../../../components/forms/AddVoucherDetail";
import type { LoaderArgs } from "@remix-run/server-runtime";
export async function loader({ params, request }: LoaderArgs) {
  const { projectId, voucherId } = params;
  const voucher = await getProjectVoucher({ id: Number(voucherId) });

  invariant(projectId, "project not found");
  invariant(voucher, "voucher not found");

  return json({ projectId, voucher });
}

export default function VoucherDetails() {
  const { projectId, voucher } = useLoaderData<typeof loader>();
  const [itemizedAmount, setItemizedAmount] = useState(0);
  const [voucherDetails, setVoucherDetails] = useState([
    {
      amount: 100,
      category: "Test",
      description: "descr",
      supplierName: "supplier",
      referenceNumber: "ref",
    },
  ] as AddVoucher[]);
  const transition = useTransition();
  const navigate = useNavigate();

  const handleOnAddDetail = (details: AddVoucher) => {
    setItemizedAmount(itemizedAmount + details.amount);
    setVoucherDetails([...voucherDetails, { ...details }]);
  };

  return (
    <DialogWithTransition
      size="xl"
      isOpen={true}
      title={
        <>
          Input voucher details
          <h1 className="pt-4">{voucher.voucherNumber}</h1>
        </>
      }
      onCloseModal={() => navigate(`/projects/${projectId}`)}
    >
      <div className="grid grid-cols-3 gap-3 text-center">
        <LabeledCurrency
          label="disbursed amount"
          value={Number(voucher.disbursedAmount)}
        />
        <LabeledCurrency
          label="itemized amount"
          value={Number(itemizedAmount)}
        />
        <LabeledCurrency
          label="amount to be refunded"
          value={Number(voucher.disbursedAmount) - Number(itemizedAmount)}
        />
      </div>
      <hr className="my-4" />
      <div className="my-4 mx-4">
        <AddVoucherDetails
          onAdd={handleOnAddDetail}
          maxAmount={Number(voucher.disbursedAmount) - itemizedAmount}
        />
      </div>
      <VoucherDetailTable data={voucherDetails} />
      <hr className="my-4" />
      {itemizedAmount > 0 && (
        <div className="text-right">
          <div className="my-2">
            <small>
              <i>
                Note: Unitemized amount will be refunded to the fund this
                disbursment came from.
              </i>
            </small>
          </div>
          <Button
            type="submit"
            disabled={transition.state === "submitting"}
            onClick={(e) => {
              if (
                !confirm(
                  "Unitemized amount will be refunded to the fund this disbursment came from."
                )
              )
                e.preventDefault();
            }}
          >
            Save and Close Voucher
          </Button>
        </div>
      )}
    </DialogWithTransition>
  );
}
