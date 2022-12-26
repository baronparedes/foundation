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

import type { AddVoucher } from "../forms/AddVoucherDetail";

type Props = {
  data: AddVoucher[];
};

export default function VoucherDetailTable({ data }: Props) {
  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <tr>
            <TableCell>Description</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Supplier</TableCell>
            <TableCell>Reference Number</TableCell>
          </tr>
        </TableHeader>
        <TableBody>
          {data?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <p className="text-center">No details yet</p>
              </TableCell>
            </TableRow>
          ) : (
            data?.map((d, key) => {
              const amount = Number(d.amount);
              const isNegative = amount < 0;

              return (
                <TableRow key={key}>
                  <TableCell className="w-96">
                    <p>{d.description}</p>
                  </TableCell>
                  <TableCell>{d.category}</TableCell>
                  <TableCell>
                    <Badge
                      type={isNegative ? "danger" : "success"}
                      className="currency"
                    >
                      {formatCurrencyFixed(amount)}
                    </Badge>
                  </TableCell>
                  <TableCell>{d.supplierName}</TableCell>
                  <TableCell>{d.referenceNumber}</TableCell>
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
