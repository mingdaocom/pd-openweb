import React, { Component } from 'react';
import cx from 'classnames';
import { Dialog } from 'ming-ui';
import process from '../../../api/process';

export default class CopyFlowBtn extends Component {
  /**
   * 复制工作流 or 转为子流程
   */
  copyFlow = () => {
    const { isConvertSubProcess, isConvertPBP, item, updateList } = this.props;

    Dialog.confirm({
      title: isConvertSubProcess
        ? _l('将“%0”转为子流程', item.name)
        : isConvertPBP
          ? _l('将“%0”转为封装业务流程', item.name)
          : _l('复制工作流“%0”', item.name),
      description: isConvertSubProcess
        ? _l('如果您需要复用本流程，通过此操作将为本流程创建一个副本，触发器类型为子流程')
        : isConvertPBP
          ? _l('如果您需要复用本流程，通过此操作将为本流程创建一个封装业务流程副本')
          : _l('将复制目标工作流的所有节点和配置'),
      okText: isConvertSubProcess || isConvertPBP ? _l('确定') : _l('复制'),
      onOk: () => {
        process
          .copyProcess({
            processId: item.id,
            name: isConvertSubProcess ? _l('-子流程') : isConvertPBP ? _l('-封装业务流程') : _l('-复制'),
            subProcess: !!isConvertSubProcess || !!isConvertPBP,
          })
          .then(res => {
            if (res) {
              updateList();
            }
          });
      },
    });
  };

  render() {
    const { isConvertSubProcess, isConvertPBP } = this.props;

    return (
      <div onClick={this.copyFlow}>
        <span
          className={cx(
            'Gray_75 Font16 pLeft12 mRight10',
            isConvertSubProcess || isConvertPBP ? 'icon-swap_horiz' : 'icon-content-copy',
          )}
        />
        {isConvertSubProcess ? _l('转为子流程') : isConvertPBP ? _l('转为封装业务流程') : _l('复制')}
      </div>
    );
  }
}
