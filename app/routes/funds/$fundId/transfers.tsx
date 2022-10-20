import {useNavigate, useParams} from '@remix-run/react';

import {DialogWithTransition} from '../../../components/@ui';

export default function CashInPage() {
  const { fundId } = useParams();
  const navigate = useNavigate();

  return (
    <DialogWithTransition
      isOpen={true}
      title={"Transfers"}
      onCloseModal={() => navigate(`/funds/${fundId}`)}
    >
      Transfers
    </DialogWithTransition>
  );
}
