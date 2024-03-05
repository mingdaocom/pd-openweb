import React, { Fragment, useState } from 'react';
import { Checkbox } from 'ming-ui';
import styled from 'styled-components';
import { Dropdown, Tooltip, Input } from 'antd';
import { Dropdown as MingDropdown, Support, Dialog } from 'ming-ui';
import cx from 'classnames';
import { useSetState } from 'react-use';
import { DATE_SHOW_TYPES } from '../../../../config/setting';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../../util/setting';
import { DropdownContent, DropdownPlaceholder, SettingItem, EditInfo } from '../../../../styled';
import DateInput from '../../DynamicDefaultValue/inputTypes/DateInput.jsx';
import moment from 'moment';

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
        color: #2196f3;
      }
    }
  }
  .display {
    flex: 1;
    padding: 16px 0 0 24px;
  }
`;

const CUSTOM_SHOW_FORMAT = [
  'YYYY-MM-DD',
  'YYYY/MM/DD',
  'YYYYMMDD',
  'YYMMDD',
  'YYYY年MM月DD日',
  'YYYY年M月D日',
  'MM-DD-YYYY',
  'MM/DD/YYYY',
  'MMM D YYYY',
  'MMMM D YYYY',
  'MM/DD/YY',
  'DD-MM-YYYY',
  'DD/MM/YYYY',
];

const ERROR_OPTIONS = ['*不支持自定义时间格式！', '*无效的格式化规则'];

function ShowFormatDialog(props) {
  const { showformat, onClose, onOk } = props;
  const [value, setValue] = useState(showformat);

  const checkError = () => {
    // 包含时间配置
    if (value && /[H|h|m|s|S|Z]/.test(value)) {
      return 1;
    }
    const tempValue = moment().format(value);
    if (value && new Date(moment(tempValue, value).valueOf()).toString() === 'Invalid Date') {
      return 2;
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
            <Support href="https://help.mingdao.com/sheet16" type={3} text={_l('帮助')} />
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
            <Input.TextArea value={value} onChange={e => setValue(e.target.value.trim())} />
            <div className="LineHeight20 Red mTop5">{ERROR_OPTIONS[checkError() - 1] || ''}</div>
          </SettingItem>
          <SettingItem className="mTop10">
            <div className="settingItemTitle">{_l('示例')}</div>
            <Input disabled value={!value || checkError() ? '' : moment().format(value)} />
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
      <div className="settingItemTitle">{_l('显示格式')}</div>
      {isCustom ? (
        <EditInfo className="pointer" onClick={() => setVisible(true)}>
          <div className="overflow_ellipsis Gray">{_l('自定义格式')}</div>
          <div className="flexCenter">
            <div
              className="clearBtn mRight10"
              onClick={e => {
                e.stopPropagation();
                onChange(handleAdvancedSettingChange(data, { showformat: '0' }));
              }}
            >
              <i className="icon-closeelement-bg-circle"></i>
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

function StartEndTime(props) {
  const { data, onChange, allControls } = props;
  const min = getAdvanceSetting(data, 'min');
  const max = getAdvanceSetting(data, 'max');

  const handleValueChange = (value, mode) => {
    onChange(handleAdvancedSettingChange(data, { [mode]: JSON.stringify(value) }));
  };
  return (
    <Fragment>
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
    </Fragment>
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
        <ShowFormat {...props} />
        <StartEndTime {...props} />
      </Fragment>
    );
  }
  if (type === 16) {
    return (
      <Fragment>
        <ShowFormat {...props} />
        <div className="labelWrap mTop8">
          <Checkbox
            size="small"
            checked={!!timeinterval}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { timeinterval: checked ? '' : '1' }))}
          >
            <span>{_l('预设分钟间隔')}</span>
            <Tooltip
              placement={'bottom'}
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
            <DropdownPlaceholder className={cx({ active: timeIntervalVisible })} color="#333">
              {_l('%0分钟', timeinterval)}
              <i className="icon-arrow-down-border Font16 Gray_9e"></i>
            </DropdownPlaceholder>
          </Dropdown>
        )}
        <StartEndTime {...props} />
      </Fragment>
    );
  }
}
