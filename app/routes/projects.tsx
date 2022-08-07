import type { LoaderArgs } from "@remix-run/node";
import {requireUserId} from '~/session.server';

import {json} from '@remix-run/node';
import {Link, NavLink, Outlet, useLoaderData} from '@remix-run/react';

import Page from '../components/Page';
import {getProjectsByUserId} from '../models/project.server';

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const projects = await getProjectsByUserId({ userId });
  return json({ projects });
}

export default function ProjectsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <Page currentPage="Projects">
      <div className="sm:py-4 md:flex">
        <div className="flex-none">
          <Link
            to="new"
            className="block p-4 text-xl text-blue-500 hover:bg-sky-100"
          >
            + Project
          </Link>
          {data.projects.length === 0 ? (
            <p className="p-4">No projects yet</p>
          ) : (
            <ol>
              {data.projects.map((project) => (
                <li key={project.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block p-4 text-xl hover:bg-sky-100 ${
                        isActive ? "bg-white" : ""
                      }`
                    }
                    to={project.id}
                  >
                    🏢 {project.name}
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
