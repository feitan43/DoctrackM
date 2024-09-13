import { useState, useEffect, useCallback } from 'react';
import useUserInfo from './useUserInfo';
import baseUrl from '../../config';

const useOthers = (selectedYear) => {
  const [data, setData] = useState({
    vouchers: null,
    others: null,
    loading: true,
    error: null,
  });

  const { officeCode } = useUserInfo();

  const currentYear = selectedYear || new Date().getFullYear();

  const fetchData = useCallback(async () => {
    if (!officeCode) return;

    try {
      setData(prev => ({ ...prev, loading: true }));

      const [vouchersRes, othersRes] = await Promise.all([
        fetch(`${baseUrl}/othersVouchers?office=${officeCode}&year=${currentYear}`),
        fetch(`${baseUrl}/othersOthers?office=${officeCode}&year=${currentYear}`),
      ]);

      if (!vouchersRes.ok || !othersRes.ok) {
        throw new Error('Network response was not ok');
      }

      const [vouchersData, othersData] = await Promise.all([
        vouchersRes.json(),
        othersRes.json(),
      ]);


      setData({
        vouchers: vouchersData,
        others: othersData,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      setData({
        vouchers: null,
        others: null,
        loading: false,
        error: err,
      });
    }
  }, [officeCode, currentYear]);

  useEffect(() => {
    let isMounted = true;

    if (officeCode && isMounted) {
      fetchData();
    }

    return () => {
      isMounted = false; // Cleanup to prevent memory leaks
    };
  }, [fetchData, officeCode]);

  return {
    othersVouchersData: data.vouchers,
    othersOthersData: data.others,
    loadingUseOthers: data.loading,
    error: data.error,
    refetchDataOthers: fetchData, // Allow manual refetch if needed
  };
};

export default useOthers;
