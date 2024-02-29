import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Dropdown, CheckBlock, Icon, Checkbox } from 'ming-ui';
import { useSetState } from 'react-use';
import BaseInfo from './BaseInfo';
import _ from 'lodash';
import { TimeDropdownChoose, ShowChoose } from 'src/pages/worksheet/common/ViewConfig/style.jsx';
import { Select, TimePicker } from 'antd';
import cx from 'classnames';
import localeZhCn from 'antd/es/date-picker/locale/zh_CN';
import localeJaJp from 'antd/es/date-picker/locale/ja_JP';
import localeZhTw from 'antd/es/date-picker/locale/zh_TW';
import localeEn from 'antd/es/date-picker/locale/en_US';
import dayjs from 'dayjs';
import { weekObj, resourceTypes } from 'src/pages/worksheet/views/ResourceView/config.js';

const locales = { 'zh-Hans': localeZhCn, 'zh-Hant': localeZhTw, en: localeEn, ja: localeJaJp };
const locale = locales[md.global.Account.lang];

const Wrap = styled.div`
  .ming.Dropdown.isDelete .Dropdown--input .value,
  .dropdownTrigger .Dropdown--input .value {
    color: red;
  }
  .ming.Dropdown.isDelete .Dropdown--border,
  .dropdownTrigger .Dropdown--border {
    border-color: red;
  }
  .rangePicker {
  }
`;
export default function ResourceSet(props) {
  const { appId, view, updateCurrentView } = props;
  const { rowHeight = 0 } = view;
  const [{ timeControls }, setState] = useSetState({
    timeControls: [],
  });

  useEffect(() => {
    const { worksheetControls = [] } = props;
    const timeControls = worksheetControls
      .filter(
        item =>
          //支持的字段类型：日期、他表字段（日期）、汇总（日期）、公式（日期）
          _.includes([15, 16], item.type) || //日期
          (item.type === 30 && _.includes([15, 16], item.sourceControlType)) || //他表字段（日期）
          (item.type === 38 && item.enumDefault === 2) ||
          (item.type === 37 && [15, 16].includes(item.enumDefault2)),
      )
      .map(o => {
        return { ...o, text: o.controlName, value: o.controlId };
      });
    setState({
      timeControls,
    });
  }, [props.view]);

  useEffect(() => {
    changePickerContainerLeft();
  }, []);

  const changePickerContainerLeft = () => {
    const changeLeft = () => {
      $('.ant-picker-range-arrow').css({ transition: 'none' });
      $('.ant-picker-panel-container').css({
        marginLeft: parseInt($('.ant-picker-range-arrow').css('left')),
      });
    };
    setTimeout(() => {
      $('.ant-picker-input input').on({
        click: () => changeLeft(),
        focus: () => changeLeft(),
      });
    }, 500);
  };

  return (
    <Wrap>
      <BaseInfo {...props} />
      <div className="flexRow mTop24">
        <div className="flex">
          <div className="Bold">{_l('开始')}</div>
          <Dropdown
            className="mTop8"
            style={{ width: '100%' }}
            data={timeControls.filter(o => o.value !== _.get(props, 'view.advancedSetting.enddate'))}
            value={_.get(props, 'view.advancedSetting.begindate')}
            border
            cancelAble
            onChange={value => {
              if (_.get(props, 'view.advancedSetting.begindate') !== value) {
                updateCurrentView({
                  ...view,
                  appId,
                  advancedSetting: { begindate: value },
                  editAdKeys: ['begindate'],
                  editAttrs: ['advancedSetting'],
                });
              }
            }}
          />
        </div>
        <div className="flex mLeft12">
          <div className="Bold">{_l('结束')}</div>
          <Dropdown
            className="mTop8"
            style={{ width: '100%' }}
            data={timeControls.filter(o => o.value !== _.get(props, 'view.advancedSetting.begindate'))}
            value={_.get(props, 'view.advancedSetting.enddate')}
            border
            cancelAble
            onChange={value => {
              if (_.get(props, 'view.advancedSetting.enddate') !== value) {
                updateCurrentView({
                  ...view,
                  appId,
                  advancedSetting: { enddate: value },
                  editAdKeys: ['enddate'],
                  editAttrs: ['advancedSetting'],
                });
              }
            }}
          />
        </div>
      </div>
      <div className="commonConfigItem Font13 bold mTop24">{_l('行高')}</div>
      <div className="commonConfigItem mTop6">
        <CheckBlock
          data={[
            { text: _l('紧凑'), value: 0 }, // 34
            { text: _l('中等'), value: 1 }, // 50
            { text: _l('宽松'), value: 2 }, // 70
            // { text: _l('超高'), value: 3 }, // 100
          ]}
          value={rowHeight}
          onChange={value => {
            if (rowHeight !== value) {
              updateCurrentView({
                ...view,
                appId,
                rowHeight: value,
                editAttrs: ['rowHeight'],
              });
            }
          }}
        />
      </div>
      <div className="commonConfigItem Font13 bold mTop24">{_l('默认视图')}</div>
      <div className="commonConfigItem mTop6">
        <CheckBlock
          data={[
            { text: _l('月'), value: '0' },
            { text: _l('周'), value: '1' },
            { text: _l('日'), value: '2' },
          ]}
          value={
            !_.get(props, 'view.advancedSetting.calendarType') ? '0' : _.get(props, 'view.advancedSetting.calendarType')
          }
          onChange={value => {
            const calendarType = !_.get(props, 'view.advancedSetting.calendarType')
              ? '0'
              : _.get(props, 'view.advancedSetting.calendarType');
            if (calendarType !== value) {
              safeLocalStorageSetItem(`${view.viewId}_resource_type`, resourceTypes[value].value);
              updateCurrentView({
                ...view,
                appId,
                advancedSetting: { calendarType: value },
                editAdKeys: ['calendarType'],
                editAttrs: ['advancedSetting'],
              });
            }
          }}
        />
      </div>
      <div className="title Font13 bold mTop24">{_l('每周的第一天')}</div>
      <TimeDropdownChoose>
        <Select
          className={cx('timeDropdown', {})}
          value={[
            !_.get(props, 'view.advancedSetting.weekbegin') ? '1' : _.get(props, 'view.advancedSetting.weekbegin'),
          ]}
          optionLabelProp="label"
          placeholder={_l('请选择')}
          suffixIcon={<Icon icon="arrow-down-border Font14" />}
          dropdownClassName="dropConOption"
          onChange={value => {
            const weekbegin = !_.get(props, 'view.advancedSetting.weekbegin')
              ? '0'
              : _.get(props, 'view.advancedSetting.weekbegin');
            if (value === weekbegin) {
              return;
            }
            updateCurrentView({
              ...view,
              appId,
              advancedSetting: { weekbegin: value },
              editAdKeys: ['weekbegin'],
              editAttrs: ['advancedSetting'],
            });
          }}
        >
          {weekObj.map((o, i) => {
            return (
              <Select.Option value={i + 1 + ''} key={i} label={o} className="select_drop">
                {o}
              </Select.Option>
            );
          })}
        </Select>
      </TimeDropdownChoose>
      <ShowChoose>
        <Checkbox
          checked={!!_.get(props, 'view.advancedSetting.unweekday')}
          className="mTop16"
          onClick={e => {
            updateCurrentView({
              ...view,
              appId,
              advancedSetting: { unweekday: !_.get(props, 'view.advancedSetting.unweekday') ? '67' : undefined },
              editAdKeys: ['unweekday'],
              editAttrs: ['advancedSetting'],
            });
          }}
          text={_l('只显示工作日')}
        />
        {!!_.get(props, 'view.advancedSetting.unweekday') && (
          <div className="hiddenDaysBox mTop16">
            {weekObj.map((it, i) => {
              let n = i + 1;
              return (
                <li
                  className={cx({ checked: (_.get(props, 'view.advancedSetting.unweekday') || '').indexOf(n) < 0 })}
                  onClick={e => {
                    let str = _.get(props, 'view.advancedSetting.unweekday');
                    if ((_.get(props, 'view.advancedSetting.unweekday') || '').indexOf(n) >= 0) {
                      str = str.replace(n, '');
                    } else {
                      str = `${str}` + n;
                    }
                    if (str.length >= 7) {
                      //不能全部选中
                      return;
                    }
                    updateCurrentView({
                      ...view,
                      appId,
                      advancedSetting: { unweekday: str },
                      editAdKeys: ['unweekday'],
                      editAttrs: ['advancedSetting'],
                    });
                  }}
                >
                  {it}
                </li>
              );
            })}
          </div>
        )}
      </ShowChoose>
      <Checkbox
        checked={!!_.get(props, 'view.advancedSetting.showtime')}
        className="mTop16"
        onClick={e => {
          updateCurrentView({
            ...view,
            appId,
            advancedSetting: { showtime: !_.get(props, 'view.advancedSetting.showtime') ? '08:00-18:00' : undefined },
            editAdKeys: ['showtime'],
            editAttrs: ['advancedSetting'],
          });
          !_.get(props, 'view.advancedSetting.showtime') && changePickerContainerLeft();
        }}
        text={_l('只显示工作时间')}
      />
      {!!_.get(props, 'view.advancedSetting.showtime') && (
        <TimePicker.RangePicker
          className="mTop8 rangePicker w100 borderAll3"
          format="HH:mm"
          value={
            !!_.get(props, 'view.advancedSetting.showtime')
              ? _.get(props, 'view.advancedSetting.showtime')
                  .split('-')
                  .map(item => dayjs(item, 'HH:mm'))
              : []
          }
          hourStep={1}
          minuteStep={60}
          onChange={(data, timeString) => {
            if (data && data[0] && data[1] && dayjs(data[1]).diff(dayjs(data[0])) <= 0) {
              alert(_l('结束时间不能早于或等于开始时间'), 3);
              return;
            }
            updateCurrentView({
              ...view,
              appId,
              advancedSetting: { showtime: `${timeString[0]}-${timeString[1]}` },
              editAdKeys: ['showtime'],
              editAttrs: ['advancedSetting'],
            });
          }}
          locale={locale}
          showNow={true}
          allowClear={false}
        />
      )}
      <Checkbox
        checked={_.get(props, 'view.advancedSetting.hour24') === '1'}
        className="mTop16"
        onClick={e => {
          updateCurrentView({
            ...view,
            appId,
            advancedSetting: { hour24: _.get(props, 'view.advancedSetting.hour24') === '1' ? '0' : '1' },
            editAdKeys: ['hour24'],
            editAttrs: ['advancedSetting'],
          });
        }}
        text={_l('24小时制')}
      />
    </Wrap>
  );
}
