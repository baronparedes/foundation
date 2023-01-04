import { TrashIcon } from "@heroicons/react/solid";
import { Form, useFetcher } from "@remix-run/react";

import { formatCurrencyFixed } from "../../utils";
import { TextInput } from "../@ui";
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
  TableRow,
} from "../@windmill";

import type { ProjectVoucherDetailslWithCategory } from "../../models/project-voucher-detail.server";
type Props = {
  data: ProjectVoucherDetailslWithCategory;
  projectVoucherId: number;
  isClosed: boolean;
  userId: string;
};

export default function VoucherDetailTable({
  data,
  userId,
  projectVoucherId,
  isClosed,
}: Props) {
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
            <TableCell></TableCell>
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
                  <TableCell>{d.detailCategory.description}</TableCell>
                  <TableCell>
                    <Badge type={isNegative ? "danger" : "success"} className="currency">
                      {formatCurrencyFixed(amount)}
                    </Badge>
                  </TableCell>
                  <TableCell>{d.supplierName}</TableCell>
                  <TableCell>{d.referenceNumber}</TableCell>
                  <TableCell>
                    {!isClosed && (
                      <DeleteVoucherDetail
                        projectVoucherId={projectVoucherId}
                        userId={userId}
                        projectVoucherDetailId={d.id}
                        isClosed={isClosed}
                      />
                    )}
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

function DeleteVoucherDetail({
  userId,
  projectVoucherId,
  projectVoucherDetailId,
}: Omit<Props, "data"> & {
  projectVoucherDetailId: number;
}) {
  const fetcher = useFetcher();
  const isDeleting =
    fetcher.state === "submitting" &&
    Number(fetcher.submission.formData.get("projectVoucherDetailId")) ===
      projectVoucherDetailId;

  return (
    <>
      <Form method="post">
        <div className="disable hidden">
          <TextInput name="updatedById" required defaultValue={userId} />
          <TextInput name="projectVoucherId" required defaultValue={projectVoucherId} />
          <TextInput
            name="projectVoucherDetailId"
            required
            defaultValue={projectVoucherDetailId}
          />
        </div>
        <Button
          name="_action"
          value="delete"
          disabled={isDeleting}
          className="cursor-pointer "
          size="small"
          type="submit"
          aria-label="delete"
        >
          <TrashIcon className="h-5 w-5" />
        </Button>
      </Form>
    </>
  );
}
