import { useCallback, useEffect, useRef, useState } from "react";

export function useNotice(initialMessage = "", duration = 2800) {
  const [notice, setNotice] = useState(initialMessage);
  const timerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const toast = useCallback(
    (message) => {
      setNotice(message);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setNotice(""), duration);
    },
    [duration]
  );

  return { notice, setNotice, toast };
}
