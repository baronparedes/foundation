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
          className="flex-1 rounded-md border-2 border-blue-200 px-3 text-lg leading-loose"
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
