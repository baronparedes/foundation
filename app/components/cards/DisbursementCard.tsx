import classNames from "classnames";
import { useState } from "react";

import { formatCurrencyFixed } from "../../utils";
import { DialogWithTransition } from "../@ui";
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
} from "../@windmill";

import type { StudioVoucherDetailsWithVoucherNumber } from "../../models/studio-voucher-detail.server";
import type { ProjectVoucher, StudioVoucher } from "@prisma/client";

import type { ProjectVoucherDetailsWithVoucherNumber } from "../../models/project-voucher-detail.server";
import type { CardProps } from "../@windmill/Card";
type Props = {
  description: string;
  total: number;
  disbursements?:
    | ProjectVoucherDetailsWithVoucherNumber[]
    | StudioVoucherDetailsWithVoucherNumber[];
  vouchers?: ProjectVoucher[] | StudioVoucher[];
};

export function DisbursementCard({
  description,
  total,
  disbursements,
  vouchers,
  ...cardProps
}: Props & CardProps) {
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
              <Table className="w-full table-auto">
                <TableHeader>
                  <tr>
                    <TableCell>Voucher Number</TableCell>
                    <TableCell>Ref #</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Supplier</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Amount</TableCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {disbursements?.map((data, key) => {
                    const amount = Number(data.amount);
                    const isNegative = amount < 0;

                    return (
                      <TableRow key={key}>
                        <TableCell>{data.voucher?.voucherNumber ?? ""}</TableCell>
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

                        <TableCell>{data.supplierName}</TableCell>
                        <TableCell>
                          <Badge className="text-sm">{Number(data.quantity)}</Badge>
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
              <Table className="w-full table-auto">
                <TableHeader>
                  <tr>
                    <TableCell>Voucher Number</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Amount</TableCell>
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
