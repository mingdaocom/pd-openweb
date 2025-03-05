import React, { useState } from 'react';
import styled from 'styled-components';
import { Dropdown, Input, Icon, Checkbox } from 'ming-ui';
import { DatePicker, TimePicker } from 'antd';
import Trigger from 'rc-trigger';
import localeZhCn from 'antd/es/date-picker/locale/zh_CN';
import localeJaJp from 'antd/es/date-picker/locale/ja_JP';
import localeZhTw from 'antd/es/date-picker/locale/zh_TW';
import localeEn from 'antd/es/date-picker/locale/en_US';
import { FFILLLIMIT_OPTIONS, TIME_PERIOD_TYPE, TIME_PERIOD_OPTIONS, TIME_TYPE, WEEKS, MONTHS } from '../../enum';
import cx from 'classnames';
import _ from 'lodash';
import dayjs from 'dayjs';
import moment from 'moment';
import CommonSwitch from './CommonSwitch';
import SectionTitle from './SectionTitle';
import { generateRandomPassword } from 'src/util';

const { RangePicker } = DatePicker;

const CustomPeriodDropdown = styled(Dropdown)`
  width: 110px;
  margin-right: 20px;
  &.ming.Dropdown .Dropdown--border,
  .dropdownTrigger .Dropdown--border {
    height: 32px;
    border-radius: 0;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`;

const TimePeriodType = styled.div`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 32px;
  border: 1px solid #ddd;
  border-right: 0;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
`;

const RangeInputContainer = styled.div`
  position: relative;

  .ming.Input {
    width: 150px;
    height: 32px;
    border-color: #ddd !important;

    &:focus {
      border-color: #1e88e5 !important;
    }
  }

  .rangeSuffix {
    position: absolute;
    top: 6px;
    right: 8px;
    line-height: 20px;
  }
`;

const CustomTimePicker = styled(TimePicker)`
  width: 150px !important;
  height: 32px !important;
  border-radius: 3px !important;
  &:hover {
    border-color: #ddd !important;
  }
  &.ant-picker-focused {
    border-color: #1e88e5 !important;
  }
`;

const MonthDropdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .Icon {
    color: #2196f3 !important;
    position: unset !important;
  }
  &:hover {
    .Icon {
      color: #fff !important;
    }
  }
`;

const DaySelectContainer = styled.div`
  width: 320px;
  padding: 12px 13px;
  background: #fff;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.16);
  border-radius: 6px;

  .dayItem {
    display: inline-block;
    text-align: center;
    width: 26px;
    height: 26px;
    line-height: 26px;
    border-radius: 5px;
    margin: 0 8px 8px 8px;
    border: 1px solid transparent;
    cursor: pointer;

    :hover {
      border: 1px solid #2196f3;
    }

    &.active {
      background: #2196f3;
      color: #fff;
    }
  }
`;

const WeekContainer = styled.div`
  display: flex;
  width: 320px;
  .weekItem {
    flex: 1;
    height: 32px;
    padding: 6px;
    text-align: center;
    border: 1px solid #ddd;
    border-left-width: 0.5px;
    border-right-width: 0.5px;
    line-height: 18px;
    cursor: pointer;

    &:first-child {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
      border-left-width: 1px;
    }
    &:last-child {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
      border-right-width: 1px;
    }
    :hover {
      border-color: #2196f3;
    }
    &.active {
      background: #2196f3;
      color: #fff;
    }
  }
`;

const NoExpandSelect = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 320px;
  height: 32px;
  padding: 5px 5px 5px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  cursor: pointer;
  i {
    margin-left: 8px;
    color: #9e9e9e;
  }

  :hover,
  &.active {
    border-color: #2196f3;
  }
`;

const LimitWriteFrequencyWrap = styled.div`
  .limitRangTypeDropdown {
    width: 120px;
  }
  .limitWriteCount {
    max-width: 200px;
    .text {
      right: 10px;
      top: 0px;
      line-height: 36px;
    }
  }
`;

export default function DataCollectionSettings(props) {
  const { data, setState } = props;
  const {
    linkSwitchTime = {},
    limitWriteTime = {},
    limitWriteCount = {},
    limitPasswordWrite = {},
    limitWriteFrequencySetting = { limitRangType: 1 },
    timeRange,
    titleFolded,
  } = data;
  const [daySelectPopupVisible, setDaySelectPopupVisible] = useState(false);
  const timePeriodList = [
    { type: TIME_TYPE.MONTH, text: _l('月%02068') },
    { type: TIME_TYPE.DAY, text: _l('日') },
    { type: TIME_TYPE.HOUR, text: _l('时%02069') },
  ];
  const locales = { 'zh-Hans': localeZhCn, 'zh-Hant': localeZhTw, en: localeEn, ja: localeJaJp };
  const locale = locales[md.global.Account.lang];

  const onRangeInputChange = (value, type, from) => {
    if (parseInt(value) || parseInt(value) === 0 || value === '') {
      const newTimeRange = _.cloneDeep(timeRange);
      const maxValue = type === TIME_TYPE.MONTH ? 12 : 31;
      const minValue = 1;
      const setValue =
        value !== ''
          ? parseInt(value) > maxValue
            ? maxValue
            : parseInt(value) < minValue
            ? minValue
            : parseInt(value)
          : '';
      newTimeRange[type][from] = setValue;
      setState({ timeRange: newTimeRange });
    }
  };

  const onRangeInputBlur = type => {
    if (timeRange[type].start && timeRange[type].end) {
      const newTimeRange = _.cloneDeep(timeRange);
      if (timeRange[type].start > timeRange[type].end) {
        newTimeRange[type].start = timeRange[type].end;
        newTimeRange[type].end = timeRange[type].start;
      }

      const newLimitWriteTime = _.cloneDeep(limitWriteTime);
      if (type === TIME_TYPE.HOUR) {
      } else {
        const resultArr = Array.from(Array(newTimeRange[type].end), (_, i) => i + 1).filter(
          item => item >= newTimeRange[type].start,
        );
        newLimitWriteTime[`${type}Setting`][`define${_.upperFirst(type)}`] = resultArr;
      }

      setState({ timeRange: newTimeRange, limitWriteTime: newLimitWriteTime });
    }
  };

  const onTimeChange = (timeString, index, from) => {
    const newTimeRange = _.cloneDeep(timeRange);
    newTimeRange[TIME_TYPE.HOUR][index][from] = timeString;
    setState({ timeRange: newTimeRange });
  };

  const getDisabledTime = (from, itemData) => {
    let disabledHours = () => [];
    let disabledMinutes = () => [];

    if (from === 'start' && itemData.end) {
      const [endHour, endMinute] = itemData.end.split(':').map(item => parseInt(item));
      disabledHours = () => Array.from({ length: 23 - endHour }, (_, k) => k + endHour + 1);
      disabledMinutes = selectedHour =>
        selectedHour < 0
          ? Array.from({ length: 60 }, (_, k) => k)
          : selectedHour === endHour
          ? Array.from({ length: 60 - endMinute }, (_, k) => k + endMinute)
          : [];
    }
    if (from === 'end' && itemData.start) {
      const [startHour, startMinute] = itemData.start.split(':').map(item => parseInt(item));
      disabledHours = () => Array.from({ length: startHour }, (_, k) => k);
      disabledMinutes = selectedHour =>
        selectedHour < 0
          ? Array.from({ length: 60 }, (_, k) => k)
          : selectedHour === startHour
          ? Array.from({ length: startMinute + 1 }, (_, k) => k)
          : [];
    }
    return { disabledHours, disabledMinutes };
  };

  const renderTimePeriodItem = (itemProps, index) => {
    const { type, text } = itemProps;
    const selectedMonths = limitWriteTime.monthSetting.defineMonth || [];
    const selectedDays = limitWriteTime.daySetting.defineDay || [];
    const selectedWeeks = limitWriteTime.daySetting.defineWeek || [];
    const currentPeriodType = limitWriteTime[`${type}Setting`][`${type}Type`];

    return (
      <div className="flexRow mBottom10" key={index}>
        <TimePeriodType>{text}</TimePeriodType>
        <CustomPeriodDropdown
          border
          isAppendToBody
          value={currentPeriodType}
          data={TIME_PERIOD_OPTIONS[type]}
          onChange={value => {
            const newLimitWriteTime = _.cloneDeep(limitWriteTime);
            newLimitWriteTime[`${type}Setting`][`${type}Type`] = value;
            switch (type) {
              case TIME_TYPE.MONTH:
                newLimitWriteTime.monthSetting.defineMonth = [];
                break;
              case TIME_TYPE.DAY:
                newLimitWriteTime.daySetting.defineDay = [];
                newLimitWriteTime.daySetting.defineWeek = [];
                break;
              default:
                newLimitWriteTime.hourSetting.rangHour = [];
                break;
            }
            setState({ limitWriteTime: newLimitWriteTime });
          }}
        />
        {currentPeriodType === TIME_PERIOD_TYPE.SPECIFY_MONTH && type === TIME_TYPE.MONTH && (
          <Dropdown
            border
            isAppendToBody
            selectClose={false}
            className="monthDropdown"
            placeholder={_l('选择月份')}
            renderTitle={() =>
              _.isEmpty(selectedMonths) ? (
                <span className="Gray_bd">{_l('选择月份')}</span>
              ) : (
                <span>{selectedMonths.sort((a, b) => a - b).join(', ')}</span>
              )
            }
            data={MONTHS.map((item, index) => {
              return {
                text: (
                  <MonthDropdownItem key={index}>
                    <span>{item.text}</span>
                    {_.includes(selectedMonths, item.value) && <Icon icon="done" />}
                  </MonthDropdownItem>
                ),
                value: item.value,
              };
            })}
            value={selectedMonths.length}
            onChange={value => {
              const isSelected = _.includes(selectedMonths, value);
              const newLimitWriteTime = _.cloneDeep(limitWriteTime);
              newLimitWriteTime.monthSetting.defineMonth = isSelected
                ? _.remove(selectedMonths, m => m !== value)
                : [...selectedMonths, value];
              setState({ limitWriteTime: newLimitWriteTime });
            }}
          />
        )}
        {currentPeriodType === TIME_PERIOD_TYPE.SPECIFY_DAY && type === TIME_TYPE.DAY && (
          <Trigger
            action={['click']}
            popupClassName="moreOption"
            popupVisible={daySelectPopupVisible}
            onPopupVisibleChange={visible => setDaySelectPopupVisible(visible)}
            popupAlign={{
              points: ['tl', 'bl'],
              offset: [0, 1],
              overflow: { adjustX: true, adjustY: true },
            }}
            popup={
              <DaySelectContainer>
                {Array.from(Array(31), (_, i) => i + 1).map(item => {
                  const isSelected = _.includes(selectedDays, item);
                  return (
                    <div
                      className={cx('dayItem', { active: isSelected })}
                      onClick={() => {
                        const newLimitWriteTime = _.cloneDeep(limitWriteTime);
                        newLimitWriteTime.daySetting.defineDay = isSelected
                          ? _.remove(selectedDays, d => d !== item)
                          : [...selectedDays, item];
                        setState({ limitWriteTime: newLimitWriteTime });
                      }}
                    >
                      {item}
                    </div>
                  );
                })}
              </DaySelectContainer>
            }
          >
            <NoExpandSelect className={cx({ active: daySelectPopupVisible })}>
              {_.isEmpty(selectedDays) ? (
                <span className="Gray_bd ellipsis InlineBlock">{_l('选择日期')}</span>
              ) : (
                <span className="ellipsis InlineBlock">{selectedDays.sort((a, b) => a - b).join(', ')}</span>
              )}
              <i className="icon-arrow-down-border"></i>
            </NoExpandSelect>
          </Trigger>
        )}
        {currentPeriodType === TIME_PERIOD_TYPE.WEEKLY && type === TIME_TYPE.DAY && (
          <WeekContainer>
            {WEEKS.map((item, index) => {
              const isSelected = _.includes(selectedWeeks, item.value);
              return (
                <div
                  key={index}
                  className={cx('weekItem', { active: isSelected })}
                  onClick={() => {
                    const newLimitWriteTime = _.cloneDeep(limitWriteTime);
                    newLimitWriteTime.daySetting.defineWeek = isSelected
                      ? _.remove(selectedWeeks, w => w !== item.value)
                      : [...selectedWeeks, item.value];
                    setState({ limitWriteTime: newLimitWriteTime });
                  }}
                >
                  {moment().day(item.value).format('dd')}
                </div>
              );
            })}
          </WeekContainer>
        )}
        {_.includes([TIME_PERIOD_TYPE.SPECIFY_RANGE_MONTH, TIME_PERIOD_TYPE.SPECIFY_RANGE_DAY], currentPeriodType) && (
          <div className="flexRow alignItemsCenter">
            <RangeInputContainer>
              <Input
                value={timeRange[type].start || ''}
                onChange={value => onRangeInputChange(value, type, 'start')}
                onBlur={() => onRangeInputBlur(type)}
              />
              <div className="rangeSuffix">{type === TIME_TYPE.MONTH ? _l('月') : _l('日')}</div>
            </RangeInputContainer>
            <Icon icon="minus Gray_75 Font12 mLeft4 mRight4" />
            <RangeInputContainer>
              <Input
                value={timeRange[type].end || ''}
                onChange={value => onRangeInputChange(value, type, 'end')}
                onBlur={() => onRangeInputBlur(type)}
              />
              <div className="rangeSuffix">{type === TIME_TYPE.MONTH ? _l('月') : _l('日')}</div>
            </RangeInputContainer>
          </div>
        )}
        {type === TIME_TYPE.HOUR && currentPeriodType === TIME_PERIOD_TYPE.SPECIFY_RANGE_HOUR && (
          <div className="flexColumn flex">
            {timeRange[type].map((item, index) => {
              return (
                <div className={`flexRow alignItemsCenter ${index !== 0 ? 'mTop10' : ''}`} key={index}>
                  <CustomTimePicker
                    locale={locale}
                    format="HH:mm"
                    showNow={false}
                    suffixIcon={null}
                    disabledTime={() => getDisabledTime('start', item)}
                    value={item.start ? dayjs(item.start, 'HH:mm') : null}
                    onChange={(time, timeString) => onTimeChange(timeString, index, 'start')}
                  />
                  <Icon icon="minus Gray_75 Font12 mLeft4 mRight4" />
                  <CustomTimePicker
                    locale={locale}
                    format="HH:mm"
                    showNow={false}
                    suffixIcon={null}
                    disabledTime={() => getDisabledTime('end', item)}
                    value={item.end ? dayjs(item.end, 'HH:mm') : null}
                    onChange={(time, timeString) => onTimeChange(timeString, index, 'end')}
                  />
                  <Icon
                    icon={index === 0 ? 'add_circle_outline' : 'remove_circle_outline'}
                    className="Font15 Gray_9e mLeft10 pointer"
                    onClick={() => {
                      setState({
                        timeRange: Object.assign({}, timeRange, {
                          [type]:
                            index === 0
                              ? [...timeRange[type], { start: null, end: null }]
                              : timeRange[type].filter((_, i) => i !== index),
                        }),
                      });
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <React.Fragment>
      <SectionTitle
        title={_l('数据收集')}
        isFolded={titleFolded.dataCollect}
        onClick={() =>
          setState({ titleFolded: Object.assign({}, titleFolded, { dataCollect: !titleFolded.dataCollect }) })
        }
      />
      {!titleFolded.dataCollect && (
        <div className="mLeft25">
          <div className="mBottom24">
            <CommonSwitch
              checked={linkSwitchTime.isEnable}
              onClick={checked => setState({ linkSwitchTime: { isEnable: !checked, isShowCountDown: false } })}
              name={_l('设置链接开始/停止时间')}
              tip={_l('打开后，填写者只有在设置的时间范围内填写，方可正常提交表单。')}
            />
            {linkSwitchTime.isEnable && (
              <div className="commonMargin flexRow alignItemsCenter">
                <RangePicker
                  showTime={true}
                  locale={locale}
                  value={
                    !linkSwitchTime.startTime || linkSwitchTime.startTime.substr(0, 4) === '0001'
                      ? null
                      : [moment(linkSwitchTime.startTime), moment(linkSwitchTime.endTime)]
                  }
                  onChange={date => {
                    setState({
                      linkSwitchTime: Object.assign({}, linkSwitchTime, {
                        startTime: date ? moment(date[0]).format('YYYY-MM-DD HH:mm:ss') : '',
                        endTime: date ? moment(date[1]).format('YYYY-MM-DD HH:mm:ss') : '',
                      }),
                    });
                  }}
                />
                <Checkbox
                  className="mLeft32"
                  size="small"
                  checked={linkSwitchTime.isShowCountDown}
                  text={_l('显示倒计时')}
                  onClick={() =>
                    setState({
                      linkSwitchTime: Object.assign({}, linkSwitchTime, {
                        isShowCountDown: !linkSwitchTime.isShowCountDown,
                      }),
                    })
                  }
                />
              </div>
            )}
          </div>
          <div className="mBottom24">
            <CommonSwitch
              checked={limitWriteTime.isEnable}
              onClick={checked => {
                const newLimitWriteTime = !checked
                  ? {
                      isEnable: !checked,
                      monthSetting: { monthType: 1 },
                      daySetting: { dayType: 1 },
                      hourSetting: { hourType: 1 },
                    }
                  : { isEnable: !checked };

                setState({ limitWriteTime: newLimitWriteTime });
              }}
              name={_l('设置填写时段')}
              tip={_l('打开后，填写者只有在设置的这个时间段内填写，方可正常提交数据。')}
            />
            {limitWriteTime.isEnable && (
              <div className="commonMargin">
                <p className="mBottom12">{_l('以下时段可填写')}</p>
                {timePeriodList.map((item, index) => {
                  return renderTimePeriodItem(item, index);
                })}
              </div>
            )}
          </div>
          <div className="mBottom24">
            <CommonSwitch
              checked={limitWriteCount.isEnable}
              onClick={checked => setState({ limitWriteCount: { isEnable: !checked } })}
              name={_l('限制收集数量上限')}
              tip={_l('打开后，当数据量达到设置的上限时，该表单将不能继续提交数据。')}
            />
            {limitWriteCount.isEnable && (
              <div className="commonMargin">
                <span>{_l('最多收集')}</span>
                <Input
                  value={limitWriteCount.limitWriteCount || ''}
                  className="limitInput"
                  onChange={value => {
                    (parseInt(value) || value === '') &&
                      setState({
                        limitWriteCount: Object.assign({}, limitWriteCount, {
                          limitWriteCount: parseInt(value),
                        }),
                      });
                  }}
                />
                <span>{_l('条数据')}</span>
              </div>
            )}
          </div>
          <LimitWriteFrequencyWrap>
            <CommonSwitch
              checked={!!_.get(limitWriteFrequencySetting, 'isEnable')}
              onClick={() =>
                setState({
                  limitWriteFrequencySetting: {
                    ...limitWriteFrequencySetting,
                    isEnable: !_.get(limitWriteFrequencySetting, 'isEnable'),
                    limitRangType: 1,
                  },
                })
              }
              name={_l('限制填写次数')}
            />
            {!!_.get(limitWriteFrequencySetting, 'isEnable') && (
              <div className="commonMargin flexRow">
                <Dropdown
                  border
                  isAppendToBody
                  selectClose={true}
                  className="limitRangTypeDropdown"
                  data={FFILLLIMIT_OPTIONS}
                  value={_.get(limitWriteFrequencySetting, 'limitRangType')}
                  onChange={limitRangType => {
                    setState({ limitWriteFrequencySetting: { ...limitWriteFrequencySetting, limitRangType } });
                  }}
                />
                <div className="flex Relative mLeft10 limitWriteCount">
                  <Input
                    className={'w100 pRight30'}
                    value={_.get(limitWriteFrequencySetting, 'limitWriteCount') || ''}
                    onChange={value => {
                      (parseInt(value) || value === '') &&
                        setState({
                          limitWriteFrequencySetting: {
                            ...limitWriteFrequencySetting,
                            limitWriteCount: !!value ? (parseInt(value) > 10000 ? 10000 : parseInt(value)) : '',
                          },
                        });
                    }}
                  />
                  <span className="text Absolute">{_l('次')}</span>
                </div>
              </div>
            )}
          </LimitWriteFrequencyWrap>
          <div className="mTop24">
            <CommonSwitch
              checked={limitPasswordWrite.isEnable}
              onClick={checked =>
                setState({
                  limitPasswordWrite: {
                    isEnable: !checked,
                    limitPasswordWrite: !checked ? generateRandomPassword(4) : '',
                  },
                })
              }
              name={_l('凭密码填写')}
              tip={_l('打开后，填写者需要输入正确的密码，方可打开表单填写数据。')}
            />
            {limitPasswordWrite.isEnable && (
              <div className="commonMargin">
                <Input
                  className="passwordInput"
                  placeholder="请输入4-8位密码"
                  value={limitPasswordWrite.limitPasswordWrite}
                  onChange={value => {
                    setState({
                      limitPasswordWrite: Object.assign({}, limitPasswordWrite, {
                        limitPasswordWrite: value,
                      }),
                    });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </React.Fragment>
  );
}
