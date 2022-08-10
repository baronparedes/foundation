type Props = React.HTMLProps<HTMLTextAreaElement> & {
  error?: string | null;
  name: string;
  label: string;
};

export default function TextArea({ error, name, label, ...rest }: Props) {
  return (
    <div>
      <label className="flex w-full flex-col gap-1">
        <span>{label}</span>
        <textarea
          name={name}
          rows={4}
          className="rounded border border-gray-500 px-2 py-1 text-lg leading-6"
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
