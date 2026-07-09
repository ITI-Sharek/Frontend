import { motion, stagger, useAnimate } from "framer-motion";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  duration?: number;
}

export function TextGenerateEffect({
  words,
  className,
  duration = 0.6,
}: TextGenerateEffectProps) {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    animate(
      "span",
      { opacity: 1, filter: "blur(0px)" },
      { duration, delay: stagger(0.1) },
    );
  }, [animate, duration]);

  return (
    <div ref={scope} className={cn("leading-snug", className)}>
      {wordsArray.map((word, idx) => (
        <motion.span
          key={word + idx}
          className="inline-block opacity-0"
          style={{ filter: "blur(8px)" }}
        >
          {word}
          {idx < wordsArray.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </div>
  );
}
