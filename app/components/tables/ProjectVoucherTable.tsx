import {formatCurrencyFixed} from '../../utils';
import {LinkStyled} from '../@ui';
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

import type { ProjectVoucherWithDetails } from "../../models/project-voucher.server";
type Props = {
  data: ProjectVoucherWithDetails;
};

export default function ProjectVoucherTable({ data }: Props) {
  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <tr>
            <TableCell>Voucher Number</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Fund</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>By</TableCell>
          </tr>
        </TableHeader>
        <TableBody>
          {data?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <p className="text-center">No vouchers yet</p>
              </TableCell>
            </TableRow>
          ) : (
            data?.map((voucher, key) => {
              const amount = Number(voucher.consumedAmount);
              const isNegative = amount < 0;

              return (
                <TableRow key={key}>
                  <TableCell>
                    <LinkStyled to={`./vouchers/${voucher.id}`}>
                      {voucher.voucherNumber}
                    </LinkStyled>
                  </TableCell>
                  <TableCell className="w-96">
                    <div className="flex items-center text-sm">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {voucher.description}
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
                  <TableCell>
                    <Badge type="neutral">{voucher.fund.code}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {new Date(voucher.transactionDate).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge type="primary">{voucher.updatedBy.email}</Badge>
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
