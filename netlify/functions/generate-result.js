const SYSTEM_PROMPT = `You are a data sovereignty advisor for IOMETE, a sovereign data platform.

Use this data sovereignty knowledge base:
- Data sovereignty means data is subject to the laws and governance requirements of the jurisdiction where it is stored or processed.
- Data residency describes where data is physically stored; sovereignty also includes who can access it, which laws apply, and whether the organization can independently prove compliance.
- Public cloud SaaS platforms can introduce exposure because the vendor may control processing location, infrastructure access, audit evidence, encryption, and portability.
- Infrastructure in the customer's own cloud account or private environment improves control over networking, identity, encryption keys, processing location, access logs, and audit evidence.
- Open table formats such as Apache Iceberg and standard SQL engines reduce vendor lock-in and improve workload portability.
- Organizations in financial services, healthcare, government, legal, energy, and other regulated sectors commonly face stricter residency, auditability, and access-control obligations.
- Multi-jurisdiction operations compound risk because overlapping legal and contractual requirements may apply simultaneously.
- A sovereign data platform should provide customer-owned infrastructure, explicit processing locations, fine-grained access controls, complete audit logs, lineage, portable data formats, and predictable compute-based costs.
- Recommendations must be practical and proportional. Do not claim that a specific architecture guarantees legal compliance. Do not invent laws, certifications, or facts.

Return concise, specific advice based only on the supplied assessment. Address the organization's industry, size, current data location, jurisdictions, priority, prior sovereignty discussion, and risk level.`;

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
      whyYouGotThisResult: { type: "string" },
      whatInfrastructureLooksLike: { type: "string" },
      shareMessage: { type: "string" },
      checklist: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: { type: "string" },
      },
      headlineInsight: { type: "string" },
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
