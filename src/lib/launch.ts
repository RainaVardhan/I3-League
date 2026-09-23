// Launch switch. While the platform is closed, people can still sign up and
// log in, but registration, consent, payment and the whole student dashboard
// are unreachable (the dashboard shows a "coming soon" card instead).
// Admins are exempt so they can keep working.
//
// Nothing was deleted to make this work: set PLATFORM_OPEN=true in .env
// (and restart the server) to turn everything back on. Default is CLOSED, so
// forgetting the variable fails safe.
export function isPlatformOpen(): boolean {
  return process.env.PLATFORM_OPEN === "true";
}
