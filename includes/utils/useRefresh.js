// useRefresh.js
import { useState, useCallback } from 'react';

const useRefresh = (fetchData) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    console.log('onRefresh called');
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  return { refreshing, onRefresh };
};

export default useRefresh;
