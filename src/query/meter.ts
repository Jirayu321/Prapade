import {useMutation, useQuery} from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export const useQueryAreas = () => {
  const query = useQuery({
    queryKey: ['areas'],
    queryFn: async () => {
      const res = await axiosInstance.get(`/searchareacode.php`);
      return res.data;
    },
  });

  return query;
};

export const useQueryBillCycle = () => {
  const query = useQuery({
    queryKey: ['billCycle'],
    queryFn: async () => {
      const res = await axiosInstance.get(`/searchbillcycle.php`);
      return res.data;
    },
  });

  return query;
};

export const useQueryMeterNotCollect = (areaCode: number) => {
  const query = useQuery({
    queryKey: ['notMeterCollect', areaCode],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/notcollectedmeter.php?areaCode=${areaCode}`,
      );
      return res.data;
    },
  });

  return query;
};

export const useQueryMeterCollect = (areaCode: number) => {
  const query = useQuery({
    queryKey: ['meterCollect', areaCode],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `allcollectedmeter.php?areaCode=${areaCode}`,
      );
      return res.data;
    },
  });

  return query;
};

export const useQueryMeterAll = (areaCode: number) => {
  const query = useQuery({
    queryKey: ['meterAll', areaCode],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `alreadycollectedmeter.php?areaCode=${areaCode}`,
      );
      return res.data;
    },
  });

  return query;
};

export const useQueryMeterMember = (memberId: number) => {
  const query = useQuery({
    queryKey: ['memberMeter', memberId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/showdetailmember.php?memberID=${memberId}`,
      );
      return res.data;
    },
  });

  return query;
};

export const useMutationSaveMeter = () => {
  const mutation = useMutation({
    mutationKey: ['saveMeter'],
    mutationFn: async (payload: any) => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const res = await axiosInstance.get(
          `/savemetermember.php?memberID=${payload.memberID}&billCycle=67-01&beforeCollected=${payload.beforeCollected}&lastCollected=${payload.lastCollected}&meterTypeCode=${payload.meterTypeCode}&userID=${userId}`,
        );

        Toast.show({
          type: 'success',
          text1: 'สำเร็จ',
          text2: res.data.message,
        });

        return res.data;
      }
    },
  });

  return mutation;
};

export const useQueryMemberAll = () => {
  const query = useQuery({
    queryKey: ['memberAll'],
    queryFn: async () => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const res = await axiosInstance.get(
          `/searchallmember.php?memberID=${userId}`,
        );
        return res.data;
      }
    },
  });

  return query;
};
