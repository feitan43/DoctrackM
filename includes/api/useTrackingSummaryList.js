import {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import BASE_URL from '../../config';
import useUserInfo from './useUserInfo';

const useTrackingSummaryList = (Status, selectedYear) => {
  const [trackingSummaryListData, setTrackingSummaryListData] = useState([]);
  const [trackingSummaryListLoading, setTrackingSummaryListLoading] =
    useState(false);
  const [trackingSummaryListError, setTrackingSummaryListError] =
    useState(null);
  const {officeCode} = useUserInfo();

  const fetchTrackingSummaryList = useCallback(async () => {
    setTrackingSummaryListLoading(true);
    setTrackingSummaryListError(null);

    if (!officeCode) return;

    try {
      const response = await axios.get(`${BASE_URL}/trackingSummaryList`, {
        params: {OfficeCode: officeCode, Status, Year: selectedYear},
      });

      setTrackingSummaryListData(response?.data || []);
    } catch (err) {
      setTrackingSummaryListError(
        err.message || 'Failed to fetch tracking summary list.',
      );
    } finally {
      setTrackingSummaryListLoading(false);
    }
  }, [officeCode]);

  useEffect(() => {
    fetchTrackingSummaryList();
  }, [fetchTrackingSummaryList]);

  return {
    trackingSummaryListData,
    trackingSummaryListLoading,
    trackingSummaryListError,
    refetchTrackingSummaryList: fetchTrackingSummaryList,
  };
};

export default useTrackingSummaryList;
