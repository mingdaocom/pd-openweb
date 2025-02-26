import React, { useState, Fragment } from 'react';
import styled from 'styled-components';
import { useSetState } from 'react-use';
import { Dialog, Dropdown, Button, RadioGroup, Checkbox } from 'ming-ui';
import AutoIcon from '../../../components/Icon';
import { Input, Tooltip } from 'antd';
import { parseInt } from 'lodash';
import { SettingItem } from '../../../styled';

const NumberConfigWrap = styled.div`
  .settingItem {
    display: flex;
    align-items: center;
    margin-top: 16px;

    .title {
      width: 80px;
    }
    .content {
      flex: 1;
    }
    .numberPoint {
      display: flex;
      input {
        width: 60px;
      }
    }
    .adjustWrap {
      display: flex;
      flex-direction: column;
      border: 1px solid #e0e0e0;
      border-left: none;
    }
    .addWrap,
    .subWrap {
      padding: 0 4px;
      height: 16px;
    }
    .addWrap {
      border-bottom: 1px solid #e0e0e0;
    }
  }
  .hint {
    margin: 8px 0 0 80px;
    color: #9e9e9e;
    font-size: 13px;
  }
  .clickable {
    color: #2196f3;
    cursor: pointer;
  }
  .footerBtn {
    text-align: right;
    margin-top: 32px;
  }
  .ming.Checkbox {
    display: flex;
    align-items: center;
  }
`;

const NUMBER_TYPE = [
  { value: 'nature', text: _l('自然数编号%04018') },
  { value: 'assign', text: _l('指定位数编号%04019') },
];
const RESET_TYPE = [
  {
    value: 0,
    text: _l('不重置'),
  },
  {
    value: 1,
    text: _l('每天重置'),
  },
  {
    value: 2,
    text: _l('每周重置'),
  },
  {
    value: 3,
    text: _l('每月重置'),
  },
  {
    value: 4,
    text: _l('每年重置'),
  },
];
const TYPE_TO_TEXT = {
  1: _l('每天00:00, 自动从初始值开始编号'),
  2: _l('每周一的00:00, 自动从初始值开始编号'),
  3: _l('每月第一天的00:00, 自动从初始值开始编号'),
  4: _l('每年第一天的00:00, 自动从初始值开始编号'),
};

export default function AutoNumberConfig(props) {
  const { rule, controlId, onClose, onOk } = props;
  const [data, setData] = useSetState(rule);
  const resetValue = window.auto_id_reset[controlId] || false;
  const [resetAutoId, setReset] = useState(resetValue);

  // data.length 为0 代表自然数编号
  const type = data.length ? 'assign' : 'nature';

  const handleValueChange = ({ value, min = 2, max = 8 }) => {
    if (value === '') return value;
    const parsedValue = parseInt(value).toFixed(0);
    if (isNaN(parsedValue)) return '';
    return Math.min(max, Math.max(min, parsedValue));
  };

  return (
    <Dialog style={{ width: '560px' }} visible title={_l('编号设置')} footer={null} onCancel={onClose}>
      <NumberConfigWrap>
        <SettingItem className="settingItem">
          <div className="title">{_l('编号方式%04017')}</div>
          <div className="content">
            <RadioGroup
              size="middle"
              checkedValue={type}
              data={NUMBER_TYPE}
              onChange={value =>
                setData({
                  length: value === 'nature' ? 0 : data.length || 4,
                  start: data.start || 1,
                  repeatType: data.repeatType || 0,
                })
              }
            />
          </div>
        </SettingItem>
        {type === 'assign' && (
          <Fragment>
            <SettingItem className="settingItem">
              <div className="title">{_l('位数')}</div>
              <div className="content numberPoint">
                <Input
                  value={data.length}
                  onChange={e => setData({ length: handleValueChange({ value: e.target.value }) || data.length })}
                />
                <div className="adjustWrap">
                  <div className="addWrap">
                    <AutoIcon
                      icon="arrow-up-border"
                      onClick={() => setData({ length: handleValueChange({ value: data.length + 1 }) || data.length })}
                    />
                  </div>
                  <div className="subWrap">
                    <AutoIcon
                      icon="arrow-down-border"
                      onClick={() => setData({ length: handleValueChange({ value: data.length - 1 }) || data.length })}
                    />
                  </div>
                </div>
              </div>
            </SettingItem>
            <div className="hint">
              <Tooltip
                trigger={['hover']}
                title={_l(
                  '取消勾选后，则编号不允许超出指定的位数，到达最大后将从0开始重新计数。如果位数设置不足会导致编号重复',
                )}
              >
                <Checkbox
                  size="small"
                  checked={data.format === 'auto'}
                  onClick={value => {
                    setData({ format: value ? '' : 'auto' });
                  }}
                >
                  <Fragment>
                    <span>{_l('编号超出位数后继续递增')}</span>
                    <Tooltip
                      trigger={['hover']}
                      title={_l('勾选时，超出位数继续递增； 取消勾选时，超出位数后从0开始编号')}
                    >
                      <AutoIcon style={{ marginLeft: '6px' }} icon="help" />
                    </Tooltip>
                  </Fragment>
                </Checkbox>
              </Tooltip>
            </div>
          </Fragment>
        )}
        <SettingItem className="settingItem">
          <div className="title">
            {_l('开始值')}
            <Tooltip
              trigger={['hover']}
              title={_l(
                '编号=开始值+创建记录数-1。若修改开始值，则之后的编号将根据新的开始值计算。例如，原来的开始值为1，已创建记录数为10，则当前最后一条编号为no.10；若此时将开始值修改为10，则下一条记录的编号为no.20。',
              )}
            >
              <AutoIcon style={{ marginLeft: '6px' }} icon="help" />
            </Tooltip>
          </div>
          <div className="content">
            <Input
              value={data.start || 1}
              onChange={e =>
                setData({
                  start: String(
                    handleValueChange({
                      value: e.target.value,
                      min: 0,
                      max: Math.pow(2, 62),
                    }),
                  ),
                })
              }
            />
          </div>
        </SettingItem>

        <div className="hint">
          <Checkbox
            size="small"
            checked={resetAutoId}
            onClick={value => {
              setReset(!value);
              window.auto_id_reset[controlId] = !value;
            }}
          >
            <Fragment>
              <span>{_l('下一条记录以修改后的开始值编号')}</span>
              <Tooltip
                trigger={['hover']}
                title={_l(
                  '勾选时，新的开始值保存后，下一条记录将直接以新开始值作为编号（例如，表中已编号至no.100，修改开始值为5并勾选此配置项，则下一条记录直接以no.5编号）',
                )}
              >
                <AutoIcon style={{ marginLeft: '6px' }} icon="help" />
              </Tooltip>
            </Fragment>
          </Checkbox>
        </div>

        <SettingItem className="settingItem">
          <div className="title">{_l('周期重置')}</div>
          <div className="content">
            <Dropdown
              isAppendToBody
              border
              value={data.repeatType}
              data={RESET_TYPE}
              onChange={value => setData({ repeatType: value })}
            />
          </div>
        </SettingItem>
        <div className="hint">{TYPE_TO_TEXT[data.repeatType]}</div>
        <div className="footerBtn">
          <Button type="link" onClick={onClose}>
            {_l('取消')}
          </Button>
          <Button
            type="primary"
            onClick={() => {
              if (!data.start) {
                onOk({ ...data, start: '1' });
              } else {
                onOk(data);
              }
              onClose();
            }}
          >
            {_l('确定')}
          </Button>
        </div>
      </NumberConfigWrap>
    </Dialog>
  );
}
