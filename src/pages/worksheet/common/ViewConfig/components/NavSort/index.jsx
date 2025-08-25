import React, { useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Dropdown, Icon } from 'ming-ui';
import { getAdvanceSetting } from 'src/pages/widgetConfig/util/index.js';
import { isSameType } from 'src/pages/worksheet/common/ViewConfig/util.js';
import SortCustom from './customSet';
import SortInput from './SortInput';

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
      border: 1px solid #1677ff;
      color: #1677ff;
      i {
        color: #1677ff;
      }
    }
  }
`;

export default function (props) {
  const {
    view,
    onChange,
    projectId,
    navsortsKey = 'navsorts',
    customitemsKey = 'customitems',
    viewControlData = {},
    hideSort,
  } = props;
  const [showCustom, setShow] = useState(false);
  const canCustom = true;
  const canSort = !isSameType([26, 27, 48], viewControlData);
  return (
    <React.Fragment>
      <div className="title mTop30 Gray Bold">{_l('排序')}</div>
      <Wrap className="flexRow alignItemsCenter mTop10">
        {/* 人员不支持字段排序 */}
        {canSort &&
          !hideSort &&
          (isSameType([29], viewControlData) ? (
            <SortInput
              className="flex mTop0 sortInput mRight10"
              {...props}
              advancedSettingKey={navsortsKey}
              viewControlData={viewControlData}
              relationControls={viewControlData.relationControls}
              onChange={data => {
                onChange({
                  [navsortsKey]: !data ? '[]' : _.get(data, `advancedSetting.${navsortsKey}`),
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
              value={
                !_.get(view, `advancedSetting.${navsortsKey}`) ? '0' : _.get(view, `advancedSetting.${navsortsKey}`)
              }
              data={[
                {
                  text: _l('升序'),
                  value: '0',
                },
                {
                  text: _l('降序'),
                  value: '1',
                },
              ]}
              onChange={value => {
                onChange({
                  [navsortsKey]: !value ? '' : value,
                });
              }}
            />
          ))}
        {canCustom && (
          <span
            className={cx('custom ThemeHoverColor3 TxtCenter Hand', {
              has: getAdvanceSetting(view, customitemsKey).length > 0,
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
            advancedSettingKey={customitemsKey}
            description={_l('最多可对50项排序，设置排序的项显示在最前')}
            onChange={infos => {
              const type = viewControlData.type === 30 ? viewControlData.sourceControlType : viewControlData.type;
              let values = [];
              switch (type) {
                case 29:
                case 26:
                case 27:
                case 48:
                  const key =
                    29 === type ? 'rowid' : 26 === type ? 'accountId' : 27 === type ? 'departmentId' : 'organizeId';
                  values = infos.map(o => o[key]);
                  break;
                default:
                  values = infos;
                  break;
              }
              values = values.slice(0, 50);
              onChange({
                [customitemsKey]: JSON.stringify(values),
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
