import { useEffect, useState, startTransition } from "react";

export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setHydrated(true);
    });
  }, []);

  return hydrated;
}
