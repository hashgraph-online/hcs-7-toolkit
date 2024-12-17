import { useEffect, useState } from "react";
import { Job } from "@/components/Upload/Job";
import { useWallet } from "./useWallets";

export function useJobs(mimeType?: string) {
  const walletReponse = useWallet();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const accountId = walletReponse?.accountInfo?.accountId;

  useEffect(() => {
    async function fetchJobs() {
      if (!accountId) {
        setJobs([]);
        setLoading(false);
        return;
      }

      try {
        const options = {
          method: "GET",
          headers: {
            "x-account-id": accountId,
            ...(mimeType && { "x-mime-type": mimeType }),
          },
        };

        const response = await fetch(
          "https://kiloscribe.com/api/jobs",
          options
        );
        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }

        const data = await response.json();
        setJobs(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch jobs")
        );
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [accountId, mimeType]);

  return { jobs, loading, error };
}
