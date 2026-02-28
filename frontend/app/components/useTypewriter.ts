import { useEffect, useState } from "react";

const TYPING_SPEED_MS = 20; // Milliseconds between each character

export function useTypewriter(text: string, shouldAnimate: boolean = true) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    // If animation is disabled or text hasn't changed, just show it all
    if (!shouldAnimate) {
      setDisplayedText(text);
      return;
    }

    // Reset displayed text when input changes
    if (!text) {
      setDisplayedText("");
      return;
    }

    let currentIndex = 0;
    setDisplayedText(""); // Reset to start animation

    const interval = setInterval(() => {
      currentIndex++;
      setDisplayedText(text.slice(0, currentIndex));

      if (currentIndex >= text.length) {
        clearInterval(interval);
      }
    }, TYPING_SPEED_MS);

    return () => clearInterval(interval);
  }, [text, shouldAnimate]);

  return displayedText;
}
