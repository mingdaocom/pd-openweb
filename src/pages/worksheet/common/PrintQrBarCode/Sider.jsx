import React, { Fragment, useState, useEffect } from 'react';
import { Radio } from 'antd';
import { Tooltip, Checkbox, RadioGroup, Dropdown, Input, Slider } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import ControlSelect from 'worksheet/components/ControlSelect';
import { FILTER } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import {
  SOURCE_TYPE,
  PRINT_TYPE,
  SOURCE_TYPE_LIST,
  SOURCE_URL_TYPE_LIST,
  PRINT_TYPE_LIST,
  A4_LAYOUT_LIST,
  QR_LABEL_SIZE_LIST,
  QR_LAYOUT_LIST,
  PORTRAIT_CODE_SIZE_LIST,
  LANDSCAPE_QR_CODE_SIZE_LIST,
  QR_POSITION_LIST,
  QR_LAYOUT,
  QR_POSITION,
  QR_LABEL_SIZE,
  CODE_FAULT_TOLERANCE_LIST,
  BAR_LABEL_SIZE,
  BAR_LAYOUT_LIST,
  BAR_LAYOUT,
  BAR_POSITION,
  BAR_HEIGHT_LIST,
  BAR_POSITION_LIST,
  PORTRAIT_QR_CODE_SIZE,
  LANDSCAPE_QR_CODE_SIZE,
} from './enum';
import SelectControlWithInput from './SelectControlWithInput';
import { getDefaultText } from './util';
import _ from 'lodash';
import { arrayOf, func, number, shape } from 'prop-types';

const LABEL_MIN_WIDTH = 20;
const LABEL_MIN_HEIGHT = 20;
const LABEL_MAX_WIDTH = 200;
const LABEL_MAX_HEIGHT = 200;

const Con = styled.div`
  font-size: 13px;
  height: 100%;
  width: 320px;
  background: #fff;
  padding: 10px 20px 30px;
  overflow: auto;
  .RadioGroupCon {
    .ming.Radio {
      width: 50%;
      display: inline-block;
      margin: 0;
    }
  }
  .switchWH {
    color: #9d9d9d;
    margin: 0 8px;
    line-height: 36px;
  }
  .customSizeUnit {
    font-size: 13px;
    margin-left: 8px;
    line-height: 36px;
  }
`;

const Tip = styled.div`
  margin-top: 10px;
  color: #757575;
`;

const TypeLabel = styled.div`
  margin-top: 26px;
  color: #333;
  font-weight: 600;
`;
const Spacer = styled.div(
  ({ top }) => `
  margin-top: ${top}px;
`,
);

const ConfigItem = styled.div(
  ({ label }) => `
  &&:before {
    content: '${label}';
    width: 80px;
  }
  margin-top: 14px;
  display: flex;
  align-items: center;
  > div {
    max-width: calc(100% - 80px) !important;
  }
  .ant-radio-group {
    width: 100%;
    display: flex;
  }
  .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
    border-color: #2196f3 !important;
    color: #2196f3 !important;
  }
  .ant-radio-button-wrapper {
    font-size: 13px;
    box-shadow: none !important;
    flex: 1;
    text-align: center;
    height: 36px;
    line-height: 34px;
  }
`,
);

const InputGroup = styled.div`
  display: flex;
  > input {
    flex: 1;
    overflow: hidden;
    width: auto;
  }
`;

const SetAsTitle = styled.i`
  position: absolute;
  right: 24px;
  top: 15px;
  font-size: 18px;
  color: #9e9e9e;
  cursor: pointer;
  &.on {
    color: #2196f3;
  }
`;

function setHr(list, indexList = []) {
  if (!_.isArray(indexList)) {
    indexList = [indexList];
  }
  indexList.forEach(i => {
    if (i < 0) {
      i = list.length - 1 + i;
    }
    if (list[i] && !_.isArray(list[i])) {
      list[i] = [list[i]];
    }
  });
  return list;
}

function numberFilter(value) {
  const reg = /[^-?\d*(\.\d*)?]/g;
  return String(value).replace(reg, '');
}

function OptionsSlider(props) {
  const { options = [], value, onChange } = props;
  if (!options.length) {
    return null;
  }
  const selectedIndex = _.findIndex(options, { value }) || 0;
  return (
    <Fragment>
      <Slider
        triggerWhenMove
        className="flex"
        showTip={false}
        showNumber={false}
        showInput={false}
        min={0}
        max={options.length - 1}
        step={1}
        value={options.length - 1 - selectedIndex}
        onChange={index => {
          if (options[options.length - 1 - index]) {
            onChange(options[options.length - 1 - index].value);
          }
        }}
      />
      {options[selectedIndex] && <span className="mLeft10 Gray_75">{options[selectedIndex].text}</span>}
    </Fragment>
  );
}

OptionsSlider.propTypes = {
  options: arrayOf(shape({})),
  value: number,
  onChange: func,
};

function LabeSizeConfig(props) {
  const { type, width, height, onChange = () => {} } = props;
  const [size, setSize] = useState({
    width,
    height,
  });
  useEffect(() => {
    setSize({ width, height });
  }, [width, height]);
  function handleWidthChange(e) {
    let newValue = Number(numberFilter(e.target.value) || 0);
    if (newValue < LABEL_MIN_WIDTH) {
      alert(_l('宽度不能小于%0', LABEL_MIN_WIDTH), 3);
      setSize({ ...size, width });
      return;
    }
    if (newValue > LABEL_MAX_WIDTH) {
      alert(_l('宽度不能大于%0', LABEL_MAX_WIDTH), 3);
      setSize({ ...size, width });
      return;
    }
    onChange({
      type,
      width: newValue,
    });
  }
  function handleHeightChange(e) {
    let newValue = Number(numberFilter(e.target.value) || 0);
    if (newValue < LABEL_MIN_WIDTH) {
      alert(_l('高度不能小于%0', LABEL_MIN_HEIGHT), 3);
      setSize({ ...size, height });
      return;
    }
    if (newValue > LABEL_MAX_HEIGHT) {
      alert(_l('高度不能大于%0', LABEL_MAX_HEIGHT), 3);
      setSize({ ...size, height });
      return;
    }
    onChange({
      type,
      height: newValue,
    });
  }
  return (
    <Fragment>
      <ConfigItem label={_l('尺寸')}>
        <Dropdown
          menuClass="w100"
          className="w100"
          maxHeight={320}
          border
          value={type}
          data={setHr(QR_LABEL_SIZE_LIST, -1)}
          onChange={value => {
            const changes = { type: value };
            if (value === QR_LABEL_SIZE.CUSTOM) {
              changes.labelCustomWidth = 30;
              changes.labelCustomHeight = 70;
            }
            onChange(changes);
          }}
        />
      </ConfigItem>
      {type === 100 && (
        <ConfigItem label={_l('宽/高')}>
          <div>
            <InputGroup>
              <Input
                value={size.width}
                onChange={value => {
                  setSize({ ...size, width: numberFilter(value) });
                }}
                onBlur={handleWidthChange}
                onKeyUp={e => {
                  if (e.keyCode === 13) {
                    handleWidthChange(e);
                  }
                }}
              />
              <span data-tip={_l('交换')}>
                <i
                  className="switchWH icon-sync1 ThemeHoverColor3 Hand"
                  onClick={() => {
                    const newSize = { height: size.width, width: size.height };
                    setSize(newSize);
                    onChange({
                      type,
                      ...newSize,
                    });
                  }}
                />
              </span>
              <Input
                value={size.height}
                onChange={value => {
                  setSize({ ...size, height: numberFilter(value) });
                }}
                onBlur={handleHeightChange}
                onKeyUp={e => {
                  if (e.keyCode === 13) {
                    handleHeightChange(e);
                  }
                }}
              />
              <span className="customSizeUnit">mm</span>
            </InputGroup>
          </div>
        </ConfigItem>
      )}
    </Fragment>
  );
}

export default function Sider(props) {
  const { config = {}, maxLineNumber, controls, onUpdate = () => {} } = props;
  const {
    sourceType = 0,
    sourceUrlType = 0,
    printType = 0,
    codeFaultTolerance = 7,
    showTexts = [],
    labelCustomWidth,
    labelCustomHeight,
    showControlName = true,
    firstIsBold = true,
    labelSize = 0,
    layout = 0,
    codeSize = 0,
    fontSize = 1,
    position = 0,
    sourceControlId,
  } = config;
  return (
    <Con>
      <Tip>
        {printType === PRINT_TYPE.BAR
          ? _l('编码方式：code128，仅支持数字、字母、符号，最大包含30个字符')
          : _l('编码方式：QR-code，可支持汉字，最大包含150个字')}
      </Tip>
      <TypeLabel className="mTop20">{printType === PRINT_TYPE.BAR ? _l('条形码数据源') : _l('数据源')}</TypeLabel>
      <Spacer top="15" />
      {printType !== PRINT_TYPE.BAR && (
        <RadioGroup
          checkedValue={sourceType}
          data={SOURCE_TYPE_LIST}
          onChange={value => {
            if (sourceType === value) {
              return;
            }
            let newSourceControlId;
            if (value === SOURCE_TYPE.CONTROL) {
              newSourceControlId = controls.filter(FILTER[2])[0].controlId;
            }
            const defaultShowText = getDefaultText({
              printType,
              sourceType: value,
              sourceControlId: newSourceControlId,
              controls,
            });
            const newShowTexts = [...showTexts];
            if (defaultShowText) {
              newShowTexts[0] = defaultShowText;
            }
            onUpdate({
              sourceType: value,
              ...(value === SOURCE_TYPE.CONTROL ? { sourceControlId: newSourceControlId } : {}),
              showTexts: newShowTexts,
            });
          }}
        />
      )}
      <Spacer top="16" />
      {sourceType === SOURCE_TYPE.URL ? (
        <Dropdown
          menuClass="w100"
          className="w100"
          border
          value={sourceUrlType}
          data={
            !md.global.Account.isPortal ? SOURCE_URL_TYPE_LIST : SOURCE_URL_TYPE_LIST.filter(item => item.value !== 1)
          }
          onChange={value => onUpdate({ sourceUrlType: value })}
        />
      ) : (
        <ControlSelect
          selected={sourceControlId}
          controls={controls.filter(FILTER[2])}
          isAppendToBody
          offset={[0, 2]}
          popupStyle={{ width: 272 }}
          onChange={control => {
            const changes = {
              sourceControlId: control.controlId,
            };
            const defaultShowText = getDefaultText({
              printType,
              sourceType,
              sourceControlId: control.controlId,
              controls,
            });
            const newShowTexts = [...showTexts];
            if (defaultShowText) {
              newShowTexts[0] = defaultShowText;
            }
            changes.showTexts = newShowTexts;
            onUpdate(changes);
          }}
        />
      )}
      <Spacer top="12" />
      {printType !== PRINT_TYPE.BAR && (
        <Fragment>
          <TypeLabel>{_l('打印方式')}</TypeLabel>
          <Spacer top="12" />
          <RadioGroup
            checkedValue={printType}
            data={PRINT_TYPE_LIST.filter(t => t.value !== PRINT_TYPE.BAR)}
            onChange={value => {
              if (printType === value) {
                return;
              }
              onUpdate({ printType: value });
            }}
          />
        </Fragment>
      )}
      {/* A4 配置 */}
      {printType === PRINT_TYPE.A4 && (
        <ConfigItem label={_l('布局')}>
          <Dropdown
            menuClass="w100"
            className="w100"
            border
            value={layout}
            data={A4_LAYOUT_LIST}
            onChange={value => onUpdate({ layout: value })}
          />
        </ConfigItem>
      )}
      {/* 二维码 配置 */}
      {printType === PRINT_TYPE.QR && (
        <Fragment>
          <LabeSizeConfig
            type={labelSize}
            width={labelCustomWidth}
            height={labelCustomHeight}
            onChange={configValue => {
              const changes = { labelSize: configValue.type };
              changes.labelCustomWidth = configValue.width || labelCustomWidth || 30;
              changes.labelCustomHeight = configValue.height || labelCustomHeight || 50;
              if (changes.labelSize === QR_LABEL_SIZE.CUSTOM) {
                changes.layout =
                  changes.labelCustomHeight > changes.labelCustomWidth ? QR_LAYOUT.PORTRAIT : QR_LAYOUT.LANDSCAPE;
                if (
                  changes.layout === QR_LAYOUT.PORTRAIT &&
                  _.includes([QR_POSITION.LEFT, QR_POSITION.RIGHT], position)
                ) {
                  changes.position = QR_POSITION.TOP;
                }
                if (
                  changes.layout === QR_LAYOUT.LANDSCAPE &&
                  !_.includes([QR_POSITION.LEFT, QR_POSITION.RIGHT], position)
                ) {
                  changes.position = QR_POSITION.LEFT;
                }
              }
              onUpdate(changes);
            }}
          />
          {labelSize !== QR_LABEL_SIZE.CUSTOM && (
            <ConfigItem label={_l('布局')}>
              <Radio.Group
                options={QR_LAYOUT_LIST}
                onChange={e =>
                  onUpdate({
                    layout: e.target.value,
                    position: e.target.value === QR_LAYOUT.PORTRAIT ? QR_POSITION.TOP : QR_POSITION.LEFT,
                    codeSize:
                      e.target.value === QR_LAYOUT.PORTRAIT ? PORTRAIT_QR_CODE_SIZE.HUGE : LANDSCAPE_QR_CODE_SIZE.SMALL,
                  })
                }
                value={layout}
                optionType="button"
              />
            </ConfigItem>
          )}
          <TypeLabel>{_l('二维码设置')}</TypeLabel>
          <React.Fragment>
            <ConfigItem label={_l('大小')}>
              <OptionsSlider
                options={layout === QR_LAYOUT.PORTRAIT ? PORTRAIT_CODE_SIZE_LIST : LANDSCAPE_QR_CODE_SIZE_LIST}
                value={codeSize}
                onChange={value => {
                  onUpdate({ codeSize: value });
                }}
              />
            </ConfigItem>
            <ConfigItem label={_l('位置')}>
              <Radio.Group
                options={layout === QR_LAYOUT.PORTRAIT ? QR_POSITION_LIST.slice(0, 2) : QR_POSITION_LIST.slice(2)}
                onChange={e => onUpdate({ position: e.target.value })}
                value={position}
                optionType="button"
              />
            </ConfigItem>
          </React.Fragment>
        </Fragment>
      )}
      {printType !== PRINT_TYPE.BAR && (
        <ConfigItem
          label={_l('容错率')}
          tips={
            '容错率是指二维码被遮挡多少后，仍可以扫描出来的能力。容错率越高，二维码越容易被扫描，二维码图片也越复杂。'
          }
        >
          <Dropdown
            menuClass="w100"
            className="w100"
            border
            value={codeFaultTolerance}
            data={CODE_FAULT_TOLERANCE_LIST}
            onChange={value => onUpdate({ codeFaultTolerance: value })}
          />
        </ConfigItem>
      )}
      {/* 条形码 配置 */}
      {printType === PRINT_TYPE.BAR && (
        <Fragment>
          <TypeLabel>{_l('标签打印机')}</TypeLabel>
          <LabeSizeConfig
            type={labelSize}
            width={labelCustomWidth}
            height={labelCustomHeight}
            onChange={configValue => {
              const changes = { labelSize: configValue.type };
              changes.labelCustomWidth = configValue.width || labelCustomWidth || 30;
              changes.labelCustomHeight = configValue.height || labelCustomHeight || 50;
              if (changes.labelSize === BAR_LABEL_SIZE.CUSTOM) {
                changes.layout =
                  changes.labelCustomHeight > changes.labelCustomWidth ? BAR_LAYOUT.PORTRAIT : BAR_LAYOUT.LANDSCAPE;
              }
              onUpdate(changes);
            }}
          />
          {labelSize !== BAR_LABEL_SIZE.CUSTOM && (
            <ConfigItem label={_l('布局')}>
              <Radio.Group
                options={BAR_LAYOUT_LIST}
                onChange={e =>
                  onUpdate({
                    layout: e.target.value,
                    position: BAR_POSITION.TOP,
                  })
                }
                value={layout}
                optionType="button"
              />
            </ConfigItem>
          )}
          <TypeLabel>{_l('条形码设置')}</TypeLabel>
          <ConfigItem label={_l('高度')}>
            {/* <Radio.Group
              options={BAR_HEIGHT_LIST}
              onChange={e =>
                onUpdate({
                  codeSize: e.target.value,
                })
              }
              value={codeSize}
              optionType="button"
            /> */}
            <OptionsSlider
              options={BAR_HEIGHT_LIST}
              value={codeSize}
              onChange={value => {
                onUpdate({ codeSize: value });
              }}
            />
          </ConfigItem>
          <ConfigItem label={_l('位置')}>
            <Radio.Group
              options={BAR_POSITION_LIST}
              onChange={e =>
                onUpdate({
                  position: e.target.value,
                })
              }
              value={position}
              optionType="button"
            />
          </ConfigItem>
        </Fragment>
      )}
      <TypeLabel>{_l('显示字段')}</TypeLabel>
      <ConfigItem label={_l('字号')}>
        <Slider
          triggerWhenMove
          numStyle={{
            color: '#757575',
            marginLeft: 18,
          }}
          showTip={false}
          showInput={false}
          min={0.5}
          max={1}
          step={0.1}
          value={fontSize}
          onChange={newFontSize => {
            onUpdate({ fontSize: Number(newFontSize) });
          }}
        />
      </ConfigItem>
      <Checkbox
        className="mTop15 mBottom15"
        size="small"
        text={_l('显示字段名称')}
        checked={showControlName}
        onClick={() => onUpdate({ showControlName: !showControlName })}
      />
      <Tip>{_l('当前尺寸下最大容纳%0行文字，字段内容超过1行后，默认向下换行直到完整显示。', maxLineNumber)}</Tip>
      <div className="Relative">
        <Tooltip text={<span>{_l('显示为标题')}</span>}>
          <SetAsTitle
            className={cx('icon-title', { on: firstIsBold })}
            onClick={() => onUpdate({ firstIsBold: !firstIsBold })}
          />
        </Tooltip>
      </div>
      {[...new Array(maxLineNumber)].map((o, i) => (
        <SelectControlWithInput
          type={(showTexts[i] || {}).type}
          value={(showTexts[i] || {}).value}
          forceInLine={(showTexts[i] || {}).forceInLine}
          name={(showTexts[i] || {}).name}
          key={i}
          index={i}
          className="mTop10"
          controls={controls}
          onChange={({ type, value, forceInLine = false, name = '' } = {}) => {
            const newShowTexts = [...showTexts];
            newShowTexts[i] = { type, value, forceInLine, name };
            onUpdate({
              showTexts: [...newShowTexts].map(item => item || { forceInLine: false, name: '', type: 2, value: '' }),
            });
          }}
        />
      ))}
    </Con>
  );
}
