export function validateDisposableProjectRef(projectRef, configuredUrl) {
  if (!projectRef || !/^[a-z0-9]{20}$/u.test(projectRef)) {
    throw new Error("Set SUPABASE_DB_TEST_PROJECT_REF to the explicitly authorized disposable Supabase project reference.");
  }

  let target;
  try {
    target = new URL(configuredUrl ?? "");
  } catch {
    throw new Error("A valid Supabase URL is required to verify the disposable test target.");
  }

  if (
    target.protocol !== "https:"
    || target.hostname !== `${projectRef}.supabase.co`
    || target.username
    || target.password
    || target.pathname !== "/"
    || target.search
    || target.hash
  ) {
    throw new Error("The explicit disposable project reference does not match the configured Supabase target.");
  }

  return projectRef;
}
