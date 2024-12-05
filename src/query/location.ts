import {useMutation, useQuery} from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useGetLocation = (memberId: string) => {
  const query = useQuery({
    queryKey: ['findLocation', memberId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/showmapmember.php?searchMember=${memberId}`,
      );
      return res.data;
    },
  });
  return query;
};
