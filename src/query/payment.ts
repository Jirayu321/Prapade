import {useMutation, useQuery} from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export const useQueryMember = (dataSearch: string) => {
  const query = useQuery({
    queryKey: ['memberLists', dataSearch],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/searchmember.php?searchMember=${dataSearch}`,
      );
      return res.data;
    },
  });

  return query;
};

export const useQueryMemberBillHistorys = (memberId: number) => {
  const query = useQuery({
    queryKey: ['memberBillHistorys', memberId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/searchhistorymember.php?memberID=${memberId}`,
      );
      return res.data;
    },
  });

  return query;
};

export const useQueryMemberHistoryId = (historyId: number) => {
  const query = useQuery({
    queryKey: ['historyId', historyId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/searchhistorydetailmember.php?historyID=${historyId}`,
      );
      return res.data;
    },
  });

  return query;
};

export const useQueryBillHistory = (historyId: number) => {
  const query = useQuery({
    queryKey: ['billHistoryId', historyId],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/printmobileinvoice.php?historyPaymentID=${historyId}`,
      );
      return response.data;
    },
  });
  return query;
};

export const useQueryBillHistoryReceive = (historyId: number) => {
  const query = useQuery({
    queryKey: ['billHistoryId', historyId],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/printmobilereceiptimg.php?historyPaymentID=${historyId}`,
      );
      return response.data;
    },
  });
  return query;
};

export const useMutationSavePayment = () => {
  const mutation = useMutation({
    mutationKey: ['savePayment'],
    mutationFn: async (payload: any) => {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const res = await axiosInstance.get(
          `/savepaybill.php?historyID=${payload.historyID}&userID=${userId}&method=${payload.type}`,
        );

        if (Number(res.data.status) === 1) {
          Toast.show({
            type: 'success',
            text1: 'สำเร็จ',
            text2: 'บันทึกการชำระเงินสำเร็จแล้ว',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'เกิดข้อผิดพลาด',
            text2: res.data.message,
          });
        }

        return res.data;
      }
    },
  });

  return mutation;
};

export const usePaymentWithScan = () => {
  const mutation = useMutation({
    mutationKey: ['paymentScan'],
    mutationFn: async (payload: any) => {
      // console.log(payload);
      const res = await axiosInstance.get(
        `/transferqrcodeapi.php?productDetail=test&customerEmail=my.mix.member@gmail.com&customerName=${payload.customerName}&total=${payload.total}&referenceNo=${payload.referenceNo}`,
      );
      return res.data;
    },
  });
  return mutation;
};

export const usePaymentWithScanSuss = () => {
  return useMutation({
    mutationKey: ['paymentScan'],
    mutationFn: async (payload: any) => {
      // console.log(payload);
      const res = await axiosInstance.get(
        `/savetransferqrcodeapi.php?referenceNo=${payload.referenceNo}`,
      );
      return res.data;
    },
  });
};
