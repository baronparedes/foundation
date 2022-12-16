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

type Data = {
  description: string;
  category: string;
  amount: number;
};

type Props = {
  data: Data[];
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
                    <div className="flex items-center text-sm">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {d.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {d.category}
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
            })
          )}
        </TableBody>
      </Table>
      <TableFooter />
    </TableContainer>
  );
}
