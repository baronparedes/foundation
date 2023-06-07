import { formatCurrencyFixed } from "../../utils";
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
  TableRow,
} from "../@windmill";
import { DeleteVoucherDetail } from "../forms/DeleteStudioVoucherDetail";

import type { StudioVoucherDetailslWithCategory } from "../../models/studio-voucher-detail.server";
type Props = {
  data: StudioVoucherDetailslWithCategory;
  studioVoucherId: number;
  isClosed: boolean;
  userId: string;
};

export function StudioVoucherDetailTable({
  data,
  userId,
  studioVoucherId,
  isClosed,
}: Props) {
  const columns = isClosed ? 5 : 6;

  return (
    <TableContainer>
      <Table className="w-full table-auto">
        <TableHeader>
          <tr>
            <TableCell>Description</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Supplier</TableCell>
            <TableCell>Reference Number</TableCell>
            {!isClosed && <TableCell></TableCell>}
          </tr>
        </TableHeader>
        <TableBody>
          {data?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns}>
                <p className="text-center">No details yet</p>
              </TableCell>
            </TableRow>
          ) : (
            data?.map((d) => {
              const amount = Number(d.amount);
              const isNegative = amount < 0;

              return (
                <TableRow key={`studio-voucher-detail-${d.id}`}>
                  <TableCell className="w-96">
                    <div className="flex items-center text-sm">
                      <div>
                        <p className="break-all text-xs text-gray-600 dark:text-gray-400">
                          {d.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge>{d.detailCategory.description}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge type={isNegative ? "danger" : "success"} className="currency">
                      {formatCurrencyFixed(amount)}
                    </Badge>
                  </TableCell>
                  <TableCell>{d.supplierName}</TableCell>
                  <TableCell>{d.referenceNumber}</TableCell>
                  {!isClosed && (
                    <TableCell>
                      <DeleteVoucherDetail
                        studioVoucherId={studioVoucherId}
                        userId={userId}
                        studioVoucherDetailId={d.id}
                      />
                    </TableCell>
                  )}
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
