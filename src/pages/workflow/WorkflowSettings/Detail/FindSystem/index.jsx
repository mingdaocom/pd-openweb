import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Checkbox } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import {
  DetailHeader,
  DetailFooter,
  SelectFields,
  TriggerCondition,
  SelectNodeObject,
  FindResult,
} from '../components';
import { APP_TYPE, TRIGGER_ID_TYPE, NODE_TYPE } from '../../enum';
import { checkConditionsIsNull } from '../../utils';
import cx from 'classnames';

export default class FindSystem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
    };
  }

  componentDidMount() {
    this.getNodeDetail(this.props);
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.selectNodeId !== this.props.selectNodeId) {
      this.getNodeDetail(nextProps);
    }

    if (
      nextProps.selectNodeName &&
      nextProps.selectNodeName !== this.props.selectNodeName &&
      nextProps.selectNodeId === this.props.selectNodeId &&
      !_.isEmpty(this.state.data)
    ) {
      this.updateSource({ name: nextProps.selectNodeName });
    }
  }

  /**
   * 获取节点详情
   */
  getNodeDetail(props, sId, fields) {
    const { processId, selectNodeId, selectNodeType } = props;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, selectNodeId: sId, fields })
      .then(result => {
        this.setState({ data: result });
      });
  }

  /**
   * 更新data数据
   */
  updateSource = (obj, callback = () => {}) => {
    this.props.haveChange(true);
    this.setState({ data: Object.assign({}, this.state.data, obj) }, callback);
  };

  /**
   * 保存
   */
  onSave = () => {
    const { data, saveRequest } = this.state;
    const { appId, appType, name, actionId, selectNodeId, fields, conditions, executeType, random } = data;

    if (saveRequest) {
      return;
    }

    if (checkConditionsIsNull(conditions)) {
      alert(_l('筛选条件的判断值不能为空'), 2);
      return;
    }

    if (!_.includes([TRIGGER_ID_TYPE.FROM_WORKSHEET, TRIGGER_ID_TYPE.WORKSHEET_FIND], actionId)) {
      if (!selectNodeId) {
        alert(_l('必须选择对象'), 2);
        return;
      } else if (!fields.length) {
        alert(_l('必须选择筛选字段'), 2);
        return;
      }
    }

    flowNode
      .saveNode({
        processId: this.props.processId,
        nodeId: this.props.selectNodeId,
        appId,
        flowNodeType: this.props.selectNodeType,
        actionId,
        appType,
        name: name.trim(),
        selectNodeId,
        fields,
        operateCondition: conditions,
        executeType,
        random,
      })
      .then(result => {
        this.props.updateNodeData(result);
        this.props.closeDetail();
      });

    this.setState({ saveRequest: true });
  };

  renderContent() {
    const { selectNodeType } = this.props;
    const { data } = this.state;
    const TEXT = {
      [APP_TYPE.USER]: {
        [TRIGGER_ID_TYPE.RELATION]: {
          title: _l('从人员字段获取'),
          filterText: _l('设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则只从字段中获得第一名人员的相关信息'),
        },
        [TRIGGER_ID_TYPE.WORKSHEET_FIND]: {
          title: _l('从组织人员中获取'),
          filterText: _l(
            '设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则只从当前组织的所有人员中获得第一名（最新入职）人员的相关信息',
          ),
        },
        [TRIGGER_ID_TYPE.FROM_RECORD]: {
          title: _l('从人员字段获取'),
          filterText: _l('设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则获得所有来自该字段的人员的相关信息'),
        },
        [TRIGGER_ID_TYPE.FROM_WORKSHEET]: {
          title: _l('从组织人员中获取'),
          filterText: _l('设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则获得当前组织的所有人员的相关信息'),
        },
      },
      [APP_TYPE.DEPARTMENT]: {
        [TRIGGER_ID_TYPE.RELATION]: {
          title: _l('从部门字段获取'),
          filterText: _l('设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则只从字段中获得第一个部门的相关信息'),
        },
        [TRIGGER_ID_TYPE.WORKSHEET_FIND]: {
          title: _l('从组织部门中获取'),
          filterText: _l(
            '设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则只从当前组织的所有部门中获得第一个（最新创建）部门的相关信息',
          ),
        },
        [TRIGGER_ID_TYPE.FROM_RECORD]: {
          title: _l('从部门字段获取'),
          filterText: _l('设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则获得所有来自该字段的部门的相关信息'),
        },
        [TRIGGER_ID_TYPE.FROM_WORKSHEET]: {
          title: _l('从组织部门中获取'),
          filterText: _l('设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则获得当前组织的所有部门的相关信息'),
        },
      },
      [APP_TYPE.EXTERNAL_USER]: {
        [TRIGGER_ID_TYPE.RELATION]: {
          title: _l('从外部用户字段获取'),
          filterText: _l(
            '设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则只从字段中获得第一名外部用户的相关信息',
          ),
        },
        [TRIGGER_ID_TYPE.WORKSHEET_FIND]: {
          title: _l('从外部门户中获取'),
          filterText: _l(
            '设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则只从当前应用的所有外部用户中获得第一名（最新注册）人员的相关信息',
          ),
        },
        [TRIGGER_ID_TYPE.FROM_RECORD]: {
          title: _l('从外部用户字段获取'),
          filterText: _l(
            '设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则获得所有来自该字段的外部用户的相关信息',
          ),
        },
        [TRIGGER_ID_TYPE.FROM_WORKSHEET]: {
          title: _l('从外部门户中获取'),
          filterText: _l(
            '设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则获得当前应用的所有外部用户的相关信息',
          ),
        },
      },
    };
    const DESC_TEXT = {
      [NODE_TYPE.FIND_SINGLE_MESSAGE]: {
        [APP_TYPE.USER]: _l(
          '获取一名人员的相关信息，包含个人信息（姓名、性别、生日、手机、邮箱）和组织信息（部门、职位、工号、上下级），供流程中的其他节点使用。',
        ),
        [APP_TYPE.DEPARTMENT]: _l(
          '获取一个部门的相关信息，包含部门名称、部门负责人、部门人员及上下级部门，供流程中的其他节点使用。',
        ),
        [APP_TYPE.EXTERNAL_USER]: _l(
          '获取一名外部用户的相关信息，包含用户名、手机号、角色、用户状态、openid和自定义字段，供流程中的其他节点使用。',
        ),
      },
      [NODE_TYPE.FIND_MORE_MESSAGE]: {
        [APP_TYPE.USER]: _l(
          '获取多名人员的相关信息，包含个人信息（姓名、性别、生日、手机、邮箱）和组织信息（部门、职位、工号、上下级），供流程中的其他节点使用。',
        ),
        [APP_TYPE.DEPARTMENT]: _l(
          '获取多个部门的相关信息，包含部门名称、部门负责人、部门人员及上下级部门，供流程中的其他节点使用。',
        ),
        [APP_TYPE.EXTERNAL_USER]: _l(
          '获取多名外部用户的相关信息，包含用户名、手机号、角色、用户状态、openid和自定义字段，供流程中的其他节点使用。',
        ),
      },
    };

    return (
      <Fragment>
        <div className="Gray_75">{((TEXT[data.appType] || {})[data.actionId] || {}).title}</div>
        <div className="Gray_75 workflowDetailDesc pTop15 pBottom15 mTop10">
          {(DESC_TEXT[selectNodeType] || {})[data.appType]}
        </div>

        {_.includes([TRIGGER_ID_TYPE.FROM_RECORD, TRIGGER_ID_TYPE.RELATION], data.actionId) && (
          <Fragment>
            <div className="mTop20 bold">{_l('选择查找对象')}</div>
            <div className="Gray_75 mTop5">{_l('当前流程中的节点对象')}</div>
            <SelectNodeObject
              appList={data.flowNodeList}
              selectNodeId={data.selectNodeId}
              selectNodeObj={data.selectNodeObj}
              onChange={sId => this.getNodeDetail(this.props, sId)}
            />

            <div className="mTop20 bold">{_l('选择字段')}</div>
            <SelectFields
              controls={data.actionId === TRIGGER_ID_TYPE.RELATION ? data.controls : data.relationControls}
              selectedIds={data.fields.map(item => item.fieldId)}
              updateSource={ids =>
                this.getNodeDetail(this.props, data.selectNodeId, JSON.stringify(ids.map(id => ({ fieldId: id }))))
              }
            />
          </Fragment>
        )}

        <div className="mTop20 bold">{_l('筛选条件')}</div>
        <div className="Gray_75 mTop5">{TEXT[data.appType][data.actionId].filterText}</div>
        {!data.conditions.length ? (
          this.renderConditionBtn()
        ) : (
          <TriggerCondition
            processId={this.props.processId}
            selectNodeId={this.props.selectNodeId}
            controls={data.actionId === TRIGGER_ID_TYPE.RELATION ? data.relationControls : data.controls}
            data={data.conditions}
            updateSource={data => this.updateSource({ conditions: data })}
            projectId={this.props.companyId}
          />
        )}

        {selectNodeType === NODE_TYPE.FIND_SINGLE_MESSAGE && (
          <Fragment>
            <div className="mTop20">
              <Checkbox
                className="InlineFlex"
                text={_l('在筛选条件的基础上，随机获取一个')}
                checked={data.random}
                onClick={checked => this.updateSource({ random: !checked })}
              />
            </div>
            <FindResult
              executeType={data.executeType}
              switchExecuteType={executeType => this.updateSource({ executeType })}
            />
          </Fragment>
        )}
      </Fragment>
    );
  }

  /**
   * 渲染筛选条件按钮
   */
  renderConditionBtn() {
    const { data } = this.state;

    return (
      <div className="mTop25">
        <span
          className={cx(
            'workflowDetailStartBtn',
            data.appId
              ? 'ThemeColor3 ThemeBorderColor3 ThemeHoverColor2 ThemeHoverBorderColor2'
              : 'Gray_bd borderColor_c',
          )}
          onClick={() => this.updateSource({ conditions: [[{}]] })}
        >
          {_l('设置筛选条件')}
        </span>
      </div>
    );
  }

  render() {
    const { selectNodeType } = this.props;
    const { data } = this.state;

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          data={{ ...data, selectNodeType: this.props.selectNodeType }}
          icon={selectNodeType === NODE_TYPE.FIND_SINGLE_MESSAGE ? 'icon-person_search' : 'icon-group-members'}
          bg="BGBlue"
          closeDetail={this.props.closeDetail}
          updateSource={this.updateSource}
        />
        <div className="flex mTop20">
          <ScrollView>
            <div className="workflowDetailBox">{this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter
          isCorrect={
            _.includes([TRIGGER_ID_TYPE.FROM_WORKSHEET, TRIGGER_ID_TYPE.WORKSHEET_FIND], data.actionId) ||
            (!!data.selectNodeId && !!data.fields.length)
          }
          onSave={this.onSave}
          closeDetail={this.props.closeDetail}
        />
      </Fragment>
    );
  }
}
