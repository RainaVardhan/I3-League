import styles from "./ContactChannels.module.css";

const CHANNELS = [
  {
    kicker: "GENERAL",
    title: "General Questions",
    body: "Anything about the program, the curriculum, or how I³ League works.",
    email: "info@i3league.com",
  },
  {
    kicker: "REGISTRATION",
    title: "Registration & Payment",
    body: "Help with signing up, team setup, or a payment confirmation.",
    email: "registration@i3league.com",
  },
  {
    kicker: "PARTNERSHIPS",
    title: "Schools & Partnerships",
    body: "Coaches, schools, and organizations interested in bringing I³ League to their students.",
    email: "partners@i3league.com",
  },
];

// No contact form or ticketing system exists yet (no ContactSubmission
// model, no email-sending service configured — see CLAUDE.md tech stack).
// A working form would need real send infrastructure this MVP doesn't have
// yet, so this stays static mailto links, matching Contact Us's Sprint 2
// scope alongside the other content-only pages.
export function ContactChannels() {
  return (
    <section className={styles.section} aria-label="Contact channels">
      <div className={styles.inner}>
        <div className={styles.grid}>
          {CHANNELS.map((channel) => (
            <article key={channel.kicker} className={styles.card}>
              <span className={styles.kicker}>{channel.kicker}</span>
              <h3>{channel.title}</h3>
              <p>{channel.body}</p>
              <a className={styles.email} href={`mailto:${channel.email}`}>
                {channel.email}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
