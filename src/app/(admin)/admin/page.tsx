export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h2 className="font-bold text-2xl">Administration</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Timeline Categories</h3>
          <p className="mt-1 text-muted-foreground text-sm">
            Manage timeline event categories and questions.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Favorite Types</h3>
          <p className="mt-1 text-muted-foreground text-sm">
            Configure favorite types and API providers.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="font-semibold">Users</h3>
          <p className="mt-1 text-muted-foreground text-sm">
            View and manage user accounts.
          </p>
        </div>
      </div>
    </div>
  );
}
