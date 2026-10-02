import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: transcripts, error } = await supabase
    .from("transcripts")
    .select("id, job_id, video_id, source_url, language_code, language_name, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (
    <div className="auth-shell dashboard-shell">
      <div className="dashboard-header">
        <div>
          <p className="panel-kicker">Your workspace</p>
          <h1>Dashboard</h1>
        </div>
        <LogoutButton />
      </div>

      <div className="dashboard-card">
        <p>
          Signed in as <strong>{user.email ?? "Authenticated user"}</strong>
        </p>
        <div className="dashboard-actions">
          <Link href="/" className="secondary-link">Return home</Link>
        </div>
      </div>

      <div className="dashboard-card">
        <h2>Transcript history</h2>
        {transcripts && transcripts.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Video</th>
                  <th>Language</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Open</th>
                </tr>
              </thead>
              <tbody>
                {transcripts.map((transcript: { id: string; video_id: string; source_url: string; language_code: string; language_name: string; created_at: string; }) => (
                  <tr key={transcript.id}>
                    <td>{transcript.video_id ?? transcript.source_url}</td>
                    <td>{transcript.language_name ?? transcript.language_code ?? "—"}</td>
                    <td>completed</td>
                    <td>{new Date(transcript.created_at).toLocaleString()}</td>
                    <td>
                      <Link href={`/transcripts/${transcript.id}`} className="secondary-link">Open</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-state">No transcripts yet. Submit a YouTube URL to create your first transcript.</p>
        )}
      </div>
    </div>
  );
}
