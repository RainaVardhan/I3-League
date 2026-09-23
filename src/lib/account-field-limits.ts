// Maximum length of every free-text field on the auth/registration/payment
// forms (StudentRegistrationForm, ParentProfileForm, PaymentForm, SignupForm,
// LoginForm, ForgotPasswordForm, ResetPasswordForm) — the same "server is the
// real limit, the form just matches it" convention as TEXT_LIMITS
// (src/lib/stage-field-limits.ts) and JOURNAL_TEXT_LIMIT/CONTRIBUTION_TEXT_LIMIT.
// Kept in its own file since these fields belong to account/registration
// flows, not the curriculum stages TEXT_LIMITS covers.
//
// None of these values are about "how much text is a reasonable answer" —
// isReasonableName/isReasonablePlace (src/lib/reasonable-text.ts) already
// handle that for names and places. These exist purely so a very long
// input (typed, pasted, or sent by a direct POST past the browser's own
// maxLength) is rejected before it reaches the database or an external API
// (Supabase Auth), instead of silently accepted at any size.

/** RFC 5321's own limit on a full email address. */
export const EMAIL_MAX_LENGTH = 254;

/** Generous for any real password; bcrypt itself only uses the first 72
 *  bytes regardless, so anything past this is pure overhead, not security. */
export const PASSWORD_MAX_LENGTH = 128;

export const PHONE_MAX_LENGTH = 20;

/** The raw typed grade string, before parseGradeNumber narrows it to 6-12. */
export const GRADE_MAX_LENGTH = 10;

export const COUNTRY_MAX_LENGTH = 100;

export const TEAM_NAME_MAX_LENGTH = 100;

/** Real join codes are 6 characters (src/lib/join-code.ts); a little extra
 *  room in case a student pastes one with stray whitespace. */
export const JOIN_CODE_MAX_LENGTH = 12;

export const PAYMENT_REFERENCE_MAX_LENGTH = 200;
