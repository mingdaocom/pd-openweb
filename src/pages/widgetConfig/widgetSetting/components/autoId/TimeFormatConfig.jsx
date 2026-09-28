import React, { useState } from 'react';
import cx from 'classnames';
import moment from 'moment';
import styled from 'styled-components';
import { Support } from 'ming-ui';
import { Input, Modal } from 'ming-ui/antd-components';
import { SettingItem } from '../../../styled';

const TimeFormatConfigWrap = styled.div`
  .intro {
    color: var(--color-text-secondary);
  }
  .hint {
    margin-top: 12px;
    color: var(--color-text-secondary);
    &.invalid {
      color: var(--color-error);
    }
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
    <Modal
      width={480}
      open
      title={_l('自定义日期格式')}
      okDisabled={!data.trim()}
      mask={{ closable: true }}
      keyboard
      onCancel={onClose}
      onOk={() => {
        onOk(data);
        onClose();
      }}
    >
      <TimeFormatConfigWrap>
        <div className="intro">
          {_l('在下方输入自定义格式，将日期按需要的方式显示')}
          <Support type={3} href="https://help.mingdao.com/worksheet/date-format/" text={_l('查看格式规则')} />
        </div>
        <SettingItem>
          <Input value={data} onChange={handleChange} />
          <div className={cx('hint')}>{_l('预览:  %0', moment().format(data))}</div>
        </SettingItem>
      </TimeFormatConfigWrap>
    </Modal>
  );
}
