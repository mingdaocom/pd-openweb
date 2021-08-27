import React, { Component } from 'react';

export default class CreateNode extends Component {
  constructor(props) {
    super(props);
  }

  renderContent() {
    const { item, disabled, nodeId, selectAddNodeId, isCopy, selectCopy } = this.props;
    const isAddState = nodeId === item.id;

    if (disabled) {
      return null;
    }

    if (isAddState && isCopy) {
      return <div className="workflowAddActionBox Gray_75 Font14">{_l('复制到此处')}</div>;
    }

    if (isAddState) {
      return (
        <div className="workflowAddActionBox Gray_75 Font14">
          {_l('选择要执行的动作，或')}
          <span className="ThemeColor3 pointer workflowCopyBtn" onClick={selectCopy}>
            {_l('复制')}
          </span>
          {_l('已有节点')}
        </div>
      );
    }

    return (
      <i
        className="icon-custom_add_circle"
        onClick={() => !isCopy && selectAddNodeId(item.id, item.typeId, item.actionId)}
      />
    );
  }

  render() {
    return <div className="workflowLineBtn">{this.renderContent()}</div>;
  }
}
