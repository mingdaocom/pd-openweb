import React, { Component, Fragment } from 'react';
import { Dialog, Icon } from 'ming-ui';
import { Tooltip } from 'antd';
import flowNode from '../../../api/flowNode';
import styled from 'styled-components';
import cx from 'classnames';
import CopyNode from './CopyNode';
import { NODE_TYPE } from '../../enum';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';

const ClickAwayable = createDecoratedComponent(withClickAway);
const Box = styled.span`
  color: ${props => (props.isBranch ? '#9e9e9e' : 'rgba(255, 255, 255, 0.8)')};
  &:hover {
    color: ${props => (props.isBranch ? '#2196f3' : '#fff')};
  }
`;

export default class NodeOperate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEdit: false,
      showDelete: false,
      showOperate: false,
    };
  }

  disabled = false;

  /**
   * 进入编辑状态
   */
  joinEdit = evt => {
    evt.stopPropagation();
    evt.preventDefault();
    this.setState({ isEdit: true });
  };

  /**
   * 修改节点名称
   */
  updateNodeName = evt => {
    const { item, updateNodeName } = this.props;
    const name = evt.currentTarget.value.trim();

    if (name && name !== item.name) {
      updateNodeName(name, item.id);
    } else {
      this.workflowNodeName.value = item.name;
    }
    this.setState({ isEdit: false });
  };

  /**
   * 渲染节点名称
   */
  renderNodeName() {
    const { item } = this.props;
    const { isEdit } = this.state;

    if (!isEdit) {
      return (
        <div className="workflowNodeNameText ellipsis bold" onMouseDown={this.joinEdit}>
          {item.name || _l('分支')}
        </div>
      );
    }

    return (
      <input
        type="text"
        ref={workflowNodeName => {
          this.workflowNodeName = workflowNodeName;
        }}
        autoFocus
        className="workflowNodeName"
        defaultValue={item.name || _l('分支')}
        onMouseDown={evt => evt.stopPropagation()}
        onKeyDown={evt => evt.keyCode === 13 && this.updateNodeName(evt)}
        onBlur={this.updateNodeName}
      />
    );
  }

  /**
   * 渲染节点描述
   */
  renderNodeDescribe() {
    const { item } = this.props;

    return (
      <Tooltip
        className="workflowNotes"
        placement="bottom"
        arrowPointAtCenter={true}
        title={<div style={{ whiteSpace: 'pre-wrap' }}>{item.desc}</div>}
      >
        <Box
          className="Font15 pointer icon-knowledge-message"
          isBranch={item.typeId === NODE_TYPE.BRANCH_ITEM}
          onMouseDown={e => {
            e.stopPropagation();
            this.addNodeDescribe();
          }}
        />
      </Tooltip>
    );
  }

  /**
   * 更新节点描述
   */
  addNodeDescribe = () => {
    const { processId, item, updateNodeDesc } = this.props;

    Dialog.confirm({
      title: _l('节点说明'),
      width: 540,
      description: (
        <textarea
          id="workflowNodeNotes"
          className="boderRadAll_4 pAll10 Gray"
          placeholder={_l('请输入节点说明')}
          defaultValue={item.desc}
          autoFocus
        />
      ),
      okText: _l('保存'),
      onOk: () => {
        const value = document.getElementById('workflowNodeNotes').value.trim();
        flowNode.nodeDesc({ processId, nodeId: item.id, desc: value }).then(() => {
          updateNodeDesc(item.id, value);
        });
      },
    });
  };

  /**
   * 渲染节点删除
   */
  renderDeleteNode() {
    const { item, deleteNode } = this.props;
    const { showDelete } = this.state;

    if (!showDelete) return null;

    return (
      <ClickAwayable
        className="delNodeBox"
        onClickAway={() => this.setState({ showDelete: false })}
        onClick={e => e.stopPropagation()}
      >
        <div className={cx('TxtCenter Font15', { mTop10: item.typeId !== NODE_TYPE.BRANCH_ITEM })}>
          {item.typeId === NODE_TYPE.BRANCH_ITEM ? _l('同时删除分支下所有节点') : _l('确定删除此节点？')}
        </div>
        <div className="flexRow Font13 mTop20">
          <div
            className="delNodeCancelBtn"
            onMouseDown={e => {
              e.stopPropagation();
              this.setState({ showDelete: false });
            }}
          >
            {_l('取消')}
          </div>
          <div
            className="delNodeSureBtn"
            onMouseDown={e => {
              e.stopPropagation();

              if (!this.disabled) {
                deleteNode(item.id);
                this.disabled = true;
              }
            }}
          >
            {_l('确定删除')}
          </div>
        </div>
      </ClickAwayable>
    );
  }

  /**
   * 渲染更多操作
   */
  renderMoreOperate() {
    const { item } = this.props;
    const { showOperate } = this.state;

    return (
      <span className="workflowOperate" onMouseDown={e => e.stopPropagation()}>
        <Trigger
          popupVisible={showOperate}
          action={['click']}
          popup={this.renderOperateList()}
          popupAlign={{ points: ['tr', 'br'] }}
          onPopupVisibleChange={showOperate => this.setState({ showOperate })}
        >
          <Box className="Font18 pointer icon-more_horiz1" isBranch={item.typeId === NODE_TYPE.BRANCH_ITEM} />
        </Trigger>
      </span>
    );
  }

  /**
   * 渲染操作列表
   */
  renderOperateList = () => {
    const { item, copyBranchNode } = this.props;
    const list = [
      { text: _l('修改名称'), icon: 'edit', events: () => this.setState({ isEdit: true }) },
      { text: _l('编辑节点说明'), icon: 'knowledge-message', events: () => this.addNodeDescribe() },
      { text: _l('节点复制'), icon: 'copy', events: copyBranchNode },
      {
        text: _l('删除'),
        icon: 'delete1',
        events: () => this.setState({ showDelete: true }),
        className: 'flowNodeDel',
      },
    ];

    // 触发节点没有删除
    if (item.typeId === NODE_TYPE.FIRST) {
      _.remove(list, (o, index) => index === 3);
    }

    // 只有分支节点有复制
    if (item.typeId !== NODE_TYPE.BRANCH_ITEM) {
      _.remove(list, (o, index) => index === 2);
    }

    return (
      <ul className="flowNodeOperateList">
        {list.map((item, index) => (
          <li
            key={index}
            className={cx(item.className)}
            onClick={() => {
              item.events();
              this.setState({ showOperate: false });
            }}
          >
            <Icon icon={item.icon} />
            {item.text}
          </li>
        ))}
      </ul>
    );
  };

  render() {
    const { item, nodeClassName } = this.props;

    return (
      <Fragment>
        {item.typeId === NODE_TYPE.BRANCH_ITEM ? (
          <Fragment>
            {this.renderNodeName()}
            <span className="flex" />
          </Fragment>
        ) : (
          <div className={cx('workflowName TxtCenter', nodeClassName)}>{this.renderNodeName()}</div>
        )}

        {!_.includes([NODE_TYPE.FIRST, NODE_TYPE.BRANCH_ITEM], item.typeId) && <CopyNode {...this.props} />}

        {item.desc && this.renderNodeDescribe()}

        {this.renderMoreOperate()}

        {item.typeId !== NODE_TYPE.FIRST && this.renderDeleteNode()}
      </Fragment>
    );
  }
}
