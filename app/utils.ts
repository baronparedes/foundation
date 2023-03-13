import moment from "moment";
import { useMemo } from "react";

import { useMatches } from "@remix-run/react";

import type { User } from "~/models/user.server";
const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(id: string): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}

function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.email === "string";
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}

export function formatCurrency(num?: number) {
  num = num ? num : 0;
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

export function formatCurrencyFixed(num?: number) {
  num = num ? num : 0;
  return num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

export function roundOff(num?: number) {
  if (!num) return 0;
  return num === 0 ? 0 : Math.round(num * 100) / 100;
}

export function sum(numbers: number[] | undefined) {
  if (!numbers || numbers.length === 0) return 0;
  return numbers.reduce((p, c) => Number(p) + Number(c));
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export function validateRequiredString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

export function isBetweenDates(from: Date, to: Date | null, target: Date) {
  const result = moment(target).isBetween(from, to, "days", "[]");
  return result;
}

export function isBeforeDate(target: Date, beforeDate: Date) {
  const result = moment(target).isBefore(beforeDate);
  return result;
}
