import {formatCurrencyFixed} from '../../utils';
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
  TableRow,
} from '../@windmill';

import type { FundWithTransaction } from "../../models/fund.server";
type Props = {
  data: FundWithTransaction;
};

export default function FundTransactionTable({ data }: Props) {
  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <tr>
            <TableCell>Description</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Project?</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>By</TableCell>
          </tr>
        </TableHeader>
        <TableBody>
          {data?.fundTransaction.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <p className="text-center">No transactions yet</p>
              </TableCell>
            </TableRow>
          ) : (
            data?.fundTransaction.map((transaction, key) => {
              return (
                <TableRow key={key}>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {transaction.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="currency text-sm">
                      {formatCurrencyFixed(Number(transaction.amount))}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge type="success">{transaction.project?.code}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge type="primary">{transaction.createdBy.email}</Badge>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      <TableFooter />
    </TableContainer>
  );
}
