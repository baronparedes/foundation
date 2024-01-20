import classNames from "classnames";
import { useState } from "react";

import { formatCurrencyFixed } from "../../utils";
import { DialogWithTransition, LabeledCurrency } from "../@ui";
import {
  Badge,
  CardBody,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
  TableRow,
} from "../@windmill";
import Card from "../@windmill/Card";

import type { CollectedFunds } from "../../models/project-dashboard.server";
import type { CardProps } from "../@windmill/Card";
type Props = {
  description: string;
  total: number;
  collectedFunds?: CollectedFunds;
};

export function CollectedFundsCard({
  description,
  total,
  collectedFunds,
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
                <TableCell>Date Collected</TableCell>
                <TableCell>Amount</TableCell>
              </tr>
            </TableHeader>
            <TableBody>
              {collectedFunds?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <p className="text-center">No details yet</p>
                  </TableCell>
                </TableRow>
              )}
              {collectedFunds &&
                collectedFunds.length > 0 &&
                collectedFunds?.map((data, key) => {
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
          <TableFooter />
        </TableContainer>
      </DialogWithTransition>
    </>
  );
}
