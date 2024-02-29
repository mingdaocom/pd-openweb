import React, { useState, useEffect } from 'react';
import { Select, Checkbox, Input, DatePicker } from 'antd';
import { Icon } from 'ming-ui';
import moment from 'moment';
import _ from 'lodash';
import locale from 'antd/es/date-picker/locale/zh_CN';
import './Validity.less';
import { generateRandomPassword } from 'src/util';

const alwaysValue = '9999-12-31 23:59:59';

const validityDateTypes = [
  {
    label: _l('永久有效'),
    value: alwaysValue,
    getValidTime: () => alwaysValue,
  },
  {
    label: _l('1小时后'),
    getSubLabel: () => {
      const current = moment();
      const date = current.add(1, 'h');
      return `${moment(date).isSame(current, 'd') ? _l('今天') : _l('明天')} ${date.format('HH:mm')}`;
    },
    getValidTime: () => moment().add(1, 'h').format('YYYY-MM-DD HH:mm'),
    value: 1,
  },
  {
    label: _l('1天后'),
    getSubLabel: () =>
      moment()
        .add(1, 'd')
        .format(`DD${_l('日')} HH:mm`),
    getValidTime: () => moment().add(1, 'd').format('YYYY-MM-DD HH:mm'),
    value: 2,
  },
  {
    label: _l('3天后'),
    getSubLabel: () =>
      moment()
        .add(3, 'd')
        .format(`DD${_l('日')} HH:mm`),
    getValidTime: () => moment().add(3, 'd').format('YYYY-MM-DD HH:mm'),
    value: 3,
  },
  {
    label: _l('7天后'),
    getSubLabel: () =>
      moment()
        .add(7, 'd')
        .format(`MM${_l('月')}DD${_l('日')} HH:mm`),
    getValidTime: () => moment().add(7, 'd').format('YYYY-MM-DD HH:mm'),
    value: 4,
  },
  {
    label: _l('自定义'),
    value: 5,
  },
];

export default function Validity(props) {
  const { data, onChange } = props;
  const { validTime, password } = data || {};
  const [type, setType] = useState(alwaysValue);
  const [customDate, setCustomDate] = useState(null);
  const [open, setOpen] = useState(false);
  const [customPassword, setCustomPassword] = useState(password);
  const isAlways = validTime === alwaysValue || _.isEmpty(validTime);

  useEffect(() => {
    if (type === 5) {
      setOpen(true);
    }
  }, [type]);

  const handleChangePassword = () => {
    if (customPassword.length < 4 || customPassword.length > 8) {
      alert(_l('密码长度4~8位'), 2);
      return;
    }
    if (/^[0-9]+$/.test(customPassword) || /^[A-Za-z]+$/.test(customPassword)) {
      alert(_l('密码必须包含数字或者字母'), 2);
      return;
    }
    onChange({ password: customPassword });
  };

  return (
    <div className="flexRow alignItemsCenter mTop16 validityDateConfig mBottom8">
      <div className="flex flexRow alignItemsCenter mRight10">
        <div className="mRight8">{_l('链接有效期')}</div>
        {type === 5 ? (
          <DatePicker
            showTime={{ format: 'HH:mm' }}
            showNow={false}
            autoFocus={true}
            suffixIcon={null}
            locale={locale}
            open={open}
            onOpenChange={setOpen}
            format={`YYYY${_l('年')}MM${_l('月')}DD${_l('日')} HH:mm`}
            value={customDate}
            clearIcon={<Icon icon="cancel1" className="Gray_bd Font17" />}
            disabledDate={current => {
              if (current) {
                return current < moment();
              } else {
                return false;
              }
            }}
            onChange={date => {
              if (_.isNull(date)) {
                setType(alwaysValue);
                onChange({ validTime: alwaysValue });
                setCustomDate(null);
              } else {
                setCustomDate(date);
                onChange({ validTime: date.format('YYYY-MM-DD HH:mm') });
              }
            }}
          />
        ) : (
          <Select
            value={isAlways ? alwaysValue : validTime ? moment(validTime).format('YYYY-MM-DD HH:mm') : null}
            className="dateSelect"
            suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
            allowClear={validTime ? true : false}
            clearIcon={<Icon icon="cancel1" className="Gray_bd Font17" />}
            onChange={(value = alwaysValue) => {
              const target = _.find(validityDateTypes, { value });
              if (target && target.getValidTime) {
                const validTime = target.getValidTime();
                onChange({ validTime });
              } else {
                onChange({ validTime: '' });
              }
              setType(value);
            }}
          >
            {validityDateTypes.map(data => (
              <Select.Option key={data.value} value={data.value} className="validityDateOption pLeft20 pRight20">
                <div className="Font13 ellipsis">
                  <span>{data.label}</span>
                  {data.getSubLabel && <span className="Gray_9e mLeft5">( {data.getSubLabel()} )</span>}
                </div>
              </Select.Option>
            ))}
          </Select>
        )}
      </div>
      <div className="flex flexRow alignItemsCenter">
        <Checkbox
          checked={password}
          className="mRight10"
          onChange={event => {
            const password = generateRandomPassword(4);
            if (event.target.checked) {
              setCustomPassword(password);
              onChange({ password });
            } else {
              onChange({ password: '' });
            }
          }}
        >
          {_l('密码保护')}
        </Checkbox>
        {password && (
          <Input
            placeholder={_l('请输入4-8位密码')}
            value={customPassword}
            className="flex"
            onChange={event => {
              const { value } = event.target;
              setCustomPassword(value.replace(/[^A-Za-z0-9]/g, '').slice(0, 8));
            }}
            onBlur={handleChangePassword}
            onKeyDown={event => {
              event.which === 13 && handleChangePassword();
            }}
          />
        )}
      </div>
    </div>
  );
}
