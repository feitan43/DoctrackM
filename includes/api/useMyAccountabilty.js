import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import BASE_URL from '../../config'; 
import useUserInfo from './useUserInfo'; 

const useMyAccountability = () => {
  const { employeeNumber } = useUserInfo();


  const queryKey = ['myAccountability', employeeNumber];

  const fetchAccountabilityData = async () => {
    if (!employeeNumber) {
      throw new Error('Employee number is not available.');
    }

    const response = await axios.get(
      `${BASE_URL}/myAccountability?EmployeeNumber=${employeeNumber}`,
      {
        timeout: 10000, 
      }
    );
    return response.data;
  };

  const {
    data: accountabilityData, 
    isLoading,            
    isError,              
    error,                
    refetch,              
  } = useQuery({
    queryKey: queryKey,
    queryFn: fetchAccountabilityData,
    enabled: !!employeeNumber,
  });

  return {
    accountabilityData,
    loading: isLoading, 
    error: isError ? (error?.message || 'An error occurred.') : null,
    fetchMyAccountability: refetch, 
  };
};

export default useMyAccountability;