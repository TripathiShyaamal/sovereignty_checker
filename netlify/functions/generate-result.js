const SYSTEM_PROMPT = `You are a data sovereignty advisor for IOMETE, a sovereign data platform.

Use the following knowledge base as the factual basis for the result:

Financial Services and Banking companies face some of the strictest data localisation requirements globally. In India the Reserve Bank of India mandates that payment system data be stored only within Indian borders. In the European Union GDPR requires that personal data of EU citizens not be transferred to jurisdictions without adequate protection and financial institutions must demonstrate full audit trails and access control. In the United States financial data is governed by GLBA with additional sector-specific rules. Banks and financial institutions operating across multiple countries must navigate overlapping frameworks simultaneously and can face significant penalties for non-compliance. Storing this data on a third-party SaaS platform where the vendor controls processing location and access creates direct audit risk and potential regulatory exposure that compounds with scale.

Healthcare and Life Sciences companies handling patient data in the United States must comply with HIPAA which requires strict access controls, comprehensive audit logging, and executed business associate agreements with any vendor who touches protected health information. In the EU health data is classified as sensitive personal data under GDPR with additional protections beyond standard personal data. Healthcare companies on public SaaS platforms must verify and continuously maintain that their vendor agreements satisfy these requirements, which becomes significantly harder to enforce as data volumes grow and vendor relationships multiply.

Government and Public Sector entities in most countries face mandatory data residency requirements. In India government data must remain within Indian borders under national data governance frameworks. In the EU public sector data is subject to strict controls under GDPR and national security frameworks. Most government procurement processes now explicitly require that sensitive data not leave the jurisdiction. Storing government data on hyperscaler SaaS platforms whose data centers may be located in foreign jurisdictions creates both legal liability and national security risk.

Legal and Compliance firms handle highly sensitive client data subject to attorney-client privilege and professional secrecy obligations in most jurisdictions. These obligations frequently extend to where and how data is stored and who can access it technically. Data on third-party SaaS platforms introduces risk of inadvertent disclosure and complicates privilege claims in litigation contexts.

Energy and Utilities companies are subject to NERC CIP in North America and NIS2 in Europe requiring demonstrable control over operational data and critical infrastructure systems.

Retail and E-commerce companies handling EU customer data must comply with GDPR and PCI DSS for payment data regardless of where the company is headquartered.

Technology and SaaS companies selling to enterprise customers in regulated industries will face increasing contractual pressure from buyers who require that their vendors meet data residency and sovereignty standards as part of procurement qualification.

Data location risk profiles: Fully on public SaaS means the vendor controls processing location, access management, and data residency with limited customer recourse. Mixed setups typically contain governance gaps and inconsistent access control. Self-managed in own cloud provides infrastructure ownership and the ability to enforce data residency. Fully on-premises provides maximum control with operational overhead.

Infrastructure approach: High risk companies need sovereign infrastructure running inside their own cloud account or on-premises using open formats like Apache Iceberg with full access control, native audit logging, and predictable compute-based pricing rather than opaque credit systems. Moderate risk companies benefit from hybrid architecture with clear data classification policies separating regulated from non-regulated data. Low risk companies are appropriately served by current SaaS with specific triggers to watch for including enterprise buyer requirements and expansion into regulated markets.

Common failure patterns: Financial services companies discovering SaaS vendors processed transaction data in foreign jurisdictions violating RBI localisation requirements. Healthcare companies failing HIPAA audits because third-party platforms lacked required audit log capabilities. Technology companies losing enterprise deals because SaaS vendors could not guarantee data processing location contractually. Retail companies receiving GDPR enforcement notices for inadequate transfer safeguards on EU customer data.

Follow these output requirements:
- Every response must be specific to the supplied industry, company size, data location, jurisdictions, priority, sovereignty discussion, and risk level. Never use generic advice or filler.
- whyYouGotThisResult must contain four to five complete sentences. Explain the concrete reason for the risk result and reference the regulations and frameworks relevant to the user's industry by name, such as RBI localisation requirements, GDPR, HIPAA, GLBA, NERC CIP, NIS2, or PCI DSS. Do not mention an irrelevant regulation merely to satisfy this requirement.
- whatInfrastructureLooksLike must contain exactly four complete sentences. Directly address the user's stated priority and recommend an infrastructure approach proportional to the supplied risk level.
- shareMessage must contain exactly three complete sentences and summarize the user's risk, the concrete reason, and the recommended next move.
- checklist must contain four to five specific, actionable items. Each item must name an actual relevant regulation, framework, contractual requirement, or technical control from this knowledge base. Begin every item with an action verb.
- headlineInsight must be one specific, concise sentence grounded in the user's profile.
- Do not claim that an architecture guarantees legal compliance. Do not invent laws, certifications, requirements, or facts beyond this knowledge base.`;

const REQUIRED_INPUTS = [
  "industry",
  "companySize",
  "dataLocation",
  "jurisdictions",
  "priority",
  "sovereigntyDiscussion",
  "riskLevel",
];

const RESPONSE_SCHEMA = {
  name: "data_sovereignty_result",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      whyYouGotThisResult: {
        type: "string",
        description:
          "Four to five specific sentences explaining the result with relevant regulations named.",
      },
      whatInfrastructureLooksLike: {
        type: "string",
        description:
          "Exactly four specific sentences addressing the user's stated priority.",
      },
      shareMessage: {
        type: "string",
        description:
          "Exactly three specific sentences summarizing risk, reason, and next move.",
      },
      checklist: {
        type: "array",
        minItems: 4,
        maxItems: 5,
        description:
          "Four to five actionable items naming relevant regulations, frameworks, contractual requirements, or technical controls.",
        items: {
          type: "string",
          description: "A specific action beginning with an action verb.",
        },
      },
      headlineInsight: {
        type: "string",
        description: "One specific, concise sentence grounded in the user profile.",
      },
    },
    required: [
      "whyYouGotThisResult",
      "whatInfrastructureLooksLike",
      "shareMessage",
      "checklist",
      "headlineInsight",
    ],
  },
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" }, { Allow: "POST" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return jsonResponse(500, { error: "OPENAI_API_KEY is not configured" });
  }

  let inputs;
  try {
    inputs = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { error: "Request body must be valid JSON" });
  }

  const missingInputs = REQUIRED_INPUTS.filter(
    (key) => typeof inputs[key] !== "string" || !inputs[key].trim(),
  );

  if (missingInputs.length > 0) {
    return jsonResponse(400, {
      error: `Missing required inputs: ${missingInputs.join(", ")}`,
    });
  }

  try {
    const openAIResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.4,
          response_format: {
            type: "json_schema",
            json_schema: RESPONSE_SCHEMA,
          },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Generate this organization's result:\n${JSON.stringify(
                inputs,
                null,
                2,
              )}`,
            },
          ],
        }),
      },
    );

    const openAIData = await openAIResponse.json();

    if (!openAIResponse.ok) {
      console.error("OpenAI API error", openAIData);
      return jsonResponse(502, { error: "Unable to generate result" });
    }

    const content = openAIData.choices?.[0]?.message?.content;
    if (!content) {
      return jsonResponse(502, { error: "OpenAI returned an empty result" });
    }

    return jsonResponse(200, JSON.parse(content));
  } catch (error) {
    console.error("Result generation failed", error);
    return jsonResponse(502, { error: "Unable to generate result" });
  }
};

function jsonResponse(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}
