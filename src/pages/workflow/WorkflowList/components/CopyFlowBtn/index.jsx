import React, { Component } from 'react';
import { Dialog } from 'ming-ui';
import process from '../../../api/process';
import cx from 'classnames';

export default class CopyFlowBtn extends Component {
  /**
   * 复制工作流 or 转为子流程
   */
  copyFlow = () => {
    const { isConvert, item, updateList } = this.props;

    Dialog.confirm({
      title: isConvert ? _l('将“%0”转为子流程', item.name) : _l('复制工作流“%0”', item.name),
      description: isConvert
        ? _l('如果您需要复用本流程，通过此操作将为本流程创建一个副本，触发器类型为子流程')
        : _l('将复制目标工作流的所有节点和配置'),
      okText: isConvert ? _l('确定') : _l('复制'),
      onOk: () => {
        process
          .copyProcess({ processId: item.id, name: isConvert ? _l('-子流程') : _l('-复制'), subProcess: !!isConvert })
          .then(res => {
            if (res) {
              updateList();
            }
          });
      },
    });
  };

  render() {
    const { isConvert } = this.props;

    return (
      <div onClick={this.copyFlow}>
        <span className={cx('Gray_75 Font16 pLeft12 mRight10', isConvert ? 'icon-swap_horiz' : 'icon-content-copy')} />
        {isConvert ? _l('转为子流程') : _l('复制')}
      </div>
    );
  }
}
