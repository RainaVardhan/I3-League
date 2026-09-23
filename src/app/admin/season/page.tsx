import { Checkbox } from "@/components/design-system/Checkbox";
import { AdminShell } from "@/components/admin/AdminShell";
import { Input } from "@/components/design-system/Input";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { requireAdmin } from "@/lib/admin";
import { getActiveSeason, formatSeasonDate } from "@/lib/season";
import { prisma } from "@/lib/prisma";
import { SEASON_FIELD_LABELS, formatSeasonHistoryValue, type SeasonFieldKey } from "@/lib/season-history";
import hub from "../AdminHub.module.css";
import { updateSeasonAction, createSeasonAction, activateSeasonAction } from "./actions";

const SEASON_SETTINGS_FORM_ID = "season-settings-form";
const NEW_SEASON_FORM_ID = "new-season-form";

export const metadata = {
  title: "Season | Admin | I³ League",
};

// <input type="date"> wants "YYYY-MM-DD"; Season dates are read/written at
// UTC midnight throughout this codebase (see formatSeasonDate), so this
// slices the ISO string rather than using local-timezone getters, which
// could shift the date by a day depending on the server's own timezone.
function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

// Season Management (CLAUDE.md Sprint 6). Edits the currently active season
// in place (every field here is one CLAUDE.md names as "Season-driven
// config" that must never be hard-coded into a template), can create a new
// season (e.g. rolling over to 2027-2028), and can switch which one is
// active, per updateSeasonAction/createSeasonAction/activateSeasonAction in
// ./actions.ts. Grouped into two halves rather than interleaved: which
// season (the live snapshot, every season on file, creating a new one, and
// the log of every create/activate) comes first, then the live season's own
// field-level settings (the edit form, then its own edit history) comes
// second — each action is still followed immediately by its own history,
// just grouped with the other season-level vs. field-level concerns.
export default async function AdminSeasonPage() {
  const { admin } = await requireAdmin();
  const season = await getActiveSeason();
  const allSeasons = await prisma.season.findMany({ orderBy: { openDate: "desc" } });

  // Every past edit to this Season row, newest first — the AuditLog rows
  // updateSeasonAction writes (one per save that actually changed
  // something, with a from/to per changed field), so nothing about the
  // history here is derived or guessed; it's exactly what was written.
  const history = await prisma.auditLog.findMany({
    where: { targetType: "Season", targetId: season.id, action: "SEASON_UPDATED" },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { actor: { include: { admin: true } } },
  });

  // Creating a season or switching which one is active are both rarer,
  // bigger-consequence actions than an ordinary field edit above, and they
  // aren't scoped to any one season's own id the way an edit is (a
  // creation's targetId is the *new* season, an activation's is whichever
  // one got switched on) — so this is a separate, site-wide log rather than
  // folded into the per-season edit history above.
  const seasonEvents = await prisma.auditLog.findMany({
    where: { targetType: "Season", action: { in: ["SEASON_CREATED", "SEASON_ACTIVATED"] } },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { actor: { include: { admin: true } } },
  });

  return (
    <AdminShell adminName={admin.fullName} breadcrumb="Season">
      <section className={hub.sectionPaper}>
        <div className={hub.inner}>
          <p className={hub.eyebrow}>Season</p>
          <h1 className={hub.heading}>{season.label}</h1>
          <p className={hub.lead}>
            Opened {formatSeasonDate(season.openDate)} · curriculum {season.curriculumVersion} · active season for
            every public page and every student&apos;s registration.
          </p>

          <div className={hub.panel}>
            <div className={hub.row}>
              <p className={hub.rowLabel}>Spring qualification deadline</p>
              <p className={hub.rowValue}>{formatSeasonDate(season.springQualifyDeadline)}</p>
            </div>
            <div className={hub.row}>
              <p className={hub.rowLabel}>Summer qualification deadline</p>
              <p className={hub.rowValue}>{formatSeasonDate(season.summerQualifyDeadline)}</p>
            </div>
            <div className={hub.row}>
              <p className={hub.rowLabel}>National Finals</p>
              <p className={hub.rowValue}>{formatSeasonDate(season.nationalFinalsDate)}</p>
            </div>
            <div className={hub.row}>
              <p className={hub.rowLabel}>Per-participant price · max team size</p>
              <p className={hub.rowValue}>
                ${season.perParticipantPriceUsd.toString()} · up to {season.maxTeamSize}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={hub.sectionBlue}>
        <div className={hub.inner}>
          <p className={hub.eyebrow}>All seasons</p>
          <h2 className={hub.heading}>Every season on file</h2>
          <p className={hub.lead}>
            One row is active at a time. Every public page and every student&apos;s registration/dashboard
            reads that one; activating a different season here switches it immediately, site-wide.
          </p>

          <div className={hub.panel}>
            {allSeasons.map((row) => (
              <div key={row.id} className={hub.row}>
                <div className={hub.rowMain}>
                  <p className={hub.rowTitle}>
                    {row.label} {row.isActive && <span className={hub.tagBlue}>Active</span>}
                  </p>
                  <p className={hub.rowMeta}>
                    Opens {formatSeasonDate(row.openDate)} · curriculum {row.curriculumVersion} · $
                    {row.perParticipantPriceUsd.toString()}/participant
                  </p>
                </div>
                {!row.isActive && (
                  <div className={hub.rowActions}>
                    <ConfirmSubmitButton
                      formId={`activate-season-${row.id}`}
                      label="Activate"
                      title={`Make ${row.label} the active season?`}
                      message={`This immediately switches pricing, FAQs, the how-it-works page, competition policies, and every student's payment/dashboard check over to ${row.label}. It does not move any student's existing enrollment or payment from ${season.label} to ${row.label}: a student already enrolled in ${season.label} will need an enrollment and a verified payment in ${row.label} too before their dashboard reads as paid for it. This can be reversed by activating ${season.label} again, but not undone automatically.`}
                      confirmLabel={`Yes, activate ${row.label}`}
                    />
                    <form id={`activate-season-${row.id}`} action={activateSeasonAction}>
                      <input type="hidden" name="seasonId" value={row.id} />
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={hub.sectionPaper}>
        <div className={hub.inner}>
          <p className={hub.eyebrow}>New season</p>
          <h2 className={hub.heading}>Create a season</h2>
          <p className={hub.lead}>
            For rolling over to a new year (e.g. 2027-2028) ahead of time. The new season is created
            inactive, so the live site keeps running on {season.label} until you activate it above, whenever
            you&apos;re ready. Copying {season.label}&apos;s curriculum content over is on by default so the
            new season&apos;s stage pages actually have lessons and activities the moment it does go active;
            leave it unchecked only if you plan to load different content another way.
          </p>

          <form id={NEW_SEASON_FORM_ID} action={createSeasonAction} className={hub.formGrid}>
            <input type="hidden" name="cloneFromSeasonId" value={season.id} />
            <Input label="Season label" id="new-season-label" name="label" placeholder="2027-2028" maxLength={30} required />
            <Input label="Opens" id="new-season-openDate" name="openDate" type="date" required />
            <Input
              label="Spring qualification deadline"
              id="new-season-springQualifyDeadline"
              name="springQualifyDeadline"
              type="date"
              required
            />
            <Input
              label="Summer qualification deadline"
              id="new-season-summerQualifyDeadline"
              name="summerQualifyDeadline"
              type="date"
              required
            />
            <Input
              label="National Finals date"
              id="new-season-nationalFinalsDate"
              name="nationalFinalsDate"
              type="date"
              required
            />
            <Input
              label="Price per participant (USD)"
              id="new-season-perParticipantPriceUsd"
              name="perParticipantPriceUsd"
              type="number"
              min={1}
              max={10000}
              step="0.01"
              defaultValue={season.perParticipantPriceUsd.toString()}
              required
            />
            <Input
              label="Max team size"
              id="new-season-maxTeamSize"
              name="maxTeamSize"
              type="number"
              min={1}
              max={10}
              step={1}
              defaultValue={season.maxTeamSize}
              required
            />
            <Input
              label="Curriculum version"
              id="new-season-curriculumVersion"
              name="curriculumVersion"
              defaultValue={season.curriculumVersion}
              maxLength={50}
              required
            />
            <Input
              label="PayPal.me link"
              id="new-season-paypalLink"
              name="paypalLink"
              defaultValue={season.paypalLink ?? ""}
              maxLength={300}
              placeholder="https://paypal.me/i3league"
            />
            <Input
              label="Venmo handle"
              id="new-season-venmoHandle"
              name="venmoHandle"
              defaultValue={season.venmoHandle ?? ""}
              maxLength={100}
              placeholder="@i3league"
            />
            <Input
              label="Zelle info"
              id="new-season-zelleInfo"
              name="zelleInfo"
              defaultValue={season.zelleInfo ?? ""}
              maxLength={300}
              placeholder="payments@i3league.org"
            />
            <div className={hub.formWide}>
              <Checkbox
                id="new-season-cloneCurriculum"
                name="cloneCurriculum"
                defaultChecked
                label={`Copy ${season.label}'s curriculum content (lessons and activities) into the new season`}
              />
            </div>

            <div className={hub.formSubmitRow}>
              <ConfirmSubmitButton
                formId={NEW_SEASON_FORM_ID}
                label="Create season"
                title="Create this new season?"
                message="This adds a new, inactive Season row: nothing on the live site changes until you activate it separately. Creating it with a label that's already in use is refused."
                confirmLabel="Yes, create season"
              />
            </div>
          </form>
        </div>
      </section>

      <section className={hub.sectionBlue}>
        <div className={hub.inner}>
          <p className={hub.eyebrow}>Season log</p>
          <h2 className={hub.heading}>Created and activated</h2>
          <p className={hub.lead}>Every season created and every switch of the active season, across all seasons.</p>

          <div className={hub.panel}>
            {seasonEvents.length === 0 ? (
              <p className={hub.empty}>No season created or activated yet.</p>
            ) : (
              seasonEvents.map((entry) => {
                const label = (entry.metadata as { label?: string } | null)?.label ?? "a season";
                const actorName = entry.actor.admin?.fullName ?? entry.actor.email;
                const verb = entry.action === "SEASON_CREATED" ? "Created" : "Activated";
                return (
                  <div key={entry.id} className={hub.rowWrap}>
                    <p className={hub.rowLabel}>
                      {actorName} · {formatSeasonDate(entry.createdAt)}
                    </p>
                    <p className={hub.rowValueWrap}>
                      {verb} {label}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className={hub.sectionPaper}>
        <div className={hub.inner}>
          <p className={hub.eyebrow}>Edit</p>
          <h2 className={hub.heading}>Update season settings</h2>
          <p className={hub.lead}>
            Changes apply immediately across the site: pricing, FAQs, the how-it-works page, competition
            policies, and payment/registration all read this Season record directly, nothing is
            hard-coded.
          </p>

          <form id={SEASON_SETTINGS_FORM_ID} action={updateSeasonAction} className={hub.formGrid}>
            <input type="hidden" name="seasonId" value={season.id} />

            <Input
              label="Spring qualification deadline"
              id="springQualifyDeadline"
              name="springQualifyDeadline"
              type="date"
              defaultValue={toDateInputValue(season.springQualifyDeadline)}
              required
            />
            <Input
              label="Summer qualification deadline"
              id="summerQualifyDeadline"
              name="summerQualifyDeadline"
              type="date"
              defaultValue={toDateInputValue(season.summerQualifyDeadline)}
              required
            />
            <Input
              label="National Finals date"
              id="nationalFinalsDate"
              name="nationalFinalsDate"
              type="date"
              defaultValue={toDateInputValue(season.nationalFinalsDate)}
              required
            />
            <Input
              label="Price per participant (USD)"
              id="perParticipantPriceUsd"
              name="perParticipantPriceUsd"
              type="number"
              min={1}
              max={10000}
              step="0.01"
              defaultValue={season.perParticipantPriceUsd.toString()}
              required
            />
            <Input
              label="Max team size"
              id="maxTeamSize"
              name="maxTeamSize"
              type="number"
              min={1}
              max={10}
              step={1}
              defaultValue={season.maxTeamSize}
              required
            />
            <Input
              label="Curriculum version"
              id="curriculumVersion"
              name="curriculumVersion"
              defaultValue={season.curriculumVersion}
              maxLength={50}
              required
            />
            <Input
              label="PayPal.me link"
              id="paypalLink"
              name="paypalLink"
              defaultValue={season.paypalLink ?? ""}
              maxLength={300}
              placeholder="https://paypal.me/i3league"
            />
            <Input
              label="Venmo handle"
              id="venmoHandle"
              name="venmoHandle"
              defaultValue={season.venmoHandle ?? ""}
              maxLength={100}
              placeholder="@i3league"
            />
            <Input
              label="Zelle info"
              id="zelleInfo"
              name="zelleInfo"
              defaultValue={season.zelleInfo ?? ""}
              maxLength={300}
              placeholder="payments@i3league.org"
            />

            <div className={hub.formSubmitRow}>
              <ConfirmSubmitButton
                formId={SEASON_SETTINGS_FORM_ID}
                label="Save season settings"
                title="Save these season settings?"
                message={`Changes apply immediately across the site the moment you confirm: pricing, FAQs, the how-it-works page, competition policies, and payment/registration all read ${season.label} directly. This can't be undone, only edited again.`}
                confirmLabel="Yes, save changes"
              />
            </div>
          </form>
          <p className={hub.formNote}>This edits {season.label} in place.</p>
        </div>
      </section>

      <section className={hub.sectionBlue}>
        <div className={hub.inner}>
          <p className={hub.eyebrow}>History</p>
          <h2 className={hub.heading}>Edit history</h2>
          <p className={hub.lead}>
            Every saved change to {season.label}, kept permanently. Nothing here is overwritten, only
            added to.
          </p>

          <div className={hub.panel}>
            {history.length === 0 ? (
              <p className={hub.empty}>No edits yet.</p>
            ) : (
              history.map((entry) => {
                const changes = (entry.metadata as { changes?: Record<string, { from: unknown; to: unknown }> } | null)
                  ?.changes;
                const changeKeys = changes ? (Object.keys(changes) as SeasonFieldKey[]) : [];
                const actorName = entry.actor.admin?.fullName ?? entry.actor.email;
                return (
                  <div key={entry.id} className={hub.rowWrap}>
                    <p className={hub.rowLabel}>
                      {actorName} · {formatSeasonDate(entry.createdAt)}
                    </p>
                    {changeKeys.length === 0 ? (
                      <p className={hub.rowValueWrap}>No field changes recorded.</p>
                    ) : (
                      <p className={hub.rowValueWrap}>
                        {changeKeys
                          .map((field) => {
                            const change = changes![field];
                            const label = SEASON_FIELD_LABELS[field] ?? field;
                            const from = formatSeasonHistoryValue(field, change.from as string | number | null);
                            const to = formatSeasonHistoryValue(field, change.to as string | number | null);
                            return `${label}: ${from} → ${to}`;
                          })
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
