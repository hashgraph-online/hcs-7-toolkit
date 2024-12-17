import { useEffect, useState, useCallback, useMemo } from "react";
import { isValid } from "date-fns";
import { Job } from "@/components/Upload/Job";
import { useWallet } from "./useWallets";

export interface MappedJob {
  name: string;
  topic: string;
  network: string;
  imageTopicId: string;
  created?: Date;
  createdAt?: Date;
  mimeType?: string;
  id: string;
  type: string;
  fileStandard?: string;
}

export const useMyJobs = (includeCollections: number = 0) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [mappedJobs, setMappedJobs] = useState<MappedJob[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const walletInfo = useWallet();
  const accountId = walletInfo?.accountInfo?.accountId;

  const fetchTransaction = useCallback(async () => {
    if (!accountId || loading) {
      return;
    }
    setLoading(true);
    try {
      const options = {
        method: "GET",
        headers: {
          "x-account-id": accountId,
          'x-type': 'hashinal',
        },
      };

      const response = await fetch("https://kiloscribe.com/api/jobs", options);
      const allJobs = (await response.json()) as Job[];
      if ((allJobs?.length || 0) > 0) {
        setJobs(allJobs);
      }
    } catch (err) {
      console.error("Error fetching transaction:", err);
      setError("Failed to fetch transaction");
    } finally {
      setLoading(false);
    }
  }, [accountId, loading, includeCollections]);

  useEffect(() => {
    const intervalId = setInterval(fetchTransaction, 5000); // Poll every 5 seconds
    return () => clearInterval(intervalId);
  }, [fetchTransaction]);

  useEffect(() => {
    const getMapped = async () => {
      if (jobs.length > 0) {
        const mapped: MappedJob[] = [];
        for (const job of jobs) {
          let actualJob = { ...job };
          if (actualJob.mimeType === "application/json") {
            try {
              const actualMetadata = await fetch(
                `https://kiloscribe.com/api/inscription-cdn/${job.topic_id}?network=${job.network}`
              );
              const metadata = await actualMetadata.json();
              actualJob.jsonTopicId = job.topic_id;
              actualJob.topic_id = metadata?.image.replace("hcs://1/", "");
            } catch (e) {
              // console.error('Error fetching metadata:', e);
            }
          } else if (actualJob.type === "hashinal-collection") {
            const topicId = actualJob.files?.imageUploads?.[0]?.topicId;
            const jsonTopicId = actualJob?.files?.metadataUploads?.[0]?.topicId;

            if (!topicId || !jsonTopicId) {
              continue;
            }
            actualJob.topic_id = topicId;
            actualJob.jsonTopicId = jsonTopicId;
          }
          mapped.push({
            ...actualJob,
            id: actualJob.tx_id,
            createdAt: actualJob.createdAt
              ? new Date(actualJob.createdAt)
              : undefined,
          });
        }
        setMappedJobs(mapped);
      }
    };
    getMapped();
  }, [jobs]);

  return {
    jobs: jobs.map((a) => ({
      ...a,
      id: a.tx_id,
      createdAt: new Date(a.createdAt),
    })),
    mappedJobs,
    loading,
    error,
  };
};

export const useMappedJobs = (onlyJSON: boolean = true) => {
  const { jobs } = useMyJobs(1);
  const [sortedJobs, setSortedJobs] = useState<MappedJob[]>([]);

  useEffect(() => {
    const processJobs = async () => {
      const allJobs: MappedJob[] = [];
      
      for (const a of jobs) {
        const created = isValid(new Date(a.createdAt))
          ? new Date(a.createdAt)
          : new Date();
        const isFile = a.type === "upload" || a.type === "file";
        
        if (a.type === "hashinal-collection" || a.mimeType?.includes("zip")) {
          const mapped = a.files?.metadataUploads?.map((file) => {
            const imageTopicId = file?.metadata?.image?.replace("hcs://1/", "");
            const metadataMimeType = file?.metadata?.type;
            return {
              name: file.name,
              topic: file.topicId,
              network: a?.network || "mainnet",
              mimeType: metadataMimeType,
              fileStandard: a?.fileStandard?.toString(),
              type: a.type,
              imageTopicId,
              created,
              id: a.tx_id,
            };
          });
          if (Number(mapped?.length || 0) > 0) {
            allJobs.push(...mapped);
          }
        } else if (a.type === "hashinal" || isFile) {
          let imageTopicId = a.topic_id;
          let jsonTopicId = a.jsonTopicId;
          let mimeType = a.mimeType;

          if (mimeType === "application/json" && isFile) {
            try {
              const actualMetadata = await fetch(
                `https://kiloscribe.com/api/inscription-cdn/${a.topic_id}?network=${a.network}`
              );
              const metadata = await actualMetadata.json();
              jsonTopicId = a.topic_id;
              imageTopicId = metadata?.image.replace("hcs://1/", "");
              const actualMimeType = metadata?.type;

              if (actualMimeType) {
                mimeType = metadata?.type;
              }
            } catch (e) {
              // console.error('Error fetching metadata:', e);
            }
          }
          if (Boolean(jsonTopicId?.length || 0 > 0) || !onlyJSON) {
            allJobs.push({
              id: a.tx_id,
              name: a.name,
              topic: jsonTopicId,
              network: a?.network || "mainnet",
              mimeType: mimeType,
              type: a?.type,
              imageTopicId,
              fileStandard: a?.fileStandard?.toString(),
              created,
            });
          }
        }
      }
      
      const sorted = allJobs.sort((a, b) => {
        const dateA = a?.created?.getTime() || 0;
        const dateB = b?.created?.getTime() || 0;
        return dateB - dateA;
      });
      
      setSortedJobs(sorted);
    };

    processJobs();
  }, [jobs, onlyJSON]);

  return sortedJobs;
};
