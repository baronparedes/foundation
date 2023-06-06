import React, {useState} from 'react';

import {Transition} from '@headlessui/react';
import {Form, NavLink} from '@remix-run/react';

import LogoGMD from '../assets/img/gmd-logo-inverted.png';
import ImageGMD from '../assets/img/gmd-main-logo-no-bg.png';
import {useUser} from '../utils';
import {Button} from './@windmill';

type Props = {
  currentPage: string;
};

const PAGES = [
  { label: "Projects", route: "/projects" },
  { label: "Studios", route: "/studios" },
  { label: "Funds", route: "/funds" },
];

export default function Page({ children, currentPage }: React.PropsWithChildren<Props>) {
  const user = useUser();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <nav className="bg-slate-900 print:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between bg-slate-900 p-4 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img className="w-20" src={LogoGMD} alt="foundation" />
              </div>
              <div className="ml-10">Hi! {user.email}</div>
              <div className="hidden md:block">
                <div className="ml-10 space-x-4">
                  {PAGES.map(({ label, route }, key) => {
                    return (
                      <NavLink
                        key={key}
                        to={route}
                        className="rounded-md px-3 py-2 font-medium text-white hover:bg-gmd-700"
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
                className="inline-flex items-center justify-center rounded-md bg-gmd-900 p-2 text-gmd-400 hover:bg-gmd-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gmd-800"
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
                      className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-gmd-700"
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
      <header className="shadow">
        <div>
          <img aria-hidden="true" className="mx-auto my-2 h-24" src={ImageGMD} alt="GMD" />
        </div>
        <div className="mx-auto max-w-7xl py-1 px-4 text-right font-serif sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-black">{currentPage}</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">{children}</div>
      </main>
    </>
  );
}
