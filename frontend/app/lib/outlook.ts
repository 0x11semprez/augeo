import { OUTLOOK_BODY } from "./constants";

/**
 * Builds an Outlook Web compose deeplink.
 *
 * Outlook Web double-encodes the deeplink when redirecting through login,
 * turning %20 into "+" and mangling the body. Building the redirect URL
 * ourselves keeps the encoding intact whether the user is logged in or not.
 */
export function buildOutlookComposeUrl(subject: string, to: string) {
  const targetURL = new URL(
    "https://outlook.office.com/mail/deeplink/compose/",
  );
  if (to) targetURL.searchParams.set("to", to);
  targetURL.searchParams.set("subject", subject);
  targetURL.searchParams.set("body", OUTLOOK_BODY);
  targetURL.search = targetURL.search.replaceAll("+", "%20");

  const redirectURL = new URL("https://outlook.office.com/owa/?state=1");
  redirectURL.searchParams.set(
    "redirectTo",
    btoa(targetURL.toString()).replaceAll("=", ""),
  );
  return redirectURL.toString();
}
