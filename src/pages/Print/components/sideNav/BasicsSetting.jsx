import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Checkbox, Icon, Slider } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { DefaultNameWidth, FONT_OPTION, fromType, typeForCon } from '../../config';

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
    type: 'allowDownloadPermission',
    label: _l('允许成员下载打印文件'),
    tip: null,
    negate: true,
    isNumber: true,
  },
];

export default function BasicsSetting(props) {
  const { hide, printFont, nameWidth, params, printData, handChange, changeAdvanceSettings } = props;

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
          itemcolor="#1677ff"
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

      return (
        <div className="mTop15" key={`BasicsSetting-${item.type}`}>
          <Checkbox
            checked={item.negate ? !printData[item.type] : printData[item.type]}
            className="InlineBlock"
            onClick={() =>
              handChange({
                [item.type]: item.isNumber ? Number(!printData[item.type]) : !printData[item.type],
              })
            }
            text={item.label}
          />
          {item.tip && (
            <Tooltip placement="right" title={item.tip}>
              <div className="Gray_9e help InlineBlock TxtTop mLeft5">
                <Icon icon="help" className="Font14" />
              </div>
            </Tooltip>
          )}
        </div>
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
