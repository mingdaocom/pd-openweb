import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Checkbox, Segmented, Select } from 'ming-ui/antd-components';
import { TimeDropdownChoose } from 'src/pages/worksheet/common/ViewConfig/style.jsx';
import { resourceTypes, weekObj } from 'src/pages/worksheet/views/ResourceView/config.js';
import WeekdaySegmented from '../WeekdaySegmented';
import BaseInfo from './BaseInfo';
import EditTimes from './EditTimes';

const Wrap = styled.div`
  .showtimeCon {
    border: 1px solid var(--color-border-primary);
    border-radius: 3px;
    color: var(--color-text-secondary);
    padding: 6px 12px;
    background: var(--color-background-primary);
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    &:hover {
      background: var(--color-background-hover);
    }
  }
`;

const changePickerContainerLeft = () => {
  const changeLeft = () => {
    $('.hap-picker-range-arrow').css({ transition: 'none' });
    $('.hap-picker-panel-container').css({
      marginLeft: parseInt($('.hap-picker-range-arrow').css('left')),
    });
  };

  setTimeout(() => {
    $('.hap-picker-input input').on({
      click: () => changeLeft(),
      focus: () => changeLeft(),
    });
  }, 500);
};

export default function ResourceSet(props) {
  const { appId, view, updateCurrentView, worksheetControls = [] } = props;
  const { rowHeight = 0 } = view;
  const [{ timeControls, show }, setState] = useSetState({
    timeControls: [],
    show: false,
  });
  const calendarType = _.get(view, 'advancedSetting.calendarType') || '0';

  useEffect(() => {
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
        return { label: o.controlName, value: o.controlId };
      });
    setState({
      timeControls,
    });
  }, [worksheetControls, setState]);

  useEffect(() => {
    changePickerContainerLeft();
  }, []);

  return (
    <Wrap>
      <BaseInfo {...props} />
      <div className="flexRow mTop24">
        <div className="flex">
          <div className="Bold">{_l('开始')}</div>
          <Select
            className="mTop8"
            style={{ width: '100%' }}
            options={timeControls.filter(o => o.value !== _.get(props, 'view.advancedSetting.enddate'))}
            value={_.get(props, 'view.advancedSetting.begindate')}
            allowClear
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
          <Select
            className="mTop8"
            style={{ width: '100%' }}
            options={timeControls.filter(o => o.value !== _.get(props, 'view.advancedSetting.begindate'))}
            value={_.get(props, 'view.advancedSetting.enddate')}
            allowClear
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
        <Segmented
          block
          value={rowHeight}
          options={[
            { text: _l('紧凑'), value: 0 }, // 34
            { text: _l('中等'), value: 1 }, // 50
            { text: _l('宽松'), value: 2 }, // 70
            // { text: _l('超高'), value: 3 }, // 100
          ].map(({ text, ...option }) => ({ ...option, label: text }))}
          onChange={value => {
            updateCurrentView({
              ...view,
              appId,
              rowHeight: value,
              editAttrs: ['rowHeight'],
            });
          }}
        />
      </div>
      <div className="commonConfigItem Font13 bold mTop24">{_l('默认视图')}</div>
      <div className="commonConfigItem mTop6">
        <Segmented
          block
          value={calendarType}
          options={resourceTypes.map(({ text, ...option }) => ({ ...option, label: text }))}
          onChange={value => {
            safeLocalStorageSetItem(`${view.viewId}_resource_type`, resourceTypes.find(o => o.value === value).key);
            updateCurrentView({
              ...view,
              appId,
              advancedSetting: { calendarType: value },
              editAdKeys: ['calendarType'],
              editAttrs: ['advancedSetting'],
            });
          }}
        />
      </div>
      <div className="title Font13 bold mTop24">{_l('每周的第一天')}</div>
      <TimeDropdownChoose>
        <Select
          className="timeDropdown"
          value={[
            !_.get(props, 'view.advancedSetting.weekbegin') ? '1' : _.get(props, 'view.advancedSetting.weekbegin'),
          ]}
          optionLabelProp="label"
          placeholder={_l('请选择')}
          suffixIcon={<Icon icon="arrow-down-border Font14" />}
          classNames={{ popup: { root: 'dropConOption' } }}
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
          options={weekObj.map((o, i) => ({
            value: i + 1 + '',
            label: o,
            className: 'select_drop',
          }))}
        />
      </TimeDropdownChoose>
      <div>
        <Checkbox
          checked={!!_.get(props, 'view.advancedSetting.unweekday')}
          className="mTop16"
          onChange={() => {
            updateCurrentView({
              ...view,
              appId,
              advancedSetting: {
                unweekday: !_.get(props, 'view.advancedSetting.unweekday') ? '67' : undefined,
              },
              editAdKeys: ['unweekday'],
              editAttrs: ['advancedSetting'],
            });
          }}
        >
          {_l('只显示工作日')}
        </Checkbox>
        {!!_.get(props, 'view.advancedSetting.unweekday') && (
          <WeekdaySegmented
            className="mTop16"
            weekdays={weekObj}
            hiddenDays={_.get(props, 'view.advancedSetting.unweekday')}
            onChange={unweekday => {
              updateCurrentView({
                ...view,
                appId,
                advancedSetting: { unweekday },
                editAdKeys: ['unweekday'],
                editAttrs: ['advancedSetting'],
              });
            }}
          />
        )}
      </div>
      <Checkbox
        checked={!!_.get(props, 'view.advancedSetting.showtime')}
        className="mTop16"
        onChange={() => {
          if (!_.get(props, 'view.advancedSetting.showtime')) {
            return setState({
              show: true,
            });
          }

          updateCurrentView({
            ...view,
            appId,
            advancedSetting: {
              showtime: !_.get(props, 'view.advancedSetting.showtime') ? '08:00-18:00' : undefined,
            },
            editAdKeys: ['showtime'],
            editAttrs: ['advancedSetting'],
          });
          !_.get(props, 'view.advancedSetting.showtime') && changePickerContainerLeft();
        }}
      >
        {_l('只显示工作时间')}
      </Checkbox>
      {!!_.get(props, 'view.advancedSetting.showtime') && (
        <div className="showtimeCon mTop10" onClick={() => setState({ show: true })}>
          <div className="flex LineHeight22">
            {(_.get(props, 'view.advancedSetting.showtime') || '').split('|').map(o => {
              return <div className="textPrimary ">{o}</div>;
            })}
          </div>
          <div class="edit LineHeight22">
            <i class="icon-edit textTertiary hoverColorPrimary Font16 Hand"></i>
          </div>
        </div>
      )}
      <Checkbox
        checked={_.get(props, 'view.advancedSetting.hour24') === '1'}
        className="mTop16 flexRow"
        onChange={() => {
          updateCurrentView({
            ...view,
            appId,
            advancedSetting: {
              hour24: _.get(props, 'view.advancedSetting.hour24') === '1' ? '0' : '1',
            },
            editAdKeys: ['hour24'],
            editAttrs: ['advancedSetting'],
          });
        }}
      >
        {_l('24小时制')}
      </Checkbox>
      {show && (
        <EditTimes
          showtime={_.get(props, 'view.advancedSetting.showtime') || ''}
          onClose={() => setState({ show: false })}
          onChange={showtime => {
            updateCurrentView({
              ...view,
              appId,
              advancedSetting: { showtime: showtime },
              editAdKeys: ['showtime'],
              editAttrs: ['advancedSetting'],
            });
          }}
        />
      )}
    </Wrap>
  );
}
