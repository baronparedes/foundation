import React, {useState} from 'react';

import {Transition} from '@headlessui/react';
import {Form, NavLink} from '@remix-run/react';

import {useUser} from '../utils';
import {Button} from './@windmill';

type Props = {
  currentPage: string;
};

const PAGES = [
  { label: "Projects", route: "/projects" },
  { label: "Funds", route: "/funds" },
];

export default function Page({ children, currentPage }: React.PropsWithChildren<Props>) {
  const user = useUser();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <nav className="bg-gray-800 print:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between bg-slate-800 p-4 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-8 w-8"
                  src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg"
                  alt="Workflow"
                />
              </div>
              <div className="ml-10">Hi! {user.email}</div>
              <div className="hidden md:block">
                <div className="ml-10 space-x-4">
                  {PAGES.map(({ label, route }, key) => {
                    return (
                      <NavLink
                        key={key}
                        to={route}
                        className="rounded-md px-3 py-2 font-medium text-white hover:bg-gray-700"
                      >
                        {label}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
              <div className="ml-4 hidden md:block">
                <Form action="/logout" method="post">
                  <Button type="submit">Logout</Button>
                </Form>
              </div>
            </div>
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="inline-flex items-center justify-center rounded-md bg-gray-900 p-2 text-gray-400 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {!isOpen ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        <Transition
          show={isOpen}
          enter="transition ease-out duration-100 transform"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-75 transform"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          {(ref) => (
            <div className="md:hidden" id="mobile-menu">
              <div ref={ref} className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                {PAGES.map(({ label, route }, key) => {
                  return (
                    <NavLink
                      key={key}
                      to={route}
                      className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-gray-700"
                    >
                      {label}
                    </NavLink>
                  );
                })}
                <Form action="/logout" method="post">
                  <Button type="submit">Logout</Button>
                </Form>
              </div>
            </div>
          )}
        </Transition>
      </nav>
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">{currentPage}</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">{children}</div>
      </main>
    </>
  );
}
