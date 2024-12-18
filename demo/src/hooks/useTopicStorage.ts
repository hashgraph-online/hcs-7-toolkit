import { useState, useMemo, useCallback } from "react";
import { useIDBStorage, getDB } from "./useIDBStorage";

const STORE_NAME = "topics";
const TOPIC_KEY = "topic-info";

interface Topic {
  topicId: string;
  submitKey: string;
  adminKey: string;
  createdAt: string;
  submittedConfigs: {
    evm: number;
    wasm: number;
    hcs1: number;
  };
  submittedEvmConfigs: Array<{
    contractAddress: string;
    functionName: string;
  }>;
}

interface TopicInfo {
  topics: Topic[];
  currentTopicId: string;
}

export interface TopicState extends Topic {}

const emptyTopicInfo: TopicInfo = {
  topics: [],
  currentTopicId: "",
};

export function useTopicStorage() {
  const [topicInfo, setTopicInfo, , topicLoading] = useIDBStorage<TopicInfo>(
    TOPIC_KEY,
    emptyTopicInfo,
    STORE_NAME
  );

  const [error, setError] = useState(null);

  const updateTopic = useCallback(
    async (topic: TopicState, shouldSelect: boolean = true) => {
      try {
        const db = await getDB(STORE_NAME);
        const currentData =
          ((await db.get(STORE_NAME, TOPIC_KEY)) as TopicInfo) ||
          emptyTopicInfo;

        const existingIndex = currentData.topics.findIndex(
          (t) => t.topicId === topic.topicId
        );
        const newTopics = [...currentData.topics];
        if (existingIndex >= 0) {
          newTopics[existingIndex] = topic;
        } else if (topic.topicId) {
          newTopics.push(topic);
        }

        console.log("[DEBUG] Before setTopicInfo:", {
          newTopics,
          TOPIC_KEY,
          topic,
          currentId: currentData.currentTopicId,
        });

        let retryCount = 0;
        const maxRetries = 3;
        let success = false;

        while (retryCount < maxRetries && !success) {
          success = await setTopicInfo({
            topics: newTopics,
            currentTopicId: shouldSelect
              ? topic.topicId
              : currentData.currentTopicId,
          });

          if (!success) {
            console.log(
              `[DEBUG] Retry attempt ${retryCount + 1} of ${maxRetries}`
            );
            await new Promise((resolve) =>
              setTimeout(resolve, 100 * Math.pow(2, retryCount))
            );
            retryCount++;
          }
        }

        console.log("[DEBUG] After setTopicInfo:", { success, retryCount });

        if (!success) {
          throw new Error("Failed to update topic in IndexedDB after retries");
        }

        return true;
      } catch (error) {
        console.error("[ERROR] Error updating topic:", {
          error,
          topic,
          shouldSelect,
          topicInfoState: {
            topics: topicInfo.topics,
            currentId: topicInfo.currentTopicId,
          },
        });
        setError(error);
        return false;
      }
    },
    []
  );

  const selectTopic = useCallback(async (topicId: string) => {
    try {
      const db = await getDB(STORE_NAME);
      const currentData =
        ((await db.get(STORE_NAME, TOPIC_KEY)) as TopicInfo) || emptyTopicInfo;

      await setTopicInfo({
        ...currentData,
        currentTopicId: topicId,
      });
      return true;
    } catch (error) {
      console.error("Error selecting topic:", error);
      setError(error);
      return false;
    }
  }, []);

  const removeTopic = useCallback(async (topicId: string) => {
    try {
      const db = await getDB(STORE_NAME);
      const currentData =
        ((await db.get(STORE_NAME, TOPIC_KEY)) as TopicInfo) || emptyTopicInfo;

      const newTopics = currentData.topics.filter((t) => t.topicId !== topicId);
      await setTopicInfo({
        topics: newTopics,
        currentTopicId:
          topicId === currentData.currentTopicId
            ? ""
            : currentData.currentTopicId,
      });
      return true;
    } catch (error) {
      console.error("Error removing topic:", error);
      setError(error);
      return false;
    }
  }, []);

  const currentTopic = useMemo(() => {
    const topic = topicInfo.topics.find(
      (t) => t.topicId === topicInfo.currentTopicId
    );
    return topic || null;
  }, [topicInfo.topics, topicInfo.currentTopicId]);

  return {
    currentTopic,
    existingTopics: topicInfo.topics.filter((t) => Boolean(t.topicId)),
    loading: topicLoading,
    error,
    updateTopic,
    selectTopic,
    removeTopic,
  };
}
