import { useCallback } from 'react';
import { postHogClient } from '@/services/post-hog-client';

export const usePostHogClient = () => {
  const capture = useCallback((eventName: string, properties?: Record<string, any>) => {
    postHogClient.capture(eventName, properties);
  }, []);

  const identify = useCallback((userId: string, properties?: Record<string, any>) => {
    postHogClient.identify(userId, properties);
  }, []);

  const setUserProperties = useCallback((properties: Record<string, any>) => {
    postHogClient.setUserProperties(properties);
  }, []);

  const screen = useCallback((screenName: string, properties?: Record<string, any>) => {
    postHogClient.screen(screenName, properties);
  }, []);

  const reset = useCallback(() => {
    postHogClient.reset();
  }, []);

  const getDistinctId = useCallback(() => {
    return postHogClient.getDistinctId();
  }, []);

  const isReady = useCallback(() => {
    return postHogClient.isReady();
  }, []);

  return {
    capture,
    identify,
    setUserProperties,
    screen,
    reset,
    getDistinctId,
    isReady,
    client: postHogClient.getClient(),
  };
};

export default usePostHogClient;
