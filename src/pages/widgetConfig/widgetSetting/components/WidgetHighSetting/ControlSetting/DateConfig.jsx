import React, { Fragment, useState } from 'react';
import { useSetState } from 'react-use';
import { Dropdown, Input, Tooltip } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Checkbox, Dialog, Dropdown as MingDropdown, Support } from 'ming-ui';
import { isCustomWidget } from 'src/pages/widgetConfig/util';
import { DATE_SHOW_TYPES } from '../../../../config/setting';
import { DropdownContent, DropdownPlaceholder, EditInfo, SettingItem } from '../../../../styled';
import { getAdvanceSetting, getDateToEn, handleAdvancedSettingChange } from '../../../../util/setting';
import DateInput from '../../DynamicDefaultValue/inputTypes/DateInput.jsx';

const INTERVAL = [1, 5, 10, 15, 30, 60];

const IntervalWrap = styled(DropdownContent)`
  .item {
    line-height: 36px;
    padding: 0 16px;
  }
`;

const ConfigWrap = styled.div`
  display: flex;
  .formatList {
    width: 250px;
    padding-top: 16px;
    border-right: 1px solid rgba(0, 0, 0, 0.08);
    .title {
      margin-bottom: 6px;
    }
    li {
      line-height: 28px;
      cursor: pointer;
      transition: color 0.25s;
      &:hover {
        color: #1677ff;
      }
    }
  }
  .display {
    flex: 1;
    padding: 16px 0 0 24px;
  }
`;

const TimeDynamicWrap = styled.div`
  .ming.Menu {
    width: 100%;
  }
`;

const CUSTOM_SHOW_FORMAT = [
  'YYYY-MM-DD',
  'YYYY/MM/DD',
  'YYYY年MM月DD日',
  'YYYY年M月D日',
  'YYYYMMDD',
  'YYMMDD',
  'DD-MM-YYYY',
  'DD/MM/YYYY',
  'DD MMM YYYY',
  'DD-MMM-YYYY',
  'DD- MMM-YY ',
  'MM-DD-YYYY',
  'MM/DD/YYYY',
  'MM/DD/YY',
  'MMM D YYYY',
  'MMMM D YYYY',
  'MMM DD YYYY',
  'ddd，YYYY-MM-DD',
  'ddd，DD MMM YYYY',
  'YYYY年MM月DD日，dddd ',
  'YYYY年M月D日，dddd',
];

const ERROR_OPTIONS = [_l('*不支持自定义时间格式！'), _l('*无效的格式化规则')];

export function ShowFormatDialog(props) {
  const { showformat, onClose, type, onOk } = props;
  const [value, setValue] = useState(showformat);

  const checkError = () => {
    if (value) {
      // 包含时间配置
      if (type !== 16 && /[H|h|m|s|S|Z]/.test(value)) return 1;
      const tempValue = moment().format(value.replace(/#EN#$/g, ''));
      if (value === tempValue) return 2;
      return 0;
    }
    return 0;
  };

  return (
    <Dialog
      width={720}
      className="textRegexpVerifyDialog"
      visible={true}
      okDisabled={!value || checkError()}
      onOk={() => onOk(checkError() ? '' : value)}
      onCancel={onClose}
      title={<span className="bold">{_l('自定义格式')}</span>}
    >
      <ConfigWrap>
        <div className="formatList">
          <div className="title Gray_75">
            {_l('选择下方日期格式或自定义输入')}
            <Support href="https://help.mingdao.com//worksheet/date-format" type={3} text={_l('帮助')} />
          </div>
          <ul className="list">
            {CUSTOM_SHOW_FORMAT.map(item => (
              <li onClick={() => setValue(item)}>{moment('2020-01-02').format(item)}</li>
            ))}
          </ul>
        </div>
        <div className="display">
          <SettingItem style={{ margin: '0' }}>
            <div className="settingItemTitle">{_l('格式化规则')}</div>
            <Input.TextArea value={value} onChange={e => setValue(e.target.value)} />
            <div className="LineHeight20 Red mTop5">{ERROR_OPTIONS[checkError() - 1] || ''}</div>
          </SettingItem>
          <SettingItem className="mTop10">
            <div className="settingItemTitle">{_l('示例')}</div>
            <Input disabled value={!value || checkError() ? '' : getDateToEn(value)} />
          </SettingItem>
        </div>
      </ConfigWrap>
    </Dialog>
  );
}

export function ShowFormat(props) {
  const { data, onChange } = props;
  const { showformat = '0' } = getAdvanceSetting(data);
  const showFormatOptions = DATE_SHOW_TYPES.map(item => {
    return { ...item, text: `${moment().format(item.format)}` + (item.text ? `（${item.text}）` : '') };
  });
  const isCustom = _.isNaN(Number(showformat));

  const [visible, setVisible] = useState(false);

  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('日期格式')}</div>
      {isCustom ? (
        <EditInfo className="pointer" onClick={() => setVisible(true)}>
          <div className="overflow_ellipsis Gray">
            {_l('自定义')}（{moment().format(showformat)}）
          </div>
          <div className="flexCenter">
            <div
              className="clearBtn mRight10"
              onClick={e => {
                e.stopPropagation();
                onChange(handleAdvancedSettingChange(data, { showformat: '0' }));
              }}
            >
              <i className="icon-cancel"></i>
            </div>
            <div className="edit">
              <i className="icon-edit"></i>
            </div>
          </div>
        </EditInfo>
      ) : (
        <MingDropdown
          border
          className="w100"
          value={showformat}
          data={showFormatOptions.concat([
            {
              value: '5',
              text: _l('自定义'),
            },
          ])}
          onChange={value => {
            // 自定义
            if (value === '5') {
              setVisible(true);
            } else {
              onChange(handleAdvancedSettingChange(data, { showformat: value }));
            }
          }}
        />
      )}

      {visible && (
        <ShowFormatDialog
          type={data.type}
          showformat={isCustom ? showformat : ''}
          onClose={() => setVisible(false)}
          onOk={value => {
            if (value) {
              onChange(handleAdvancedSettingChange(data, { showformat: value }));
            }
            setVisible(false);
          }}
        />
      )}
    </SettingItem>
  );
}

export function DateHour12(props) {
  const { data, onChange } = props;
  const { hour12 = '0' } = getAdvanceSetting(data);

  return (
    <div className="labelWrap mTop12">
      <Checkbox
        size="small"
        checked={hour12 === '1'}
        onClick={checked => onChange(handleAdvancedSettingChange(data, { hour12: checked ? '0' : '1' }))}
      >
        <span>
          {_l('12小时制')}（{moment().format('h:mm A')}）
        </span>
      </Checkbox>
    </div>
  );
}

function StartEndTime(props) {
  const { data, onChange, allControls } = props;
  const min = getAdvanceSetting(data, 'min');
  const max = getAdvanceSetting(data, 'max');

  const handleValueChange = (value, mode) => {
    onChange(handleAdvancedSettingChange(data, { [mode]: JSON.stringify(value) }));
  };
  return (
    <TimeDynamicWrap>
      <div className={cx('labelWrap mTop8', { mBottom8: min })}>
        <Checkbox
          size="small"
          checked={min}
          onClick={checked => onChange(handleAdvancedSettingChange(data, { min: checked ? '' : JSON.stringify([]) }))}
        >
          <span>{_l('起始日期')}</span>
        </Checkbox>
      </div>
      {min && (
        <DateInput
          {...props}
          controls={allControls}
          hideSearchAndFun
          dynamicValue={min}
          onDynamicValueChange={value => handleValueChange(value, 'min')}
        />
      )}
      <div className={cx('labelWrap', { mTop8: min, mBottom8: max })}>
        <Checkbox
          size="small"
          checked={max}
          onClick={checked => onChange(handleAdvancedSettingChange(data, { max: checked ? '' : JSON.stringify([]) }))}
        >
          <span>{_l('结束日期')}</span>
        </Checkbox>
      </div>
      {max && (
        <DateInput
          {...props}
          hideSearchAndFun
          controls={allControls}
          dynamicValue={max}
          onDynamicValueChange={value => handleValueChange(value, 'max')}
        />
      )}
    </TimeDynamicWrap>
  );
}

export default function DateConfig(props) {
  const { data, onChange } = props;
  const { type } = data;
  const { timeinterval } = getAdvanceSetting(data);

  const [{ timeIntervalVisible }, setVisible] = useSetState({ timeIntervalVisible: false });

  if (type === 15) {
    return (
      <Fragment>
        {/* <ShowFormat {...props} /> */}
        {!isCustomWidget(data) && <StartEndTime {...props} />}
      </Fragment>
    );
  }
  if (type === 16) {
    return (
      <Fragment>
        {/* <ShowFormat {...props} /> */}
        <div className="labelWrap mTop8">
          <Checkbox
            size="small"
            checked={!!timeinterval}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { timeinterval: checked ? '' : '1' }))}
          >
            <span>{_l('预设分钟间隔')}</span>
            <Tooltip
              placement={'bottom'}
              autoCloseDelay={0}
              title={_l('用于控制时间选择器上的分钟按多少间隔显示，但依然可手动输入任意分钟数')}
            >
              <i className="icon-help tipsIcon Gray_9e Font16 pointer"></i>
            </Tooltip>
          </Checkbox>
        </div>
        {timeinterval && (
          <Dropdown
            trigger={'click'}
            visible={timeIntervalVisible}
            onVisibleChange={v => setVisible({ timeIntervalVisible: v })}
            overlay={
              <IntervalWrap>
                {INTERVAL.map(v => (
                  <div
                    key={v}
                    className="item"
                    onClick={() => {
                      onChange(handleAdvancedSettingChange(data, { timeinterval: String(v) }));
                      setVisible({ timeIntervalVisible: false });
                    }}
                  >
                    {_l('%0分钟', v)}
                  </div>
                ))}
              </IntervalWrap>
            }
          >
            <DropdownPlaceholder className={cx({ active: timeIntervalVisible })} color="#151515">
              {_l('%0分钟', timeinterval)}
              <i className="icon-arrow-down-border Font16 Gray_9e"></i>
            </DropdownPlaceholder>
          </Dropdown>
        )}
        {!isCustomWidget(data) && <StartEndTime {...props} />}
      </Fragment>
    );
  }
}
