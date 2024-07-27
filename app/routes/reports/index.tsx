import { FolderIcon } from "@heroicons/react/solid";
import { NavLink } from "@remix-run/react";

import { RoundIcon } from "../../components/@ui";
import { Card, CardBody } from "../../components/@windmill";
import Page from "../../components/Page";

export default function ReportsIndexPage() {
  return (
    <Page currentPage={"Reports"}>
      <div className="xl:grid-cols- m-4 mb-8 grid gap-6 md:grid-cols-2">
        <Card colored className="hover:bg-gmd-100">
          <NavLink to="./revenue">
            <CardBody className="m-1 flex items-center">
              <RoundIcon icon={FolderIcon} className="mr-4" />
              <div>
                <p className="mb-2 text-lg font-medium text-gray-600">Revenue</p>
              </div>
            </CardBody>
          </NavLink>
        </Card>
      </div>
    </Page>
  );
}
