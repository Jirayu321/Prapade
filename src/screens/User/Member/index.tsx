/* eslint-disable react-native/no-inline-styles */
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Button,
  ButtonText,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Image,
} from '@gluestack-ui/themed';
import React, {FC, useEffect} from 'react';
import fontStyles from '../../../core/styles/fonts';
import MeterCard from '../../../components/meter_card';
import Footer from '../../../components/footer';
import Header from '../../../components/header';
import {useUserDetail} from '../../../query/user';
import {useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {useQueryMemberAll, useQueryMeterMember} from '../../../query/meter';
import {
  useQueryMemberBillHistorys,
  useQueryMemberHistoryId,
  useMutationSavePayment,
  usePaymentWithScan,
} from '../../../query/payment';
import {TouchableHighlight, PermissionsAndroid, Platform} from 'react-native';
import {writeFile, DownloadDirectoryPath} from 'react-native-fs';
import Toast from 'react-native-toast-message';

export const saveBase64ToFile = async (
  base64String: string,
  fileName: string,
): Promise<void> => {
  try {
    if (Platform.OS === 'android') {
      // Request permission for Android devices
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Permission to Save File',
          message: 'We need your permission to save files to your device.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permission denied');
        return;
      }
    }

    const filePath = `${DownloadDirectoryPath}/${fileName}`;

    // Write the Base64 string to the file
    await writeFile(filePath, base64String, 'base64');

    console.log(`File saved successfully at: ${filePath}`);
  } catch (error) {
    console.error('Error saving file:', error);
  }
};
const MemberScreen: FC = () => {
  const queryClient = useQueryClient();
  const userDetail = useUserDetail();
  const [getSelectMemberId, setSelectMemberId] = useState(0);
  const [getSelectHistoryId, setSelectHistoryId] = useState(0);
  const [getPaymentAmountConfirm, setPaymentAmountConfirm] = useState(0);
  const [getMemberSelect, setMemberSelect]: any = useState({});
  const [getMemberLists, setMemberLists] = useState([]);
  const [getSelectHistoryData, setSelectHistoryData]: any = useState({});
  const [showModal, setShowModal] = React.useState(false);
  const [qrcode, setQrcode] = useState('');

  const memberLists = useQueryMemberAll();
  const meterMember = useQueryMeterMember(getSelectMemberId);
  const memberBillHistorys = useQueryMemberBillHistorys(getSelectMemberId);
  console.log('memberBillHistorys:', memberBillHistorys.data);
  const savePayment = useMutationSavePayment();
  const historyId = useQueryMemberHistoryId(getSelectHistoryId);
  const useScanQRCode = usePaymentWithScan();

  const handleSelectMember = async (data: any) => {
    setSelectMemberId(Number(data.memberID));
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

  const resetPayment = () => {
    setSelectHistoryId(0);
    setSelectHistoryData({});
    setPaymentAmountConfirm(0);
  };

  // const handlePaymentWithCash = async () => {
  //   if (
  //     getPaymentAmountConfirm === 0 ||
  //     Number(getPaymentAmountConfirm) !==
  //       Number(getSelectHistoryData.paymentAmt)
  //   ) {
  //     return Toast.show({
  //       type: 'error',
  //       text1: 'เกิดข้อผิดพลาด',
  //       text2: 'โปรดระบุจำนวนเงินที่ต้องชำระให้ถูกต้อง !!',
  //     });
  //   }

  //   const payload = {
  //     type: 'C',
  //     historyID: getSelectHistoryId,
  //   };

  //   await savePayment.mutateAsync(payload);
  //   await queryClient.invalidateQueries({
  //     queryKey: ['memberBillHistorys', Number(getSelectMemberId)],
  //   });
  //   resetPayment();
  // };

  const handlePaymentWithTransfer = async () => {
    // if (
    //   getPaymentAmountConfirm === 0 ||
    //   Number(getPaymentAmountConfirm) !==
    //     Number(getSelectHistoryData.paymentAmt)
    // ) {
    //   return Toast.show({
    //     type: 'error',
    //     text1: 'เกิดข้อผิดพลาด',
    //     text2: 'โปรดระบุจำนวนเงินที่ต้องชำระให้ถูกต้อง !!',
    //   });
    // }

    const payload1 = {
      type: 'T',
      historyID: getSelectHistoryId,
    };

    await savePayment.mutateAsync(payload1);
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
        console.log('data :', data?.data.image);
        setQrcode(data?.data.image);
        setShowModal(true);
      }
    }

    // await queryClient.invalidateQueries({
    //   queryKey: ['memberBillHistorys', Number(getSelectMemberId)],
    // });

    // resetPayment();
  };

  useEffect(() => {
    if (memberLists.data) {
      setMemberLists(memberLists.data);
    }

    if (meterMember.data) {
      console.log(JSON.stringify(meterMember.data));
      setMemberSelect(meterMember.data[0] || meterMember.data);
    }

    if (historyId.data) {
      setSelectHistoryData(historyId.data[0] || historyId.data);
    }
  }, [
    memberLists.data,
    meterMember.data,
    memberBillHistorys.data,
    userDetail.data,
    historyId.data,
  ]);

  return (
    <SafeAreaView flex={1} backgroundColor="#3DA1FF">
      <Header title={'สมาชิก'} />
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
              {getSelectHistoryData.paymentAmt} บาท
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
                // handleScanQrCode();
                saveBase64ToFile(qrcode, 'QRCODE');
              }}>
              <ButtonText>บันทึก QRCODE</ButtonText>
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
            {userDetail.data && (
              <View marginVertical={5}>
                <Text
                  fontFamily={fontStyles.semibold}
                  color="white"
                  textAlign="center">
                  {userDetail.data[0].memberName}
                </Text>
              </View>
            )}
            <MeterCard
              type="user"
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
                {/* <View marginTop={22}>
                  <Input
                    backgroundColor="white"
                    borderWidth={0}
                    size="md"
                    borderRadius={20}>
                    <InputField
                      onChangeText={handleChangePaymentAmountConfirm}
                      keyboardType="decimal-pad"
                      placeholder="ระบุจำนวนที่ต้องการชำระ"
                      placeholderTextColor="#D4D8DB"
                      paddingVertical={3}
                      paddingHorizontal={16}
                      fontFamily={fontStyles.regular}
                    />
                  </Input>
                </View> */}
                <View marginTop={10} alignItems="center">
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

export default MemberScreen;
