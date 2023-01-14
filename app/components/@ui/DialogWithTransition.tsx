import React, {Fragment} from 'react';

import {Dialog, Transition} from '@headlessui/react';
import {XIcon} from '@heroicons/react/solid';

type Size = "sm" | "md" | "lg" | "xl";

type Props = {
  onCloseModal?: () => void;
  isOpen: boolean;
  title: React.ReactNode;
  isStatic?: boolean;
  size?: Size;
};

function getSize(size?: Size) {
  switch (size) {
    case "sm":
      return "max-w-sm";
    case "md":
      return "max-w-lg";
    case "xl":
      return "max-w-6xl";
    case "lg":
    default:
      return "max-w-2xl";
  }
}

export default function DialogWithTransition({
  title,
  children,
  isStatic,
  isOpen,
  size,
  onCloseModal,
}: React.PropsWithChildren<Props>) {
  function handleOnClose() {
    if (onCloseModal) {
      onCloseModal();
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="top-0 left-0 right-0 bottom-0 z-10 overflow-auto"
        onClose={() => {}}
        static={isStatic}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full ${getSize(
                  size
                )} transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all`}
              >
                <Dialog.Title
                  as="h3"
                  className=" mb-6 text-lg font-medium leading-6 text-gray-900"
                >
                  <div className="flex">
                    <div className="flex-1">{title}</div>
                    <div className="flex cursor-pointer">
                      <XIcon
                        className="h-5 w-5 text-red-600 hover:text-red-800"
                        onClick={handleOnClose}
                      />
                    </div>
                  </div>
                </Dialog.Title>
                <hr className="my-4" />
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
