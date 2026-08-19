"use client";

import { useEffect, useRef, useState } from "react";

const WORDS = ["hizmet", "ürün", "tadilat", "temizlik", "nakliyat", "tamir"] as const;
const INTERVAL = 2600;

export function HeroSlot() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"idle" | "exit" | "enter">("idle");
  const nextIndex = useRef(1);

  useEffect(() => {
    const id = setInterval(() => {
      nextIndex.current = (index + 1) % WORDS.length;
      setPhase("exit");
    }, INTERVAL);
    return () => clearInterval(id);
  }, [index]);

  useEffect(() => {
    if (phase === "exit") {
      const t = setTimeout(() => {
        setIndex(nextIndex.current);
        setPhase("enter");
      }, 430);
      return () => clearTimeout(t);
    }
    if (phase === "enter") {
      const t = setTimeout(() => setPhase("idle"), 460);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const cls =
    phase === "exit"
      ? "slot-exit"
      : phase === "enter"
        ? "slot-enter"
        : "";

  return (
    <span
      aria-live="polite"
      className="relative inline-block overflow-hidden text-accent"
      style={{ minWidth: "4ch" }}
    >
      <span key={index} className={`inline-block ${cls}`}>
        {WORDS[index]}
      </span>
    </span>
  );
}
