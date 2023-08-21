import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import * as React from "react";
import { createUser, getUserByEmail } from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";
import { safeRedirect, validateEmail } from "~/utils";

import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";

import ImageGMD from "../assets/img/gmd-main-logo.jpg";
import { Button } from "../components/@windmill";

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");

  if (!validateEmail(email)) {
    return json({ errors: { email: "Email is invalid", password: null } }, { status: 400 });
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { email: null, password: "Password is required" } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json(
      { errors: { email: null, password: "Password is too short" } },
      { status: 400 }
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json(
      {
        errors: {
          email: "A user already exists with this email",
          password: null,
        },
      },
      { status: 400 }
    );
  }

  const user = await createUser(email, password);

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo,
  });
}

export const meta: MetaFunction = () => {
  return {
    title: "Sign Up",
  };
};

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData<typeof action>();
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-screen items-center bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto h-full max-w-4xl flex-1 overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <div className="mx-auto p-4 md:h-auto md:w-1/2">
          <img
            aria-hidden="true"
            className="h-full w-full object-cover"
            src={ImageGMD}
            alt="Login"
          />
        </div>
        <div>
          <main className="flex items-center justify-center p-6 sm:p-12">
            <div className="w-full">
              <div className="mx-auto md:w-1/2">
                <Form method="post" className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email address
                    </label>
                    <div className="mt-1">
                      <input
                        ref={emailRef}
                        id="email"
                        required
                        autoFocus={true}
                        name="email"
                        type="email"
                        autoComplete="email"
                        aria-invalid={actionData?.errors?.email ? true : undefined}
                        aria-describedby="email-error"
                        className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                      />
                      {actionData?.errors?.email && (
                        <div className="pt-1 text-red-700" id="email-error">
                          {actionData.errors.email}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Password
                    </label>
                    <div className="mt-1">
                      <input
                        id="password"
                        ref={passwordRef}
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        aria-invalid={actionData?.errors?.password ? true : undefined}
                        aria-describedby="password-error"
                        className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                      />
                      {actionData?.errors?.password && (
                        <div className="pt-1 text-red-700" id="password-error">
                          {actionData.errors.password}
                        </div>
                      )}
                    </div>
                  </div>

                  <input type="hidden" name="redirectTo" value={redirectTo} />
                  <Button type="submit" className="w-full">
                    Create Account
                  </Button>
                  <div className="flex items-center justify-center">
                    <div className="text-center text-sm text-gray-500">
                      Already have an account?{" "}
                      <Link
                        className="text-blue-400 underline"
                        to={{
                          pathname: "/",
                          search: searchParams.toString(),
                        }}
                      >
                        Log in
                      </Link>
                    </div>
                  </div>
                </Form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
