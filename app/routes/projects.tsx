import type { LoaderArgs } from "@remix-run/node";
import {requireUserId} from '~/session.server';
import {useUser} from '~/utils';

import {json} from '@remix-run/node';
import {Link, NavLink, useLoaderData} from '@remix-run/react';

import Header from '../components/Header';
import Layout from '../components/Layout';
import {getProjectsByUserId} from '../models/project.server';

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const projects = await getProjectsByUserId({ userId });
  return json({ projects });
}

export default function NotesPage() {
  const data = useLoaderData<typeof loader>();
  const user = useUser();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <Header page="Projects" to="." email={user.email} />
      <Layout>
        <Link to="new" className="block p-4 text-xl text-blue-500">
          + Project
        </Link>

        <hr />

        {data.projects.length === 0 ? (
          <p className="p-4">No projects yet</p>
        ) : (
          <ol>
            {data.projects.map((project) => (
              <li key={project.id}>
                <NavLink
                  className={({ isActive }) =>
                    `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                  }
                  to={project.id}
                >
                  🏢 {project.name}
                </NavLink>
              </li>
            ))}
          </ol>
        )}
      </Layout>
    </div>
  );
}
