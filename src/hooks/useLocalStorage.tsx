import { useEffect, useLayoutEffect, useState } from "react";

const useLocalStorage = (key: string, defaultValue: any) => {
  const [value, setValue] = useState(defaultValue);
  const [isMounted, setIsMounted] = useState(false);

  useLayoutEffect(() => {
    const currentValue = JSON.parse(
      localStorage.getItem(key) || `"${String(defaultValue)}"`
    );
    setValue(currentValue ?? defaultValue);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key, isMounted]);

  return [value, setValue];
};

export default useLocalStorage;
