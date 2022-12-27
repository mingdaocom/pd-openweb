import React, { Fragment } from 'react';
import { Dialog, Dropdown, Checkbox, Icon, Input } from 'ming-ui';
import { Tooltip } from 'antd';
import { useSetState } from 'react-use';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import { DISPLAY_MASK, CUSTOM_DISPLAY } from 'src/pages/widgetConfig/config/setting';
import styled from 'styled-components';
import InputValue from 'src/pages/widgetConfig/widgetSetting/components/WidgetVerify/InputValue';
import { dealMaskValue } from './util';
import cx from 'classnames';

const Setting_Config = [
  {
    text: _l('开头显示'),
    dropdownKey: 'maskbegin',
    inputKey: 'mdchar',
    errKey: 'mdErr',
    data: [
      {
        text: _l('不显示'),
        value: '0',
      },
      {
        text: _l('指定字数'),
        value: '1',
      },
      {
        text: _l('指定字符之前的字'),
        value: '2',
      },
      {
        text: _l('指定字符和之前的字'),
        value: '3',
      },
    ],
  },
  {
    text: _l('结尾显示'),
    dropdownKey: 'maskend',
    inputKey: 'mechar',
    errKey: 'meErr',
    data: [
      {
        text: _l('不显示'),
        value: '0',
      },
      {
        text: _l('指定字数'),
        value: '1',
      },
      {
        text: _l('指定字符之后的字'),
        value: '2',
      },
      {
        text: _l('指定字符和之后的字'),
        value: '3',
      },
    ],
  },
];

const SelectItem = styled.div`
  width: 100%;
  margin-top: 24px;
  &:first-child {
    margin-top: 0;
  }
  .title {
    margin-bottom: 6px;
  }
  .Dropdown--input {
    padding: 5px 8px 5px 12px !important;
    border-color: #ddd !important;
  }
  .opBtn {
    width: 70px;
    height: 36px;
    background: #ffffff;
    border-radius: 3px;
    border: 1px solid #dddddd;
    line-height: 34px;
    text-align: center;
    margin-left: 11px;
    cursor: pointer;
    &:hover {
      color: #2196f3;
      background: #fafafa;
    }
  }
  .inputBox {
    border: 1px solid #ddd !important;
    height: 36px;
    border-radius: 4px;
    padding: 0px 12px;
    &::placeholder {
      color: #bdbdbd;
    }
    &:focus {
      border-color: #2196f3 !important;
    }
    &.err {
      border-color: #ff0000;
    }
  }
`;

const getMaskTypeByType = type => {
  if (_.includes([3, 4], type)) {
    return '2';
  } else if (_.includes([5], type)) {
    return '3';
  } else if (_.includes([6, 8], type)) {
    return '4';
  } else if (_.includes([7], type)) {
    return '5';
  } else {
    return 'all';
  }
};

export default function MaskSettingDialog(props) {
  const { data = {}, onCancel, onChange } = props;
  let originAdvanceData = _.pick(getAdvanceSetting(data), [
    'masktype',
    'maskbegin',
    'mdchar',
    'maskend',
    'mechar',
    'maskmid',
    'masklen',
  ]);
  const [detail, setDetail] = useSetState({
    ...originAdvanceData,
    ...(!originAdvanceData.masktype ? { masktype: getMaskTypeByType(data.type) } : {}),
  });
  const originErr = {
    mdErr: false,
    meErr: false,
    mlErr: false,
  };
  const [err, setErr] = useSetState({ ...originErr });
  // status  掩盖：true，解密：false
  const [testInfo, setTestInfo] = useSetState({ text: '', maskText: '', status: false, visible: !!detail.masklen });

  const { masktype, maskmid = '', masklen = '' } = detail;

  const renderShowValue = (item = {}) => {
    const selectValue = _.find(DISPLAY_MASK, i => i.value === item.value) || {};
    return (
      <span>
        {selectValue.text}
        <span className="mLeft10 subText" style={{ color: '#9e9e9e' }}>
          {selectValue.subText}
        </span>
      </span>
    );
  };

  const handleTest = () => {
    if (!testInfo.text) return;
    const newData = handleAdvancedSettingChange(data, {
      ...(detail.masktype !== 'custom' ? _.pick(detail, 'masktype') : detail),
      datamask: '1',
    });
    setTestInfo({ maskText: dealMaskValue({ ...newData, value: testInfo.text }), status: !testInfo.status });
  };

  return (
    <Dialog
      width={560}
      visible={true}
      title={_l('掩码设置')}
      onCancel={onCancel}
      overlayClosable={false}
      onOk={() => {
        if (_.includes(['1', '2', '3'], detail.maskbegin) && (!detail.mdchar || err.mdErr)) {
          setErr({ mdErr: true });
          return alert(_l('请填写限制开头显示的%0', detail.maskbegin === '1' ? _l('字数') : _l('字符')), 3);
        } else if (_.includes(['1', '2', '3'], detail.maskend) && (!detail.mechar || err.meErr)) {
          setErr({ meErr: true });
          return alert(_l('请填写限制结尾显示的%0', detail.maskend === '1' ? _l('字数') : _l('字符')), 3);
        } else if (testInfo.visible && err.mlErr) {
          return alert(_l('虚拟掩码长度应在1～100以内'), 3);
        }
        onChange(
          handleAdvancedSettingChange(data, {
            ...(detail.masktype !== 'custom' ? _.pick(detail, 'masktype') : detail),
            datamask: '1',
          }),
        );
        onCancel();
      }}
    >
      <SelectItem>
        <div className="title Bold">{_l('掩码规则')}</div>
        <Dropdown
          border
          isAppendToBody
          className="w100"
          maxHeight={385}
          value={masktype}
          renderTitle={(i = {}) => i.text}
          data={[DISPLAY_MASK.map(item => ({ text: renderShowValue(item), value: item.value }))].concat(CUSTOM_DISPLAY)}
          onChange={value => {
            setDetail({ masktype: value });
            setTestInfo({ text: '', status: false });
            setErr({ ...originErr });
          }}
        />
      </SelectItem>

      {masktype === 'custom' && (
        <SelectItem>
          <div className="title Bold">{_l('设置')}</div>
          <div className="Gray_9e">{_l('设置需要显示的字符，其他字符全部显示为掩码')}</div>

          {Setting_Config.map(({ text, dropdownKey, inputKey, data, errKey }) => {
            const dropValue = detail[dropdownKey] || '0';
            const inputValue = detail[inputKey];
            return (
              <div className="flexCenter mTop12">
                <span className="InlineBlock Width80 overflow_ellipsis mRight10">{text}</span>
                <Dropdown
                  className="Width180"
                  border
                  isAppendToBody
                  value={dropValue}
                  data={data}
                  onChange={value => {
                    setDetail({ [dropdownKey]: value, [inputKey]: '' });
                    setErr({ [errKey]: false });
                  }}
                />
                {dropValue === '1' && (
                  <Fragment>
                    <span className="mLeft20 flex">{_l('字数')}</span>
                    <InputValue
                      className="inputBox"
                      type={2}
                      placeholder={_l('请输入字数')}
                      value={inputValue}
                      onChange={value => {
                        setDetail({ [inputKey]: value });
                        setErr({ mdErr: !value || !parseInt(value) });
                      }}
                    />
                  </Fragment>
                )}
                {_.includes(['2', '3'], dropValue) && (
                  <Fragment>
                    <span className="mLeft20 flex">{_l('字符')}</span>
                    <Input
                      className="inputBox"
                      placeholder={_l('请输入字符')}
                      value={inputValue}
                      onChange={value => {
                        setDetail({ [inputKey]: value });
                        setErr({ meErr: !value });
                      }}
                    />
                  </Fragment>
                )}
              </div>
            );
          })}

          <div className="flexCenter mTop12">
            <span className="Width80 mRight10">{_l('中间显示')}</span>
            <Input
              className="flex inputBox"
              placeholder={_l('按顺序输入显示的字符，多个使用,隔开。如：a,b,c')}
              value={maskmid}
              onChange={value => setDetail({ maskmid: value })}
            />
          </div>

          <div className="flexCenter mTop12 LineHeight36">
            <Checkbox
              className="mRight12"
              size="small"
              checked={testInfo.visible}
              onClick={checked => {
                setDetail({ masklen: checked ? '' : '3' });
                setTestInfo({ visible: !checked });
                if (checked) {
                  setErr({ mlErr: false });
                }
              }}
            >
              <span style={{ marginRight: '4px' }}>{_l('虚拟掩码长度')}</span>
              <Tooltip
                placement="bottom"
                title={_l('未勾选时，按照真实字数显示掩码；勾选后，按照虚拟字数显示掩码，不暴露真实长度')}
              >
                <Icon icon="help" className="Font15 Gray_9e TxtMiddle" />
              </Tooltip>
            </Checkbox>
            {testInfo.visible && (
              <Fragment>
                <InputValue
                  className="Width110 inputBox"
                  type={2}
                  placeholder={_l('请输入')}
                  value={masklen}
                  onChange={value => {
                    setDetail({ masklen: value });
                    setErr({ mlErr: !value || !parseInt(value) || parseInt(value) > 100 });
                  }}
                />
                <span className="mLeft12">{_l('个字')}</span>
              </Fragment>
            )}
          </div>
        </SelectItem>
      )}

      <SelectItem>
        <div className="title Bold">{_l('测试')}</div>
        <div className="flexCenter">
          <Input
            className="flex inputBox"
            placeholder={_l('试一试掩盖效果')}
            disabled={testInfo.status}
            value={testInfo.status ? testInfo.maskText : testInfo.text}
            onChange={value => setTestInfo({ text: value })}
          />
          <div className="opBtn" onClick={handleTest}>
            {testInfo.status ? _l('解密') : _l('掩盖')}
          </div>
        </div>
      </SelectItem>
    </Dialog>
  );
}
