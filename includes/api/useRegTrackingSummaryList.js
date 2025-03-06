import {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import BASE_URL from '../../config';
import useUserInfo from './useUserInfo';

const useRegTrackingSummaryList = (Status, selectedYear) => {
  const [regTrackingSummaryListData, setRegTrackingSummaryListData] = useState([]);
  const [regTrackingSummaryListLoading, setRegTrackingSummaryListLoading] =
    useState(false);
  const [regTrackingSummaryListError, setRegTrackingSummaryListError] =
    useState(null);
  const {officeCode} = useUserInfo();

  const fetchRegTrackingSummaryList = useCallback(async () => {
    setRegTrackingSummaryListLoading(true);
    setRegTrackingSummaryListError(null);

    if (!officeCode) return;

    try {
      const response = await axios.get(`${BASE_URL}/regTrackingSummaryList`, {
        params: {OfficeCode: officeCode, Status, Year: selectedYear},
      });

      setRegTrackingSummaryListData(response?.data || []);
    } catch (err) {
      setRegTrackingSummaryListError(
        err.message || 'Failed to fetch tracking summary list.',
      );
    } finally {
      setRegTrackingSummaryListLoading(false);
    }
  }, [officeCode]);

  useEffect(() => {
    fetchRegTrackingSummaryList();
  }, [fetchRegTrackingSummaryList]);

  return {
    regTrackingSummaryListData,
    regTrackingSummaryListLoading,
    regTrackingSummaryListError,
    refetchRegTrackingSummaryList: fetchRegTrackingSummaryList,
  };
};

export default useRegTrackingSummaryList;
