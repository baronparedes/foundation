import invariant from "tiny-invariant";
import { getStudio } from "~/models/studio.server";

import { json } from "@remix-run/node";
import {
  Form,
  Outlet,
  useCatch,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";

import { SearchInput } from "../../components/@ui/SearchInput";
import { Button } from "../../components/@windmill";
import { StudioHeader } from "../../components/StudioHeader";
import { StudioVoucherTable } from "../../components/tables/StudioVoucherTable";
import { getStudioDashboard } from "../../models/studio-dashboard.server";
import { getStudioVouchers } from "../../models/studio-voucher.server";

import type { Studio } from "~/models/studio.server";
import type { LoaderArgs } from "@remix-run/node";
import type { StudioVoucherWithDetails } from "../../models/studio-voucher.server";
export async function loader({ params, request }: LoaderArgs) {
  invariant(params.studioId, "studioId not found");

  const studio = await getStudio({ id: params.studioId });
  if (!studio) {
    throw new Response("Not Found", { status: 404 });
  }

  const url = new URL(request.url);
  const urlParams = new URLSearchParams(url.search);

  const studioVouchers = await getStudioVouchers({
    id: params.studioId,
    criteria: urlParams.get("search") ?? undefined,
  });

  const { disbursedFunds, remainingFunds } = await getStudioDashboard({
    id: params.studioId,
  });

  return json({
    studio,
    disbursedFunds,
    remainingFunds,
    studioVouchers,
  });
}

export default function StudioDetailsPage() {
  const { studio, disbursedFunds, remainingFunds, studioVouchers } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <StudioHeader
        studio={studio as unknown as Studio}
        disbursedFunds={disbursedFunds}
        remainingFunds={remainingFunds}
      />
      <hr className="my-4" />
      <div className="w-full space-x-2 text-right">
        <Button onClick={() => navigate("./dashboard")}>Dashboard</Button>
        <Button onClick={() => navigate("./vouchers")}>New Voucher</Button>
        <Outlet />
      </div>
      <hr className="my-4" />
      <Form>
        <SearchInput placeholder="search vouchers" />
      </Form>
      <hr className="my-4" />
      <div>
        <StudioVoucherTable data={studioVouchers as unknown as StudioVoucherWithDetails} />
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>404 not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
