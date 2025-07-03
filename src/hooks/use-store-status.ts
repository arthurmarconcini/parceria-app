import { useState, useEffect } from "react";

interface StoreStatus {
  isOpen: boolean;
  message: string;
}

export function useStoreStatus() {
  const [status, setStatus] = useState<StoreStatus>({
    isOpen: true,
    message: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/store/status")
      .then((res) => res.json())
      .then((data) => {
        setStatus(data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return { ...status, isLoading };
}
