import { MAINTENANCE_BACK_ON, isMaintenance } from "@/lib/maintenance";

/**
 * Quiet banner above the hero explaining why parts of the page are missing.
 * Renders nothing once the maintenance window has passed. See lib/maintenance.
 */
export function MaintenanceNotice() {
  if (!isMaintenance()) return null;

  return (
    <aside className="maint" role="status">
      <div className="wrap">
        <p className="maint-eyebrow">Scheduled maintenance</p>
        <p className="maint-body">
          Some parts of our site are temporarily unavailable while we make a few
          improvements. Everything will be back on{" "}
          <strong>{MAINTENANCE_BACK_ON}</strong>.
        </p>
        <p className="maint-assure">Our wedding dates have not changed.</p>
      </div>
    </aside>
  );
}
