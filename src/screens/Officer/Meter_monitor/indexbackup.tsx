import React, {FC, useEffect, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Input,
  InputField,
  Button,
  ButtonText,
} from '@gluestack-ui/themed';
import fontStyles from '../../../core/styles/fonts';
import Footer from '../../../components/footer';
import MeterCard from '../../../components/meter_card';
import Header from '../../../components/header';
import {
  useMutationSaveMeter,
  useQueryAreas,
  useQueryBillCycle,
  useQueryMeterAll,
  useQueryMeterCollect,
  useQueryMeterMember,
  useQueryMeterNotCollect,
} from '../../../query/meter';
import {useQueryBillHistory} from '../../../query/payment';
import SelectAction from '../../../components/actionsheets/select';
import {useQueryClient} from '@tanstack/react-query';

import {BLEPrinter} from 'react-native-thermal-receipt-printer-image-qr';
import {
  useRoute,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

const MeterMonitorScreen: FC = () => {
  const route = useRoute();
  const queryClient = useQueryClient();
  const navigation: any = useNavigation();
  const useAreas = useQueryAreas();
  const billCycle = useQueryBillCycle();

  const [isOpenSelectArea, setOpenSelectArea] = useState(false);
  const [getSelectArea, setSelectArea]: any = useState({});
  const [getAreas, setAreas] = useState([]);
  const [getMeterStatus, setMeterStatus] = useState('not_collect');
  const [getTextMeterSearch, setTextMeterSearch] = useState('');
  const [getNewMeterNumber, setNewMeterNumber] = useState(0);
  const notMeterCollect = useQueryMeterNotCollect(Number(getSelectArea?.ID));
  const meterCollect = useQueryMeterCollect(Number(getSelectArea?.ID));
  const meterAll = useQueryMeterAll(Number(getSelectArea?.ID));
  const [getNotMeterCollectLists, setNotMeterCollectLists] = useState([]);
  const [getFilterNotMeterCollectLists, setFilterNotMeterCollectLists] =
    useState([]);
  const [getMeterCollectLists, setMeterCollectLists] = useState([]);
  const [getFilterMeterCollectLists, setFilterMeterCollectLists] = useState([]);
  const [getMeterAllLists, setMeterAllLists] = useState([]);
  const [getFilterMeterAllLists, setFilterMeterAllLists] = useState([]);
  const [getSelectMember, setSelectMember]: any = useState({});
  const [getMemberDetail, setMemberDetail]: any = useState({});
  const [getPercentUseWater, setPercentUseWater] = useState(0);
  const [getHistoryId, setHistoryId] = useState(-1);
  const useBillHistory = useQueryBillHistory(getHistoryId);
  const [getBillData, setBillData]: any = useState({});
  const [resetTrigger, setResetTrigger] = useState(0);

  const useMemberMeter = useQueryMeterMember(
    Number(getSelectMember?.MEMBER_ID),
  );
  const useSaveMeter = useMutationSaveMeter();
  useFocusEffect(
    React.useCallback(() => {
      setOpenSelectArea(false);
      setSelectArea({});
      setAreas([]);
      setMeterStatus('not_collect');
      setTextMeterSearch('');
      setNewMeterNumber(0);
      setNotMeterCollectLists([]);
      setFilterNotMeterCollectLists([]);
      setMeterCollectLists([]);
      setFilterMeterCollectLists([]);
      setMeterAllLists([]);
      setFilterMeterAllLists([]);
      setSelectMember({});
      setMemberDetail({});
      setPercentUseWater(0);
      setHistoryId(-1);
      setBillData({});
      return () => {};
    }, [route.name]),
  );

  useEffect(() => {
    if (useAreas.data) {
      setAreas(useAreas.data);

      if (Object.keys(getSelectArea).length === 0)
        setSelectArea(useAreas.data[0]);
    }

    if (notMeterCollect.data) {
      setNotMeterCollectLists(notMeterCollect.data);
      setFilterNotMeterCollectLists(notMeterCollect.data);
    }

    if (meterCollect.data) {
      setMeterCollectLists(meterCollect.data);
      setFilterMeterCollectLists(meterCollect.data);
    }

    if (meterAll.data) {
      setMeterAllLists(meterAll.data);
      setFilterMeterAllLists(meterAll.data);
    }

    if (useMemberMeter.data) {
      setMemberDetail(useMemberMeter.data[0]);
    }
    if (useBillHistory.data) {
      setBillData(useBillHistory.data);
    }
  }, [
    useAreas.data,
    notMeterCollect.data,
    meterCollect.data,
    meterAll.data,
    useMemberMeter.data,
    getHistoryId,
    useBillHistory.data,
    getSelectArea,
    getSelectMember,
  ]);

  const onCloseCallbackSelectArea = () => {
    setOpenSelectArea(false);
  };

  const onCallbackSelectArea = async (data: any) => {
    setSelectArea(data);

    await queryClient.invalidateQueries({
      queryKey: ['notMeterCollect', data?.ID],
    });
    await queryClient.invalidateQueries({queryKey: ['meterCollect', data?.ID]});
    await queryClient.invalidateQueries({queryKey: ['meterAll', data?.ID]});
  };

  const handleChangeNewMeterNumber = (meter: string) => {
    const newMeter = Number(meter);
    const oldMeter = Number(getMemberDetail?.beforeCollected);
    setNewMeterNumber(newMeter);
    if (meter !== '') {
      const cal = ((newMeter - oldMeter) * 100) / oldMeter;
      setPercentUseWater(cal);
    } else {
      setPercentUseWater(0);
    }
  };

  const handleChangeMeterSearchText = (text: string) => {
    setTextMeterSearch(text);

    if (text === '') {
      setFilterNotMeterCollectLists(getNotMeterCollectLists);
      setFilterMeterCollectLists(getMeterCollectLists);
      setFilterMeterAllLists(getMeterAllLists);
    } else {
      if (getMeterStatus === 'not_collect') {
        const filteredLists = getNotMeterCollectLists.filter(
          (item: any) =>
            item.METER_NUMBER.includes(text) ||
            item.NAME.includes(text) ||
            item.SURNAME.includes(text) ||
            item.MEMBER_ID.includes(text),
        );
        setFilterNotMeterCollectLists(filteredLists);
      } else if (getMeterStatus === 'collect') {
        const filteredLists = getMeterCollectLists.filter(
          (item: any) =>
            item.METER_NUMBER.includes(text) ||
            item.NAME.includes(text) ||
            item.SURNAME.includes(text) ||
            item.MEMBER_ID.includes(text),
        );
        setFilterMeterCollectLists(filteredLists);
      } else if (getMeterStatus === 'all') {
        const filteredLists = getMeterAllLists.filter(
          (item: any) =>
            item.METER_NUMBER.includes(text) ||
            item.NAME.includes(text) ||
            item.SURNAME.includes(text) ||
            item.MEMBER_ID.includes(text),
        );
        setFilterMeterAllLists(filteredLists);
      }
    }
  };

  const onSelectMember = async (member: any) => {
    setSelectMember(member);
    console.log('member', member.SAVEMETER);
    handleChangeNewMeterNumber('');
    setNewMeterNumber(0);
    await queryClient.invalidateQueries({
      queryKey: ['memberMeter', member?.MEMBER_ID],
    });
  };

  // const handleEndEvent = () => {
  //   setMeterStatus('not_collect');
  //   setTextMeterSearch('');
  //   setSelectArea({});
  //   setNewMeterNumber(0);
  //   setNotMeterCollectLists([]);
  //   setFilterNotMeterCollectLists([]);
  //   setMeterCollectLists([]);
  //   setFilterMeterCollectLists([]);
  //   setMeterAllLists([]);
  //   setFilterMeterAllLists([]);
  //   setSelectMember({});
  //   setMemberDetail({});
  //   setPercentUseWater(0);
  // };

  const onSaveMeter = async () => {
    const lastCollected = Number(getNewMeterNumber);
    const beforeCollected = Number(getMemberDetail?.beforeCollected);

    // ตรวจสอบว่าค่า lastCollected และ beforeCollected เหมือนกันหรือไม่
    if (lastCollected === beforeCollected) {
      console.log('ค่า lastCollected ยังเป็นค่าเดิม, ไม่จำเป็นต้องบันทึกซ้ำ');
      return; // ปล่อยผ่านไม่ทำการบันทึก
    }

    const payload = {
      memberID: Number(getMemberDetail?.memberID),
      billCycle: billCycle.data[0].BILL_CODE,
      beforeCollected: beforeCollected,
      lastCollected: lastCollected,
      meterTypeCode: Number(getMemberDetail?.meterTypeCode),
    };

    await useSaveMeter.mutateAsync(payload).then(response => {
      if (response.paymentID) {
        setHistoryId(response.paymentID);
      }
    });

    setSelectMember({});
    setResetTrigger(prev => prev + 1);
  };

  const printBill = async () => {
    if (Object.keys(getBillData).length > 0) {
      console.log('getBillData', getBillData);
      const base64: any = getBillData.image.split('base64,')[1];
      BLEPrinter.printImageBase64(base64, {
        imageWidth: 400,
        imageHeight: 1600,
        paddingX: 0,
      });
    }
  };

  const changeType = x => {
    setMeterStatus(x);
    setSelectMember({});
    setResetTrigger(prev => prev + 1);
  };

  return (
    <>
      <SelectAction
        isOpen={isOpenSelectArea}
        onClose={onCloseCallbackSelectArea}
        onCallback={onCallbackSelectArea}
        listItems={getAreas}
      />
      <SafeAreaView flex={1} backgroundColor="#3DA1FF">
        <Header title={'จอมิเตอร์'} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View
            width={'100%'}
            height={'100%'}
            paddingBottom={14}
            alignItems="center"
            marginTop={16}>
            <View width={'90%'}>
              <View>
                <Text fontFamily={fontStyles.semibold} color="white">
                  พื้นที่จัดเก็บ
                </Text>
              </View>
              <View marginTop={5}>
                <Button
                  onPress={() =>
                    setOpenSelectArea(isOpenSelectArea ? false : true)
                  }
                  backgroundColor="white"
                  borderWidth={2}
                  borderColor="#D6EBFF"
                  borderRadius={50}
                  size="md">
                  <ButtonText
                    fontFamily={fontStyles.regular}
                    fontSize={14}
                    textAlign="center"
                    color={
                      Object.keys(getSelectArea).length <= 0
                        ? '#D4D8DB'
                        : 'black'
                    }
                    padding={4}>
                    {(Object.keys(getSelectArea).length <= 0 && (
                      <>- เลือก -</>
                    )) || <>{getSelectArea.COLLECT_AREA}</>}
                  </ButtonText>
                </Button>
                <View
                  marginTop={14}
                  flexDirection="row"
                  justifyContent="space-around"
                  gap={2}
                  alignItems="center">
                  <Button
                    onPress={() => changeType('not_collect')}
                    borderRadius={16}
                    borderWidth={getMeterStatus === 'not_collect' ? 1 : 0}
                    borderColor="white"
                    width={'31%'}
                    size="sm"
                    backgroundColor="#ed8907"
                    alignItems="center"
                    justifyContent="center"
                    height={40}>
                    <ButtonText
                      fontFamily={fontStyles.semibold}
                      fontSize={13}
                      textAlign="center"
                      color="white">
                      ไม่ได้จดมิเตอร์
                    </ButtonText>
                  </Button>
                  <Button
                    onPress={() => changeType('collect')}
                    borderRadius={16}
                    borderWidth={getMeterStatus === 'collect' ? 1 : 0}
                    borderColor="white"
                    width={'30%'}
                    size="sm"
                    backgroundColor="#26c714"
                    alignItems="center"
                    justifyContent="center"
                    height={40}>
                    <ButtonText
                      fontFamily={fontStyles.semibold}
                      fontSize={13}
                      textAlign="center"
                      color="white">
                      จดมิเตอร์แล้ว
                    </ButtonText>
                  </Button>
                  <Button
                    onPress={() => changeType('all')}
                    borderRadius={16}
                    borderWidth={getMeterStatus === 'all' ? 1 : 0}
                    borderColor="white"
                    width={'30%'}
                    size="sm"
                    backgroundColor="#0279FD"
                    alignItems="center"
                    justifyContent="center"
                    height={40}>
                    <ButtonText
                      fontFamily={fontStyles.semibold}
                      fontSize={13}
                      color="white"
                      textAlign="center">
                      ทั้งหมด
                    </ButtonText>
                  </Button>
                </View>
              </View>
              <View marginTop={10}>
                <Text fontFamily={fontStyles.semibold} color="white">
                  ค้นหาสมาชิก
                </Text>
              </View>
              <View marginTop={5}>
                <Input
                  backgroundColor="white"
                  variant="rounded"
                  borderWidth={2}
                  borderColor="#D6EBFF"
                  size="md">
                  <InputField
                    value={getTextMeterSearch}
                    onChangeText={handleChangeMeterSearchText}
                    keyboardType="numeric"
                    fontFamily={fontStyles.regular}
                    fontSize={14}
                    placeholder="เลขประจำมิเตอร์ / รหัสสมาชิก"
                    placeholderTextColor="#D4D8DB"
                    padding={4}
                    color="#474E55"
                  />
                </Input>
              </View>
              {(getMeterStatus === 'not_collect' && (
                <MeterCard
                  onSelect={onSelectMember}
                  listItems={getFilterNotMeterCollectLists}
                  resetTrigger={resetTrigger}
                />
              )) ||
                (getMeterStatus === 'collect' && (
                  <MeterCard
                    onSelect={onSelectMember}
                    listItems={getFilterMeterCollectLists}
                    resetTrigger={resetTrigger}
                  />
                )) ||
                (getMeterStatus === 'all' && (
                  <MeterCard
                    onSelect={onSelectMember}
                    listItems={getFilterMeterAllLists}
                    resetTrigger={resetTrigger}
                  />
                ))}

              <View
                marginTop={16}
                backgroundColor="#D6EBFF"
                width={'100%'}
                borderRadius={16}
                paddingHorizontal={20}
                paddingVertical={15}>
                {Object.keys(getSelectMember).length === 0 && (
                  <Text fontFamily={fontStyles.regular} textAlign="center">
                    ไม่มีข้อมูล
                  </Text>
                )}
                {Object.keys(getSelectMember).length > 0 && (
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
                        {getMemberDetail?.meterNumber}
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
                        {getMemberDetail?.meterType}
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
                        {getMemberDetail?.memberName}
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
                        {getMemberDetail?.memberAddress}
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
                        {getMemberDetail?.memberTel}
                      </Text>
                    </View>
                    <View marginTop={14}>
                      <View flexDirection="row" justifyContent="center">
                        <View width={'50%'} alignItems="center">
                          <Text
                            fontFamily={fontStyles.semibold}
                            color="#065B94"
                            textAlign="center">
                            เลขมิเตอร์เดิม
                          </Text>
                          <View
                            backgroundColor="white"
                            width={'80%'}
                            borderRadius={32}
                            paddingVertical={6}
                            paddingHorizontal={10}
                            marginTop={2}>
                            <Text
                              fontFamily={fontStyles.semibold}
                              color="#474E55"
                              textAlign="center">
                              {getMemberDetail?.beforeCollected}
                            </Text>
                          </View>
                        </View>
                        <View width={'50%'} alignItems="center">
                          <Text
                            fontFamily={fontStyles.semibold}
                            color="#065B94"
                            textAlign="center">
                            เลขมิเตอร์ใหม่
                          </Text>
                          <Input
                            width={'80%'}
                            backgroundColor="white"
                            variant="rounded"
                            borderWidth={2}
                            borderColor="#D6EBFF"
                            size="md">
                            <InputField
                              value={getNewMeterNumber.toString()}
                              onChangeText={handleChangeNewMeterNumber}
                              keyboardType="numeric"
                              fontFamily={fontStyles.semibold}
                              fontSize={16}
                              textAlign="center"
                              placeholderTextColor="#D4D8DB"
                              color="#474E55"
                              padding={4}
                            />
                          </Input>
                        </View>
                      </View>
                    </View>
                    <View marginTop={20} alignItems="center">
                      <Text fontFamily={fontStyles.semibold} color="#054977">
                        จำนวนหน่วยที่ใช้งาน{' '}
                        <Text fontFamily={fontStyles.semibold} color="#F74C4C">
                          {Math.abs(
                            getNewMeterNumber -
                              getMemberDetail?.beforeCollected,
                          )}
                        </Text>{' '}
                        หน่วย
                      </Text>
                    </View>
                    <View marginTop={5} alignItems="center">
                      <Text fontFamily={fontStyles.semibold} color="#054977">
                        ใช้น้ำสูงเกิน{' '}
                        <Text fontFamily={fontStyles.semibold} color="#F74C4C">
                          {getPercentUseWater.toFixed(2)}%
                        </Text>{' '}
                        จากเดือนที่ผ่านมา
                      </Text>
                    </View>
                    <View marginTop={20} alignItems="center">
                      {getMeterStatus === 'collect' ? (
                        <></>
                      ) : getSelectMember.SAVEMETER === 'Y' ? (
                        <></>
                      ) : (
                        <Button
                          onPress={onSaveMeter}
                          borderRadius={20}
                          size="md"
                          width={'100%'}
                          backgroundColor="#087FCF">
                          <ButtonText fontFamily={fontStyles.semibold}>
                            บันทึกมิเตอร์
                          </ButtonText>
                        </Button>
                      )}

                      <Button
                        borderRadius={20}
                        onPress={printBill}
                        marginTop={12}
                        size="md"
                        width={'100%'}
                        backgroundColor="#065B94">
                        <ButtonText fontFamily={fontStyles.semibold}>
                          พิมพ์ใบแจ้งหนี้
                        </ButtonText>
                      </Button>
                      <Button
                        onPress={() => {
                          navigation.navigate('PaymentScreenTab', {
                            screen: 'Payment',
                          });
                        }}
                        borderRadius={20}
                        marginTop={12}
                        size="md"
                        width={'100%'}
                        backgroundColor="#054977">
                        <ButtonText fontFamily={fontStyles.semibold}>
                          ชำระเงิน
                        </ButtonText>
                      </Button>

                      {/* <Button
                        onPress={() => {
                          handleEndEvent();
                        }}
                        borderRadius={20}
                        marginTop={12}
                        size="md"
                        width={'100%'}
                        backgroundColor="#043759">
                        <ButtonText fontFamily={fontStyles.semibold}>
                          จบการทำรายการ
                        </ButtonText>
                      </Button> */}
                    </View>
                  </>
                )}
              </View>
            </View>
            <Footer />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default MeterMonitorScreen;
