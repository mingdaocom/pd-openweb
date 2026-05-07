import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, Icon, Input, Slider } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { DefaultNameWidth, FONT_OPTION, fromType, typeForCon } from '../../core/config';

const BasicItemWrapper = styled.div`
  margin-top: 15px;
  .checkboxWrapper {
    display: flex;
    align-items: center;
    .icon-help {
      margin-top: 2px;
      margin-left: 5px;
      color: var(--color-text-tertiary);
    }
  }
  .emptyPlaceholderModeWrapper {
    padding-left: 26px;
    input {
      width: 100% !important;
    }
  }
`;

const BasicsSettingConfig = [
  {
    type: 'printOption',
    label: _l('选项字段平铺打印'),
    tip: _l('开启后，平铺类型的选项字段会打印没有选中的选项'),
  },
  {
    type: 'showData',
    label: _l('打印值为空的字段'),
    tip: _l('开启后，没有内容的字段会显示并可以打印'),
  },
  {
    type: 'enableEmptyPlaceholder',
    label: _l('空值填充占位符'),
    tip: _l('开启后，字段为空时将打印占位符内容，用于保持打印板式完整，避免空白显示'),
  },
  {
    type: 'allowDownloadPermission',
    label: _l('允许成员下载打印文件'),
    tip: null,
    negate: true,
    isNumber: true,
  },
];

export default function BasicsSetting(props) {
  const { hide, printFont, nameWidth, params, printData, handChange, changeAdvanceSettings } = props;
  const debouncedChange = useRef(
    _.debounce(value => {
      changeAdvanceSettings({ key: 'emptyPlaceholderMode', value });
    }, 300),
  );

  const [localEmptyPlaceholderMode, setLocalEmptyPlaceholderMode] = useState(printData.emptyPlaceholderMode);

  useEffect(() => {
    return () => {
      debouncedChange.current.cancel();
    };
  }, []);

  const handleCheckboxChange = item => {
    const { type } = item;

    if (type === 'enableEmptyPlaceholder') {
      changeAdvanceSettings({ key: type, value: Number(!printData[type]) });
      return;
    }

    handChange({
      [type]: item.isNumber ? Number(!printData[type]) : !printData[type],
    });
  };

  const renderDrop = () => {
    return (
      <div className="TxtTop valignWrapper">
        <span className="TxtMiddle">{_l('文字大小')}</span>
        <div className="mLeft12 forSizeBox">
          {FONT_OPTION.map(l => (
            <span
              key={`printSideNav-fontSizeOption-${l.fontSize}`}
              onClick={() => handChange({ font: l.fontSize })}
              className={cx({ current: printFont === l.fontSize })}
            >
              {l.label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderNameWidth = () => {
    return (
      <div className="valignWrapper mTop15">
        <span>{_l('名称宽度')}</span>
        <Slider
          className="flex mLeft12 nameSlider"
          itemcolor="var(--color-primary)"
          showInput={false}
          min={50}
          max={150}
          value={nameWidth || DefaultNameWidth}
          step={1}
          onChange={value => changeAdvanceSettings({ key: 'nameWidth', value })}
        />
      </div>
    );
  };

  const renderBtnSetting = () => {
    const type = _.get(params, 'type');
    const from = _.get(params, 'from');

    return BasicsSettingConfig.map(item => {
      if (item.type === 'allowDownloadPermission' && (from !== fromType.FORM_SET || type !== typeForCon.EDIT))
        return null;

      if (item.type === 'enableEmptyPlaceholder' && !printData.showData) return null;

      return (
        <BasicItemWrapper key={`BasicsSetting-${item.type}`}>
          <div className="checkboxWrapper">
            <Checkbox
              checked={item.negate ? !printData[item.type] : printData[item.type]}
              onClick={() => handleCheckboxChange(item)}
              text={item.label}
            />
            {item.tip && (
              <Tooltip placement="right" title={item.tip}>
                <Icon icon="help" className="Font14" />
              </Tooltip>
            )}
          </div>
          {item.type === 'enableEmptyPlaceholder' &&
            printData.showData &&
            !!Number(printData.enableEmptyPlaceholder) && (
              <div className="emptyPlaceholderModeWrapper">
                <Input
                  placeholder={_l('请输入占位符')}
                  value={localEmptyPlaceholderMode}
                  onChange={value => {
                    setLocalEmptyPlaceholderMode(value);
                    debouncedChange.current(value);
                  }}
                />
              </div>
            )}
        </BasicItemWrapper>
      );
    });
  };

  if (hide) return null;

  return (
    <div className="mTop20">
      {renderDrop()}
      {renderNameWidth()}
      {renderBtnSetting()}
    </div>
  );
}
