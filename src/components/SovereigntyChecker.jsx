import { useMemo, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  INDUSTRIES,
  COMPANY_SIZES,
  DATA_LOCATIONS,
  JURISDICTIONS,
  PRIORITIES,
  SOVEREIGNTY_DISCUSSION,
  assessRisk,
  RISK_META,
} from "@/lib/sovereigntyLogic";

// Exact hex colors from spec
const C = {
  appBg: "#F2EEEB",
  cardBg: "#FFFFFF",
  primaryText: "#202020",
  secondaryText: "#626261",
  border: "#D0D0CD",
  primary: "#2D382D", // RACING-900
  white: "#FFFFFF",
  accent: "#D3F52C", // FLUORO-400
  accentMuted: "#A0B8A0", // subtitle on dark
  copyBoxBg: "#FCFCF8",
  lowRiskText: "#617A61",
};

const initialForm = {
  industry: "",
  companySize: "",
  dataLocation: "",
  multiJurisdiction: "",
  priority: "",
  sovereigntyDiscussion: "",
};

export default function SovereigntyChecker() {
  const [form, setForm] = useState(initialForm);
  const [screen, setScreen] = useState("form"); // "form" | "result"
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const allFilled = useMemo(
    () => Object.values(form).every((v) => v && v.length > 0),
    [form],
  );

  const update = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!allFilled || loading) return;

    setLoading(true);
    setSubmitError("");
    setCopied(false);

    try {
      const response = await fetch("/.netlify/functions/generate-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: form.industry,
          companySize: form.companySize,
          dataLocation: form.dataLocation,
          jurisdictions: form.multiJurisdiction,
          priority: form.priority,
          sovereigntyDiscussion: form.sovereigntyDiscussion,
          riskLevel: assessRisk(form),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to generate your result");
      }

      setResult(data);
      setScreen("result");
      if (typeof window !== "undefined") window.scrollTo({ top: 0 });
    } catch (error) {
      setSubmitError(
        error.message || "Unable to generate your result. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setResult(null);
    setSubmitError("");
    setCopied(false);
    setScreen("form");
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  return (
    <div
      data-testid="sovereignty-checker"
      style={{ backgroundColor: C.appBg, color: C.primaryText }}
      className="min-h-screen w-full"
    >
      {/* IOMETE meta tag bar — sits on light bg, above the dark hero block */}
      <div
        className="mx-auto max-w-[1120px] px-5 sm:px-8"
        style={{ paddingTop: "32px", paddingBottom: "20px" }}
      >
        <Header />
      </div>

      {screen === "form" ? (
        <FormScreen
          form={form}
          update={update}
          allFilled={allFilled}
          onSubmit={handleSubmit}
          loading={loading}
          submitError={submitError}
        />
      ) : (
        <ResultScreen
          form={form}
          result={result}
          copied={copied}
          setCopied={setCopied}
          onReset={handleReset}
          onBackToForm={() => setScreen("form")}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Header                                                                     */
/* -------------------------------------------------------------------------- */
function Header() {
  return (
    <div className="mb-8 flex items-center gap-3" data-testid="app-header">
      <span
        className="font-mono-dm text-[11px] tracking-[0.18em] uppercase"
        style={{ color: C.secondaryText }}
        data-testid="brand-tag"
      >
        IOMETE
      </span>
      <span
        className="h-px flex-1"
        style={{ backgroundColor: C.border }}
        aria-hidden
      />
      <span
        className="font-mono-dm text-[11px] tracking-[0.18em] uppercase"
        style={{ color: C.secondaryText }}
      >
        Data Sovereignty Checker
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Form Screen                                                                */
/* -------------------------------------------------------------------------- */
function FormScreen({ form, update, allFilled, onSubmit, loading, submitError }) {
  return (
    <div className="screen-enter screen-enter-active" data-testid="form-screen">
      {/* Full-width dark title block */}
      <div
        style={{
          backgroundColor: C.primary,
          paddingTop: "40px",
          paddingBottom: "40px",
        }}
        data-testid="form-title-block"
      >
        <div className="mx-auto max-w-[1120px] px-5 text-center sm:px-8">
          <h1
            className="font-archivo text-4xl leading-[1.1] sm:text-5xl"
            style={{ color: C.accent }}
            data-testid="form-title"
          >
            Check Your Data Sovereignty Risk
          </h1>
          <p
            className="font-inter mx-auto mt-3 max-w-2xl text-base sm:text-lg"
            style={{ color: C.accentMuted }}
            data-testid="form-subtitle"
          >
            Answer six questions to understand your exposure and what to do
            about it.
          </p>
        </div>
      </div>

      {/* Centered 640px form card on app bg */}
      <div
        className="mx-auto px-5 sm:px-8"
        style={{
          maxWidth: "calc(640px + 64px)",
          paddingTop: "32px",
          paddingBottom: "48px",
        }}
      >
        <div
          className="rounded-lg"
          style={{
            backgroundColor: C.cardBg,
            border: `1px solid ${C.border}`,
            padding: "32px",
            maxWidth: "640px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
          data-testid="form-card"
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {/* Field 1: Industry */}
            <Field
              label="Your Industry"
              descriptor="Select the sector that best describes your organisation."
              testId="field-industry"
            >
              <Select
                value={form.industry}
                onChange={update("industry")}
                options={INDUSTRIES}
                placeholder="Choose an industry"
                testId="industry-select"
              />
            </Field>

            {/* Field 2: Company Size */}
            <Field label="Company Size" testId="field-companysize">
              <ButtonGroup
                value={form.companySize}
                onChange={update("companySize")}
                options={COMPANY_SIZES}
                testIdPrefix="companysize"
              />
            </Field>

            {/* Field 3: Data Location */}
            <Field
              label="Where does your data currently live"
              testId="field-datalocation"
            >
              <Select
                value={form.dataLocation}
                onChange={update("dataLocation")}
                options={DATA_LOCATIONS}
                placeholder="Choose where your data lives"
                testId="datalocation-select"
              />
            </Field>

            {/* Field 4: Multi-jurisdiction */}
            <Field
              label="Do you operate across multiple countries or jurisdictions"
              testId="field-jurisdiction"
            >
              <ButtonGroup
                value={form.multiJurisdiction}
                onChange={update("multiJurisdiction")}
                options={JURISDICTIONS}
                testIdPrefix="jurisdiction"
              />
            </Field>

            {/* Field 5: Priority */}
            <Field
              label="What matters most to you right now"
              testId="field-priority"
            >
              <Select
                value={form.priority}
                onChange={update("priority")}
                options={PRIORITIES}
                placeholder="Choose what matters most"
                testId="priority-select"
              />
            </Field>

            {/* Field 6: Sovereignty Discussion */}
            <Field
              label="Has your team discussed data sovereignty before"
              testId="field-discussion"
            >
              <ButtonGroup
                value={form.sovereigntyDiscussion}
                onChange={update("sovereigntyDiscussion")}
                options={SOVEREIGNTY_DISCUSSION}
                testIdPrefix="discussion"
              />
            </Field>
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={!allFilled || loading}
            data-testid="check-risk-button"
            className="font-archivo mt-7 inline-flex w-full items-center justify-center rounded-md text-base transition-colors"
            style={{
              backgroundColor: C.primary,
              color: C.accent,
              opacity: allFilled && !loading ? 1 : 0.4,
              cursor: allFilled && !loading ? "pointer" : "not-allowed",
              letterSpacing: "0.005em",
              padding: "16px 24px",
            }}
          >
            {loading ? "Generating Your Result..." : "Check My Risk"}
          </button>
          {submitError && (
            <p
              className="font-inter mt-3 text-center text-[13px]"
              style={{ color: "#ED7E68" }}
              role="alert"
              data-testid="submit-error"
            >
              {submitError}
            </p>
          )}
        </div>

        <p
          className="font-inter mt-6 text-center text-sm"
          style={{ color: C.secondaryText }}
          data-testid="form-footer-note"
        >
          Your answers are securely sent to generate this result and are not
          stored by this app.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Field wrapper                                                              */
/* -------------------------------------------------------------------------- */
function Field({ label, descriptor, children, testId }) {
  return (
    <div data-testid={testId}>
      <label
        className="font-inter block text-[15px]"
        style={{ color: C.primaryText, fontWeight: 500 }}
      >
        {label}
      </label>
      {descriptor ? (
        <p
          className="font-inter mt-1 text-sm"
          style={{ color: C.secondaryText }}
        >
          {descriptor}
        </p>
      ) : null}
      <div className="mt-2">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Native Select (no shadcn, keeps absolute color control)                    */
/* -------------------------------------------------------------------------- */
function Select({ value, onChange, options, placeholder, testId }) {
  return (
    <select
      className="ds-select font-inter w-full rounded-md text-[15px]"
      style={{
        backgroundColor: C.cardBg,
        color: value ? C.primaryText : C.secondaryText,
        border: `1px solid ${C.border}`,
        padding: "11px 14px",
        lineHeight: "1.3",
      }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-testid={testId}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

/* -------------------------------------------------------------------------- */
/* Horizontal button group                                                    */
/* -------------------------------------------------------------------------- */
function ButtonGroup({ value, onChange, options, testIdPrefix }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            data-testid={`${testIdPrefix}-option-${opt
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "")}`}
            className="font-inter rounded-md text-[14px] transition-colors"
            style={{
              backgroundColor: selected ? C.primary : C.cardBg,
              color: selected ? C.accent : C.primaryText,
              border: `1px solid ${selected ? C.primary : C.border}`,
              padding: "9px 14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Result Screen                                                              */
/* -------------------------------------------------------------------------- */
function ResultScreen({
  form,
  result,
  copied,
  setCopied,
  onReset,
  onBackToForm,
}) {
  const risk = useMemo(() => assessRisk(form), [form]);
  const meta = RISK_META[risk];
  const whyText = result.whyYouGotThisResult;
  const recText = result.whatInfrastructureLooksLike;
  const shareText = result.shareMessage;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const ta = document.createElement("textarea");
        ta.value = shareText;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      // silent — copy not available
    }
  };

  return (
    <div
      className="screen-enter screen-enter-active"
      data-testid="result-screen"
    >
      {/* Back navigation — sits on light bg above dark block */}
      <div
        className="mx-auto max-w-[1120px] px-5 sm:px-8"
        style={{ paddingBottom: "16px" }}
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToForm}
            className="font-inter text-sm transition-colors"
            style={{ color: C.secondaryText, cursor: "pointer" }}
            data-testid="back-to-form-button"
          >
            ← Back to form
          </button>
          <span
            className="font-mono-dm text-[11px] tracking-[0.18em] uppercase"
            style={{ color: C.secondaryText }}
          >
            Result
          </span>
        </div>
      </div>

      {/* Full-width dark risk label block */}
      <div
        style={{
          backgroundColor: C.primary,
          paddingTop: "32px",
          paddingBottom: "32px",
        }}
        data-testid="risk-header"
      >
        <div className="mx-auto max-w-[1120px] px-5 text-center sm:px-8">
          <h1
            className="font-archivo flex items-center justify-center gap-3 text-[34px] leading-[1.08] sm:text-[44px]"
            style={{ color: C.accent }}
            data-testid="risk-label"
          >
            <span
              aria-hidden
              data-testid="risk-label-dot"
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: 9999,
                backgroundColor: C.accent,
                flexShrink: 0,
              }}
            />
            {meta.label}
          </h1>
          <p
            className="font-inter mx-auto mt-3 max-w-3xl text-base sm:text-[17px]"
            style={{ color: C.accentMuted, lineHeight: 1.55 }}
            data-testid="risk-descriptor"
          >
            {meta.descriptor}
          </p>
        </div>
      </div>

      {/* Static three-zone risk indicator — sits between the dark risk block and the cards */}
      <RiskIndicator risk={risk} />

      {/* Content on light bg */}
      <div
        className="mx-auto max-w-[1120px] px-5 sm:px-8"
        style={{ paddingTop: "28px", paddingBottom: "48px" }}
      >
        {/* Two cards side-by-side on desktop, stacked on mobile */}
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: "16px" }}
          data-testid="result-cards"
        >
          <ResultCard
            title="Why You Got This Result"
            body={whyText}
            testId="why-card"
          />
          <ResultCard
            title="What the Right Infrastructure Looks Like"
            body={recText}
            testId="recommendation-card"
          />
        </div>

        <style>{`
          @media (max-width: 767px) {
            [data-testid="result-cards"] { gap: 12px !important; }
          }
        `}</style>

        {/* What To Do Next — input-specific actionable checklist */}
        <ChecklistSection items={result.checklist} />

        {/* Share box */}
        <div
          className="mt-6 rounded-md"
          style={{
            border: `1px solid ${C.border}`,
            backgroundColor: C.copyBoxBg,
            padding: "20px",
          }}
          data-testid="share-box"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p
                className="font-inter text-[13px]"
                style={{ color: C.primaryText, fontWeight: 500 }}
              >
                Share this with your team
              </p>
              <p
                className="font-inter mt-2 text-[15px]"
                style={{ color: C.primaryText, lineHeight: 1.55 }}
                data-testid="share-text"
              >
                {shareText}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="font-inter inline-flex shrink-0 items-center gap-1.5 rounded-md text-[13px] transition-colors"
              style={{
                backgroundColor: C.cardBg,
                color: copied ? C.primary : C.secondaryText,
                border: `1px solid ${C.border}`,
                padding: "8px 12px",
                cursor: "pointer",
                fontWeight: 500,
              }}
              data-testid="copy-button"
              aria-label="Copy share text"
            >
              {copied ? (
                <>
                  <Check size={14} strokeWidth={2.25} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={14} strokeWidth={2.25} />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Email capture — appears for High and Moderate only */}
        {(risk === "high" || risk === "moderate") && <EmailCapture />}

        {/* Shareable result card — always shown */}
        <ShareYourResult insight={result.headlineInsight} meta={meta} />

        {/* Learn more link + Start Over */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <a
            href="https://iomete.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-inter text-[14px] underline-offset-4 hover:underline"
            style={{ color: C.secondaryText }}
            data-testid="learn-more-link"
          >
            Learn how enterprises with your profile approach data
            infrastructure →
          </a>
          <button
            type="button"
            onClick={onReset}
            className="font-inter text-[14px]"
            style={{
              color: C.secondaryText,
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
            data-testid="start-over-button"
          >
            Start over
          </button>
        </div>

        {/* Book a conversation CTA — High and Moderate only */}
        {(risk === "high" || risk === "moderate") && <BookCTA />}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Checklist — "What To Do Next" with input-specific items                    */
/* -------------------------------------------------------------------------- */
function ChecklistSection({ items }) {
  const [checked, setChecked] = useState(() => new Set());

  const toggle = (i) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div
      data-testid="checklist-section"
      className="mt-6 rounded-lg"
      style={{
        backgroundColor: C.cardBg,
        border: `1px solid ${C.border}`,
        padding: "24px",
      }}
    >
      <h3
        className="font-archivo text-[20px] sm:text-[22px]"
        style={{ color: C.primaryText, lineHeight: 1.2 }}
        data-testid="checklist-title"
      >
        What To Do Next
      </h3>
      <ul style={{ marginTop: 14, listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((item, i) => {
          const isChecked = checked.has(i);
          return (
            <li
              key={i}
              data-testid={`checklist-item-${i}`}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "10px 0",
              }}
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-pressed={isChecked}
                aria-label={isChecked ? "Uncheck item" : "Check item"}
                data-testid={`checkbox-${i}`}
                style={{
                  width: 20,
                  height: 20,
                  flexShrink: 0,
                  borderRadius: 4,
                  marginTop: 2,
                  border: `1px solid ${isChecked ? C.primary : C.border}`,
                  backgroundColor: isChecked ? C.primary : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: 0,
                  transition: "background-color 120ms ease, border-color 120ms ease",
                }}
              >
                {isChecked && (
                  <Check size={13} strokeWidth={3} color="#FFFFFF" />
                )}
              </button>
              <span
                className="font-inter"
                style={{
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: isChecked ? C.secondaryText : C.primaryText,
                  textDecoration: isChecked ? "line-through" : "none",
                }}
              >
                {item}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Email capture                                                              */
/* -------------------------------------------------------------------------- */
function EmailCapture() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setSent(true);
  };

  return (
    <div className="mt-6" data-testid="email-capture">
      <p
        className="font-inter text-[14px]"
        style={{ color: C.primaryText, fontWeight: 500 }}
        data-testid="email-capture-label"
      >
        Get your full report by email
      </p>
      {sent ? (
        <p
          className="font-inter mt-3 text-[14px]"
          style={{ color: "#617A61", lineHeight: 1.5 }}
          data-testid="email-confirmation"
        >
          Your report has been sent. The IOMETE team may follow up with relevant
          resources.
        </p>
      ) : (
        <>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              placeholder="your@email.com"
              className="ds-input font-inter w-full rounded-md text-[15px] sm:flex-1"
              style={{
                backgroundColor: C.cardBg,
                color: C.primaryText,
                border: `1px solid ${C.border}`,
                padding: "11px 14px",
                lineHeight: "1.3",
              }}
              data-testid="email-input"
            />
            <button
              type="button"
              onClick={handleSend}
              className="font-inter w-full rounded-md text-[14px] transition-colors sm:w-auto"
              style={{
                backgroundColor: C.primary,
                color: C.accent,
                border: `1px solid ${C.primary}`,
                padding: "11px 22px",
                fontWeight: 500,
                cursor: "pointer",
              }}
              data-testid="email-send-button"
            >
              Send Report
            </button>
          </div>
          {error && (
            <p
              className="font-inter mt-2 text-[13px]"
              style={{ color: "#ED7E68" }}
              data-testid="email-error"
            >
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Shareable result card                                                      */
/* -------------------------------------------------------------------------- */
function ShareYourResult({ insight, meta }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#2D382D",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = "iomete-sovereignty-result.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      // silent
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mt-6" data-testid="share-your-result">
      <p
        className="font-inter text-[14px]"
        style={{ color: C.primaryText, fontWeight: 500 }}
        data-testid="share-result-label"
      >
        Share your result
      </p>
      <div className="mt-3 flex justify-center">
        <div
          ref={cardRef}
          data-testid="share-preview-card"
          style={{
            backgroundColor: "#2D382D",
            padding: 16,
            borderRadius: 8,
            width: 600,
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: 9999,
                backgroundColor: "#D3F52C",
                flexShrink: 0,
              }}
            />
            <h3
              className="font-archivo"
              style={{
                color: "#D3F52C",
                fontSize: 26,
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              {meta.label}
            </h3>
          </div>
          <p
            className="font-inter"
            style={{
              color: "#FCFCF8",
              fontSize: 15,
              lineHeight: 1.5,
              marginTop: 14,
              marginBottom: 0,
            }}
            data-testid="share-card-insight"
          >
            {insight}
          </p>
          <div
            style={{
              marginTop: 22,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 16,
            }}
          >
            <span
              className="font-mono-dm"
              style={{ color: "#A0B8A0", fontSize: 11 }}
            >
              IOMETE Sovereign Data Platform
            </span>
            <span
              className="font-mono-dm"
              style={{ color: "#A0B8A0", fontSize: 11 }}
            >
              iomete.com
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={handleDownload}
          className="font-inter rounded-md text-[14px] transition-colors hover:bg-[#F2EEEB]"
          style={{
            backgroundColor: C.cardBg,
            color: C.primary,
            border: `1px solid ${C.primary}`,
            padding: "10px 22px",
            fontWeight: 500,
            cursor: "pointer",
          }}
          data-testid="download-card-button"
        >
          Download Card
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Book a conversation CTA                                                    */
/* -------------------------------------------------------------------------- */
function BookCTA() {
  return (
    <div className="mt-10 text-center" data-testid="book-cta">
      <p
        className="font-inter text-[14px]"
        style={{ color: C.secondaryText, marginBottom: 14 }}
      >
        Ready to see what sovereign infrastructure looks like for your setup
      </p>
      <a
        href="https://iomete.com"
        target="_blank"
        rel="noopener noreferrer"
        className="font-inter inline-block rounded-md text-[15px] transition-colors"
        style={{
          backgroundColor: C.primary,
          color: C.accent,
          border: `1px solid ${C.primary}`,
          padding: "16px 28px",
          fontWeight: 500,
          textDecoration: "none",
        }}
        data-testid="book-cta-button"
      >
        Talk to IOMETE
      </a>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Result Card                                                                */
/* -------------------------------------------------------------------------- */
function RiskIndicator({ risk }) {
  // Marker x-position — biased to the right side of the corresponding zone
  const POSITIONS = { low: 28, moderate: 58, high: 92 };
  const markerPct = POSITIONS[risk] ?? 50;

  return (
    <div
      data-testid="risk-indicator"
      style={{
        backgroundColor: C.appBg,
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div
        className="mx-auto max-w-[1120px] px-5 sm:px-8"
        style={{ paddingTop: "24px", paddingBottom: "24px" }}
      >
        {/* Bar + marker */}
        <div
          style={{ position: "relative", height: 8, marginTop: 28 }}
          data-testid="risk-indicator-bar"
        >
          <div
            style={{
              display: "flex",
              height: 8,
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{ flex: 1, backgroundColor: "#617A61" }}
              data-testid="zone-low"
            />
            <div
              style={{ flex: 1, backgroundColor: "#E39740" }}
              data-testid="zone-moderate"
            />
            <div
              style={{ flex: 1, backgroundColor: "#2D382D" }}
              data-testid="zone-high"
            />
          </div>
          {/* Marker — vertical FLUORO line crossing the bar with diamond head on top */}
          <div
            data-testid="risk-marker"
            aria-hidden
            style={{
              position: "absolute",
              left: `${markerPct}%`,
              top: -24,
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              style={{ display: "block" }}
              data-testid="risk-marker-diamond"
            >
              <polygon points="8,0 16,8 8,16 0,8" fill={C.accent} />
            </svg>
            <div
              data-testid="risk-marker-line"
              style={{
                width: 3,
                height: 24,
                backgroundColor: C.accent,
              }}
            />
          </div>
        </div>

        {/* "Your organisation" label sits below the bar at the marker's x */}
        <div
          style={{ position: "relative", marginTop: 10, height: 16 }}
        >
          <div
            data-testid="risk-marker-label"
            className="font-inter"
            style={{
              position: "absolute",
              left: `${markerPct}%`,
              transform: "translateX(-50%)",
              fontSize: 12,
              color: C.primaryText,
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            Your organisation
          </div>
        </div>

        {/* Zone labels under the bar */}
        <div
          className="font-inter"
          style={{
            display: "flex",
            marginTop: 8,
            fontSize: 12,
            color: C.secondaryText,
          }}
        >
          <div
            style={{ flex: 1, textAlign: "center" }}
            data-testid="zone-label-low"
          >
            Low
          </div>
          <div
            style={{ flex: 1, textAlign: "center" }}
            data-testid="zone-label-moderate"
          >
            Moderate
          </div>
          <div
            style={{ flex: 1, textAlign: "center" }}
            data-testid="zone-label-high"
          >
            High
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Result Card                                                                */
/* -------------------------------------------------------------------------- */
function ResultCard({ title, body, testId }) {
  return (
    <div
      className="rounded-lg"
      style={{
        backgroundColor: C.cardBg,
        border: `1px solid ${C.border}`,
        borderLeft: `3px solid ${C.primary}`,
        padding: "24px",
      }}
      data-testid={testId}
    >
      <h2
        className="font-archivo text-[20px] sm:text-[22px]"
        style={{ color: C.primaryText, lineHeight: 1.2 }}
      >
        {title}
      </h2>
      <p
        className="font-inter mt-3 text-[15px]"
        style={{ color: C.primaryText, lineHeight: 1.6 }}
      >
        {body}
      </p>
    </div>
  );
}
