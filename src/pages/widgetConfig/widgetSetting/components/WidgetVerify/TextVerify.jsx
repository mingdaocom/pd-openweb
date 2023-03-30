import React, { useState, Fragment, useEffect } from 'react';
import { Dialog, Checkbox } from 'ming-ui';
import cx from 'classnames';
import styled from 'styled-components';
import { useSetState } from 'react-use';
import { find, isEmpty } from 'lodash';
import { Input } from 'antd';
import { SettingItem } from '../../../styled';
import { getAdvanceSetting } from '../../../util';
import { handleAdvancedSettingChange } from '../../../util/setting';

const FORMAT_CONFIG = [
  { text: _l('字母'), value: 'char', regExp: '^[A-Za-z]*$' },
  { text: _l('字母数字'), value: 'charNumber', regExp: '^[A-Za-z0-9]*$' },
  { text: _l('数字'), value: 'number', regExp: '^\\d*$' },
  { text: _l('大写字母'), value: 'capital', regExp: '^[A-Z]*$' },
  { text: _l('小写字母'), value: 'lowercase', regExp: '^[a-z]*$' },
  { text: _l('6个字母'), value: 'sixChar', regExp: '^\\w{6}$' },
  { text: _l('6位数字'), value: 'sixNumber', regExp: '^\\d{6}$' },
  { text: _l('邮政编码'), value: 'post', regExp: '^\\d{4,6}$' },
  {
    text: _l('IP地址'),
    value: 'ip',
    regExp: '^((2(5[0-5]|[0-4]\\d))|[0-1]?\\d{1,2})(.((2(5[0-5]|[0-4]\\d))|[0-1]?\\d{1,2})){3}$',
  },
  {
    text: _l('链接'),
    value: 'link',
    regExp: '^https?:\\/\\/\\w+\\.\\w+\\.\\w+.*$',
  },
  {
    text: _l('车牌号'),
    value: 'car',
    regExp: '^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领]\\w{4,9}$',
  },
  {
    text: _l('身份证号'),
    value: 'idCard',
    regExp: '^\\d{17}[\\dX]$',
  },
  {
    text: _l('中国护照'),
    value: 'passport',
    regExp: '(^[EeKkGgDdSsPpHh]\\d{8}$)|(^(([Ee][a-fA-F])|([DdSsPp][Ee])|([Kk][Jj])|([Mm][Aa])|(1[45]))\\d{7}$)',
  },
];

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

    .hint {
      margin-top: 12px;
      i {
        margin-left: 4px;
        font-size: 14px;
      }
    }
    .invalid {
      color: #f44336;
    }
    .isInvalid,
    .invalidInput {
      border-color: #f44336;
      &:focus {
        box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.5);
      }
    }
  }
`;

const FormatInfo = styled.div`
  line-height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  margin-top: 12px;
  border-radius: 3px;
  border: 1px solid #e0e0e0;
  background-color: #f5f5f5;
`;

export default function InputFormatConfig({ data, onChange }) {
  const format = getAdvanceSetting(data, 'regex') || {};

  const [{ type, regex, err }, setData] = useSetState({
    type: format.type || '',
    regex: format.regex || '',
    err: format.err || '',
  });

  useEffect(() => {
    setData({
      type: format.type || '',
      regex: format.regex || '',
      err: format.err || '',
    });
  }, [data.controlId]);

  const [visible, setVisible] = useState(false);
  const [testValue, setTestValue] = useState('');

  const getText = () => {
    if (!type) return '';
    if (type === 'custom') return _l('自定义');
    let value = find(FORMAT_CONFIG, item => item.value === type);
    return value ? value.text : '';
  };

  const text = getText();

  let reg;
  try {
    reg = new RegExp(regex);
  } catch (error) {
    console.log(error);
  }

  const isInvalid = reg && !reg.test(testValue);

  return (
    <Fragment>
      <Dialog
        width={720}
        className="textRegexpVerifyDialog"
        visible={visible}
        okDisabled={!regex}
        onOk={() => {
          onChange(
            handleAdvancedSettingChange(data, {
              regex: JSON.stringify({ type, regex, err: err || _l('请输入有效文本') }),
            }),
          );
          setVisible(false);
        }}
        onCancel={() => {
          setVisible(false);
        }}
        title={<span className="bold">{_l('限定输入格式')}</span>}>
        <ConfigWrap>
          <div className="formatList">
            <div className="title Gray_75">
              {_l('选择下方常用表达式或自定义输入')}
              <a href="https://help.mingdao.com/zh/sheet31.html" target="__blank" className="mLeft4">
                {_l('帮助')}
              </a>
            </div>
            <ul className="list">
              {FORMAT_CONFIG.map(item => (
                <li onClick={() => setData({ type: item.value, err: _l('请输入%0', item.text), regex: item.regExp })}>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="display">
            <SettingItem style={{ margin: '0' }}>
              <div className="settingItemTitle">{text ? _l('正则表达式: %0', text) : _l('正则表达式')}</div>
              <Input.TextArea
                className={cx({ isInvalid: !reg })}
                value={regex}
                onChange={e => {
                  setData({ regex: e.target.value, type: 'custom', err: _l('请输入有效文本') });
                }}
              />
            </SettingItem>
            <SettingItem>
              <div className="settingItemTitle">{_l('错误时提示')}</div>
              <Input placeholder={_l('请输入有效文本')} value={err} onChange={e => setData({ err: e.target.value })} />
            </SettingItem>
            <SettingItem>
              <div className="settingItemTitle">{_l('测试')}</div>
              <Input
                className={cx({ invalidInput: testValue && isInvalid })}
                placeholder={_l('测试')}
                value={testValue}
                onChange={e => setTestValue(e.target.value)}
              />
              {testValue &&
                (isInvalid ? (
                  <div className="hint invalid">
                    {err}
                    <i className="icon-cancel"></i>
                  </div>
                ) : (
                  <div className="hint">
                    {_l('测试通过')}
                    <i className="icon-check_circle" style={{ color: '#00c345' }}></i>
                  </div>
                ))}
            </SettingItem>
          </div>
        </ConfigWrap>
      </Dialog>
      <div className="labelWrap">
        <Checkbox
          size="small"
          checked={!isEmpty(format)}
          onClick={checked => {
            if (checked) {
              onChange(handleAdvancedSettingChange(data, { regex: '' }));
              setTestValue('');
              setData({ type: '', err: '', regex: '' });
              return;
            }
            setVisible(true);
          }}
          text={_l('限定输入格式')}
        />
      </div>
      {!isEmpty(format) && text && (
        <FormatInfo>
          <span>{text}</span>
          <i className="icon-edit pointer Gray_9e pointer" onClick={() => setVisible(true)}></i>
        </FormatInfo>
      )}
    </Fragment>
  );
}
