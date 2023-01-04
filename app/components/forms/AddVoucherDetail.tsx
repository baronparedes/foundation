import {useEffect, useState} from 'react';

import {useFetcher} from '@remix-run/react';

import {DialogWithTransition, LabeledCurrency, TextInput} from '../@ui';
import {Button} from '../@windmill';

type Props = {
  projectVoucherId: number;
  userId: string;
  maxAmount: number;
};
export function AddVoucherDetails({ maxAmount, projectVoucherId, userId }: Props) {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState(0);
  const [supplierName, setSupplierName] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [quantity, setQuantity] = useState<number>();
  const [toggle, setToggle] = useState(false);
  const isValid =
    supplierName !== "" &&
    referenceNumber !== "" &&
    description !== "" &&
    category !== "" &&
    amount > 0 &&
    amount <= maxAmount;

  const fetcher = useFetcher();
  const isAdding =
    fetcher.submission?.formData.get("_action") === "create" &&
    fetcher.state === "submitting";

  function onResetForm() {
    setToggle(false);
    setDescription("");
    setCategory("");
    setAmount(0);
    setSupplierName("");
    setReferenceNumber("");
    setQuantity(undefined);
  }

  useEffect(() => {
    !isAdding && onResetForm();
  }, [isAdding]);

  return (
    <>
      <div className="my-2 text-right">
        <Button
          disabled={maxAmount === 0}
          onClick={() => {
            setToggle(true);
          }}
        >
          Add Details
        </Button>
      </div>
      <DialogWithTransition
        isOpen={toggle}
        title={<>Fill out voucher details</>}
        onCloseModal={() => {
          setToggle(false);
        }}
      >
        <div className="my-4 text-center">
          <small>
            <LabeledCurrency label="available amount" value={Number(maxAmount)} />
          </small>
        </div>
        <fetcher.Form
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: "100%",
          }}
          method="post"
        >
          <div className="disable hidden">
            <TextInput name="updatedById" required defaultValue={userId} />
            <TextInput name="projectVoucherId" required defaultValue={projectVoucherId} />
          </div>
          <TextInput
            name="supplierName"
            label="Supplier Name"
            required
            value={supplierName}
            onChange={(e) => setSupplierName(e.currentTarget.value)}
          />
          <TextInput
            textTransform="uppercase"
            name="referenceNumber"
            label="Reference Number"
            required
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.currentTarget.value)}
          />
          <TextInput
            name="quantity"
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.currentTarget.value))}
          />
          <hr className="my-4" />
          <TextInput
            name="description"
            label="Description"
            required
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
          />
          <TextInput
            name="category"
            label="Category"
            required
            value={category}
            onChange={(e) => setCategory(e.currentTarget.value)}
          />
          <TextInput
            name="amount"
            label="Amount"
            type="number"
            required
            value={amount}
            min={1}
            max={maxAmount}
            error={
              amount > maxAmount
                ? `should not exceed available amount of ${maxAmount}`
                : undefined
            }
            onChange={(e) => setAmount(Number(e.currentTarget.value))}
          />
          <hr className="my-4" />
          <div className="text-right">
            <Button
              disabled={!isValid || fetcher.state === "submitting"}
              name="_action"
              value="create"
              type="submit"
            >
              Add
            </Button>
          </div>
        </fetcher.Form>
      </DialogWithTransition>
    </>
  );
}
