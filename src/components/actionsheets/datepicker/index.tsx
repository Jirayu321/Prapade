/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React,{FC, useState} from 'react';
import {
  Box,
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
  View,
  Text,
  Button,
  ButtonText,
} from '@gluestack-ui/themed';
import {TouchableHighlight, StyleSheet, Pressable} from 'react-native';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faAngleLeft, faAngleRight} from '@fortawesome/free-solid-svg-icons';
import fontStyles from '../../../core/styles/fonts';
import moment from 'moment';
import 'moment/locale/th';

const styles = StyleSheet.create({
  'stylesheet.calendar.header': {
    dayTextAtIndex0: {
      color: 'black',
      fontFamily: fontStyles.regular,
      fontSize: 14,
    },
    dayTextAtIndex1: {
      color: 'black',
      fontFamily: fontStyles.regular,
      fontSize: 14,
    },
    dayTextAtIndex2: {
      color: 'black',
      fontFamily: fontStyles.regular,
      fontSize: 14,
    },
    dayTextAtIndex3: {
      color: 'black',
      fontFamily: fontStyles.regular,
      fontSize: 14,
    },
    dayTextAtIndex4: {
      color: 'black',
      fontFamily: fontStyles.regular,
      fontSize: 14,
    },
    dayTextAtIndex5: {
      color: 'black',
      fontFamily: fontStyles.regular,
      fontSize: 14,
    },
    dayTextAtIndex6: {
      color: 'black',
      fontFamily: fontStyles.regular,
      fontSize: 14,
    },
  } as any,
});

interface CalendarProps {
  isOpen: boolean;
  type?: string | 'full';
  dateInit: string;
  callback: (item: string) => void;
  closeCallback: () => void;
  showTitle: boolean;
  icon?: any;
  title?: string;
}

const CalendarComponent: FC<CalendarProps> = ({...props}) => {
  const handleClose = () => props.closeCallback();
  const currentYear = moment().format('YYYY');
  const [focusedDate, setFocusedDate] = useState(props.dateInit);
  moment.locale('th');
  LocaleConfig.locales['th'] = {
    monthNames: [
      'มกราคม',
      'กุมภาพันธ์',
      'มีนาคม',
      'เมษายน',
      'พฤษภาคม',
      'มิถุนายน',
      'กรกฎาคม',
      'สิงหาคม',
      'กันยายน',
      'ตุลาคม',
      'พฤศจิกายน',
      'ธันวาคม',
    ],
    monthNamesShort: [
      'ม.ค.',
      'ก.พ.',
      'มี.ค.',
      'เม.ย.',
      'พ.ค.',
      'มิ.ย.',
      'ก.ค.',
      'ส.ค.',
      'ก.ย.',
      'ต.ค.',
      'พ.ย.',
      'ธ.ค.',
    ],
    dayNames: [
      'วันอาทิตย์',
      'วันจันทร์',
      'วันอังคาร',
      'วันพุธ',
      'วันพฤหัสบดี',
      'วันศุกร์',
      'วันเสาร์',
    ],
    dayNamesShort: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'],
    today: 'วันนี้',
  };

  LocaleConfig.defaultLocale = 'th';

  const HeaderRender = ({date}: any) => {
    const year = date.getFullYear() + 543;
    const month =
      LocaleConfig.locales[LocaleConfig.defaultLocale].monthNames[
        date.getMonth()
      ];
    return (
      <View height={'100%'} marginTop={6}>
        <Text
          fontSize={18}
          color="black"
          style={{fontFamily: fontStyles.medium}}>
          {month} {year}
        </Text>
      </View>
    );
  };

  const dayComponent = ({date}: any) => {
    const day = date.day.toString();
    const isFocused = focusedDate === date.dateString;

    return (
      <TouchableHighlight
        onPress={() => {
          setFocusedDate(date.dateString);
        }}
        underlayColor={'none'}>
        <View
          bgColor={isFocused ? `#3DA1FF` : `#F1F1F1`}
          borderRadius={10}
          width={35}
          height={35}
          flexDirection="row"
          justifyContent="center">
          <Text
            textAlign="center"
            alignSelf="center"
            width={'$full'}
            color={isFocused ? 'white' : '#888888'}>
            {day}
          </Text>
        </View>
      </TouchableHighlight>
    );
  };

  const [getCurrentYear, setCurrentYear] = useState(currentYear);
  const [getCurrentMonth, setCurrentMonth] = useState({
    month: Number(moment(props.dateInit).format('M')),
    name: moment(props.dateInit).format('MMMM'),
  });

  return (
    <Box>
      <Actionsheet
        isOpen={props.isOpen}
        onClose={handleClose}
        snapPoints={[85]}
        zIndex={999}>
        <ActionsheetBackdrop />
        <ActionsheetContent padding={'$0'} zIndex={999} maxHeight="85%">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          {props.showTitle && (
            <>
              <View
                marginTop={'$5'}
                paddingBottom={12}
                paddingHorizontal={'$4'}
                width={'100%'}
                flexDirection="row"
                justifyContent="flex-start"
                alignItems="center"
                gap={12}>
                {props.icon && (
                  <View>
                    <FontAwesomeIcon
                      icon={props.icon}
                      color="black"
                      size={22}
                    />
                  </View>
                )}
                <Text
                  fontFamily={fontStyles.semibold}
                  fontSize={16}
                  paddingRight={'$6'}
                  size={'lg'}
                  color="black">
                  {props.title}
                </Text>
              </View>
              <Box
                backgroundColor="black"
                width={'100%'}
                height={'$0.5'}
                borderRadius={50}></Box>
            </>
          )}
          <View width={'100%'} paddingTop={10}>
            {(props.type === 'full' && (
              <Calendar
                theme={styles as any}
                minData={new Date()}
                renderHeader={date => <HeaderRender date={date} />}
                dayComponent={dayComponent}
              />
            )) ||
              (props.type === 'month' && (
                <>
                  <View
                    width={'100%'}
                    padding={15}
                    flexDirection="row"
                    justifyContent="space-between"
                    alignContent="center">
                    <Pressable
                      onPress={() => {
                        setCurrentYear(String(Number(getCurrentYear) - 1));
                      }}>
                      <FontAwesomeIcon
                        icon={faAngleLeft}
                        color="black"
                        size={20}
                      />
                    </Pressable>
                    <View height={'$full'}>
                      <Text
                        style={{fontFamily: fontStyles.regular}}
                        color="black"
                        fontSize={18}>
                        {Number(getCurrentYear) + 543}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => {
                        setCurrentYear(String(Number(getCurrentYear) + 1));
                      }}>
                      <FontAwesomeIcon
                        icon={faAngleRight}
                        color="black"
                        size={20}
                      />
                    </Pressable>
                  </View>
                  <View
                    width={'100%'}
                    padding={15}
                    flexDirection="row"
                    justifyContent="center"
                    alignContent="center"
                    flexWrap="wrap"
                    rowGap={12}
                    columnGap={25}>
                    {LocaleConfig.locales[
                      LocaleConfig.defaultLocale
                    ].monthNames.map((item: any, idx: number) => (
                      <Pressable
                        onPress={() => {
                          setCurrentMonth({
                            month: idx + 1,
                            name: item,
                          });
                        }}
                        key={idx}
                        style={{
                          width: '28%',
                          backgroundColor:
                            getCurrentMonth.name === item
                              ? '#0E86D4'
                              : '#F1F1F1',
                          borderRadius: 10,
                          padding: 2,
                        }}>
                        <Text
                          color={
                            getCurrentMonth.name === item ? '#FFF' : '#888888'
                          }
                          textAlign="center"
                          fontFamily={fontStyles.regular}>
                          {item}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              ))}
          </View>
          <View position="absolute" bottom={40} width={'90%'}>
            <Button
              size={'lg'}
              bgColor="#3DA1FF"
              onPress={() => {
                if (props.type === 'full') props.callback(focusedDate);
                else if (props.type === 'month') {
                  props.callback(
                    `${getCurrentYear}-${getCurrentMonth.month}-01`,
                  );
                }
                handleClose();
              }}>
              <ButtonText fontFamily={fontStyles.regular}>ตกลง</ButtonText>
            </Button>
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </Box>
  );
};

export default CalendarComponent;
