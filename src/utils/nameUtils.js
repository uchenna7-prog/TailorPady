export function getInitials(name) {
  if (!name) return ""

  const titles = [
    // Common
    "mr", "mrs", "miss", "ms", "mister", "mistress", "master",

    // Medical
    "dr", "doctor", "prof", "professor", "nurse", "midwife",
    "pharm", "pharmacist", "dent", "dentist", "vet", "veterinarian",

    // Legal
    "bar", "barrister", "solicitor", "atty", "attorney", "esq", "esquire", "notary",

    // Academic
    "assoc", "asst", "lecturer", "dean",

    // Religious — Christian
    "rev", "reverend", "pastor", "bishop", "archbishop", "cardinal",
    "father", "fr", "sister", "sr", "brother", "br", "deacon", "deaconess",
    "apostle", "evangelist", "prophet", "prophetess", "elder", "pope",

    // Religious — Islamic
    "imam", "sheikh", "shaikh", "maulana", "mullah", "mallam", "alfa",
    "alhaji", "alhaja", "al-hajj",

    // Religious — Jewish
    "rabbi", "cantor",

    // Honorific / Professional
    "sir", "madam", "dame", "hon", "honorable", "honourable",
    "eng", "engineer", "arch", "architect", "surveyor",
    "snr", "jnr", "senior", "junior",

    // Nigerian / West African Traditional
    "oba", "obi", "igwe", "eze", "lolo", "ozo", "otunba", "erelu",
    "iyalode", "baale", "olori", "oluwo", "aragoro", "asiwaju", "waziri",
    "sarki", "emir", "emira", "sultan",

    // Royalty / Nobility
    "prince", "princess", "king", "queen", "duke", "duchess",
    "lord", "lady", "baron", "baroness", "earl", "count", "countess",
    "viscount", "viscountess", "marquis", "marquess", "archduke",

    // Military / Paramilitary
    "gen", "general", "col", "colonel", "maj", "major",
    "capt", "captain", "lt", "lieutenant", "sgt", "sergeant",
    "cpl", "corporal", "pvt", "private", "adm", "admiral",
    "cmdr", "commander", "brig", "brigadier", "cso", "dsp", "asp",

    // Government / Political
    "gov", "governor", "sen", "senator", "rep", "representative",
    "amb", "ambassador", "consul", "pres", "president", "vp",
    "min", "minister", "sec", "secretary", "cllr", "councillor",
    "mp", "mla", "mga",

    // Corporate
    "ceo", "cfo", "coo", "cto", "cmo", "md", "gm", "dir", "director",
    "mgr", "manager",

    // Misc
    "chief", "high", "most", "right", "very", "rt",
  ]

  const parts = name
    .toLowerCase()
    .replace(/\./g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  const filtered = parts.filter(word => !titles.includes(word))

  if (filtered.length === 0) return ""

  if (filtered.length === 1) {
    const single = filtered[0].replace(/-/g, "")
    return single.slice(0, 2).toUpperCase()
  }

  const first = filtered[0]
  const last  = filtered[filtered.length - 1]

  const firstInitial = first.replace(/-/g, "")[0]
  const lastInitial  = last.replace(/-/g, "")[0]

  return (firstInitial + lastInitial).toUpperCase()
}