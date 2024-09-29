import React, { Component } from 'react';
import { Dialog, Support } from 'ming-ui';
import { TriggerCondition } from '../components';
import flowNode from '../../../api/flowNode';
import { checkConditionsIsNull } from '../../utils';
import cx from 'classnames';

export default class Branch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      controls: [],
      saveRequest: false,
    };
  }

  componentDidMount() {
    const { processId, selectNodeId, selectNodeType, instanceId } = this.props;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, instanceId })
      .then(result => {
        // 兼容空值情况
        if (instanceId) {
          result.conditions.forEach(list => {
            list.forEach(item => {
              if (!item.fromValue) {
                item.fromValue = _l('空');
              }

              if (!item.toValue) {
                item.toValue = [_l('空')];
              }
            });
          });
        }

        this.setState({
          name: result.name,
          data: result.conditions.length ? result.conditions : this.state.data,
          controls: result.flowNodeAppDtos,
        });
      });
  }

  /**
   * 筛选条件头
   */
  triggerConditionHeader() {
    return <div className="Font13 Gray_75">{_l('设置筛选条件后，满足条件的数据才能进入该分支')}</div>;
  }

  /**
   * 更新data数据
   */
  updateSource = data => {
    this.setState({ data });
  };

  /**
   * 保存
   */
  onSave = () => {
    const { data, saveRequest } = this.state;
    const { processId, selectNodeId, selectNodeType, updateNodeData } = this.props;

    if (saveRequest) {
      return;
    }

    if (checkConditionsIsNull(data)) {
      alert(_l('筛选条件的判断值不能为空'), 2);
      return;
    }

    flowNode
      .saveNode({ nodeId: selectNodeId, flowNodeType: selectNodeType, operateCondition: data, processId })
      .then(result => {
        updateNodeData(result);
        this.props.closeDetail();
      });

    this.setState({ saveRequest: true });
  };

  render() {
    const { flowInfo, closeDetail, instanceId } = this.props;
    const { data, controls, name } = this.state;

    return (
      <Dialog
        className={cx('workflowDialogBox', { workflowDetailRelease: !!flowInfo.parentId || instanceId })}
        overlayClosable={false}
        visible
        title={
          <div className="flexRow" style={{ height: 24 }}>
            <span className="ellipsis">{name || _l('分支')}</span>
            <span className="mLeft10">
              <Support
                type={1}
                className="workflowDialogSupport"
                href="https://help.mingdao.com/worksheet/field-filter"
              />
            </span>
            <span className="flex" />
          </div>
        }
        onCancel={closeDetail}
        width={560}
        onOk={this.onSave}
      >
        <TriggerCondition
          processId={this.props.processId}
          relationId={this.props.relationId}
          selectNodeId={this.props.selectNodeId}
          isNodeHeader={true}
          controls={controls}
          Header={this.triggerConditionHeader}
          data={data}
          updateSource={this.updateSource}
          projectId={this.props.companyId}
          isPlugin={this.props.isPlugin}
        />
        {!data.length && (
          <div
            className="Font13 addConditionBtn ThemeColor3 ThemeHoverColor2 mTop15"
            onClick={() => this.setState({ data: [[{}]] })}
          >
            {_l('添加筛选条件')}
          </div>
        )}
      </Dialog>
    );
  }
}
