import { ExclamationCircleIcon, TrashIcon } from "@heroicons/react/solid";
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
  TableHeader,
  TableRow,
} from "../@windmill";

import type { ProjectAddOnWithDetails } from "../../models/project-add-on.server";
type Props = {
  data: ProjectAddOnWithDetails;
};

export default function ProjectAddOnTable({ data }: Props) {
  return (
    <>
      <TableContainer>
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>By</TableCell>
              <TableCell>Date Added</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <p className="text-center">No add ons yet</p>
                </TableCell>
              </TableRow>
            ) : (
              data?.map((projectAddOn, key) => {
                return (
                  <TableRow key={key}>
                    <TableCell className="w-80">
                      <div className="flex items-center text-sm">
                        <div>
                          <p className="break-all text-xs text-gray-600 dark:text-gray-400">
                            {projectAddOn.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <small>{formatCurrencyFixed(Number(projectAddOn.quantity))}</small>
                    </TableCell>
                    <TableCell>
                      <Badge className="currency">
                        {formatCurrencyFixed(Number(projectAddOn.amount))}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge type="success" className="currency">
                        {formatCurrencyFixed(Number(projectAddOn.total))}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge type="primary">{projectAddOn.updatedBy.email}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(projectAddOn.updatedAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {!projectAddOn.costPlus && (
                        <span title="This is exempted from cost plus">
                          <ExclamationCircleIcon
                            className="h-5 w-5 text-yellow-600"
                            aria-label="cost plus exempt"
                          />
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DeleteProjectAddOn projectAddOnId={projectAddOn.id} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

function DeleteProjectAddOn({ projectAddOnId }: { projectAddOnId: number }) {
  const fetcher = useFetcher();
  const isDeleting =
    fetcher.state === "submitting" &&
    Number(fetcher.submission.formData.get("projectAddOnId")) === projectAddOnId;

  return (
    <>
      <Form method="post">
        <div className="disable hidden">
          <TextInput name="projectAddOnId" required defaultValue={projectAddOnId} />
        </div>
        <Button
          name="_action"
          value="delete-project-add-on"
          disabled={isDeleting}
          className="cursor-pointer"
          size="small"
          type="submit"
          aria-label="delete"
          onClick={(e) => !confirm("continue?") && e.preventDefault()}
        >
          <TrashIcon className="h-5 w-5" />
        </Button>
      </Form>
    </>
  );
}
