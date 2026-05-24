import { useEffect, useState } from "react";

export function useCountdown(expiresAt?: string) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;

    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      setTimeLeft(Math.max(diff, 0));
    };

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const totalSeconds = Math.floor(timeLeft / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return { totalSeconds, formatted };
}
