import React, { Component } from 'react';
import { Dialog } from 'ming-ui';
import process from '../../../api/process';

export default class CopyFlowBtn extends Component {
  /**
   * 复制工作流
   */
  copyFlow = () => {
    const { item, updateList } = this.props;

    Dialog.confirm({
      title: _l('复制工作流“%0”', item.name),
      description: _l('将复制目标工作流的所有节点和配置'),
      okText: _l('复制'),
      onOk: () => {
        process.copyProcess({ processId: item.id, name: _l('-复制') }).then(res => {
          if (res) {
            updateList();
          }
        });
      },
    });
  };

  render() {
    return (
      <div onClick={this.copyFlow}>
        <span className="icon-content-copy Gray_9e Font16 pLeft12 mRight10" />
        {_l('复制')}
      </div>
    );
  }
}
