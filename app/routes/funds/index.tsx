import { Link } from "@remix-run/react";

export default function FundIndexPage() {
  return (
    <p>
      Select a wallet or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new one.
      </Link>
    </p>
  );
}
