import styles from "./ContentBlocks.module.css";

type Lesson = { id: string; title: string; bodyMarkdown: string | null };

// A lesson is written (prisma/seed.ts, verbatim from docs/curriculum/01_LEARN)
// as blank-line-separated "Label: text" paragraphs. Most use the curriculum's
// standard labels (What is it, Why it matters, Example, Common mistake, Try
// this, Key takeaway, Think about it, Use this in your project), but some
// topics use their own, and those are shown exactly as the curriculum words
// them: Bias Awareness's "What is bias?", "Why can it hurt research?",
// "Example of a leading survey question" and "Better version", or Citation vs.
// Plagiarism's "Credible Sources (quick reference)". Rows are rendered in the
// order they are written; only a few labels get a special role.
type Role = "definition" | "why" | "takeaway" | "reflect" | "hidden" | "plain";

type Row = { label: string; text: string; role: Role };

function roleFor(label: string): Role {
  const key = label.toLowerCase();
  if (key.startsWith("what is")) return "definition";
  if (key.startsWith("why")) return "why";
  if (key === "key takeaway") return "takeaway";
  if (key === "think about it") return "reflect";
  // "Try this" and "Use this in your project" are not shown: the Do band
  // states the activity and the Show band asks for the answers, so they only
  // repeated them. Both stay in the lesson data.
  if (key === "try this" || key === "use this in your project") return "hidden";
  return "plain";
}

// The standard labels are stored short ("What is it", "Why it matters") and
// shown as questions; a topic's own labels are shown as written.
function headingFor(label: string): string {
  const key = label.toLowerCase();
  if (key === "what is it") return "What is it?";
  if (key === "why it matters") return "Why does it matter?";
  return label;
}

// Reads the "Label: text" paragraphs, in order. Returns null for lesson
// content that isn't written in this format (plain prose), so the caller can
// render it as-is.
function parseLessonRows(body: string): Row[] | null {
  const rows: Row[] = [];
  for (const paragraph of body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)) {
    const match = paragraph.match(/^([A-Za-z][A-Za-z ?'(),&/.-]{2,60}?):\s([\s\S]+)$/);
    if (!match) continue;
    const label = match[1].trim();
    rows.push({ label, text: match[2].trim(), role: roleFor(label) });
  }
  return rows.length >= 4 ? rows : null;
}

// Splits a definition sentence into the term being defined and the rest, so
// the term can be bolded: "Observation means paying..." -> ["Observation",
// " means paying..."]. Returns null when the sentence isn't shaped like that,
// and the whole sentence is then shown unbolded.
function splitDefinition(definition: string): [string, string] | null {
  const match = definition.match(/^(.+?)( (?:means|is) [\s\S]+)$/);
  return match ? [match[1], match[2]] : null;
}

// A row whose text runs over several lines (Citation's quick reference: one
// line each for "Usually stronger", "Use carefully", "Always ask") is shown
// as a list, with each line's own "Label:" in bold.
function MultiLine({ text }: { text: string }) {
  return (
    <ul className={styles.lessonList}>
      {text.split("\n").map((line) => {
        const match = line.match(/^([^:]{2,40}):\s(.+)$/);
        return (
          <li key={line}>
            {match ? (
              <>
                <strong>{match[1]}:</strong> {match[2]}
              </>
            ) : (
              line
            )}
          </li>
        );
      })}
    </ul>
  );
}

function RowText({ row }: { row: Row }) {
  if (row.role === "definition") {
    const parts = splitDefinition(row.text);
    return (
      <p className={styles.definitionLede}>
        <mark className={styles.definition}>
          {parts ? (
            <>
              <strong className={styles.term}>{parts[0]}</strong>
              {parts[1]}
            </>
          ) : (
            row.text
          )}
        </mark>
      </p>
    );
  }
  if (row.role === "takeaway") return <p className={styles.takeaway}>{row.text}</p>;
  if (row.role === "reflect") return <p className={styles.reflect}>{row.text}</p>;
  if (row.text.includes("\n")) return <MultiLine text={row.text} />;
  return <p className={styles.lede}>{row.text}</p>;
}

// One lesson, used inside a topic's Learn band (see TaskSection). The lesson's
// title is not repeated here: it is the section heading above the panel. One
// connected plane of numbered rows, all styled the same: the definition is
// highlighted, the key takeaway is set in the display face, and "think about
// it" is italic. Read-only; there's no per-lesson completion tracking.
export function LessonPanel({ lesson }: { lesson: Lesson }) {
  const body = lesson.bodyMarkdown ?? "";
  const rows = parseLessonRows(body);

  if (!rows) {
    return (
      <div className={styles.itemBody}>
        {body
          .split(/\n{2,}/)
          .filter((paragraph) => paragraph.trim().length > 0)
          .map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
      </div>
    );
  }

  return (
    <div className={styles.lessonBody}>
      {rows
        .filter((row) => row.role !== "hidden")
        .map((row) => (
          <section key={row.label} className={styles.lessonSection}>
            <h3 className={styles.blockLabel}>{headingFor(row.label)}</h3>
            <RowText row={row} />
          </section>
        ))}
    </div>
  );
}
