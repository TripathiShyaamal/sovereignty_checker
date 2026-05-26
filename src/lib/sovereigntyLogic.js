// Data Sovereignty Checker — risk assessment + dynamic content generation
// All logic runs client-side. No backend calls.

export const INDUSTRIES = [
  "Financial Services and Banking",
  "Healthcare and Life Sciences",
  "Government and Public Sector",
  "Legal and Compliance",
  "Energy and Utilities",
  "Retail and E-commerce",
  "Technology and SaaS",
  "Manufacturing and Supply Chain",
  "Other",
];

export const COMPANY_SIZES = [
  "Under 200 employees",
  "200 to 1000",
  "1000 to 5000",
  "Over 5000",
];

export const DATA_LOCATIONS = [
  "Fully on public cloud SaaS platforms such as Snowflake Databricks or BigQuery",
  "Mix of cloud SaaS and some on-premises systems",
  "Mostly self-managed in our own cloud account",
  "Fully on-premises or private infrastructure",
];

export const JURISDICTIONS = ["Yes", "No", "Not Sure"];

export const PRIORITIES = [
  "Cost predictability",
  "Compliance and data residency",
  "Vendor independence",
  "Speed of setup",
  "Full control over our infrastructure",
];

export const SOVEREIGNTY_DISCUSSION = [
  "Never come up",
  "Discussed but no action taken",
  "Actively evaluating it",
];

const REGULATED_INDUSTRIES = new Set([
  "Financial Services and Banking",
  "Healthcare and Life Sciences",
  "Government and Public Sector",
  "Legal and Compliance",
]);

const SAAS_OR_MIXED = new Set([
  "Fully on public cloud SaaS platforms such as Snowflake Databricks or BigQuery",
  "Mix of cloud SaaS and some on-premises systems",
]);

const SAAS_ONLY =
  "Fully on public cloud SaaS platforms such as Snowflake Databricks or BigQuery";
const MIXED =
  "Mix of cloud SaaS and some on-premises systems";
const OWN_CLOUD = "Mostly self-managed in our own cloud account";
const ON_PREM = "Fully on-premises or private infrastructure";

const LARGE_SIZES = new Set(["1000 to 5000", "Over 5000"]);

// ---------------------------------------------------------------------------
// Risk assessment
// ---------------------------------------------------------------------------
export function assessRisk(inputs) {
  const { industry, companySize, dataLocation, multiJurisdiction, priority } =
    inputs;

  const isRegulated = REGULATED_INDUSTRIES.has(industry);
  const isOnSaasOrMixed = SAAS_OR_MIXED.has(dataLocation);
  const isMultiJur = multiJurisdiction === "Yes";
  const isLarge = LARGE_SIZES.has(companySize);
  const priorityFlags =
    priority === "Compliance and data residency" ||
    priority === "Vendor independence";

  // High exposure
  if (isRegulated && isOnSaasOrMixed && (isMultiJur || isLarge)) {
    return "high";
  }

  // Moderate exposure: any two of the listed conditions are true
  const moderateConditions = [
    isRegulated,
    isOnSaasOrMixed,
    isMultiJur,
    isLarge,
    priorityFlags,
  ];
  const trueCount = moderateConditions.filter(Boolean).length;
  if (trueCount >= 2) {
    return "moderate";
  }

  return "low";
}

export const RISK_META = {
  high: {
    label: "High Sovereignty Exposure",
    descriptor:
      "Your current setup carries meaningful data control and compliance risk that will compound as you scale.",
    color: "#2D382D",
  },
  moderate: {
    label: "Moderate Sovereignty Exposure",
    descriptor:
      "Your setup has growing exposure that will require deliberate decisions as you move into regulated markets or larger enterprise contracts.",
    color: "#2D382D",
  },
  low: {
    label: "Low Sovereignty Exposure",
    descriptor:
      "Your current setup is likely appropriate for your stage and risk profile though there are things to watch as you grow.",
    color: "#617A61",
  },
};

// ---------------------------------------------------------------------------
// Industry-specific regulatory language used in the "Why" card
// ---------------------------------------------------------------------------
function industryRegulatoryPhrase(industry, multiJurisdiction) {
  switch (industry) {
    case "Financial Services and Banking":
      return multiJurisdiction === "Yes"
        ? "frameworks like the RBI payment data localisation mandate in India, GDPR in the EU, and GLBA in the US that you may need to satisfy simultaneously"
        : "frameworks such as GDPR, GLBA, or RBI payment data localisation rules depending on where you operate";
    case "Healthcare and Life Sciences":
      return "HIPAA in the US and the sensitive personal data provisions of GDPR in the EU, both of which require demonstrable access controls and complete audit trails";
    case "Government and Public Sector":
      return "mandatory data residency requirements that apply to government data in most jurisdictions, including India's national data governance framework and the EU's combination of GDPR and national security controls";
    case "Legal and Compliance":
      return "attorney-client privilege and professional secrecy obligations that frequently extend to where data is stored and who can technically access it";
    case "Energy and Utilities":
      return "sector-specific cybersecurity frameworks like NERC CIP in North America and NIS2 in Europe, which require auditable control over operational data";
    case "Retail and E-commerce":
      return "GDPR, which applies whenever you hold personal data of EU customers regardless of where your company is headquartered";
    case "Technology and SaaS":
      return "increasing procurement requirements from enterprise buyers in regulated industries who require their vendors to meet data residency and sovereignty standards";
    case "Manufacturing and Supply Chain":
      return "regulations that increasingly extend beyond personal data to operational technology and supply chain intelligence, especially across multiple jurisdictions";
    default:
      return "evolving data protection and residency frameworks that vary significantly by jurisdiction";
  }
}

function dataLocationPhrase(dataLocation) {
  switch (dataLocation) {
    case SAAS_ONLY:
      return "Because your data sits fully on public cloud SaaS platforms, your vendor controls processing location, access management, and audit capabilities — which is difficult to independently verify or enforce against";
    case MIXED:
      return "A mixed SaaS and on-premises setup typically reflects organic evolution rather than a deliberate architecture, and frequently contains governance gaps and inconsistent access control between the two environments";
    case OWN_CLOUD:
      return "Running mostly in your own cloud account already gives you infrastructure ownership and independent access management — your remaining exposure is largely operational, not architectural";
    case ON_PREM:
      return "Operating fully on-premises gives you the highest level of control over residency and access — the trade-off is operational overhead and the difficulty of running modern analytics without a purpose-built platform";
    default:
      return "Your current data location shapes both your regulatory exposure and your operational flexibility";
  }
}

function jurisdictionPhrase(multiJurisdiction) {
  if (multiJurisdiction === "Yes")
    return "Operating across multiple jurisdictions means you have to satisfy overlapping frameworks at the same time, which compounds the cost of any gap.";
  if (multiJurisdiction === "Not Sure")
    return "If you expand into additional jurisdictions, the same data setup can move from acceptable to non-compliant without any change on your side.";
  return "Staying within a single jurisdiction simplifies the regulatory picture today, but enterprise contracts and new markets can change that quickly.";
}

// ---------------------------------------------------------------------------
// Short, paste-friendly version of the data location
// ---------------------------------------------------------------------------
function dataLocationShort(dataLocation) {
  switch (dataLocation) {
    case SAAS_ONLY:
      return "fully on public cloud SaaS";
    case MIXED:
      return "across a mix of cloud SaaS and on-premises systems";
    case OWN_CLOUD:
      return "mostly self-managed in our own cloud account";
    case ON_PREM:
      return "fully on-premises";
    default:
      return "in mixed environments";
  }
}

// ---------------------------------------------------------------------------
// What a material exposure event actually looks like for the user's
// specific industry + data location combination (HIGH risk)
// ---------------------------------------------------------------------------
function auditConsequence(industry, dataLocation) {
  const onShared = dataLocation === SAAS_ONLY || dataLocation === MIXED;
  switch (industry) {
    case "Financial Services and Banking":
      return onShared
        ? "In practical terms, the exposure surfaces during a routine supervisory inspection where the regulator asks where each class of payment or customer data was processed and your team has to reconstruct that from a vendor's metadata rather than from infrastructure you control — typically followed by a remediation order on a fixed deadline that the business has to meet while still running normally."
        : "The exposure here is operational continuity under audit pressure: when a regulator asks for evidence inside a tight window, the speed of producing it depends on whether your platform layer surfaces processing location and access logs natively, or whether each request becomes a manual exercise.";
    case "Healthcare and Life Sciences":
      return onShared
        ? "In practical terms, this looks like a HIPAA audit team requesting six months of access logs for protected health information processed through your analytics layer and finding that the vendor's audit capabilities do not satisfy the required standard, which then triggers a corrective action plan and, in some cases, public reporting under the breach notification rules."
        : "The exposure surfaces when an auditor asks for evidence of who specifically accessed which PHI records and when — a question that gets harder to answer cleanly as data volumes grow and the number of analytics tools touching that data multiplies.";
    case "Government and Public Sector":
      return onShared
        ? "In practical terms, this looks like a classification review or oversight inquiry finding that sensitive citizen records were processed on servers physically located in a foreign jurisdiction, which is treated as a direct violation of national data governance frameworks regardless of what the vendor contract permits."
        : "The exposure here is procurement and oversight: most government tenders now require attestations about processing location and access that are difficult to produce without a platform layer designed for that evidence.";
    case "Legal and Compliance":
      return onShared
        ? "In practical terms, this surfaces when opposing counsel in a litigation matter raises a privilege challenge based on the fact that client communications or work product passed through a third-party processor — a question your team should be able to answer with infrastructure evidence rather than vendor assurances."
        : "The exposure surfaces when a client or court asks who could technically access privileged material, and the answer requires evidence of access controls rather than a contractual assurance.";
    case "Energy and Utilities":
      return onShared
        ? "In practical terms, this looks like a NERC CIP or NIS2 audit identifying that operational technology data has been processed outside the controlled environment, which carries direct sanction risk for the entity and, in some frameworks, personal accountability for the responsible officers."
        : "The exposure is incident-driven: when an operational event triggers an investigation, the speed at which you can prove which systems processed which signals, and who had access, determines how much of the response is contained internally versus escalated to the regulator.";
    case "Retail and E-commerce":
      return onShared
        ? "In practical terms, this surfaces as a GDPR enforcement notice or a data protection authority inquiry into how personal data of EU customers ended up being processed on infrastructure that did not have adequate transfer safeguards in place — typically discovered after a customer complaint or a routine sweep, not after a breach."
        : "The exposure surfaces during a data subject access request or a transfer impact assessment, when you have to evidence exactly where personal data is processed and which controls apply at each stage.";
    case "Technology and SaaS":
      return onShared
        ? "In practical terms, the first acute exposure tends to be commercial rather than regulatory — an enterprise procurement team requires evidence of where customer data is processed, your current vendor cannot guarantee it on shared infrastructure, and the renewal or new deal stalls while the architecture is reviewed."
        : "The exposure tends to surface in customer due diligence: a regulated buyer's security team requests evidence of residency, processing location, and access controls, and the speed of that response determines whether the deal moves forward.";
    case "Manufacturing and Supply Chain":
      return onShared
        ? "In practical terms, this surfaces when a major customer or a regulator in a critical-infrastructure framework asks for a sovereignty attestation covering operational technology and supply chain intelligence — which a SaaS-only stack often cannot underwrite without contractual carve-outs that take months to negotiate."
        : "The exposure surfaces in tender qualification: increasingly, enterprise and government buyers in this sector ask for evidence of where operational data is processed before they will accept a bid.";
    default:
      return onShared
        ? "In practical terms, this surfaces when a regulator, auditor, or major customer asks for evidence of where specific data classes are processed and your team has to produce that evidence on vendor timelines rather than your own."
        : "The exposure here surfaces when an auditor or counterparty asks for evidence faster than your current platform can produce it, which is increasingly common as data protection frameworks tighten globally.";
  }
}

// ---------------------------------------------------------------------------
// Middle-band consequence text (MODERATE risk)
// ---------------------------------------------------------------------------
function moderateConsequence(industry, dataLocation) {
  const regulated = REGULATED_INDUSTRIES.has(industry);
  if (dataLocation === SAAS_ONLY) {
    return regulated
      ? "The exposure tends to surface first in a procurement review or due diligence exercise rather than in a regulator's office — when a larger customer or partner asks for evidence of processing location and your current platform cannot produce it without escalating to the vendor, the conversation about sovereignty starts on someone else's terms."
      : "The exposure tends to surface during procurement: enterprise buyers increasingly include residency and processing questions in vendor reviews, and on shared SaaS the answer often requires going back to the vendor rather than producing the evidence directly from your platform.";
  }
  if (dataLocation === MIXED) {
    return regulated
      ? "Specifically, the issue is governance drift: classification rules that work at five datasets break at fifty, and access controls applied unevenly across the SaaS and on-premises halves of the estate become difficult to defend cleanly in any audit conversation."
      : "The risk here is governance drift more than residency — controls applied unevenly across the two environments tend to become harder to evidence as data volumes and team size grow.";
  }
  if (dataLocation === OWN_CLOUD) {
    return regulated
      ? "Your moderate exposure is less about residency and more about completeness — without a platform layer that consolidates audit logs, lineage, and access controls, evidencing compliance becomes a manual exercise each time a regulator or buyer asks, which is workable today but does not scale."
      : "Most of the remaining work is operational rather than architectural — the platform layer is where you either save your security team weeks per audit or create work that grows with each new dataset.";
  }
  // ON_PREM
  return regulated
    ? "Most of the residency question is already answered by your architecture; the moderate exposure is operational and analytical — running modern workloads productively on this estate without slipping behind teams that have lighter compliance constraints."
    : "Your exposure is operational rather than regulatory — the question is whether you can run modern analytics on top of this estate fast enough to keep the rest of the business moving.";
}

// ---------------------------------------------------------------------------
// Low-risk watch-point context
// ---------------------------------------------------------------------------
function lowWatchPoint(industry, dataLocation) {
  const onShared = dataLocation === SAAS_ONLY || dataLocation === MIXED;
  if (onShared) {
    return "For a profile like yours, the watch-point is usually customer-driven rather than regulator-driven — the first enterprise buyer in a regulated sector who needs a sovereignty attestation, or the first jurisdictional expansion that introduces stricter rules, tends to be the moment to revisit the architecture.";
  }
  return industry === "Technology and SaaS"
    ? "The watch-point is the moment two of three things become true: you start selling into financial services or healthcare buyers, you expand into a jurisdiction with stricter frameworks, or you start accumulating genuinely sensitive customer data at meaningful volume."
    : "The watch-point for a setup like yours is generally external — a new regulated buyer, a new jurisdiction, or a new sensitive data category will change the picture before any internal pressure does.";
}

// ---------------------------------------------------------------------------
// "Why You Got This Result" copy — 4 to 5 sentences
// ---------------------------------------------------------------------------
export function generateWhyText(inputs, risk) {
  const { industry, dataLocation, multiJurisdiction, companySize } = inputs;
  const regPhrase = industryRegulatoryPhrase(industry, multiJurisdiction);
  const locPhrase = dataLocationPhrase(dataLocation);
  const jurPhrase = jurisdictionPhrase(multiJurisdiction);
  const dataShort = dataLocationShort(dataLocation);

  if (risk === "high") {
    const audit = auditConsequence(industry, dataLocation);
    return `As a ${industry.toLowerCase()} organisation at ${companySize.toLowerCase()} with data ${dataShort}, you sit directly inside ${regPhrase}. ${locPhrase}, which is exactly the configuration that triggers the most acute audit and residency risk in your sector. ${audit} ${jurPhrase} At your scale, every new dataset, customer cohort, and jurisdiction multiplies these obligations against a vendor stack you do not directly control.`;
  }

  if (risk === "moderate") {
    const middle = moderateConsequence(industry, dataLocation);
    return `Your profile combines a ${industry.toLowerCase()} context at ${companySize.toLowerCase()} with data ${dataShort}, which puts you in the middle band today rather than the highest — but you are already touching obligations like ${regPhrase}. ${locPhrase}. ${middle} ${jurPhrase} The exposure typically becomes a concrete problem when an enterprise buyer, a new regulated market, or a routine audit forces an evidence conversation before the platform is ready for it.`;
  }

  // low
  const watch = lowWatchPoint(industry, dataLocation);
  return `Given that you are in ${industry.toLowerCase()} at ${companySize.toLowerCase()} with data ${dataShort}, your current exposure is limited. ${locPhrase}. ${jurPhrase} ${watch} The setup is appropriate for your stage and risk profile, so this is a baseline to maintain rather than a problem to fix today.`;
}

// ---------------------------------------------------------------------------
// Priority-specific, full-sentence address used in the recommendation card
// ---------------------------------------------------------------------------
function priorityAddress(priority) {
  switch (priority) {
    case "Cost predictability":
      return "On cost, what changes most is the move away from opaque, credit-based pricing — where consumption is hard to forecast from one quarter to the next — toward predictable, compute-based pricing tied to infrastructure you can size and budget directly.";
    case "Compliance and data residency":
      return "Because compliance and data residency is your stated priority, the most important property of the platform is that it produces audit-ready evidence on demand — access logs, processing locations, lineage — directly from your environment rather than on a vendor's data export schedule.";
    case "Vendor independence":
      return "Given vendor independence is the stated priority, the architectural lever is open table formats like Apache Iceberg paired with standard SQL engines, so your data stays portable across compute layers and no single vendor controls the roadmap.";
    case "Speed of setup":
      return "On speed of setup, the honest tradeoff is that a sovereign platform is heavier than signing up for a SaaS product in an afternoon — what closes most of that gap is a managed deployment that runs inside your environment, so you keep ownership without rebuilding the data stack from scratch.";
    case "Full control over our infrastructure":
      return "Because full control over infrastructure is the priority, governance and access management become first-class concerns — networking, identity, encryption keys, and processing are all owned and configured by your team rather than delegated to a vendor's defaults.";
    default:
      return "On your stated priority, the platform should make the right outcome the path of least resistance rather than something engineered around vendor constraints.";
  }
}

export function generateRecommendationText(inputs, risk) {
  const { priority, dataLocation, industry } = inputs;
  const priorityLine = priorityAddress(priority);

  if (risk === "high") {
    return `Given your priority on ${priority.toLowerCase()}, the right answer for ${industry.toLowerCase()} is a sovereign data platform that runs entirely inside your own cloud account or on-premises environment, with native audit logging and open table formats so data is never locked into a proprietary engine. Keep access control, networking, and processing fully within your perimeter so residency and governance can be evidenced from infrastructure you own, not from a vendor's contract. ${priorityLine} The goal is to keep modern analytics capability without surrendering residency, governance, or audit posture to any third party.`;
  }

  if (risk === "moderate") {
    return `A hybrid approach fits your situation: keep experimental and non-sensitive workloads on SaaS for iteration speed, and move regulated, sensitive, or strategically important datasets to infrastructure you control — ideally a platform that can run inside your own cloud account without forcing a full migration away from existing tools. Establish a clear data classification policy that decides which data is allowed on shared SaaS and which is not, with the boundary tied to regulation and customer commitments rather than convenience. ${priorityLine} Done well, this hybrid stays a deliberate choice rather than a transitional state, and it scales with your business instead of collapsing as the regulated portion of the data grows.`;
  }

  // low
  const triggerLine =
    dataLocation === SAAS_ONLY || dataLocation === MIXED
      ? "Specific triggers worth watching are selling into regulated industries, contracts that require data residency, expanding into stricter jurisdictions, and accumulating sensitive user data that changes your regulatory profile."
      : "Specific triggers worth watching are pursuing enterprise contracts that require sovereignty guarantees, expanding into stricter jurisdictions, and adding regulated data types that change your obligations.";
  return `For your stage and risk profile, your current setup is likely appropriate and there is no architectural change to chase today. ${triggerLine} ${priorityLine} When two or more of these triggers become true, it is worth re-evaluating the platform layer proactively rather than waiting for an audit or a deal to force the conversation.`;
}

// ---------------------------------------------------------------------------
// Share text — 3 sentences: risk + reason, regulatory/operational exposure,
// recommended next step. Neutral, factual, paste-ready.
// ---------------------------------------------------------------------------
function shareExposureSentence(
  industry,
  dataLocation,
  multiJurisdiction,
  risk,
) {
  const reg = industryRegulatoryPhrase(industry, multiJurisdiction);
  const onShared = dataLocation === SAAS_ONLY || dataLocation === MIXED;

  if (risk === "high" || risk === "moderate") {
    return onShared
      ? `The specific exposure is that ${reg} all require us to evidence where data is processed and who can access it, which is difficult to do cleanly when the underlying platform is controlled by a third-party vendor.`
      : `The specific exposure is operational rather than residency — ${reg} require evidence on demand, and our current platform layer is the bottleneck for producing it consistently.`;
  }

  // low
  return `The operational exposure is limited today, but ${reg} mean that a new regulated buyer or a new jurisdiction would change the picture quickly.`;
}

function shareNextStep(risk) {
  if (risk === "high") {
    return "Suggested next step: a short internal review of which datasets are actually regulated and whether the sensitive ones should sit on infrastructure we control, ideally before the next audit or enterprise contract forces the timeline for us.";
  }
  if (risk === "moderate") {
    return "Suggested next step: a data classification pass to decide what can stay on shared SaaS, what should move to infrastructure we control, and what specific triggers — a new market, a regulated buyer, a new data type — would force a re-architecture.";
  }
  return "Nothing urgent here — flagging it so we share a view of the situation, and so we know what to revisit when we expand into a stricter jurisdiction or sell into a regulated buyer.";
}

export function generateShareText(inputs, risk) {
  const { industry, companySize, dataLocation, multiJurisdiction } = inputs;
  const riskName = RISK_META[risk].label;
  const jurClause =
    multiJurisdiction === "Yes"
      ? "operating across multiple jurisdictions"
      : multiJurisdiction === "No"
        ? "operating in a single jurisdiction"
        : "with multi-jurisdiction exposure still being assessed";
  const locShort = dataLocationShort(dataLocation);
  const exposure = shareExposureSentence(
    industry,
    dataLocation,
    multiJurisdiction,
    risk,
  );
  const nextStep = shareNextStep(risk);

  return `Quick data sovereignty read for our ${industry} setup (${companySize.toLowerCase()}, data ${locShort}, ${jurClause}): this lands as ${riskName}, mainly driven by the combination of our industry and where the data currently sits. ${exposure} ${nextStep}`;
}

// ---------------------------------------------------------------------------
// Headline insight for the shareable result card — one plain sentence
// ---------------------------------------------------------------------------
export function generateHeadlineInsight(inputs, risk) {
  const { industry, dataLocation, multiJurisdiction } = inputs;
  const onShared = dataLocation === SAAS_ONLY || dataLocation === MIXED;

  if (risk === "high") {
    switch (industry) {
      case "Financial Services and Banking":
        return multiJurisdiction === "Yes"
          ? "Financial services data on public SaaS across multiple jurisdictions creates direct audit and residency risk under overlapping frameworks like RBI, GDPR, and GLBA."
          : "Financial services data on shared SaaS infrastructure creates direct audit and residency risk under frameworks like GDPR and GLBA.";
      case "Healthcare and Life Sciences":
        return "Healthcare data on shared SaaS makes HIPAA-grade access logs and audit evidence hard to produce on demand.";
      case "Government and Public Sector":
        return "Government data on shared SaaS sits outside the residency controls most national data governance frameworks require.";
      case "Legal and Compliance":
        return "Sensitive client work flowing through third-party processors complicates privilege claims and professional-secrecy obligations.";
      case "Energy and Utilities":
        return "Operational technology data on shared infrastructure carries direct exposure under NERC CIP and NIS2 audit regimes.";
      case "Retail and E-commerce":
        return "Personal data of EU customers on US-based SaaS creates direct GDPR transfer exposure that compounds as you scale.";
      default:
        return onShared
          ? "Data on shared SaaS in a regulated context creates audit and residency risk that compounds with scale and new jurisdictions."
          : "Operating in a regulated context at this scale requires audit-ready evidence that current infrastructure cannot consistently produce.";
    }
  }
  if (risk === "moderate") {
    return onShared
      ? `Data on shared SaaS in a ${industry.toLowerCase()} context creates growing audit and procurement exposure as you move into regulated markets.`
      : `Your ${industry.toLowerCase()} setup is exposed mostly through procurement and audit-readiness rather than residency itself, and that gap widens with scale.`;
  }
  return "Current setup is appropriate for the stage and risk profile — the trigger to reassess is the first regulated buyer, jurisdiction, or sensitive data category that changes the picture.";
}

// ---------------------------------------------------------------------------
// "What To Do Next" — input-specific, actionable checklist (3 to 5 items)
// ---------------------------------------------------------------------------
function industryChecklistItem(industry, multiJurisdiction) {
  switch (industry) {
    case "Financial Services and Banking":
      return multiJurisdiction === "Yes"
        ? "Audit your current SaaS vendor's data processing agreement and confirm physical processing location against the relevant payment data localisation, GDPR, and GLBA requirements."
        : "Audit your current SaaS vendor's data processing agreement and confirm physical processing location against the financial services frameworks applicable in your jurisdiction.";
    case "Healthcare and Life Sciences":
      return "Verify that your analytics vendor's audit logging satisfies HIPAA standards and request a recent independent audit attestation for protected health information.";
    case "Government and Public Sector":
      return "Confirm with each vendor that all sensitive citizen records remain within the mandated jurisdiction at every stage of processing and document the chain of custody.";
    case "Legal and Compliance":
      return "Map which client communications and work product flow through third-party processors, and document the access controls protecting privilege.";
    case "Energy and Utilities":
      return "Confirm that operational technology data subject to NERC CIP or NIS2 is processed within a controlled environment with auditable access logs.";
    case "Retail and E-commerce":
      return "Conduct a GDPR transfer impact assessment for all personal data of EU customers currently held on SaaS infrastructure outside the EU.";
    case "Technology and SaaS":
      return "Document your data processing-location guarantees in a security overview that enterprise buyers can review during procurement without escalation.";
    case "Manufacturing and Supply Chain":
      return "Inventory operational and supply chain data subject to sovereignty requirements in your critical-infrastructure or major-customer contracts.";
    default:
      return "Inventory which data classes carry residency or processing-location obligations today and how each is currently controlled across your stack.";
  }
}

function dataLocationChecklistItem(dataLocation) {
  switch (dataLocation) {
    case SAAS_ONLY:
      return "Map all datasets currently held on public cloud SaaS and flag those subject to residency, sovereignty, or sector-specific requirements.";
    case MIXED:
      return "Run a classification pass across both your SaaS and on-premises estates to identify governance gaps where access controls differ between the two environments.";
    case OWN_CLOUD:
      return "Document where access logs, lineage, and audit evidence live across your own cloud account so any audit request can be served from a single source.";
    case ON_PREM:
      return "Identify which modern analytics workloads are blocked by on-premises constraints and evaluate platform layers designed to run productively in sovereign environments.";
    default:
      return "Take stock of where your most sensitive data classes live today and which platform layer governs each one.";
  }
}

function priorityChecklistItem(priority) {
  switch (priority) {
    case "Cost predictability":
      return "Compare your current credit-based vendor pricing against a compute-based model tied to infrastructure you control on a 12-month forecast.";
    case "Compliance and data residency":
      return "Establish a data classification policy that distinguishes regulated data from operational data and define where each class is allowed to be processed.";
    case "Vendor independence":
      return "Evaluate data platforms that use open table formats like Apache Iceberg so your data layer remains portable across compute engines.";
    case "Speed of setup":
      return "Shortlist managed sovereign platforms that can deploy inside your existing environment without forcing a full migration off your current tools.";
    case "Full control over our infrastructure":
      return "Define ownership boundaries for networking, identity, encryption keys, and processing so each is configured by your team rather than by vendor defaults.";
    default:
      return "Make your stated priority an explicit selection criterion in any platform shortlist rather than a soft preference.";
  }
}

function jurisdictionChecklistItem(multiJurisdiction) {
  if (multiJurisdiction === "Yes")
    return "Schedule a cross-border data flow review before your next compliance cycle, mapping each dataset to the jurisdictions where it is allowed to be processed.";
  if (multiJurisdiction === "Not Sure")
    return "Confirm with finance and product which jurisdictions you operate in or are likely to enter in the next 12 months, then map your data flows accordingly.";
  return null;
}

function discussionChecklistItem(sovereigntyDiscussion, risk) {
  if (risk === "low") return null;
  switch (sovereigntyDiscussion) {
    case "Never come up":
      return "Brief your CTO and CISO on this assessment and the relevant frameworks so future conversations start from a shared baseline.";
    case "Discussed but no action taken":
      return "Convert your prior internal discussion into a written sovereignty position with named owners and a 90-day review cadence.";
    case "Actively evaluating it":
      return "Move the evaluation forward with a deployment proof-of-concept on one representative sensitive dataset inside your own environment.";
    default:
      return null;
  }
}

export function generateChecklist(inputs, risk) {
  const {
    industry,
    dataLocation,
    multiJurisdiction,
    priority,
    sovereigntyDiscussion,
  } = inputs;
  const items = [
    industryChecklistItem(industry, multiJurisdiction),
    dataLocationChecklistItem(dataLocation),
    priorityChecklistItem(priority),
    jurisdictionChecklistItem(multiJurisdiction),
    discussionChecklistItem(sovereigntyDiscussion, risk),
  ].filter(Boolean);
  return items.slice(0, 5);
}
