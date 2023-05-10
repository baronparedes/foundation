type Props = {
  label?: React.ReactNode;
};

export function SearchInput({
  label,
  ...inputProps
}: React.HTMLProps<HTMLInputElement & Props>) {
  return (
    <>
      <label
        htmlFor="search"
        className="sr-only mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        Search
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            aria-hidden="true"
            className="h-5 w-5 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <input
          name="search"
          type="search"
          id="search"
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-4 pl-10 text-sm text-gray-900 focus:border-gmd-500 focus:ring-gmd-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-gmd-500 dark:focus:ring-gmd-500"
          placeholder="Search"
          {...inputProps}
        />
        <button
          type="submit"
          className="absolute right-2.5 bottom-2.5 rounded-lg bg-gmd-700 px-4 py-2 text-sm font-medium text-white hover:bg-gmd-800 focus:outline-none focus:ring-4 focus:ring-gmd-300 dark:bg-gmd-600 dark:hover:bg-gmd-700 dark:focus:ring-gmd-800"
        >
          {label ?? "Search"}
        </button>
      </div>
    </>
  );
}
