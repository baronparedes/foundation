import classNames from "classnames";
import { useState } from "react";

import { ExclamationCircleIcon } from "@heroicons/react/solid";

import { formatCurrencyFixed } from "../../utils";
import { DialogWithTransition, LabeledCurrency } from "../@ui";
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

import type { ProjectAddOn } from "@prisma/client";

import type { CardProps } from "../@windmill/Card";
type Props = {
  description: string;
  total: number;
  addOns?: ProjectAddOn[];
};

export function AddOnExpenseCard({
  description,
  total,
  addOns,
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
        <div className="text-center">
          <div>
            <LabeledCurrency
              label="total"
              value={total}
              valueClassName={classNames("text-2xl")}
            />
          </div>
        </div>
        <hr className="my-4" />
        <TableContainer>
          <Table className="w-full table-auto">
            <TableHeader>
              <tr>
                <TableCell>Description</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Total</TableCell>
                <TableCell></TableCell>
              </tr>
            </TableHeader>
            <TableBody>
              {addOns?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <p className="text-center">No details yet</p>
                  </TableCell>
                </TableRow>
              )}
              {addOns &&
                addOns.length > 0 &&
                addOns?.map((data, key) => {
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
                        <small>{formatCurrencyFixed(Number(data.quantity))}</small>
                      </TableCell>
                      <TableCell>
                        <Badge className="currency">
                          {formatCurrencyFixed(Number(data.amount))}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge type="success" className="currency">
                          {formatCurrencyFixed(Number(data.total))}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {!data.costPlus && (
                          <span title="This is exempted from cost plus">
                            <ExclamationCircleIcon
                              className="h-5 w-5 text-yellow-600"
                              aria-label="cost plus exempt"
                            />
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
          <TableFooter />
        </TableContainer>
      </DialogWithTransition>
    </>
  );
}
