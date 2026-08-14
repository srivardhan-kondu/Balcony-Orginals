import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { api } from "@/lib/api";
import { PageHero } from "@/components/PageHero";
import { Reveal, MaskLines } from "@/components/Motion";

const CATEGORIES = ["Culture", "Devotional", "Heritage", "People", "Feature Film", "Other"];

const inputCls =
  "w-full border-b border-line bg-transparent py-3 text-[15px] text-bone placeholder:text-dim outline-none transition-colors duration-300 focus:border-gold";
const labelCls = "mb-1 block font-mono text-[10px] uppercase tracking-[0.22em] text-bone/50";

const Field = ({ label, required, children, htmlFor }) => (
  <div>
    <label htmlFor={htmlFor} className={labelCls}>
      {label} {required && <span className="text-gold">*</span>}
    </label>
    {children}
  </div>
);

export default function SubmitStory() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    one_line_story: "",
    category: "",
    note: "",
    consent: false,
    website: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverMsg, setServerMsg] = useState("");

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = "We'd like to know who's telling the story.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) er.email = "A valid email helps us reach you.";
    if (form.one_line_story.trim().length < 3) er.one_line_story = "Give us the story — even one honest line is enough.";
    if (!form.consent) er.consent = "We need your permission to reach out.";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    try {
      const res = await api.submitStory(form);
      setServerMsg(res.message || "");
      setStatus("done");
    } catch (err) {
      setServerMsg(err?.response?.data?.detail || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const reset = () => {
    setForm({ name: "", email: "", phone: "", location: "", one_line_story: "", category: "", note: "", consent: false, website: "" });
    setStatus("idle");
    setServerMsg("");
  };

  return (
    <div data-testid="submit-story-page">
      <PageHero
        testid="submit-hero"
        overline="Stories are gems"
        titleLines={["Your story", "might be a gem."]}
        sub="Have a story, idea or lived experience that deserves a bigger canvas? If you have the story but need the backbone to bring it to life, tell us in a few lines."
      />

      <div className="mx-auto max-w-[1560px] px-[clamp(18px,4vw,58px)] pb-[clamp(80px,12vh,150px)]">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.3fr]">
          <Reveal>
            <div className="lg:sticky lg:top-32">
              <div className="font-telugu text-[clamp(24px,2.6vw,36px)] leading-[1.5] text-gold/90">
                ప్రతి కథ ఒక రత్నం
              </div>
              <p className="mt-6 max-w-[46ch] text-[15px] leading-[1.75] text-mute">
                You don't need a screenplay. You don't need contacts in the industry. If the story is true and
                it matters to you, that's enough to knock on our door.
              </p>
              <ul className="mt-9 space-y-4">
                {[
                  "Reviewed personally by our core team",
                  "Never published or shared publicly",
                  "Your details stay private — always",
                  "We reach out only if it fits our slate",
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-3.5 text-sm text-bone/70">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-none rotate-45 bg-gold" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            {status === "done" ? (
              <div
                data-testid="submit-story-success"
                className="rounded-sm border border-gold/30 bg-ink2/60 px-[clamp(24px,4vw,56px)] py-[clamp(48px,7vh,90px)] text-center"
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/50 text-gold">
                  <Check size={22} />
                </span>
                <h2 className="mt-8 font-display font-extrabold uppercase tracking-[-0.015em] text-[clamp(24px,3.6vw,46px)] leading-[1.04] text-bone">
                  <MaskLines lines={["Thank you for trusting", "us with your story."]} lastClassName="text-sand" />
                </h2>
                <p className="mx-auto mt-7 max-w-[52ch] text-[15px] leading-[1.7] text-mute">
                  {serverMsg ||
                    "Our team will review your submission and reach out if it fits our current storytelling or production interests."}
                </p>
                <button
                  onClick={reset}
                  data-testid="submit-another-btn"
                  className="mt-10 rounded-sm border border-bone/25 px-6 py-3.5 text-xs uppercase tracking-[0.15em] text-bone transition-colors hover:border-gold hover:text-gold"
                >
                  Submit another story
                </button>
              </div>
            ) : (
              <form
                onSubmit={submit}
                data-testid="story-submission-form"
                className="rounded-sm border border-line bg-ink2/60 p-[clamp(24px,4vw,52px)]"
                noValidate
              >
                <div className="grid gap-8 sm:grid-cols-2">
                  <Field label="Name" required htmlFor="ss-name">
                    <input
                      id="ss-name"
                      data-testid="submit-story-name-input"
                      className={inputCls}
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Your full name"
                    />
                    {errors.name && <p data-testid="error-name" className="mt-2 text-xs text-terra">{errors.name}</p>}
                  </Field>
                  <Field label="Email" required htmlFor="ss-email">
                    <input
                      id="ss-email"
                      type="email"
                      data-testid="submit-story-email-input"
                      className={inputCls}
                      value={form.email}
                      onChange={set("email")}
                      placeholder="you@example.com"
                    />
                    {errors.email && <p data-testid="error-email" className="mt-2 text-xs text-terra">{errors.email}</p>}
                  </Field>
                  <Field label="Phone / WhatsApp" htmlFor="ss-phone">
                    <input
                      id="ss-phone"
                      data-testid="submit-story-phone-input"
                      className={inputCls}
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder="+91 · optional"
                    />
                  </Field>
                  <Field label="Location" htmlFor="ss-location">
                    <input
                      id="ss-location"
                      data-testid="submit-story-location-input"
                      className={inputCls}
                      value={form.location}
                      onChange={set("location")}
                      placeholder="Village / town / city"
                    />
                  </Field>
                </div>

                <div className="mt-8">
                  <Field label="Tell us the story in one line" required htmlFor="ss-line">
                    <textarea
                      id="ss-line"
                      data-testid="submit-story-logline-input"
                      className={`${inputCls} min-h-[76px] resize-y font-serif text-lg italic leading-relaxed`}
                      value={form.one_line_story}
                      onChange={set("one_line_story")}
                      placeholder="In my grandmother's village, there is a lamp that has not gone out in ninety years…"
                    />
                  </Field>
                  {errors.one_line_story && (
                    <p data-testid="error-logline" className="mt-2 text-xs text-terra">{errors.one_line_story}</p>
                  )}
                </div>

                <div className="mt-8 grid gap-8 sm:grid-cols-2">
                  <Field label="Story category" htmlFor="ss-category">
                    <select
                      id="ss-category"
                      data-testid="submit-story-category-select"
                      className={`${inputCls} cursor-pointer bg-ink2`}
                      value={form.category}
                      onChange={set("category")}
                    >
                      <option value="">Choose one (optional)</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Anything else?" htmlFor="ss-note">
                    <input
                      id="ss-note"
                      data-testid="submit-story-synopsis-textarea"
                      className={inputCls}
                      value={form.note}
                      onChange={set("note")}
                      placeholder="Context, links, background — optional"
                    />
                  </Field>
                </div>

                {/* honeypot */}
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={set("website")}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div className="mt-10">
                  <label className="flex cursor-pointer items-start gap-3.5 text-sm leading-relaxed text-bone/70">
                    <input
                      type="checkbox"
                      data-testid="submit-story-consent-checkbox"
                      checked={form.consent}
                      onChange={set("consent")}
                      className="mt-1 h-4 w-4 flex-none cursor-pointer appearance-none rounded-sm border border-line bg-transparent transition-colors checked:border-gold checked:bg-gold"
                    />
                    <span>
                      You may contact me about this submission. I understand Balcony Originals will not publish
                      or share my story or details publicly.
                    </span>
                  </label>
                  {errors.consent && (
                    <p data-testid="error-consent" className="mt-2 text-xs text-terra">{errors.consent}</p>
                  )}
                </div>

                {status === "error" && (
                  <p data-testid="submit-story-error" className="mt-6 border border-terra/50 bg-terra/10 px-4 py-3 text-sm text-bone/80">
                    {serverMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  data-testid="submit-story-submit-button"
                  className="mt-10 inline-flex w-full items-center justify-center gap-3 rounded-sm bg-gold px-8 py-4 text-xs font-medium uppercase tracking-[0.18em] text-ink transition-all duration-300 hover:bg-bone disabled:cursor-wait disabled:opacity-60"
                >
                  {status === "sending" ? "Sending your story…" : "Submit Your Story"}
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </div>
  );
}
