import React, { useState } from 'react';
import { Dialog, Button, Support } from 'ming-ui';
import { Input } from 'antd';
import cx from 'classnames';
import styled from 'styled-components';
import { SettingItem } from '../../../styled';

const TimeFormatConfigWrap = styled.div`
  .intro {
    color: #757575;
  }
  .hint {
    margin-top: 12px;
    color: #757575;
    &.invalid {
      color: #f44336;
    }
  }
  .footerBtn {
    text-align: right;
    margin-top: 32px;
  }
`;
export default function TimeFormatConfig({ rule, onOk, onClose }) {
  const [data, setData] = useState(rule.format || 'YYYY-MM-DD hh:mm:ss');
  const handleChange = e => {
    const { value } = e.target;
    if (value.trim().length > 32) return;
    setData(value);
  };
  return (
    <Dialog style={{ width: '480px' }} visible title={_l('自定义日期格式')} footer={null} onCancel={onClose}>
      <TimeFormatConfigWrap>
        <div className="intro">
          {_l('在下方输入自定义格式，将日期按需要的方式显示')}
          <Support type={3} href="https://help.mingdao.com/sheet16.html" text={_l('查看格式规则')} />
        </div>
        <SettingItem>
          <Input value={data} onChange={handleChange} />
          <div className={cx('hint')}>{_l('预览:  %0', moment().format(data))}</div>
        </SettingItem>
        <div className="footerBtn">
          <Button type="link" onClick={onClose}>
            {_l('取消')}
          </Button>
          <Button
            disabled={!data.trim()}
            type="primary"
            onClick={() => {
              onOk(data);
              onClose();
            }}
          >
            {_l('确定')}
          </Button>
        </div>
      </TimeFormatConfigWrap>
    </Dialog>
  );
}
