/* eslint-disable react-native/no-inline-styles */
import React, {FC, useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Pressable,
  Input,
  InputField,
  Button,
  ButtonText,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  Heading,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Image,
} from '@gluestack-ui/themed';
import fontStyles from '../../../core/styles/fonts';
import SVG from '../../../constants/svgs';
import MeterCard from '../../../components/meter_card';
import Footer from '../../../components/footer';
import Header from '../../../components/header';
import {
  useMutationSavePayment,
  useQueryMember,
  useQueryMemberBillHistorys,
  useQueryMemberHistoryId,
  useQueryBillHistoryReceive,
  usePaymentWithScan,
  usePaymentWithScanSuss,
} from '../../../query/payment';
import {useQueryMeterMember} from '../../../query/meter';
import {useQueryClient} from '@tanstack/react-query';
import {TouchableHighlight} from 'react-native';
import Toast from 'react-native-toast-message';
import {BLEPrinter} from 'react-native-thermal-receipt-printer-image-qr';
import {useRoute, useFocusEffect} from '@react-navigation/native';

const PaymentScreen: FC = () => {
  const queryClient = useQueryClient();
  const route = useRoute();

  const [getMemberLists, setMemberLists] = useState([]);
  const [getSelectMemberId, setSelectMemberId] = useState(0);
  const [getMemberSelect, setMemberSelect]: any = useState({});
  const [getSelectHistoryId, setSelectHistoryId] = useState(-1);
  const [getSelectHistoryData, setSelectHistoryData]: any = useState({});
  const [getPaymentAmountConfirm, setPaymentAmountConfirm] = useState(0);
  const [getPaymentAmountConfirm2, setPaymentAmountConfirm2] = useState(0);
  const [showModal, setShowModal] = React.useState(false);
  const [qrcode, setQrcode] = useState('');
  const [referenceNoqrcode, setReferenceNoQrcode] = useState('');
  const [time, setTime] = useState(0);

  const [getTextSearch, setTextSearch] = useState('');
  const [getBillData, setBillData]: any = useState({});
  const memberLists = useQueryMember(getTextSearch);
  const meterMember = useQueryMeterMember(getSelectMemberId);
  const memberBillHistorys = useQueryMemberBillHistorys(getSelectMemberId);
  // console.log('memberBillHistorys', memberBillHistorys);
  const historyId = useQueryMemberHistoryId(getSelectHistoryId);
  const savePayment = useMutationSavePayment();
  const useBillReceive = useQueryBillHistoryReceive(getSelectHistoryId);
  const useScanQRCode = usePaymentWithScan();
  const useCheckScanQRCode = usePaymentWithScanSuss();

  const handleChangeMemberFilterText = (text: string) => {
    setTextSearch(text);
  };

  useFocusEffect(
    React.useCallback(() => {
      // รีเซ็ตค่าทั้งหมดทุกครั้งที่เข้าแท็บ
      setMemberLists([]);
      setSelectMemberId(0);
      setMemberSelect({});
      setSelectHistoryId(-1);
      setSelectHistoryData({});
      setPaymentAmountConfirm(0);
      setPaymentAmountConfirm2(0);
      setTextSearch('');
      setBillData({});
      return () => {};
    }, [route.name]),
  );

  useEffect(() => {
    if (memberLists.data) {
      setMemberLists(memberLists.data);
    }

    if (meterMember.data) {
      setMemberSelect(meterMember.data[0] || meterMember.data);
    }

    if (historyId.data) {
      setSelectHistoryData(historyId.data[0] || historyId.data);
    }

    console.log('useBillReceive.data', useBillReceive.data);
    if (useBillReceive.data) {
      setBillData(useBillReceive.data);
    }
  }, [
    memberLists.data,
    meterMember.data,
    memberBillHistorys.data,
    historyId.data,
    useBillReceive.data,
  ]);

  const handleSelectMember = async (data: any) => {
    setSelectMemberId(Number(data.MEMBER_ID));
    await queryClient.invalidateQueries({
      queryKey: ['memberMeter', Number(data.MEMBER_ID)],
    });

    await queryClient.invalidateQueries({
      queryKey: ['memberBillHistorys', Number(data.MEMBER_ID)],
    });
  };

  const handleSelectHistory = async (data: any) => {
    setSelectHistoryId(data.historyID);

    await queryClient.invalidateQueries({
      queryKey: ['historyId', Number(data.historyID)],
    });
  };

  const handleChangePaymentAmountConfirm = (text: string) => {
    setPaymentAmountConfirm(Number(text));
  };

  useEffect(() => {
    handleChangePaymentAmountConfirm2();
  }, [getPaymentAmountConfirm, getSelectHistoryData.paymentAmt]);

  const handleChangePaymentAmountConfirm2 = () => {
    const x = Number(getSelectHistoryData?.paymentAmt || 0);
    const data = Number(getPaymentAmountConfirm || 0) - x;
    if (Number(getPaymentAmountConfirm === 0)) {
      setPaymentAmountConfirm2(null);
    } else {
      setPaymentAmountConfirm2(data);
    }
  };

    // const resetPayment = () => {
    //   setSelectHistoryId(0);
    //   setSelectHistoryData({});
    //   setPaymentAmountConfirm(0);
    // };

  const handlePaymentWithCash = async () => {
    if (
      getPaymentAmountConfirm === 0 ||
      Number(getPaymentAmountConfirm) < Number(getSelectHistoryData.paymentAmt)
    ) {
      return Toast.show({
        type: 'error',
        text1: 'เกิดข้อผิดพลาด',
        text2: 'โปรดระบุจำนวนเงินที่ต้องชำระให้ถูกต้อง !!',
      });
    }

    const payload = {
      type: 'C',
      historyID: getSelectHistoryId,
    };

    await savePayment.mutateAsync(payload);
    await queryClient.invalidateQueries({
      queryKey: ['memberBillHistorys', Number(getSelectMemberId)],
    });
    // resetPayment();
  };

  const handlePaymentWithTransfer = async () => {
    // if (
    //   getPaymentAmountConfirm === 0 ||
    //   Number(getPaymentAmountConfirm) < Number(getSelectHistoryData.paymentAmt)
    // ) {
    //   return Toast.show({
    //     type: 'error',
    //     text1: 'เกิดข้อผิดพลาด',
    //     text2: 'โปรดระบุจำนวนเงินที่ต้องชำระให้ถูกต้อง !!',
    //   });
    // }

    if (
      getSelectHistoryData.paymentAmt &&
      getSelectHistoryData.invoiceNo &&
      getMemberSelect.memberName
    ) {
      const payload = {
        customerName: getMemberSelect.memberName.replace(/\s+/g, ''),
        total: Number(getSelectHistoryData.paymentAmt),
        referenceNo: getSelectHistoryData.invoiceNo,
      };

      const data = await useScanQRCode.mutateAsync(payload);
      if (data?.data.image) {
        console.log('data :', data);
        setQrcode(data?.data.image);
        setReferenceNoQrcode(data?.data.referenceNo);
        setShowModal(true);

        // กำหนดตัวจับเวลา 5 นาที
        const startTime = Date.now();
        const intervalId = setInterval(async () => {
          const elapsedTime = Date.now() - startTime;
          setTime(elapsedTime);

          // ตรวจสอบว่าเกิน 5 นาทีหรือยัง
          if (elapsedTime >= 5 * 60 * 1000) {
            // console.log('Time exceeded 5 minutes, stopping further checks.');
            clearInterval(intervalId);
            setShowModal(false);
            return;
          }

          if (referenceNoqrcode !== '') {
            const payload = {
              referenceNo: referenceNoqrcode,
            };
            try {
              const data_useCheckScanQRCode =
                await useCheckScanQRCode.mutateAsync(payload);
              console.log('data useCheckScanQRCode', data_useCheckScanQRCode);
              if (data_useCheckScanQRCode?.status !== '3') {
                console.log('Scan successful or status updated.');
                setShowModal(false);
                clearInterval(intervalId); // หยุดการตรวจสอบ
              }
            } catch (error) {
              console.error('Error:', error);
            }
          }
        }, 3000); // เรียกทุก 3 วินาที
      }
    }
    // resetPayment();
  };

  const handleScanQrCode = async () => {
    if (referenceNoqrcode !== '') {
      const payload = {
        referenceNo: referenceNoqrcode,
      };
      try {
        const data = await useCheckScanQRCode.mutateAsync(payload);
        // console.log('data :', data?.status);
        if (data?.status !== '3') {
          setShowModal(false);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handlePrintBill = async () => {
    console.log('getBillData', getBillData);
    if (Object.keys(getBillData).length > 0) {
      const base64: any = getBillData.image.split('base64,')[1];
      BLEPrinter.printImageBase64(base64, {
        imageWidth: 390,
        imageHeight: 1600,
        paddingX: 0,
      });
    }
  };

  return (
    <SafeAreaView flex={1} backgroundColor="#3DA1FF">
      <Header title={'รับชำระเงิน'} />
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
        }}
        size="md">
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <ModalCloseButton>
              {/* <Icon
                  as={CloseIcon}
                  size="md"
                  className="stroke-background-400 group-[:hover]/modal-close-button:stroke-background-700 group-[:active]/modal-close-button:stroke-background-900 group-[:focus-visible]/modal-close-button:stroke-background-900"
                /> */}
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Image
              source={qrcode}
              style={{
                width: 300,
                height: 250,
              }}
              alt="Logo"
            />
            <Text
              style={{
                textAlign: 'center',
              }}>
              {getSelectHistoryData?.paymentAmt} บาท
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              action="secondary"
              onPress={() => {
                setShowModal(false);
              }}
              style={{marginRight: 10}}>
              <ButtonText>ปิด</ButtonText>
            </Button>
            <Button
              onPress={() => {
                // setShowModal(false);
                handleScanQrCode();
              }}>
              <ButtonText>ชำระเงินเรียบร้อย</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View
          width={'100%'}
          height={'100%'}
          paddingBottom={14}
          alignItems="center"
          marginTop={16}>
          <View width={'90%'}>
            <View
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center">
              <Text fontFamily={fontStyles.semibold} color="white">
                ค้นหาสมาชิก
              </Text>
              {/* <Pressable onPress={handleScanQrCode}> */}
              <SVG.Payment_Icon />
              {/* </Pressable> */}
            </View>
            <View marginTop={10}>
              <Input
                backgroundColor="white"
                variant="rounded"
                borderWidth={2}
                borderColor="#D6EBFF"
                size="md">
                <InputField
                  value={getTextSearch}
                  onChangeText={handleChangeMemberFilterText}
                  fontFamily={fontStyles.regular}
                  keyboardType="numeric"
                  fontSize={14}
                  placeholder="เลขประจำมิเตอร์ / หมายเลขโทรศัพท์"
                  placeholderTextColor="#D4D8DB"
                  padding={4}
                />
              </Input>
            </View>
            <MeterCard
              onSelect={handleSelectMember}
              listItems={getMemberLists}
            />
            <View
              marginTop={16}
              backgroundColor="#D6EBFF"
              width={'100%'}
              borderRadius={16}
              paddingHorizontal={20}
              paddingVertical={15}>
              {(Object.keys(getMemberSelect).length > 0 && (
                <>
                  <View
                    width={'80%'}
                    flexDirection="row"
                    justifyContent="flex-start"
                    marginVertical={5}
                    gap={18}>
                    <Text color="#087FCF" fontFamily={fontStyles.semibold}>
                      เลขมิเตอร์ :
                    </Text>
                    <Text
                      color="#087FCF"
                      fontFamily={fontStyles.regular}
                      textBreakStrategy="simple">
                      {getMemberSelect.meterNumber}
                    </Text>
                  </View>
                  <View
                    width={'80%'}
                    flexDirection="row"
                    justifyContent="flex-start"
                    marginVertical={5}
                    gap={18}>
                    <Text color="#087FCF" fontFamily={fontStyles.semibold}>
                      ประเภทผู้ใช้น้ำ :
                    </Text>
                    <Text
                      color="#087FCF"
                      fontFamily={fontStyles.regular}
                      textBreakStrategy="simple">
                      {getMemberSelect.meterType}
                    </Text>
                  </View>
                  <View
                    width={'80%'}
                    flexDirection="row"
                    justifyContent="flex-start"
                    marginVertical={5}
                    gap={18}>
                    <Text color="#087FCF" fontFamily={fontStyles.semibold}>
                      ชื่อผู้ใช้น้ำ :
                    </Text>
                    <Text
                      color="#087FCF"
                      fontFamily={fontStyles.regular}
                      textBreakStrategy="simple">
                      {getMemberSelect.memberName}
                    </Text>
                  </View>
                  <View
                    width={'70%'}
                    flexDirection="row"
                    justifyContent="flex-start"
                    marginVertical={5}
                    gap={18}>
                    <Text color="#087FCF" fontFamily={fontStyles.semibold}>
                      สถานที่ใช้น้ำ :
                    </Text>
                    <Text
                      color="#087FCF"
                      fontFamily={fontStyles.regular}
                      textBreakStrategy="simple">
                      {getMemberSelect.memberAddress}
                    </Text>
                  </View>
                  <View
                    width={'80%'}
                    flexDirection="row"
                    justifyContent="flex-start"
                    marginVertical={5}
                    gap={18}>
                    <Text color="#087FCF" fontFamily={fontStyles.semibold}>
                      เบอร์ติดต่อ :
                    </Text>
                    <Text
                      color="#087FCF"
                      fontFamily={fontStyles.regular}
                      textBreakStrategy="simple">
                      {getMemberSelect.memberTel}
                    </Text>
                  </View>
                  <View marginTop={14}>
                    <View
                      flexDirection="row"
                      gap={2}
                      justifyContent="center"
                      alignItems="center">
                      <Button
                        backgroundColor="#7ABFFF"
                        width={'50%'}
                        borderTopLeftRadius={8}
                        borderBottomLeftRadius={8}
                        borderTopRightRadius={0}
                        borderBottomRightRadius={0}>
                        <ButtonText
                          color="white"
                          fontFamily={fontStyles.semibold}>
                          รอบบิลเดือน
                        </ButtonText>
                      </Button>
                      <Button
                        backgroundColor="#7ABFFF"
                        width={'50%'}
                        borderTopRightRadius={8}
                        borderBottomRightRadius={8}
                        borderTopLeftRadius={0}
                        borderBottomLeftRadius={0}>
                        <ButtonText
                          color="white"
                          fontFamily={fontStyles.semibold}>
                          จำนวนเงิน
                        </ButtonText>
                      </Button>
                    </View>
                  </View>
                  <View marginTop={22}>
                    {memberBillHistorys?.data?.[0] && (
                      <TouchableHighlight
                        underlayColor={'none'}
                        onPress={() =>
                          handleSelectHistory(memberBillHistorys.data[0])
                        }>
                        <View
                          flexDirection="row"
                          justifyContent="space-between"
                          alignItems="center"
                          borderTopWidth={1}
                          borderColor="#3CACF7"
                          paddingVertical={6}
                          borderBottomWidth={2}>
                          <Text color="#087FCF" fontFamily={fontStyles.regular}>
                            {memberBillHistorys.data[0].billCycle}
                          </Text>
                          <Text color="#087FCF" fontFamily={fontStyles.regular}>
                            {memberBillHistorys.data[0].paymentAmt}
                          </Text>
                        </View>
                      </TouchableHighlight>
                    )}
                  </View>
                </>
              )) || (
                <Text fontFamily={fontStyles.regular} textAlign="center">
                  ไม่มีข้อมูลการค้นหา
                </Text>
              )}
            </View>
            {Object.keys(getSelectHistoryData).length > 0 && (
              <View
                marginTop={16}
                backgroundColor="#D6EBFF"
                width={'100%'}
                borderRadius={16}
                paddingHorizontal={20}
                paddingVertical={20}>
                <Text
                  color="#F74C4C"
                  fontFamily={fontStyles.semibold}
                  textAlign="center">
                  บังคับชำระเงินค่าน้ำ เก่าสุดก่อนเสมอ
                </Text>
                <View marginTop={20}>
                  <View
                    flexDirection="row"
                    justifyContent="flex-start"
                    marginVertical={3}
                    gap={12}
                    alignItems="center">
                    <Text color="#087FCF" fontFamily={fontStyles.semibold}>
                      รอบบิลเดือน:
                    </Text>
                    <Text color="#087FCF" fontFamily={fontStyles.regular}>
                      {getSelectHistoryData.billCycle}
                    </Text>
                  </View>
                  <View
                    flexDirection="row"
                    justifyContent="flex-start"
                    marginVertical={3}
                    gap={12}
                    alignItems="center">
                    <Text color="#087FCF" fontFamily={fontStyles.semibold}>
                      เลขที่ใบแจ้งหนี้ :
                    </Text>
                    <Text color="#087FCF" fontFamily={fontStyles.regular}>
                      {getSelectHistoryData.invoiceNo}
                    </Text>
                  </View>
                  <View
                    flexDirection="row"
                    justifyContent="flex-start"
                    marginVertical={3}
                    gap={12}
                    alignItems="center">
                    <Text color="#087FCF" fontFamily={fontStyles.semibold}>
                      จำนวนเงินที่ต้องชำระ :
                    </Text>
                    <Text color="#087FCF" fontFamily={fontStyles.regular}>
                      {getSelectHistoryData.paymentAmt} บาท
                    </Text>
                  </View>
                  <View
                    flexDirection="row"
                    justifyContent="flex-start"
                    marginVertical={3}
                    gap={12}
                    alignItems="center">
                    <Text color="#087FCF" fontFamily={fontStyles.semibold}>
                      ครบกำหนดชำระ :
                    </Text>
                    <Text color="#087FCF" fontFamily={fontStyles.regular}>
                      {getSelectHistoryData.paymentDueDate}
                    </Text>
                  </View>
                </View>
                <View marginTop={22}>
                  <Input
                    backgroundColor="white"
                    borderWidth={0}
                    size="md"
                    borderRadius={20}>
                    <InputField
                      onChangeText={handleChangePaymentAmountConfirm}
                      keyboardType="decimal-pad"
                      placeholder="จำนวนเงินที่ชำระ"
                      placeholderTextColor="#D4D8DB"
                      paddingVertical={3}
                      paddingHorizontal={16}
                      fontFamily={fontStyles.regular}
                    />
                  </Input>
                </View>
                <View marginTop={22}>
                  <Input
                    backgroundColor="white"
                    borderWidth={0}
                    size="md"
                    borderRadius={20}>
                    <InputField
                      value={
                        getPaymentAmountConfirm2 !== null
                          ? getPaymentAmountConfirm2.toString()
                          : ''
                      }
                      keyboardType="decimal-pad"
                      placeholder="จำนวนเงินทอน"
                      placeholderTextColor="#D4D8DB"
                      paddingVertical={3}
                      paddingHorizontal={16}
                      fontFamily={fontStyles.regular}
                      editable={false}
                    />
                  </Input>
                </View>
                <View marginTop={20} alignItems="center">
                  <Button
                    onPress={handlePaymentWithCash}
                    borderRadius={20}
                    size="md"
                    width={'100%'}
                    backgroundColor="#087FCF">
                    <ButtonText fontFamily={fontStyles.semibold}>
                      ชำระด้วยเงินสด
                    </ButtonText>
                  </Button>
                  <Button
                    onPress={handlePaymentWithTransfer}
                    borderRadius={20}
                    marginTop={12}
                    size="md"
                    width={'100%'}
                    backgroundColor="#054977">
                    <ButtonText fontFamily={fontStyles.semibold}>
                      โอนเงินชำระ
                    </ButtonText>
                  </Button>
                  <Button
                    borderRadius={20}
                    onPress={handlePrintBill}
                    marginTop={12}
                    size="md"
                    width={'100%'}
                    backgroundColor="#043759">
                    <ButtonText fontFamily={fontStyles.semibold}>
                      พิมพ์ใบเสร็จ (ชั่วคราว)
                    </ButtonText>
                  </Button>
                </View>
              </View>
            )}
          </View>
          <Footer />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentScreen;
