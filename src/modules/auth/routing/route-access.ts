import { notFound, redirect } from "@tanstack/react-router";

import { getPostLoginPath, ROUTES } from "@/config/routes.config";
import { storageService } from "@/services/storage.service";

import { getCurrentUser } from "../services/auth.service";
import type { AuthUserDto, UserRole } from "../types/auth.types";

type RoleMismatchBehavior = "redirect" | "not-found";

interface RouteAccessOptions {
  allowedRoles: readonly UserRole[];
  onRoleMismatch?: RoleMismatchBehavior;
}

interface RouteAccessDependencies {
  isBrowser: boolean;
  getAccessToken: () => string | null;
  clearSession: () => void;
  getUser: () => Promise<AuthUserDto>;
}

interface RouteGuardInput {
  context?: RouteAccessContext;
}

export interface RouteAccessContext {
  currentUser?: AuthUserDto;
}

const MEMBER_ROLES = ["owner", "contributor"] as const;

const defaultDependencies: RouteAccessDependencies = {
  isBrowser: typeof window !== "undefined",
  getAccessToken: storageService.getAccessToken,
  clearSession: storageService.clearTokens,
  getUser: getCurrentUser,
};

function isAuthenticationFailure(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return false;
  }

  const response = error.response;
  if (typeof response !== "object" || response === null || !("status" in response)) {
    return false;
  }

  return response.status === 401 || response.status === 403;
}

function enforceAllowedRole(
  currentUser: AuthUserDto,
  options: RouteAccessOptions,
): RouteAccessContext {
  if (!options.allowedRoles.includes(currentUser.role)) {
    if (options.onRoleMismatch === "not-found") {
      throw notFound();
    }

    throw redirect({ to: getPostLoginPath(currentUser) });
  }

  return { currentUser };
}

export async function requireRouteAccess(
  options: RouteAccessOptions,
  dependencies: RouteAccessDependencies = defaultDependencies,
): Promise<RouteAccessContext> {
  if (!dependencies.isBrowser) {
    return {};
  }

  if (!dependencies.getAccessToken()) {
    throw redirect({ to: ROUTES.login });
  }

  let currentUser: AuthUserDto;
  try {
    currentUser = await dependencies.getUser();
  } catch (error) {
    if (isAuthenticationFailure(error)) {
      dependencies.clearSession();
      throw redirect({ to: ROUTES.login });
    }

    throw error;
  }

  return enforceAllowedRole(currentUser, options);
}

function requireNestedRouteAccess(
  input: RouteGuardInput | undefined,
  options: RouteAccessOptions,
): Promise<RouteAccessContext> {
  const currentUser = input?.context?.currentUser;
  if (currentUser) {
    return Promise.resolve(enforceAllowedRole(currentUser, options));
  }

  return requireRouteAccess(options);
}

export function requireMemberRoute(
  input?: RouteGuardInput,
): Promise<RouteAccessContext> {
  return requireNestedRouteAccess(input, { allowedRoles: MEMBER_ROLES });
}

export function requireContributorRoute(
  input?: RouteGuardInput,
): Promise<RouteAccessContext> {
  return requireNestedRouteAccess(input, { allowedRoles: ["contributor"] });
}

export function requireOwnerRoute(
  input?: RouteGuardInput,
): Promise<RouteAccessContext> {
  return requireNestedRouteAccess(input, { allowedRoles: ["owner"] });
}

export function requireAdminRoute(
  input?: RouteGuardInput,
): Promise<RouteAccessContext> {
  return requireNestedRouteAccess(input, {
    allowedRoles: ["admin"],
    onRoleMismatch: "not-found",
  });
}
