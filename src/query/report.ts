import {useMutation, useQuery} from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useQueryReportCollectUser = (dateStart: string) => {
  const query = useQuery({
    queryKey: ['reportCollectUser'],
    queryFn: async () => {
      const userID = await AsyncStorage.getItem('userId');
      const res = await axiosInstance.get(
        `/reportcollectuser.php?dateStart=${dateStart}&userID=${userID}`,
      );

      return res.data;
    },
  });

  return query;
};

export const useQueryReportLists = () => {
  const query = useQuery({
    queryKey: ['reportLists'],
    queryFn: async () => {
      const res = await axiosInstance.get(`/searchincidenttitle.php`);
      return res.data;
    },
  });

  return query;
};
