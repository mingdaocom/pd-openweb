import React from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Dropdown, Icon, Tooltip } from 'ming-ui';
import { filterAndFormatterControls } from 'src/pages/worksheet/views/util';
import { FlexCenter } from 'worksheet/styled';
import { getIconByType } from 'src/pages/widgetConfig/util';
import Abstract from '../Abstract';
import DisplayControl from '../DisplayControl';
import CoverSetting from '../CoverSettingCon';
import _ from 'lodash';

const MapSettingWrap = styled.div`
  .splitLine {
    border-bottom: 1px solid #eaeaea;
    width: 100%;
    height: 1px;
  }
  .tagColorWrap {
    border-radius: 3px;
    width: fit-content;
    span {
      display: inline-block;
      padding: 0 24px;
      height: 36px;
      line-height: 36px;
      border: 1px solid #e0e0e0;
      &:nth-child(1),
      &:nth-child(2) {
        border-right: none;
      }
      &:nth-child(1) {
        border-radius: 3px 0 0 3px;
      }
      &:last-child {
        border-radius: 0 3px 3px 0;
      }
      &.current {
        background: #2196f3;
        color: #fff !important;
        border-color: #2196f3;
      }
      &:hover {
        color: #2196f3;
      }
    }
  }
  .allColorSelectFields {
    font-weight: 500;
    border-radius: 4px;

    .Dropdown--border {
      // border: 1px solid rgba(33, 150, 243, 0.3);
    }

    .Item-content {
      padding-left: 32px !important;
    }
  }
`;

const DisplayControlOption = styled(FlexCenter)`
  .icon {
    font-size: 16px;
    color: rgba(0, 0, 0, 0.4);
    margin-right: 4px;
  }
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-left: 4px;
  }
`;

const SelectValue = styled(DisplayControlOption)`
  &：hover {
    .icon {
      color: #2196f3;
    }
  }
`;

export default function MapSetting(props) {
  const { view, columns, updateCurrentView, worksheetControls, appId } = props;
  const { viewControl, advancedSetting = {} } = view;

  const tagColorControl = _.find(columns, { controlId: advancedSetting.tagcolorid });

  const getViewSelectFields = () => {
    return filterAndFormatterControls({
      controls: columns,
      filter: l => l.type === 40 || (l.type === 30 && l.sourceControlType === 40),
      formatter: ({ controlName, controlId, type }) => ({
        text: controlName,
        value: controlId,
        icon: getIconByType(type, false),
      }),
    });
  };

  const updateViewTagType = value => {
    updateCurrentView({
      ...view,
      appId,
      advancedSetting: { tagType: value },
      editAttrs: ['advancedSetting'],
      editAdKeys: ['tagType'],
    });
  };

  return (
    <MapSettingWrap className="mapSettingBox">
      <div className="title bold mBottom10">{_l('位置字段')}</div>
      <div className="settingContent">
        <Dropdown
          data={getViewSelectFields()}
          value={viewControl}
          className="dropdownSelectFields"
          hoverTheme
          renderTitle={obj => {
            const { icon, text } = obj || {};
            return (
              <SelectValue>
                <Icon icon={icon} />
                <span>{text}</span>
              </SelectValue>
            );
          }}
          onChange={value => {
            if (viewControl === value) {
              return;
            }
            updateCurrentView({
              ...view,
              appId,
              viewControl: value,
              editAttrs: ['viewControl'],
            });
          }}
          border
          style={{ width: '100%' }}
          placeholder={_l('请选择')}
        />
      </div>
      <div className="splitLine mTop32 mBottom32" />
      <div className="title mBottom24 mTop24 bold">{_l('卡片外观')}</div>
      <Abstract
        {...props}
        advancedSetting={advancedSetting}
        handleChange={value => {
          updateCurrentView({
            ...view,
            appId,
            advancedSetting: { abstract: value },
            editAttrs: ['advancedSetting'],
            editAdKeys: ['abstract'],
          });
        }}
      />
      <DisplayControl
        {...props}
        handleChange={data => {
          updateCurrentView({ ...view, appId, ...data }, false);
        }}
        handleChangeSort={({ newControlSorts, newShowControls }) => {
          updateCurrentView(
            {
              ...view,
              appId,
              controlsSorts: newControlSorts,
              displayControls: newShowControls,
              editAttrs: ['controlsSorts', 'displayControls'],
            },
            false,
          );
        }}
        canShowCount={false}
      />
      <CoverSetting
        {...props}
        advancedSetting={advancedSetting}
        // 是否显示
        handleChangeIsCover={value =>
          updateCurrentView({
            ...view,
            appId,
            coverCid: value === 'notDisplay' ? '' : value,
            editAttrs: ['coverCid'],
          })
        }
        // 显示位置
        handleChangePosition={(value, coverTypeValue) => {
          updateCurrentView({
            ...view,
            appId,
            coverType: coverTypeValue,
            advancedSetting: { coverposition: value },
            editAttrs: ['coverType', 'advancedSetting'],
            editAdKeys: ['coverposition'],
          });
        }}
        // 显示方式
        handleChangeType={value =>
          updateCurrentView({ ...view, appId, coverType: value, editAttrs: ['coverType'] }, false)
        }
        // 允许点击查看
        handleChangeOpencover={value => {
          updateCurrentView({
            ...view,
            appId,
            advancedSetting: { opencover: value },
            editAdKeys: ['opencover'],
            editAttrs: ['advancedSetting'],
          });
        }}
      />
      <div className="splitLine mTop32 mBottom32" />
      <div className="mBottom32">
        <div className="title bold mBottom8">{_l('标签颜色')}</div>
        <div className="tagColorWrap">
          <span
            className={cx('Hand', { current: Number(advancedSetting.tagType || 0) === 0 })}
            onClick={() => updateViewTagType(0)}
          >
            {_l('浅色')}
          </span>
          <span
            className={cx('Hand', { current: Number(advancedSetting.tagType || 0) === 1 })}
            onClick={() => updateViewTagType(1)}
          >
            {_l('深色')}
          </span>
          <span
            className={cx('Hand', { current: Number(advancedSetting.tagType || 0) === 2 })}
            onClick={() => updateViewTagType(2)}
          >
            {_l('动态颜色')}
          </span>
        </div>
        {Number(advancedSetting.tagType || 0) === 2 && (
          <React.Fragment>
            <div className="title Bold mTop24">
              {_l('颜色')}
              {tagColorControl && tagColorControl.enumDefault2 !== 1 && (
                <Tooltip className="mLeft6" text={_l('当前选择的字段未启用颜色')}>
                  <i className="icon icon-error1 Font16" style={{ color: '#ff9300' }}></i>
                </Tooltip>
              )}
            </div>
            <div className="mTop6 mBottom10 Font12 Gray_9e">
              {_l('选择一个单选字段，标签将按照此字段中的选项颜色来显示')}
            </div>
            <Dropdown
              data={filterAndFormatterControls({
                controls: columns,
                filter: l => l.type === 11,
                formatter: ({ controlName, controlId, type }) => ({
                  text: controlName,
                  value: controlId,
                  icon: getIconByType(type, false),
                }),
              })}
              value={advancedSetting.tagcolorid}
              className="allColorSelectFields"
              renderTitle={obj => {
                const { icon, text } = obj || {};
                return (
                  <SelectValue>
                    <Icon icon={icon} />
                    <span>{text}</span>
                  </SelectValue>
                );
              }}
              onChange={value => {
                updateCurrentView({
                  ...view,
                  appId,
                  advancedSetting: { tagcolorid: value },
                  editAttrs: ['advancedSetting'],
                  editAdKeys: ['tagcolorid'],
                });
              }}
              border
              style={{ width: '100%' }}
              placeholder={_l('请选择')}
            />
          </React.Fragment>
        )}
      </div>
    </MapSettingWrap>
  );
}
