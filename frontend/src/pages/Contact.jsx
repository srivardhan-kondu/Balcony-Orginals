import { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { api } from "@/lib/api";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Motion";

const SUBJECTS = [
  "General enquiry",
  "Production collaboration",
  "Feature-film partnership",
  "Documentary collaboration",
  "Tourism / cultural production",
  "Media / press",
  "Other",
];

const inputCls =
  "w-full border-b border-line bg-transparent py-3 text-[15px] text-bone placeholder:text-dim outline-none transition-colors duration-300 focus:border-gold";
const labelCls = "mb-1 block font-mono text-[10px] uppercase tracking-[0.22em] text-mute";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: SUBJECTS[0], message: "", website: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverMsg, setServerMsg] = useState("");

  useEffect(() => {
    document.title = "Contact — Balcony Originals";
  }, []);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!form.name.trim()) er.name = "Your name, please.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) er.email = "A valid email helps us reply.";
    if (form.message.trim().length < 3) er.message = "A few words at least.";
    setErrors(er);
    if (Object.keys(er).length) return;
    setStatus("sending");
    try {
      const res = await api.contact(form);
      setServerMsg(res.message || "");
      setStatus("done");
    } catch (err) {
      setServerMsg(err?.response?.data?.detail || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div data-testid="contact-page">
      <PageHero
        testid="contact-hero"
        overline="Contact"
        titleLines={["Let's talk."]}
        sub="Collaborations, partnerships, press, or a story that won't leave you alone — this is the door."
      />

      <div className="mx-auto max-w-[1560px] px-[var(--bo-gutter)] pb-[clamp(80px,12vh,150px)]">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.3fr]">
          <Reveal>
            <div className="lg:sticky lg:top-32">
              <div className="font-mono text-[10.5px] leading-[2.2] tracking-[0.2em] text-mute">
                BALCONY ORIGINALS
                <br />
                RAYALASEEMA · ANDHRA PRADESH
                <br />
                INDIA
              </div>
              <p className="mt-8 max-w-[40ch] text-sm leading-[1.75] text-mute">
                For story submissions with a creative heart, use the{" "}
                <a href="/submit-story" className="text-gold underline-offset-4 hover:underline">
                  Submit Your Story
                </a>{" "}
                form instead — it goes straight to the storytelling desk.
              </p>
              <ul className="mt-8 space-y-3.5">
                {SUBJECTS.slice(1, 6).map((s) => (
                  <li key={s} className="flex items-center gap-3 text-sm text-bone/65">
                    <span className="h-1 w-1 rotate-45 bg-gold/70" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            {status === "done" ? (
              <div
                data-testid="contact-success"
                className="rounded-sm border border-gold/30 bg-ink2/60 px-[clamp(24px,4vw,56px)] py-[clamp(48px,7vh,90px)] text-center"
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/50 text-gold">
                  <Check size={22} />
                </span>
                <h2 className="mt-8 font-serif text-[clamp(24px,3vw,38px)] leading-[1.1] text-bone">
                  Thank you — we have it.
                </h2>
                <p className="mx-auto mt-5 max-w-[46ch] text-[15px] leading-[1.7] text-mute">
                  {serverMsg || "We'll get back to you soon."}
                </p>
              </div>
            ) : (
              <form
                onSubmit={submit}
                data-testid="contact-form"
                className="rounded-sm border border-line bg-ink2/60 p-[clamp(24px,4vw,52px)]"
                noValidate
              >
                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-name" className={labelCls}>
                      Name <span className="text-gold">*</span>
                    </label>
                    <input
                      id="c-name"
                      data-testid="contact-name-input"
                      className={inputCls}
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Your full name"
                    />
                    {errors.name && <p data-testid="error-contact-name" className="mt-2 text-xs text-terra">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="c-email" className={labelCls}>
                      Email <span className="text-gold">*</span>
                    </label>
                    <input
                      id="c-email"
                      type="email"
                      data-testid="contact-email-input"
                      className={inputCls}
                      value={form.email}
                      onChange={set("email")}
                      placeholder="you@example.com"
                    />
                    {errors.email && <p data-testid="error-contact-email" className="mt-2 text-xs text-terra">{errors.email}</p>}
                  </div>
                </div>
                <div className="mt-8">
                  <label htmlFor="c-subject" className={labelCls}>
                    What's this about?
                  </label>
                  <select
                    id="c-subject"
                    data-testid="contact-subject-select"
                    className={`${inputCls} cursor-pointer bg-ink2`}
                    value={form.subject}
                    onChange={set("subject")}
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-8">
                  <label htmlFor="c-message" className={labelCls}>
                    Message <span className="text-gold">*</span>
                  </label>
                  <textarea
                    id="c-message"
                    data-testid="contact-message-textarea"
                    className={`${inputCls} min-h-[130px] resize-y leading-relaxed`}
                    value={form.message}
                    onChange={set("message")}
                    placeholder="Tell us what you have in mind…"
                  />
                  {errors.message && <p data-testid="error-contact-message" className="mt-2 text-xs text-terra">{errors.message}</p>}
                </div>

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

                {status === "error" && (
                  <p data-testid="contact-error" className="mt-6 border border-terra/50 bg-terra/10 px-4 py-3 text-sm text-bone/80">
                    {serverMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  data-testid="contact-submit-button"
                  className="mt-10 inline-flex w-full items-center justify-center gap-3 rounded-sm bg-gold px-8 py-4 text-xs font-medium uppercase tracking-[0.18em] text-ink transition-all duration-300 hover:bg-bone disabled:cursor-wait disabled:opacity-60"
                >
                  {status === "sending" ? "Sending…" : "Send Message"}
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
