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
    const { processId, item, updateNodeName } = this.props;
    const name = evt.currentTarget.value.trim();

    if (name && name !== item.name) {
      updateNodeName(processId, name, item.id);
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
    const { item, isRelease } = this.props;

    return (
      <Tooltip
        className="workflowNotes"
        placement="bottom"
        arrowPointAtCenter={true}
        title={
          <Fragment>
            {item.alias && <div>{_l('别名：%0', item.alias)}</div>}
            {item.desc && <div style={{ whiteSpace: 'pre-wrap' }}>{item.desc}</div>}
          </Fragment>
        }
      >
        <Box
          className="Font15 pointer icon-knowledge-message"
          isBranch={item.typeId === NODE_TYPE.BRANCH_ITEM}
          onMouseDown={e => {
            e.stopPropagation();
            !isRelease && this.addNodeDescribe();
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
      className: 'processNodeBox',
      title: _l('节点别名和说明'),
      width: 540,
      description: (
        <Fragment>
          <div className="Gray">{_l('别名')}</div>
          <div className="mTop5 Gray_75 Font12">
            {_l(
              '用于在邮件节点中插入动态值时指代当前节点，比使用节点ID更有辨识度。节点别名仅允许使用字母（不区分大小写）、数字和下划线组合，且必须以字母开头，不可重复。',
            )}
          </div>
          <div className="relative">
            <div className="processNodeErrorMessage Hidden">
              {_l('非法字符')}
              <i className="processNodeErrorArrow" />
            </div>
            <input
              type="text"
              id="processNodeAlias"
              className="processNodeAlias mTop10"
              placeholder={_l('请输入别名')}
              defaultValue={item.alias}
              maxLength={64}
              onChange={e => {
                const alias = e.target.value.trim();

                $('.processNodeBox .processNodeErrorMessage').toggleClass(
                  'Hidden',
                  !(alias && !/^[a-zA-Z]{1}\w*$/.test(alias)),
                );
              }}
            />
          </div>

          <div className="Gray mTop15">{_l('说明')}</div>
          <textarea
            id="workflowNodeNotes"
            className="boderRadAll_4 pAll10 Gray mTop10"
            placeholder={_l('请输入节点说明')}
            defaultValue={item.desc}
          />
        </Fragment>
      ),
      okText: _l('保存'),
      onOk: () => {
        return new Promise((resolve, reject) => {
          const alias = document.getElementById('processNodeAlias').value.trim();
          const desc = document.getElementById('workflowNodeNotes').value.trim();

          if (alias && !/^[a-zA-Z]{1}\w*$/.test(alias)) {
            alert(_l('请输入正确的别名'), 2);
            reject(true);
          } else {
            flowNode.nodeDesc({ processId, nodeId: item.id, alias, desc }).then(result => {
              if (result) {
                updateNodeDesc(processId, item.id, alias, desc);
                resolve();
              } else {
                document.getElementById('processNodeAlias').value = '';
                alert(_l('该别名已存在'), 2);
                reject(true);
              }
            });
          }
        });
      },
    });
  };

  /**
   * 渲染节点删除
   */
  renderDeleteNode() {
    const { processId, item, deleteNode } = this.props;
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
                deleteNode(processId, item.id);
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
          <Box className="Font18 pointer icon-more_horiz" isBranch={item.typeId === NODE_TYPE.BRANCH_ITEM} />
        </Trigger>
      </span>
    );
  }

  /**
   * 渲染操作列表
   */
  renderOperateList = () => {
    const { item, copyBranchNode, noDelete } = this.props;
    const list = [
      { text: _l('修改名称'), icon: 'edit', events: () => this.setState({ isEdit: true }) },
      { text: _l('编辑节点别名和说明'), icon: 'knowledge-message', events: () => this.addNodeDescribe() },
      { text: _l('节点复制'), icon: 'copy', events: copyBranchNode },
      {
        text: _l('删除'),
        icon: 'delete1',
        events: () => this.setState({ showDelete: true }),
        className: 'flowNodeDel',
      },
    ];

    // 触发节点没有删除 || 禁用删除
    if (item.typeId === NODE_TYPE.FIRST || noDelete) {
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
    const { item, nodeClassName, noCopy } = this.props;

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

        {!_.includes([NODE_TYPE.FIRST, NODE_TYPE.BRANCH_ITEM], item.typeId) && !noCopy && <CopyNode {...this.props} />}

        {(item.alias || item.desc) && this.renderNodeDescribe()}

        {this.renderMoreOperate()}

        {item.typeId !== NODE_TYPE.FIRST && this.renderDeleteNode()}
      </Fragment>
    );
  }
}
