import { ResourceManager } from "@/components/admin/ResourceManager";
import { RESOURCES } from "@/lib/admin/config";
import { listRows } from "@/lib/admin/data";

export default async function Page() {
  const resource = RESOURCES.blocked;
  const rows = await listRows(resource.table);
  return (
    <div>
      <div className="bg-white border border-line rounded-md px-5 py-4 mb-6">
        <p className="text-ink text-sm leading-relaxed">
          Anyone on this list can still RSVP for the Traditional and Wedding
          celebrations, but the <b>Reception</b> and <b>All</b> options are
          closed to them — they&rsquo;ll see &ldquo;seats are filled.&rdquo;
        </p>
        <p className="font-util text-[0.62rem] tracking-[0.12em] uppercase text-muted mt-2">
          Enter a <b>full name</b> to close one person (this also catches middle
          names, e.g. &ldquo;Kwame Mensah&rdquo; still matches &ldquo;Kwame A.
          Mensah&rdquo;). A <b>single first or last name on its own closes the
          reception for everyone who carries it</b> — use that only when you mean
          the whole family. This list is private and never shown on the site.
        </p>
      </div>
      <ResourceManager resource={resource} rows={rows} />
    </div>
  );
}
