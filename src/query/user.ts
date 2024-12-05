import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export const userLogin = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['userLogin'],
    mutationFn: async (userData: {username: string; password: string}) => {
      const res = await axiosInstance.get(
        `/checklogin.php?userName=${userData.username}&userPass=${userData.password}`,
      );

      if (Number(res.data.status) === 1 || Number(res.data.status) === 2) {
        await AsyncStorage.setItem('username', userData.username);
        await AsyncStorage.setItem('password', userData.password);
        await AsyncStorage.setItem('userId', res.data.userID);

        Toast.show({
          type: 'success',
          text1: 'สำเร็จ',
          text2: res.data.message,
        });

        await queryClient.invalidateQueries({queryKey: ['userAuth']});
      } else {
        Toast.show({
          type: 'error',
          text1: 'เกิดข้อผิดพลาด',
          text2: res.data.message,
        });
      }

      return res.data;
    },
  });

  return mutation;
};

export const userChangePassword = () => {
  const mutation = useMutation({
    mutationKey: ['changePassword'],
    mutationFn: async (newPassword: string) => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const res = await axiosInstance.get(
          `/updateuserpassword.php?userID=${userId}&userPass=${newPassword}`,
        );

        if (res.data === 'SUCCESS') {
          Toast.show({
            type: 'success',
            text1: 'สำเร็จ',
            text2: 'ทำการเปลี่ยนรหัสผ่านสำเร็จ',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'เกิดข้อผิดพลาด',
            text2: 'ไม่สามารถดำเนินการได้ในขณะนี้',
          });
        }
        return res.data;
      }
    },
  });

  return mutation;
};

export const userAuthorization = () => {
  const query = useQuery({
    queryKey: ['userAuth'],
    queryFn: async () => {
      const username = await AsyncStorage.getItem('username');
      const password = await AsyncStorage.getItem('password');

      if (username && password) {
        const res = await axiosInstance.get(
          `/checklogin.php?userName=${username}&userPass=${password}`,
        );

        if (Number(res.data.status) === 1 || Number(res.data.status) === 2) {
          return Number(res.data.status);
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
  });

  return query;
};

export const useOfficerDetail = () => {
  const query = useQuery({
    queryKey: ['officerDetail'],
    queryFn: async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const res = await axiosInstance.get(`/userdetail.php?userID=${userId}`);
        return res.data;
      }
    },
  });

  return query;
};

export const useUserDetail = () => {
  const query = useQuery({
    queryKey: ['userDetail'],
    queryFn: async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const res = await axiosInstance.get(
          `/showuserhomedetail.php?memberID=${userId}`,
        );

        return res.data;
      }
    },
  });

  return query;
};
