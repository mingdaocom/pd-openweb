import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { Checkbox, LoadDiv, ScrollView } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import { ACTION_ID, APP_TYPE, NODE_TYPE } from '../../enum';
import { checkConditionsIsNull, getIcons } from '../../utils';
import {
  DetailFooter,
  DetailHeader,
  FindResult,
  SelectFields,
  SelectNodeObject,
  TriggerCondition,
} from '../components';

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

  componentWillReceiveProps(nextProps) {
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
    const { processId, selectNodeId, selectNodeType, instanceId } = props;
    const { data } = this.state;

    flowNode
      .getNodeDetail({
        processId,
        nodeId: selectNodeId,
        flowNodeType: selectNodeType,
        selectNodeId: sId,
        fields,
        instanceId,
      })
      .then(result => {
        this.setState({ data: !sId ? result : { ...result, name: data.name } });
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
    const { appId, appType, name, actionId, selectNodeId, fields, conditions, executeType, random, relation } = data;

    if (saveRequest) {
      return;
    }

    if (checkConditionsIsNull(conditions)) {
      alert(_l('筛选条件的判断值不能为空'), 2);
      return;
    }

    if (!_.includes([ACTION_ID.FROM_WORKSHEET, ACTION_ID.WORKSHEET_FIND], actionId)) {
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
        relation,
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
        [ACTION_ID.RELATION]: {
          title: _l('从人员字段获取'),
          filterText: _l('设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则只从字段中获得第一名人员的相关信息'),
        },
        [ACTION_ID.WORKSHEET_FIND]: {
          title: _l('从组织人员中获取'),
          filterText: _l(
            '设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则只从当前组织的所有人员中获得第一名（最新入职）人员的相关信息',
          ),
        },
        [ACTION_ID.FROM_RECORD]: {
          title: _l('从人员字段获取'),
          filterText: _l('设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则获得所有来自该字段的人员的相关信息'),
        },
        [ACTION_ID.FROM_WORKSHEET]: {
          title: _l('从组织人员中获取'),
          filterText: _l('设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则获得当前组织的所有人员的相关信息'),
        },
      },
      [APP_TYPE.DEPARTMENT]: {
        [ACTION_ID.RELATION]: {
          title: _l('从部门字段获取'),
          filterText: _l('设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则只从字段中获得第一个部门的相关信息'),
        },
        [ACTION_ID.WORKSHEET_FIND]: {
          title: _l('从组织部门中获取'),
          filterText: _l(
            '设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则只从当前组织的所有部门中获得第一个（最新创建）部门的相关信息',
          ),
        },
        [ACTION_ID.FROM_RECORD]: {
          title: _l('从部门字段获取'),
          filterText: _l('设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则获得所有来自该字段的部门的相关信息'),
        },
        [ACTION_ID.FROM_WORKSHEET]: {
          title: _l('从组织部门中获取'),
          filterText: _l('设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则获得当前组织的所有部门的相关信息'),
        },
      },
      [APP_TYPE.EXTERNAL_USER]: {
        [ACTION_ID.RELATION]: {
          title: _l('从外部用户字段获取'),
          filterText: _l(
            '设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则只从字段中获得第一名外部用户的相关信息',
          ),
        },
        [ACTION_ID.WORKSHEET_FIND]: {
          title: _l('从外部门户中获取'),
          filterText: _l(
            '设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则只从当前应用的所有外部用户中获得第一名（最新注册）人员的相关信息',
          ),
        },
        [ACTION_ID.FROM_RECORD]: {
          title: _l('从外部用户字段获取'),
          filterText: _l(
            '设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则获得所有来自该字段的外部用户的相关信息',
          ),
        },
        [ACTION_ID.FROM_WORKSHEET]: {
          title: _l('从外部门户中获取'),
          filterText: _l(
            '设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则获得当前应用的所有外部用户的相关信息',
          ),
        },
      },
      [APP_TYPE.ORGANIZATION_ROLE]: {
        [ACTION_ID.RELATION]: {
          title: _l('从组织角色字段获取'),
          filterText: _l(
            '设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则只从字段中获得第一个组织角色的相关信息',
          ),
        },
        [ACTION_ID.WORKSHEET_FIND]: {
          title: _l('从组织角色中获取'),
          filterText: _l(
            '设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则只从当前组织的所有组织角色中获得第一个（最新创建）角色的相关信息',
          ),
        },
        [ACTION_ID.FROM_RECORD]: {
          title: _l('从组织角色字段获取'),
          filterText: _l(
            '设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则获得所有来自该字段的组织角色的相关信息',
          ),
        },
        [ACTION_ID.FROM_WORKSHEET]: {
          title: _l('从组织角色中获取'),
          filterText: _l(
            '设置筛选条件，获得满足条件的数据。如果未添加筛选条件，则获得当前组织的所有组织角色的相关信息',
          ),
        },
      },
    };
    const DESC_TEXT = {
      [NODE_TYPE.FIND_SINGLE_MESSAGE]: {
        [APP_TYPE.USER]: _l(
          '获取一名人员的相关信息，包含个人信息（姓名、性别、生日、手机、邮箱）和组织信息（部门、职位、工号、上下级（可选）），供流程中的其他节点使用。',
        ),
        [APP_TYPE.DEPARTMENT]: _l(
          '获取一个部门的相关信息，包含部门名称、部门负责人、部门人员及上下级部门，供流程中的其他节点使用。',
        ),
        [APP_TYPE.EXTERNAL_USER]: _l(
          '获取一名外部用户的相关信息，包含用户名、手机号、角色、用户状态、openid和自定义字段，供流程中的其他节点使用。',
        ),
        [APP_TYPE.ORGANIZATION_ROLE]: _l(
          '获取一个组织角色的相关信息，包含角色名称、备注、角色下人员，供流程中的其他节点使用。',
        ),
      },
      [NODE_TYPE.FIND_MORE_MESSAGE]: {
        [APP_TYPE.USER]: _l(
          '获取多名人员的相关信息，包含个人信息（姓名、性别、生日、手机、邮箱）和组织信息（部门、职位、工号、上下级（可选）），供流程中的其他节点使用。',
        ),
        [APP_TYPE.DEPARTMENT]: _l(
          '获取多个部门的相关信息，包含部门名称、部门负责人、部门人员及上下级部门，供流程中的其他节点使用。',
        ),
        [APP_TYPE.EXTERNAL_USER]: _l(
          '获取多名外部用户的相关信息，包含用户名、手机号、角色、用户状态、openid和自定义字段，供流程中的其他节点使用。',
        ),
        [APP_TYPE.ORGANIZATION_ROLE]: _l(
          '获取多个组织角色的相关信息，包含角色名称、备注、角色下人员，供流程中的其他节点使用。',
        ),
      },
    };

    return (
      <Fragment>
        <div className="Gray_75">{((TEXT[data.appType] || {})[data.actionId] || {}).title}</div>
        <div className="Gray_75 workflowDetailDesc pTop15 pBottom15 mTop10">
          {(DESC_TEXT[selectNodeType] || {})[data.appType]}
        </div>

        {_.includes([ACTION_ID.FROM_RECORD, ACTION_ID.RELATION], data.actionId) && (
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
              controls={data.actionId === ACTION_ID.RELATION ? data.controls : data.relationControls}
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
            relationId={this.props.relationId}
            selectNodeId={this.props.selectNodeId}
            controls={data.actionId === ACTION_ID.RELATION ? data.relationControls : data.controls}
            data={data.conditions}
            updateSource={data => this.updateSource({ conditions: data })}
            projectId={this.props.companyId}
            singleCondition={data.appType === APP_TYPE.EXTERNAL_USER}
            excludingDepartmentSpecialFilter
          />
        )}

        {selectNodeType === NODE_TYPE.FIND_SINGLE_MESSAGE && (
          <div className="mTop20">
            <Checkbox
              className="InlineFlex"
              text={_l('在筛选条件的基础上，随机获取一个')}
              checked={data.random}
              onClick={checked => this.updateSource({ random: !checked })}
            />
          </div>
        )}

        {data.appType === APP_TYPE.USER && (
          <Fragment>
            <div className="mTop20 bold">{_l('获取汇报关系')}</div>
            <div className="mTop15" style={{ height: 23 }}>
              <Checkbox
                className="InlineFlex"
                text={_l('同时获取人员的汇报关系信息')}
                checked={data.relation}
                onClick={checked => this.updateSource({ relation: !checked })}
              />
            </div>
            <div className="mLeft25 Gray_75">
              {_l(
                '包含人员的直属上司、直接下属、所有下属；如果您的使用场景无需汇报关系相关信息，推荐不勾选以提升您的查询效率',
              )}
            </div>
          </Fragment>
        )}

        {selectNodeType === NODE_TYPE.FIND_SINGLE_MESSAGE && (
          <FindResult
            executeType={data.executeType}
            switchExecuteType={executeType => this.updateSource({ executeType })}
          />
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
      <div className="addActionBtn mTop25">
        <span
          className={data.appId ? 'ThemeBorderColor3' : 'Gray_bd borderColor_c'}
          onClick={() => this.updateSource({ conditions: [[{}]] })}
        >
          <i className="icon-add Font16" />
          {_l('筛选条件')}
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
          {...this.props}
          data={{ ...data }}
          icon={getIcons(selectNodeType, data.appType)}
          bg="BGBlue"
          updateSource={this.updateSource}
        />
        <div className="flex overflowHidden">
          <ScrollView>
            <div className="workflowDetailBox">{this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter
          {...this.props}
          isCorrect={
            _.includes([ACTION_ID.FROM_WORKSHEET, ACTION_ID.WORKSHEET_FIND], data.actionId) ||
            (!!data.selectNodeId && !!data.fields.length)
          }
          onSave={this.onSave}
        />
      </Fragment>
    );
  }
}
