import {useMutation, useQuery} from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useGetAgency = (memberId: any) => {
  const query = useQuery({
    queryKey: ['findLocation', memberId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/showlogo.php`,
      );
      return res.data;
    },
  });
  return query;
};
