import { formatCurrencyFixed } from "../../utils";
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
} from "../@windmill";
import { DeleteProjectSetting } from "../forms/DeleteProjectSetting";

import type { ProjectSettingWithDetails } from "../../models/project-setting.server";
type Props = {
  data: ProjectSettingWithDetails;
};

export function ProjectSettingTable({ data }: Props) {
  return (
    <>
      <TableContainer>
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell>Percentage Add On</TableCell>
              <TableCell>By</TableCell>
              <TableCell>Date Added</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <p className="text-center">No settings yet</p>
                </TableCell>
              </TableRow>
            ) : (
              data?.map((projectSetting) => {
                return (
                  <TableRow key={`project-setting-${projectSetting.id}`}>
                    <TableCell className="w-80">
                      <div className="flex items-center text-sm">
                        <div>
                          <p className="break-all text-xs text-gray-600 dark:text-gray-400">
                            {projectSetting.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge type="success">
                        {formatCurrencyFixed(Number(projectSetting.percentageAddOn))}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge type="primary">{projectSetting.updatedBy.email}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(projectSetting.updatedAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(projectSetting.startDate).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {projectSetting.endDate &&
                          new Date(projectSetting.endDate).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="inline-flex space-x-2">
                      <DeleteProjectSetting projectSettingId={projectSetting.id} />
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
