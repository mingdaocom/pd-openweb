import React, { Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { RadioGroup } from 'ming-ui';
import SortColumns from 'src/pages/worksheet/components/SortColumns/SortColumns';
import { SettingItem } from '../../../../styled';
import { getFilterRelateControls } from '../../../../util';
import { getAdvanceSetting, getControlsSorts, handleAdvancedSettingChange } from '../../../../util/setting';
import DropdownCover from './DropdownCover';

const DropdownShowControlsWrap = styled.div`
  .ming.Radio {
    margin-right: 0;
    margin-top: 10px;
    &:last-child {
      margin-top: 16px;
    }
    display: flex;
    .Radio-text {
      margin-top: -6px;
    }
  }
  .relateCoverSetting {
    cursor: pointer;
    &.active,
    &:hover {
      color: var(--color-primary);
    }
  }
`;

const DISPLAY_OPTIONS = [
  {
    text: (
      <Fragment>
        <span className="textPrimary Font14">{_l('在下拉列表中显示附加字段和封面')}</span>
        <span className="textSecondary InlineBlock w100">{_l('用户可在下拉列表中查看更多记录信息')}</span>
      </Fragment>
    ),
    value: '0',
  },
  {
    text: (
      <Fragment>
        <span className="textPrimary Font14 InlineBlock">{_l('允许弹层选择')}</span>
        <span className="textSecondary InlineBlock w100">
          {_l('在下拉框中显示弹层选择按钮，用户点击后可打开表格弹层选择记录。弹层可设置更多显示字段和筛选器')}
        </span>
      </Fragment>
    ),
    value: '1',
  },
];

export default function DropdownShowControls(props) {
  const { data, controls = [], handleChange } = props;
  const { showControls = [], enumDefault, coverCid } = data;
  const { openfastfilters, ddset } = getAdvanceSetting(data);
  const chooseshowIds = getAdvanceSetting(data, 'chooseshowids') || [];
  const chooseshow = openfastfilters === '1' ? '1' : ddset === '1' ? '0' : '3';
  const filterControls = getFilterRelateControls({ controls, showControls });

  return (
    <DropdownShowControlsWrap>
      <SettingItem>
        <div className="settingItemTitle">{_l('辅助选择方式')}</div>
        <RadioGroup
          size="middle"
          disableTitle={true}
          vertical={true}
          checkedValue={chooseshow}
          data={DISPLAY_OPTIONS}
          onChange={value => {
            let nextData = handleAdvancedSettingChange(data, {
              ...(value === '0' ? { openfastfilters: '0', ddset: '1' } : { openfastfilters: '1', ddset: '0' }),
            });
            if (enumDefault === 2) {
              nextData = handleAdvancedSettingChange(nextData, {
                ...(value === '0' ? { chooseshow: '0', chooseshowids: '' } : { chooseshow: '1' }),
              });
              if (value === '1') {
                nextData.showControls = [];
              }
            }
            handleChange(nextData);
          }}
        />
      </SettingItem>
      {/**单条下拉: 下拉列表显示与弹层共用一套，用showControls;多条下拉按chooseshow配置来，showControls或chooseshowids */}
      <SettingItem>
        <div className="settingItemTitle flexCenter" style={{ justifyContent: 'space-between' }}>
          {_l('显示字段')}
          {_.includes(['0', '1'], chooseshow) && (
            <Trigger
              popup={() => <DropdownCover data={data} filterControls={filterControls} handleChange={handleChange} />}
              action={['click']}
              popupAlign={{
                points: ['tr', 'br'],
                offset: [0, 2],
                overflow: { adjustX: true, adjustY: true },
              }}
              getPopupContainer={() => document.body}
            >
              <div className={cx('relateCoverSetting', { active: !!coverCid })}>
                <span className="icon-picture mRight6"></span>
                <span>
                  {coverCid
                    ? _l('封面：%0', filterControls.find(c => c.controlId === coverCid)?.controlName)
                    : _l('设置封面')}
                </span>
              </div>
            </Trigger>
          )}
        </div>
        {enumDefault === 1 || (enumDefault === 2 && chooseshow !== '1') ? (
          <SortColumns
            layout={2}
            sortAutoChange
            isShowColumns
            noShowCount={true}
            maxSelectedNum={50}
            noempty={false} //不需要至少显示一列
            showControls={showControls}
            columns={filterControls}
            controlsSorts={getControlsSorts(data, filterControls)}
            onChange={({ newShowControls, newControlSorts }) => {
              handleChange({
                ...handleAdvancedSettingChange(data, {
                  controlssorts: JSON.stringify(newControlSorts),
                }),
                showControls: newShowControls,
              });
            }}
            showTabs={true}
          />
        ) : (
          <SortColumns
            layout={2}
            sortAutoChange
            isShowColumns
            noShowCount={true}
            maxSelectedNum={50}
            noempty={false} //不需要至少显示一列
            showControls={chooseshowIds}
            columns={filterControls}
            controlsSorts={getControlsSorts(data, filterControls, 'choosecontrolssorts')}
            onChange={({ newShowControls, newControlSorts }) => {
              handleChange(
                handleAdvancedSettingChange(data, {
                  chooseshowids: JSON.stringify(newShowControls),
                  choosecontrolssorts: JSON.stringify(newControlSorts),
                }),
              );
            }}
            showTabs={true}
          />
        )}
      </SettingItem>
    </DropdownShowControlsWrap>
  );
}
