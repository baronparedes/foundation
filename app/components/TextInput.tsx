type Props = React.HTMLProps<HTMLInputElement> & {
  error?: string | null;
  name: string;
  label: string;
};

export default function TextInput({ error, name, label, ...rest }: Props) {
  return (
    <div>
      <label className="flex w-full flex-col gap-1">
        <span>{label}</span>
        <input
          name={name}
          className="rounded border border-gray-500 px-2 py-1 text-lg"
          aria-invalid={error ? true : undefined}
          aria-errormessage={error ? `${name}-error` : undefined}
          {...rest}
        />
      </label>
      {error && (
        <div className="pt-1 text-red-700" id={`${name}-error`}>
          {error}
        </div>
      )}
    </div>
  );
}
