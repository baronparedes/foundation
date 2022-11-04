import invariant from 'tiny-invariant';

import {useLoaderData, useNavigate} from '@remix-run/react';
import {json} from '@remix-run/server-runtime';

import {DialogWithTransition} from '../../../components/@ui';

import type { LoaderArgs } from "@remix-run/server-runtime";

export async function loader({ params, request }: LoaderArgs) {
  invariant(params.projectId, "project not found");
  invariant(params.voucherId, "voucher not found");

  return json({ projectId: params.projectId, voucherId: params.voucherId });
}

export default function VoucherDetails() {
  const { projectId } = useLoaderData<typeof loader>();

  const navigate = useNavigate();
  return (
    <DialogWithTransition
      isOpen={true}
      title={<>Input voucher details</>}
      onCloseModal={() => navigate(`/projects/${projectId}`)}
    >
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
      reiciendis iure laborum repellendus, totam veritatis distinctio ratione
      officiis iusto maxime deleniti, delectus cum optio harum dolores minus
      modi quaerat culpa!
    </DialogWithTransition>
  );
}
