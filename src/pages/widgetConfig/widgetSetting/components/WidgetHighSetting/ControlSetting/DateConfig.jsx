import React, { Fragment, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Support } from 'ming-ui';
import { Checkbox, Dropdown, Input, Modal, Select, Tooltip } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { getDateToEn } from 'src/utils/domain/control/date';
import { isCustomWidget } from 'src/utils/domain/control/metadata';
import { DATE_SHOW_TYPES } from 'src/utils/domain/control/setting';
import { SYSTEM_DATE_CONTROL } from 'src/utils/domain/control/widget';
import { DropdownPlaceholder, EditInfo, SettingItem } from '../../../../styled';
import DateInput from '../../DynamicDefaultValue/inputTypes/DateInput.jsx';

const INTERVAL = [1, 5, 10, 15, 30, 60];

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
        color: var(--color-primary);
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
    <Modal
      width={720}
      className="textRegexpVerifyDialog"
      open={true}
      mask={{ closable: true }}
      keyboard
      okDisabled={!value || checkError()}
      onOk={() => {
        onOk(checkError() ? '' : value);
        onClose();
      }}
      onCancel={onClose}
      title={<span className="bold">{_l('自定义格式')}</span>}
    >
      <ConfigWrap>
        <div className="formatList">
          <div className="title textSecondary">
            {_l('选择下方日期格式或自定义输入')}
            <Support href="https://help.mingdao.com/worksheet/date-format/" type={3} text={_l('帮助')} />
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
            <div className="textSecondary LineHeight20 mBottom8">
              {_l(
                '格式化规则MMM/MMMM/ddd/dddd可以依据当前用户的个人语言，呈现不同的形式。如需指定按英文的规则呈现，可以在格式后添加 #EN#。',
              )}
            </div>
            <Input.TextArea value={value} onChange={e => setValue(e.target.value)} />
            <div className="LineHeight20 Red mTop5">{ERROR_OPTIONS[checkError() - 1] || ''}</div>
          </SettingItem>
          <SettingItem className="mTop10">
            <div className="settingItemTitle">{_l('示例')}</div>
            <Input disabled value={!value || checkError() ? '' : getDateToEn(value)} />
          </SettingItem>
        </div>
      </ConfigWrap>
    </Modal>
  );
}

export function ShowFormat(props) {
  const { data, onChange } = props;
  const { showformat = '0' } = getAdvanceSetting(data);
  const showFormatOptions = DATE_SHOW_TYPES.map(item => ({
    ...item,
    label: `${moment().format(item.format)}${item.text ? `（${item.text}）` : ''}`,
  }));
  const isCustom = _.isNaN(Number(showformat));

  const [visible, setVisible] = useState(false);

  return (
    <SettingItem>
      <div className="settingItemTitle">{_l('日期格式')}</div>
      {isCustom ? (
        <EditInfo className="pointer" onClick={() => setVisible(true)}>
          <div className="overflow_ellipsis textPrimary">
            {_l('自定义')}（{getDateToEn(showformat)}）
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
        <Select
          className="w100"
          value={showformat}
          options={showFormatOptions.concat([
            {
              value: '5',
              label: _l('自定义'),
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
        checked={hour12 === '1'}
        onChange={event =>
          onChange(
            handleAdvancedSettingChange(data, {
              hour12: !event.target.checked ? '0' : '1',
            }),
          )
        }
        size="small"
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
  const controls = _.uniqBy(
    allControls.concat(SYSTEM_DATE_CONTROL.filter(control => control.controlId === 'ctime')),
    'controlId',
  );
  const min = getAdvanceSetting(data, 'min');
  const max = getAdvanceSetting(data, 'max');
  const locationbegin = getAdvanceSetting(data, 'locationbegin');

  const handleValueChange = (value, mode) => {
    onChange(handleAdvancedSettingChange(data, { [mode]: JSON.stringify(value) }));
  };

  return (
    <Fragment>
      <div className={cx('labelWrap mTop8', { mBottom8: min })}>
        <Checkbox
          checked={min}
          onChange={event =>
            onChange(
              handleAdvancedSettingChange(
                data,
                !event.target.checked
                  ? {
                      locationbegin: '0',
                      min: '',
                    }
                  : {
                      min: JSON.stringify([]),
                    },
              ),
            )
          }
          size="small"
        >
          <span>{_l('起始日期')}</span>
        </Checkbox>
      </div>
      {min && (
        <Fragment>
          <DateInput
            {...props}
            controls={controls}
            hideSearchAndFun
            dynamicValue={min}
            onDynamicValueChange={value => handleValueChange(value, 'min')}
          />
          <div className="labelWrap mTop8">
            <Checkbox
              checked={!!locationbegin}
              onChange={event =>
                onChange(
                  handleAdvancedSettingChange(data, {
                    locationbegin: !event.target.checked ? '0' : '1',
                  }),
                )
              }
              size="small"
            >
              <span>{_l('默认定位到起始日期')}</span>
              <Tooltip
                placement="bottom"
                title={_l('勾选后，打开时间选择器优先显示起始日期所在日期；未勾选时优先显示当前日期。')}
              >
                <i className="icon-help tipsIcon textTertiary Font16 pointer"></i>
              </Tooltip>
            </Checkbox>
          </div>
        </Fragment>
      )}

      <div className={cx('labelWrap', { mTop8: min, mBottom8: max })}>
        <Checkbox
          checked={max}
          onChange={event =>
            onChange(
              handleAdvancedSettingChange(data, {
                max: !event.target.checked ? '' : JSON.stringify([]),
              }),
            )
          }
          size="small"
        >
          <span>{_l('结束日期')}</span>
        </Checkbox>
      </div>
      {max && (
        <DateInput
          {...props}
          hideSearchAndFun
          controls={controls}
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
            checked={!!timeinterval}
            onChange={event =>
              onChange(
                handleAdvancedSettingChange(data, {
                  timeinterval: !event.target.checked ? '' : '1',
                }),
              )
            }
            size="small"
          >
            <span>{_l('预设分钟间隔')}</span>
            <Tooltip
              placement="bottom"
              title={_l('用于控制时间选择器上的分钟按多少间隔显示，但依然可手动输入任意分钟数')}
            >
              <i className="icon-help tipsIcon textTertiary Font16 pointer"></i>
            </Tooltip>
          </Checkbox>
        </div>
        {timeinterval && (
          <Dropdown
            trigger={'click'}
            open={timeIntervalVisible}
            onOpenChange={v => setVisible({ timeIntervalVisible: v })}
            menu={{
              items: INTERVAL.map(v => ({
                key: v,
                label: _l('%0分钟', v),
                onClick: () => {
                  onChange(handleAdvancedSettingChange(data, { timeinterval: String(v) }));
                  setVisible({ timeIntervalVisible: false });
                },
              })),
            }}
          >
            <DropdownPlaceholder className={cx({ active: timeIntervalVisible })} color="var(--color-text-primary)">
              {_l('%0分钟', timeinterval)}
              <i className="icon-arrow-down-border Font16 textTertiary"></i>
            </DropdownPlaceholder>
          </Dropdown>
        )}
        {!isCustomWidget(data) && <StartEndTime {...props} />}
      </Fragment>
    );
  }
}
