import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Modal } from 'ming-ui/antd-components';
import './index.less';

const PUBLISH_ERROR_MODAL_STYLES = {
  body: { paddingBottom: 13 },
};
const DANGER_OK_BUTTON_PROPS = { danger: true };

const warnTypes = {
  99: _l('你的流程中未包含可执行操作的节点,请至少添加一个'),
  100: _l('未设置流程的触发方式'),
  102: _l('个节点未进行配置'),
  103: _l('个节点指定的对象已删除'),
  105: _l('个节点未指定人员或人员异常'),
  108: _l('个节点有审核中、审核失败的短信模版'),
  200: _l('个节点未设置有效的操作或操作内容异常'),
};

const FATAL_ERROR = [99, 100];

export default ({ onOk, onCancel, info, isPlugin }) => {
  const { processWarnings, name } = info;
  return (
    <Modal
      className="publishErrorDialog"
      open
      title={isPlugin ? _l('插件 “%0” 存在错误！', name) : _l('工作流 “%0” 存在错误！', name)}
      styles={PUBLISH_ERROR_MODAL_STYLES}
      okButtonProps={DANGER_OK_BUTTON_PROPS}
      onCancel={onCancel}
      onOk={onOk}
      okText={_l('前往修改')}
    >
      <ul className="reasonList">
        {processWarnings.map(item => {
          const warnNum = _.includes(FATAL_ERROR, item.warningType) ? '' : item.errorCount;
          return (
            <li className="errorItem" key={item.warningType}>
              <span className={cx('iconBox', { warn: item.yellow })}>
                <Icon className={cx('Font20', item.yellow ? 'icon-error_outline' : 'icon-report')} />
              </span>
              <span className="detail">{`${warnNum}${warnTypes[item.warningType]}`}</span>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
};
