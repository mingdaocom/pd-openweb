import React, { useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, Dropdown, Icon } from 'ming-ui';
import { ShowChoose, TimeDropdownChoose } from 'src/pages/worksheet/common/ViewConfig/style.jsx';
import { AnimationWrap } from 'src/pages/worksheet/common/ViewConfig/style.jsx';
import { resourceTypes, weekObj } from 'src/pages/worksheet/views/ResourceView/config.js';
import BaseInfo from './BaseInfo';
import EditTimes from './EditTimes';

const Wrap = styled.div`
  .ming.Dropdown.isDelete .Dropdown--input .value,
  .dropdownTrigger .Dropdown--input .value {
    color: red;
  }
  .ming.Dropdown.isDelete .Dropdown--border,
  .dropdownTrigger .Dropdown--border {
    border-color: red;
  }
  .showtimeCon {
    border: 1px solid #ddd;
    border-radius: 3px;
    color: #757575;
    padding: 6px 12px;
    background: #fff;
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    &:hover {
      background: #f5f5f5;
    }
  }
`;
export default function ResourceSet(props) {
  const { appId, view, updateCurrentView } = props;
  const { rowHeight = 0 } = view;
  const [{ timeControls, show }, setState] = useSetState({
    timeControls: [],
    show: false,
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
            isAppendToBody
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
            isAppendToBody
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
        <AnimationWrap>
          {[
            { text: _l('紧凑'), value: 0 }, // 34
            { text: _l('中等'), value: 1 }, // 50
            { text: _l('宽松'), value: 2 }, // 70
            // { text: _l('超高'), value: 3 }, // 100
          ].map(item => {
            return (
              <div
                className={cx('animaItem overflow_ellipsis', {
                  active: rowHeight === item.value,
                })}
                onClick={() => {
                  const { value } = item;
                  if (rowHeight !== value) {
                    updateCurrentView({
                      ...view,
                      appId,
                      rowHeight: value,
                      editAttrs: ['rowHeight'],
                    });
                  }
                }}
              >
                {item.text}
              </div>
            );
          })}
        </AnimationWrap>
      </div>
      <div className="commonConfigItem Font13 bold mTop24">{_l('默认视图')}</div>
      <div className="commonConfigItem mTop6">
        <AnimationWrap>
          {resourceTypes.map(item => {
            const calendarType = !_.get(props, 'view.advancedSetting.calendarType')
              ? '0'
              : _.get(props, 'view.advancedSetting.calendarType');
            return (
              <div
                className={cx('animaItem overflow_ellipsis', {
                  active: calendarType === item.value,
                })}
                onClick={() => {
                  const { value } = item;
                  if (calendarType !== value) {
                    safeLocalStorageSetItem(
                      `${view.viewId}_resource_type`,
                      resourceTypes.find(o => o.value === value).key,
                    );
                    updateCurrentView({
                      ...view,
                      appId,
                      advancedSetting: { calendarType: value },
                      editAdKeys: ['calendarType'],
                      editAttrs: ['advancedSetting'],
                    });
                  }
                }}
              >
                {item.text}
              </div>
            );
          })}
        </AnimationWrap>
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
          <AnimationWrap className="hiddenDaysBox mTop16">
            {weekObj.map((it, i) => {
              let n = i + 1;
              return (
                <div
                  className={cx('animaItem overflow_ellipsis', {
                    active: (_.get(props, 'view.advancedSetting.unweekday') || '').indexOf(n) < 0,
                  })}
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
                </div>
              );
            })}
          </AnimationWrap>
        )}
      </ShowChoose>
      <Checkbox
        checked={!!_.get(props, 'view.advancedSetting.showtime')}
        className="mTop16"
        onClick={e => {
          if (!_.get(props, 'view.advancedSetting.showtime')) {
            return setState({ show: true });
          }
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
        <div className="showtimeCon mTop10" onClick={() => setState({ show: true })}>
          <div className="flex LineHeight22">
            {(_.get(props, 'view.advancedSetting.showtime') || '').split('|').map(o => {
              return <div className="Gray ">{o}</div>;
            })}
          </div>
          <div class="edit LineHeight22">
            <i class="icon-edit Gray_9e ThemeHoverColor3 Font16 Hand"></i>
          </div>
        </div>
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
