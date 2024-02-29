import React, { Fragment, useState } from 'react';
import styled from 'styled-components';
import { Dropdown, Tooltip, Icon } from 'ming-ui';
import SortInput from './SortInput';
import SortCustom from './customSet';
import { getAdvanceSetting } from 'src/pages/widgetConfig/util/index.js';
import cx from 'classnames';

const Wrap = styled.div`
  .sortInput {
    flex-shrink: 0;
    min-width: 0;
  }
  .custom {
    width: 92px;
    height: 36px;
    line-height: 36px;
    background: #ffffff;
    border-radius: 3px 3px 3px 3px;
    border: 1px solid #dddddd;
    i {
      color: #9e9e9e;
    }
    &:hover,
    &.has {
      border: 1px solid #2196f3;
      color: #2196f3;
      i {
        color: #2196f3;
      }
    }
  }
`;

export default function (props) {
  const { updateCurrentView, view, appId, controls, onChange, projectId } = props;
  const viewControlData = controls.find(o => o.controlId === _.get(view, 'viewControl')) || {};
  const [showCustom, setShow] = useState(false);
  const canCustom = viewControlData.type !== 28;
  const canSort = viewControlData.type !== 26;
  return (
    <React.Fragment>
      <div className="title mTop30 Gray Bold">{_l('排序')}</div>
      <Wrap className="flexRow alignItemsCenter mTop10">
        {/* 人员不支持字段排序 */}
        {canSort &&
          (viewControlData.type === 29 ? (
            <SortInput
              className="flex mTop0 sortInput mRight10"
              {...props}
              advancedSettingKey="navsorts"
              viewControlData={viewControlData}
              relationControls={viewControlData.relationControls}
              onChange={data => {
                onChange({
                  navsorts: !data ? '[]' : _.get(data, `advancedSetting.navsorts`),
                });
              }}
              canClear
            />
          ) : (
            <Dropdown
              border
              cancelAble
              isAppendToBody
              className={cx('flex mTop0', { mRight10: canCustom })}
              value={!_.get(view, `advancedSetting.navsorts`) ? '0' : _.get(view, `advancedSetting.navsorts`)}
              data={[
                {
                  text: _l('正序'),
                  value: '0',
                },
                {
                  text: _l('倒序'),
                  value: '1',
                },
              ]}
              onChange={value => {
                onChange({
                  navsorts: !value ? '' : value,
                });
              }}
            />
          ))}
        {canCustom && (
          <span
            className={cx('custom ThemeHoverColor3 TxtCenter Hand', {
              has: getAdvanceSetting(view, 'customitems').length > 0,
            })}
            onClick={() => {
              setShow(true);
            }}
          >
            <Icon type="folder-sort" className="" />
            {_l('自定义')}
          </span>
        )}
        {showCustom && (
          <SortCustom
            {...props}
            view={props.view}
            projectId={projectId}
            maxCount={50}
            controlInfo={viewControlData}
            title={_l('自定义排序')}
            advancedSettingKey="customitems"
            description={_l('最多可对50项排序，设置排序的项显示在最前')}
            onChange={infos => {
              let values = [];
              switch (viewControlData.type) {
                case 29:
                  values = infos.map(o => o.rowid);
                  break;
                case 26:
                  values = infos.map(o => o.accountId);
                  break;
                default:
                  values = infos;
                  break;
              }
              values = values.slice(0, 50);
              onChange({
                customitems: JSON.stringify(values),
              });
              setShow(false);
            }}
            onClose={() => {
              setShow(false);
            }}
            addTxt={_l('排序项')}
          />
        )}
      </Wrap>
    </React.Fragment>
  );
}
