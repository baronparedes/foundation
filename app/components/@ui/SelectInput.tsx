type Props = React.HTMLProps<HTMLSelectElement> & {
  error?: string | null;
  name: string;
  label?: string;
};

export default function TextInput({
  error,
  name,
  label,
  children,
  ...rest
}: React.PropsWithChildren<Props>) {
  return (
    <div>
      <label className="flex w-full flex-col gap-1">
        <span>{label}</span>
        <select
          name={name}
          className="rounded border border-gray-500 px-2 py-1 text-lg"
          aria-invalid={error ? true : undefined}
          aria-errormessage={error ? `${name}-error` : undefined}
          {...rest}
        >
          {children}
        </select>
      </label>
      {error && (
        <div className="pt-1 text-red-700" id={`${name}-error`}>
          {error}
        </div>
      )}
    </div>
  );
}
