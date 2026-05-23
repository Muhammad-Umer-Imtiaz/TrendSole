export const AUTH_COOKIE_NAME = "trendsole_admin_token";
export const AUTH_ROLE_COOKIE_NAME = "trendsole_user_role";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export const setAuthCookie = (token: string, role?: string) => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = [
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${COOKIE_MAX_AGE}`,
    "SameSite=Strict",
  ].join("; ");

  if (role) {
    document.cookie = [
      `${AUTH_ROLE_COOKIE_NAME}=${encodeURIComponent(role)}`,
      "Path=/",
      `Max-Age=${COOKIE_MAX_AGE}`,
      "SameSite=Strict",
    ].join("; ");
  }
};

export const clearAuthCookie = () => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = [
    `${AUTH_COOKIE_NAME}=`,
    "Path=/",
    "Max-Age=0",
    "SameSite=Strict",
  ].join("; ");

  document.cookie = [
    `${AUTH_ROLE_COOKIE_NAME}=`,
    "Path=/",
    "Max-Age=0",
    "SameSite=Strict",
  ].join("; ");
};
