import {useState} from 'react';

import {Form} from '@remix-run/react';

import {DialogWithTransition, TextInput} from '../@ui';
import {Button} from '../@windmill';
import LabeledCurrency from '../LabeledCurrency';

type Props = {
  maxAmount: number;
  onAdd?: (details: AddVoucher) => void;
};

export type AddVoucher = {
  description: string;
  category: string;
  amount: number;
  supplierName: string;
  referenceNumber: string;
  quantity?: number;
};

//TODO: Refactor to a better form implementation
export function AddVoucherDetails({ onAdd: onAddDetail, maxAmount }: Props) {
  const [toggle, setToggle] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState(0);
  const [supplierName, setSupplierName] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [quantity, setQuantity] = useState<number>();
  const isValid =
    supplierName !== "" &&
    referenceNumber !== "" &&
    description !== "" &&
    category !== "" &&
    amount > 0 &&
    amount <= maxAmount;

  const handleOnAdd = () => {
    onAddDetail &&
      onAddDetail({
        description,
        category,
        amount,
        supplierName,
        referenceNumber,
        quantity,
      });
    setToggle(false);
    setDescription("");
    setCategory("");
    setReferenceNumber("");
    setSupplierName("");
    setQuantity(undefined);
    setAmount(0);
  };

  return (
    <>
      <div className="my-2 text-right">
        <Button
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
            <LabeledCurrency
              label="available amount"
              value={Number(maxAmount)}
            />
          </small>
        </div>
        <Form
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: "100%",
          }}
        >
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
            max={maxAmount}
            error={
              amount > maxAmount
                ? `should not exceed available amount of ${maxAmount}`
                : undefined
            }
            onChange={(e) => setAmount(Number(e.currentTarget.value))}
          />
        </Form>
        <hr className="my-4" />
        <div className="text-right">
          <Button disabled={!isValid} onClick={handleOnAdd}>
            Add
          </Button>
        </div>
      </DialogWithTransition>
    </>
  );
}
