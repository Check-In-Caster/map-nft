import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, milliSeconds: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, milliSeconds);

    return () => {
      clearTimeout(timeout);
    };
  }, [value, milliSeconds]);

  if (typeof value === "string" && value === "") return "";
  return debouncedValue;
}
