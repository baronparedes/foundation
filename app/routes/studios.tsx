import type { LoaderArgs } from "@remix-run/node";
import {requireUserId} from '~/session.server';

import {json} from '@remix-run/node';
import {Link, NavLink, Outlet, useLoaderData} from '@remix-run/react';

import Page from '../components/Page';
import {getStudiosByUserId} from '../models/studio.server';

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const studios = await getStudiosByUserId({ userId });
  return json({ studios });
}

export default function StudiossPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <Page currentPage="Studios">
      <div className="sm:py-4 md:flex">
        <div className="flex-none">
          <Link to="new" className="block p-4 text-xl text-blue-500 hover:bg-sky-100">
            + Studio
          </Link>
          {data.studios.length === 0 ? (
            <p className="p-4">No studios yet</p>
          ) : (
            <ol>
              {data.studios.map((studio) => (
                <li key={studio.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block p-4 text-xl hover:bg-sky-100 ${isActive ? "bg-white" : ""}`
                    }
                    to={studio.id}
                  >
                    {studio.name}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    </Page>
  );
}
