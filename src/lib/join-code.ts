// Alphabet excludes 0/O and 1/I/L — a team's join code gets read aloud or
// copied by hand between teammates, and those pairs are the most common
// transcription mistakes.
const JOIN_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateJoinCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += JOIN_CODE_ALPHABET[Math.floor(Math.random() * JOIN_CODE_ALPHABET.length)];
  }
  return code;
}
