import type { Status } from "../../lib/types";

export function StatusBanner({ status }: { status: Status | null }) {
  if (!status) return null;
  return (
    <div className={`status ${status.type}`} role="status">
      {status.message}
    </div>
  );
}
