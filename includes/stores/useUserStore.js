import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode } from 'base-64';
global.atob = decode;

const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (err) {
    console.error('Error decoding token:', err);
    return null;
  }
};

const useUserStore = create((set) => ({
  userData: null,
  token: null,
  officeCode: null,
  fullName: null,
  officeName: null,
  employeeNumber: null,
  privilege: null,
  accountType: null,
  permission: null,
  error: null,

  fetchUserInfo: async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) return;

      const decodedResult = decodeToken(storedToken);
      const user = decodedResult?.data?.[0];

      if (user) {
        set({
          token: storedToken,
          userData: user,
          officeCode: user.OfficeCode,
          fullName: user.FullName,
          officeName: user.OfficeName,
          employeeNumber: user.EmployeeNumber,
          privilege: user.Privilege,
          accountType: user.AccountType,
          permission: user.Permission,
          error: null,
        });
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
      set({ error: err.message });
    }
  },
}));

export default useUserStore;
