// US state/territory names + abbreviations, used to sanity-check the
// registration form's state fields once the country field resolves to the
// United States (see src/lib/countries.ts's isUnitedStates).
export const US_STATES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
  ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
  TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "District of Columbia", PR: "Puerto Rico", GU: "Guam",
  VI: "Virgin Islands", AS: "American Samoa", MP: "Northern Mariana Islands",
};

export function isKnownUsState(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (US_STATES[trimmed.toUpperCase()]) return true;
  const lower = trimmed.toLowerCase();
  return Object.values(US_STATES).some((name) => name.toLowerCase() === lower);
}
