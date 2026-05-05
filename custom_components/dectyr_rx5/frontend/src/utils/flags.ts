/** ISO 3166-1 alpha-3 → alpha-2 for flag emoji. */
const ISO3_TO_ISO2: Record<string, string> = {
  FRA: "FR",
  USA: "US",
  GBR: "GB",
  DEU: "DE",
  ITA: "IT",
  ESP: "ES",
  NLD: "NL",
  BEL: "BE",
  UKR: "UA",
  POL: "PL",
  CHE: "CH",
  AUT: "AT",
  CAN: "CA",
  AUS: "AU",
  JPN: "JP",
  CHN: "CN",
  IND: "IN",
  BRA: "BR",
  MEX: "MX",
  SWE: "SE",
  NOR: "NO",
  DNK: "DK",
  FIN: "FI",
  IRL: "IE",
  PRT: "PT",
  GRC: "GR",
  CZE: "CZ",
  SVK: "SK",
  HUN: "HU",
  ROU: "RO",
  BGR: "BG",
  HRV: "HR",
  SVN: "SI",
  LUX: "LU",
  MLT: "MT",
  CYP: "CY",
  EST: "EE",
  LVA: "LV",
  LTU: "LT",
  ISL: "IS",
  LIE: "LI",
  MCO: "MC",
  AND: "AD",
  SMR: "SM",
  VAT: "VA",
  RUS: "RU",
  TUR: "TR",
  ISR: "IL",
  ARE: "AE",
  SAU: "SA",
  ZAF: "ZA",
  EGY: "EG",
  MAR: "MA",
  DZA: "DZ",
  TUN: "TN",
  NGA: "NG",
  KEN: "KE",
  ARG: "AR",
  CHL: "CL",
  COL: "CO",
  PER: "PE",
  NZL: "NZ",
  KOR: "KR",
  TWN: "TW",
  SGP: "SG",
  MYS: "MY",
  THA: "TH",
  VNM: "VN",
  IDN: "ID",
  PHL: "PH",
};

/** Regional-indicator flag emoji from ISO 3166-1 alpha-3, or code fallback. */
export function countryFlag(iso3: string | null): string {
  if (!iso3) {
    return "";
  }
  const key = iso3.toUpperCase().trim();
  const iso2 = ISO3_TO_ISO2[key];
  if (!iso2 || iso2.length !== 2) {
    return iso3;
  }
  const offset = 0x1f1e6;
  const A = "A".charCodeAt(0);
  return String.fromCodePoint(
    offset + iso2.charCodeAt(0) - A,
    offset + iso2.charCodeAt(1) - A,
  );
}
