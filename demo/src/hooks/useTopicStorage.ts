import { useState, useEffect, useMemo, useCallback } from "react";
import { useIDBStorage } from "./useIDBStorage";

const DB_NAME = "hcs-7-toolkit-storage";
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
        const existingIndex = topicInfo.topics.findIndex(
          (t) => t.topicId === topic.topicId
        );
        const newTopics = [...topicInfo.topics];
        if (existingIndex >= 0) {
          newTopics[existingIndex] = topic;
        } else if (topic.topicId) {
          newTopics.push(topic);
        }

        console.log("setting new topic", newTopics, TOPIC_KEY, topic);

        await setTopicInfo({
          topics: newTopics,
          currentTopicId: shouldSelect
            ? topic.topicId
            : topicInfo.currentTopicId,
        });
        return true;
      } catch (error) {
        console.error("Error updating topic:", error);
        setError(error);
        return false;
      }
    },
    [topicInfo?.topics, topicInfo?.currentTopicId]
  );

  const selectTopic = useCallback(
    async (topicId: string) => {
      try {
        await setTopicInfo({
          ...topicInfo,
          currentTopicId: topicId,
        });
        return true;
      } catch (error) {
        console.error("Error selecting topic:", error);
        setError(error);
        return false;
      }
    },
    [setTopicInfo, topicInfo]
  );

  const removeTopic = useCallback(
    async (topicId: string) => {
      try {
        const newTopics = topicInfo.topics.filter((t) => t.topicId !== topicId);
        await setTopicInfo({
          topics: newTopics,
          currentTopicId:
            topicId === topicInfo.currentTopicId
              ? ""
              : topicInfo.currentTopicId,
        });
        return true;
      } catch (error) {
        console.error("Error removing topic:", error);
        setError(error);
        return false;
      }
    },
    [topicInfo.topics, topicInfo.currentTopicId]
  );

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
