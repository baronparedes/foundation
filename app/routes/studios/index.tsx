import { Link } from "@remix-run/react";

export default function ProjectIndexPage() {
  return (
    <p>
      Select a studio or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new one.
      </Link>
    </p>
  );
}
