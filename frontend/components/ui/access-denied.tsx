export function AccessDenied({
  title = "Access Denied",
  message = "You don't have permission to access this page.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
