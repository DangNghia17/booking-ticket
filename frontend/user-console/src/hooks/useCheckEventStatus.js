import { useEffect } from 'react';
import { useCheckEventsStatus } from '../api/services/eventServices';

export const useCheckEventStatus = () => {
  const { data, error, isLoading, refetch } = useCheckEventsStatus();

  useEffect(() => {
    // Check status khi component mount
    refetch();

    // Set up interval để check định kỳ
    const interval = setInterval(() => {
      refetch();
    }, 1000 * 60 * 10); // 10 phút

    return () => clearInterval(interval);
  }, [refetch]);

  return {
    statusData: data,
    statusError: error,
    isCheckingStatus: isLoading
  };
}; 