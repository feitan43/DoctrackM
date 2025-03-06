import { useMutation } from '@tanstack/react-query';
import { evaluatorRevert } from '../api/evaluateApi';
import useUserInfo from '../api/useUserInfo';
import { showMessage } from 'react-native-flash-message';  // Assuming you are using this for message feedback.

export const useEvaluateRevert = () => {
  const { employeeNumber } = useUserInfo(); 

  return useMutation({
    mutationFn: async (item) => {
      const { Year, TrackingNumber, Status } = item;

      const response = await evaluatorRevert({
        Year,
        TrackingNumber,
        EmployeeNumber: employeeNumber, 
        Status,
      });


      return response.data;
    },
    onError: (error) => {
      console.error('Error during evaluation:', error);
      // Show an error message to the user.
      showMessage({
        message: 'Error during evaluation',
        description: error.message || 'Something went wrong',
        type: 'danger',
      });
    },
    onSuccess: (data) => {
      console.log('Evaluation successful:', data);
      // Show a success message.
      showMessage({
        message: 'Evaluation Successful!',
        description: 'The evaluation was processed successfully.',
        type: 'success',
      });
      // You can also trigger any UI updates here, like refetching related data or closing a modal.
    },
  });
};
