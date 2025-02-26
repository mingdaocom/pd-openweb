import React, { Fragment } from 'react';
import { Radio } from 'ming-ui';
import _ from 'lodash';
import cx from 'classnames';
import Ajax from 'src/api/workWeiXin';

const messageLinkTypes = [
  { label: _l('独立窗口'), key: 2 },
  { label: _l('侧边栏打开'), key: 1 },
];

function SettingLinkOpen(props) {
  const { value, disabled, projectId, className = '', onChange = () => {} } = props;

  const handleChange = status => {
    Ajax.editDDMessagUrlPcSlide({
      projectId: projectId,
      status,
    }).then(res => {
      if (res) {
        onChange(status);
      } else {
        alert(_l('失败'), 2);
      }
    });
  };

  return (
    <div className={cx('stepItem', className)}>
      <h3 className="stepTitle Font16 Gray pBottom5">{_l('消息链接')}</h3>
      {messageLinkTypes.map(item => {
        return (
          <Radio
            className="Block mTop20"
            disabled={disabled}
            checked={value === item.key}
            text={item.label}
            onClick={e => handleChange(item.key)}
          />
        );
      })}
    </div>
  );
}

export default SettingLinkOpen;
