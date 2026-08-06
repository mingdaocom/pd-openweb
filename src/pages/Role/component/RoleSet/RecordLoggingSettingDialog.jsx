import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Checkbox, Dialog, Radio } from 'ming-ui';

export const LOGGING_RANGE = {
  ALL: 1,
  USER: 2,
  SELF: 3,
};

export function normalizeRecordLoggingSetting(data) {
  const rawRange = _.get(data, 'Range', _.get(data, 'range'));
  const normalizedRange = Number(rawRange);
  const rawAllowExport = _.get(data, 'AllowExport', _.get(data, 'allowExport'));
  const normalizedAllowExport = _.isBoolean(rawAllowExport)
    ? rawAllowExport
    : String(rawAllowExport).toLowerCase() === 'true' || String(rawAllowExport) === '1';

  return {
    enable: !!_.get(data, 'enable'),
    Range: [LOGGING_RANGE.ALL, LOGGING_RANGE.USER, LOGGING_RANGE.SELF].includes(normalizedRange)
      ? normalizedRange
      : LOGGING_RANGE.ALL,
    AllowExport: _.isUndefined(rawAllowExport) ? false : normalizedAllowExport,
  };
}

const RANGE_OPTIONS = [
  { text: _l('全部'), value: LOGGING_RANGE.ALL },
  { text: _l('仅用户类型'), value: LOGGING_RANGE.USER },
  { text: _l('仅本人操作'), value: LOGGING_RANGE.SELF },
];
const RADIO_BOX_CENTER = 9;
const DEFAULT_LOGGING_VALUE = {};

export function getRecordLoggingRangeText(data) {
  const logging = normalizeRecordLoggingSetting(data);
  return _.get(
    RANGE_OPTIONS.find(item => item.value === logging.Range),
    'text',
    RANGE_OPTIONS[0].text,
  );
}

const Wrap = styled.div`
  .rangeOptions {
    display: flex;
    align-items: center;
  }
  .rangeOptionItem {
    flex: 1;
    min-width: 0;
    .ming.Radio {
      display: inline-flex;
      align-items: center;
      margin-right: 0;
    }
    .ming.Radio .Radio-box {
      margin-right: 6px;
    }
  }
  .hintBoxWrap {
    position: relative;
    margin-top: 12px;
  }
  .hintArrow {
    position: absolute;
    top: -6px;
    left: ${props => props.arrowLeft};
    width: 10px;
    height: 10px;
    background: var(--color-background-secondary);
    border-left: 1px solid var(--color-border-secondary);
    border-top: 1px solid var(--color-border-secondary);
    transform: translateX(-50%) rotate(45deg);
  }
  .hintBox {
    padding: 12px 13px;
    border: 1px solid var(--color-border-secondary);
    border-radius: 4px;
    background: var(--color-background-secondary);
    line-height: 24px;
    word-break: break-all;
  }
`;

function RecordLoggingSettingDialog({ visible = false, value = DEFAULT_LOGGING_VALUE, onChange, onClose }) {
  if (!visible) {
    return null;
  }

  const logging = normalizeRecordLoggingSetting(value);

  const handleRangeChange = nextRange => {
    onChange({
      ...logging,
      Range: nextRange,
      range: nextRange,
    });
  };

  const handleAllowExportClick = () => {
    onChange({
      ...logging,
      AllowExport: !logging.AllowExport,
      allowExport: !logging.AllowExport,
    });
  };

  const rangeHint =
    logging.Range === LOGGING_RANGE.USER
      ? _l('仅可查看“用户”类型的日志（含全部用户）')
      : logging.Range === LOGGING_RANGE.SELF
        ? _l('仅可查看当前用户产生的日志')
        : _l('可查看所有日志');
  const activeIndex = Math.max(
    0,
    RANGE_OPTIONS.findIndex(item => item.value === logging.Range),
  );
  const optionWidthPercent = 100 / RANGE_OPTIONS.length;
  const arrowLeft = `calc(${activeIndex * optionWidthPercent}% + ${RADIO_BOX_CENTER}px)`;

  return (
    <Dialog
      visible
      width={640}
      title={_l('可查看哪些记录日志？')}
      onCancel={onClose}
      onOk={onClose}
      okText={_l('保存')}
      cancelText={_l('取消')}
    >
      <Wrap arrowLeft={arrowLeft} className="mTop5">
        <div className="rangeOptions">
          {RANGE_OPTIONS.map(item => {
            return (
              <div key={item.value} className="rangeOptionItem">
                <Radio
                  text={item.text}
                  checked={logging.Range === item.value}
                  onClick={() => handleRangeChange(item.value)}
                />
              </div>
            );
          })}
        </div>
        <div className="hintBoxWrap">
          <span className="hintArrow" />
          <div className="hintBox">{rangeHint}</div>
        </div>
        <div className="mTop24 Bold">{_l('其他')}</div>
        <div className="mTop12">
          <Checkbox checked={logging.AllowExport} onClick={handleAllowExportClick} text={_l('允许导出日志')} />
        </div>
      </Wrap>
    </Dialog>
  );
}

RecordLoggingSettingDialog.propTypes = {
  visible: PropTypes.bool,
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default RecordLoggingSettingDialog;
