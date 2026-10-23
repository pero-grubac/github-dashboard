const utc = (iso) => iso.replace("T", " ").slice(0, 16) + " UTC";

// Where the dashboard data came from, for the terminal log and the footer.
export function sourceLabel(source) {
  if (source?.kind === "snapshot")
    return `build-time snapshot · generated ${utc(source.generatedAt)}`;
  return "live api.github.com (no token)";
}
