"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  learning,
  terminalCommands,
  terminalIntro,
} from "@/data/content";
import { useInView } from "@/hooks/useInView";
import { useMotionProfile } from "@/hooks/useMotionProfile";

type Line = {
  kind: "cmd" | "out" | "error";
  text: string;
};

export function Workbench() {
  const { ref: sectionRef, inView } = useInView<HTMLElement>("240px", 0.05);
  const { reduced } = useMotionProfile();
  const inputRef = useRef<HTMLInputElement>(null);
  const [typed, setTyped] = useState(terminalIntro);
  const [hasTyped, setHasTyped] = useState(false);
  const [typing, setTyping] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [vba, setVba] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  /* The prompt types itself once, before it reaches the viewport. */
  useEffect(() => {
    if (!inView || reduced || hasTyped) return;
    let index = 0;
    let timer = 0;
    const start = requestAnimationFrame(() => {
      setTyped("");
      setTyping(true);
      timer = window.setInterval(() => {
        index += 1;
        setTyped(terminalIntro.slice(0, index));
        if (index >= terminalIntro.length) {
          window.clearInterval(timer);
          setTyping(false);
          setHasTyped(true);
        }
      }, 30);
    });
    return () => {
      cancelAnimationFrame(start);
      window.clearInterval(timer);
      setTyping(false);
    };
  }, [inView, reduced, hasTyped]);

  const stopTyping = () => {
    if (!typing) return;
    setTyped(terminalIntro);
    setTyping(false);
    setHasTyped(true);
  };

  const scrollTo = useCallback(
    (id: string) => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    },
    [reduced],
  );

  const run = (raw: string) => {
    const command = raw.trim().toLowerCase();
    if (!command) return;

    if (command === "clear") {
      setLines([]);
      return;
    }

    if (command === "vba") {
      const next = !vba;
      setVba(next);
      setLines((current) => [
        ...current,
        { kind: "cmd", text: raw },
        next
          ? { kind: "out", text: "Re-skinning to the VBA Immediate Window." }
          : { kind: "out", text: "Back to the plant terminal." },
        {
          kind: "out",
          text: next
            ? "Windows software in VBA is in service. Type vba again to return."
            : "Command line restored.",
        },
      ]);
      return;
    }

    const output = terminalCommands[command];

    if (!output) {
      setLines((current) => [
        ...current,
        { kind: "cmd", text: raw },
        { kind: "error", text: `command not found: ${command}. Type help.` },
      ]);
      return;
    }

    setLines((current) => [
      ...current,
      { kind: "cmd", text: raw },
      ...output.map((text) => ({ kind: "out" as const, text })),
    ]);

    if (command === "contact") {
      window.setTimeout(() => scrollTo("grid"), 350);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = input.trim();
    if (!value) return;
    stopTyping();
    run(value);
    setHistory((current) => [value, ...current].slice(0, 24));
    setHistoryIndex(-1);
    setInput("");
  };

  const onInputKey = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      inputRef.current?.blur();
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (history.length === 0) return;
      const next = Math.min(history.length - 1, historyIndex + 1);
      setHistoryIndex(next);
      setInput(history[next]);
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setInput("");
        return;
      }
      const next = historyIndex - 1;
      setHistoryIndex(next);
      setInput(history[next]);
    }
  };

  /* "/" opens the terminal from anywhere. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          "input, textarea, select, [contenteditable='true'], [role='textbox']",
        )
      ) {
        return;
      }
      event.preventDefault();
      scrollTo("workbench");
      window.setTimeout(
        () => inputRef.current?.focus({ preventScroll: true }),
        reduced ? 30 : 480,
      );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reduced, scrollTo]);

  return (
    <section
      id="workbench"
      ref={sectionRef}
      className="stage workbench"
      aria-labelledby="workbench-title"
    >
      <div className="shell">
        <header className="stage-head" data-reveal>
          <p className="stage-kicker">
            <span>STAGE 04 / WORKBENCH</span>
            <span>WHAT I&apos;M GROWING INTO</span>
          </p>
          <h2 id="workbench-title" className="stage-title">
            Workbench<span className="accent">.</span>
          </h2>
          <p className="stage-sub">
            The honest current state. Linux is in daily use. Python, AI and
            robotics are in progress — no fake projects or certificates.
          </p>
        </header>

        <div className="workbench__grid" data-reveal>
          <aside className="workbench__side" aria-label="Learning status">
            <p className="label">LEARNING QUEUE</p>
            <ul className="learning-list">
              {learning.map((item) => (
                <li key={item.code}>
                  <div className="learning-list__head">
                    <span className="learning-list__code">{item.code}</span>
                    <span className="tag tag--amber">{item.status}</span>
                  </div>
                  <strong>{item.name}</strong>
                  <p>{item.note}</p>
                </li>
              ))}
            </ul>
            <div className="workbench__linux">
              <span className="tag tag--cyan">LINUX</span>
              <p>I know it well and use it.</p>
            </div>
            <p className="workbench__hint">
              Press <kbd>/</kbd> anywhere to jump here and type.
            </p>
          </aside>

          <div className={`terminal ${vba ? "terminal--vba" : ""}`}>
            <div className="terminal__bar">
              <span className="terminal__title">
                {vba ? "Immediate" : "shreeram@selang:~"}
              </span>
              <span className="terminal__meta">
                {vba ? "VBA / WINDOWS" : "TTY-01 / LOCAL"}
              </span>
            </div>

            <div className="terminal__body">
              <p className="terminal__banner" aria-hidden="true">
                {typed}
                {typing ? <span className="terminal__caret" /> : null}
              </p>

              <p className="terminal__hint">
                Type <code>help</code> for commands. Try <code>vba</code> for the
                old grey Immediate Window.
              </p>

              <div
                className="terminal__out"
                role="log"
                aria-live="polite"
                aria-label="Terminal output"
              >
                {lines.map((line, index) => (
                  <p key={`${line.text}-${index}`} className={`terminal__line terminal__line--${line.kind}`}>
                    {line.kind === "cmd" ? (
                      <>
                        <span className="terminal__prompt">
                          {vba ? "Immediate>" : "shreeram@selang:~$"}
                        </span>{" "}
                        {line.text}
                      </>
                    ) : (
                      line.text || " "
                    )}
                  </p>
                ))}
              </div>

              <form className="terminal__form" onSubmit={onSubmit}>
                <label className="sr-only" htmlFor="terminal-input">
                  Terminal command
                </label>
                <span className="terminal__prompt" aria-hidden="true">
                  {vba ? "Immediate>" : "shreeram@selang:~$"}
                </span>
                <input
                  ref={inputRef}
                  id="terminal-input"
                  className="terminal__input"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={onInputKey}
                  onFocus={stopTyping}
                  placeholder="type a command…"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  aria-keyshortcuts="/"
                />
                <span className="terminal__caret" aria-hidden="true" />
                <button type="submit" className="sr-only">
                  Run command
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
