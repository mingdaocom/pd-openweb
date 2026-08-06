import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Dropdown, Icon } from 'ming-ui';
import { PAPER_DIRECTION_OPTIONS, PAPER_SIZE_OPTIONS } from '../../core/config';
import { getPrintPaperDirectionOption, getPrintPaperSizeOption } from '../../core/layout';

const LayoutSettingWrap = styled.div`
  margin-top: 20px;

  .settingLabel {
    margin-bottom: 10px;
    color: var(--color-text-secondary);
    line-height: 20px;
    font-weight: 500;
  }

  .directionList {
    display: flex;
    gap: 12px;
  }

  .directionCard {
    flex: 1;
    height: 80px;
    border: 1px solid var(--color-border-primary);
    border-radius: 6px;
    background: var(--color-background-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    .Icon {
      font-size: 52px;
      color: #bfbfbf !important;
      transition: all 0.2s ease;
    }

    &.current {
      border-color: var(--color-primary);
      box-shadow: inset 0 0 0 1px var(--color-primary);
      background: rgba(33, 150, 243, 0.04);

      .Icon {
        color: var(--color-primary) !important;
      }
    }
  }
`;

export default function LayoutSetting(props) {
  const { hide, paperSize, paperDirection, changeAdvanceSettings } = props;
  const currentPaperSize = getPrintPaperSizeOption(paperSize).value;
  const currentPaperDirection = getPrintPaperDirectionOption(paperDirection).value;

  if (hide) return null;

  return (
    <LayoutSettingWrap>
      <div>
        <div className="settingLabel">{_l('纸张')}</div>
        <Dropdown
          className="w100"
          isAppendToBody
          border
          value={currentPaperSize}
          data={PAPER_SIZE_OPTIONS}
          onChange={value => changeAdvanceSettings({ key: 'paperSize', value })}
        />
      </div>
      <div className="mTop20">
        <div className="settingLabel">{_l('方向')}</div>
        <div className="directionList">
          {PAPER_DIRECTION_OPTIONS.map(item => (
            <div
              key={`print-paperDirection-${item.value}`}
              className={cx('directionCard', { current: currentPaperDirection === item.value })}
              onClick={() => changeAdvanceSettings({ key: 'paperDirection', value: item.value })}
            >
              <Icon icon={item.icon || 'file'} />
            </div>
          ))}
        </div>
      </div>
    </LayoutSettingWrap>
  );
}
