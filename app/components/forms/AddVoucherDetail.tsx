import {useState} from 'react';

import {Form} from '@remix-run/react';

import {DialogWithTransition, TextInput} from '../@ui';
import {Button} from '../@windmill';
import LabeledCurrency from '../LabeledCurrency';

type Props = {
  maxAmount: number;
  onAddDetail?: (description: string, category: string, amount: number) => void;
};

export function AddVoucherDetails({ onAddDetail, maxAmount }: Props) {
  const [toggle, setToggle] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState(0);
  const isValid =
    description !== "" && category !== "" && amount > 0 && amount <= maxAmount;

  const handleOnAdd = () => {
    onAddDetail && onAddDetail(description, category, amount);
    setToggle(false);
    setDescription("");
    setCategory("");
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
          Add
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
            name="description"
            label="Description : "
            required
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
          />
          <TextInput
            name="category"
            label="Category: "
            required
            value={category}
            onChange={(e) => setCategory(e.currentTarget.value)}
          />
          <TextInput
            name="amount"
            label="Amount: "
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
