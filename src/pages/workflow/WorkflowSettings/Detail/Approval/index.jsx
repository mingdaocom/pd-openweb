import React, { Component, Fragment } from 'react';
import { ScrollView, Dropdown, Checkbox, LoadDiv } from 'ming-ui';
import cx from 'classnames';
import { NODE_TYPE } from '../../enum';
import flowNode from '../../../api/flowNode';
import {
  SelectUserDropDown,
  Member,
  SelectNodeObject,
  DetailHeader,
  DetailFooter,
  WriteFields,
  ButtonName,
} from '../components';

export default class Approval extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      showSelectUserDialog: false,
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
  getNodeDetail(props) {
    const { processId, selectNodeId, selectNodeType } = props;

    flowNode.getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType }).then(result => {
      this.setState({ data: result });
    });
  }

  /**
   * 下拉框更改
   */
  onChange = selectNodeId => {
    const { data } = this.state;
    const selectNodeObj = _.find(data.appList, item => item.nodeId === selectNodeId);

    this.updateSource({ selectNodeId, selectNodeObj });

    if (data.isCallBack) {
      this.getCallBackNodeNames(selectNodeId, data.callBackType);
    }
  };

  /**
   * render member
   */
  renderMember() {
    const { data, showSelectUserDialog } = this.state;
    const { accounts } = data;
    const updateAccounts = ({ accounts }) => {
      this.updateSource({ accounts, countersignType: accounts.length <= 1 ? 0 : 3 }, () => {
        this.switchApprovalSettings(false, 16);
      });
    };

    return (
      <div className="mTop15">
        <Member type={NODE_TYPE.APPROVAL} accounts={accounts} updateSource={updateAccounts} />

        <div
          className="flexRow mTop12 ThemeColor3 workflowDetailAddBtn"
          onClick={() => this.setState({ showSelectUserDialog: true })}
        >
          <i className="Font28 icon-task-add-member-circle mRight10" />
          {_l('添加审批人')}
          <SelectUserDropDown
            appId={this.props.relationType === 2 ? this.props.relationId : ''}
            visible={showSelectUserDialog}
            companyId={this.props.companyId}
            processId={this.props.processId}
            nodeId={this.props.selectNodeId}
            unique={false}
            accounts={accounts}
            updateSource={updateAccounts}
            onClose={() => this.setState({ showSelectUserDialog: false })}
          />
        </div>
      </div>
    );
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
    const {
      name,
      selectNodeId,
      accounts,
      countersignType,
      operationTypeList,
      isCallBack,
      callBackType,
      formProperties,
      passBtnName,
      overruleBtnName,
      auth,
    } = data;

    if (!selectNodeId) {
      alert(_l('必须先选择一个对象'), 2);
      return;
    }

    if (!accounts.length) {
      alert(_l('必须指定审批人'), 2);
      return;
    }

    if (saveRequest) {
      return;
    }

    flowNode
      .saveNode({
        processId: this.props.processId,
        nodeId: this.props.selectNodeId,
        flowNodeType: this.props.selectNodeType,
        name: name.trim(),
        selectNodeId,
        accounts,
        countersignType,
        operationTypeList,
        isCallBack,
        callBackType,
        formProperties,
        passBtnName: passBtnName.trim() || _l('通过'),
        overruleBtnName: overruleBtnName.trim() || _l('否决'),
        auth,
      })
      .then(result => {
        this.props.updateNodeData(result);
        this.props.closeDetail();
      });

    this.setState({ saveRequest: true });
  };

  /**
   * 切换审批设置
   */
  switchApprovalSettings(checked, value) {
    const { data } = this.state;
    const operationTypeList = _.cloneDeep(data.operationTypeList);

    if (checked) {
      operationTypeList.push(value);
    } else {
      _.remove(operationTypeList, item => item === value);
    }

    this.updateSource({ operationTypeList });
  }

  /**
   * 获取回滚节点的名称
   */
  getCallBackNodeNames(id, callBackType) {
    const { processId, selectNodeId } = this.props;

    flowNode.getCallBackNodeNames({ processId, nodeId: selectNodeId, selectNodeId: id, callBackType }).then(result => {
      this.updateSource({ callBackNodeList: result });
    });
  }

  /**
   * 意见必填修改
   */
  opinionRequiredChange(checked, key) {
    const { data } = this.state;
    const currentAuth = [].concat(data.auth[key]);

    if (checked) {
      currentAuth.push(100);
    } else {
      _.remove(currentAuth, item => item === 100);
    }

    this.updateSource({ auth: Object.assign({}, data.auth, { [key]: currentAuth }) });
  }

  /**
   * 认证必填修改
   */
  authRequiredChange(checked, key) {
    const { data } = this.state;
    const currentAuth = [].concat(data.auth[key]).filter(item => item === 100);
    const value = data.auth.passTypeList.concat(data.auth.overruleTypeList).filter(item => item !== 100)[0] || 1;

    if (checked) {
      currentAuth.push(value);
    }

    this.updateSource({ auth: Object.assign({}, data.auth, { [key]: currentAuth }) });
  }

  /**
   * 认证等级修改
   */
  authRankChange = value => {
    const { data } = this.state;
    const passTypeList = data.auth.passTypeList.filter(item => item === 100);
    const overruleTypeList = data.auth.overruleTypeList.filter(item => item === 100);

    if (data.auth.passTypeList.filter(item => item !== 100).length) {
      passTypeList.push(value);
    }

    if (data.auth.overruleTypeList.filter(item => item !== 100).length) {
      overruleTypeList.push(value);
    }

    this.updateSource({ auth: { passTypeList, overruleTypeList } });
  };

  render() {
    const { data } = this.state;
    const personsPassing = [
      { text: _l('或签（一名审批人通过或否决即可）'), value: 3 },
      { text: _l('会签（需所有审批人通过）'), value: 1 },
      { text: _l('会签（只需一名审批人通过，否决需全员否决）'), value: 2 },
    ];
    const authTypeListText = {
      1: _l('签名'),
      2: _l('四级：实名'),
      3: _l('三级：实名+实人'),
      4: _l('二级：实名+实人+网证（开发中...）'),
      5: _l('一级：实名+实人+网证+实证（开发中...）'),
    };

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          data={{ ...data, selectNodeType: this.props.selectNodeType }}
          icon="icon-workflow_ea"
          bg="BGViolet"
          closeDetail={this.props.closeDetail}
          updateSource={this.updateSource}
        />
        <div className="flex mTop20">
          <ScrollView>
            <div className="workflowDetailBox">
              <div className="Font13 bold">{_l('审批对象')}</div>
              <div className="Font13 Gray_9e mTop10">{_l('当前流程中的节点对象')}</div>

              <SelectNodeObject
                appList={data.appList}
                selectNodeId={data.selectNodeId}
                selectNodeObj={data.selectNodeObj}
                onChange={this.onChange}
              />

              <div className="Font13 bold mTop20">{_l('审批人')}</div>
              {this.renderMember()}

              <div className="Font13 bold mTop20">{_l('多人审批时采用的审批方式')}</div>
              <Dropdown
                className="flowDropdown mTop10"
                data={personsPassing}
                value={data.countersignType}
                border
                onChange={countersignType => {
                  this.updateSource({ countersignType, operationTypeList: [], isCallBack: false });
                }}
              />

              <div className="Font13 bold mTop25">{_l('审批设置')}</div>

              {data.countersignType !== 2 && (
                <Checkbox
                  className="mTop15 flexRow"
                  text={_l('允许审批人转审')}
                  checked={_.includes(data.operationTypeList, 6)}
                  onClick={checked => this.switchApprovalSettings(!checked, 6)}
                />
              )}

              {_.includes([1, 2], data.countersignType) && (
                <Checkbox
                  className="mTop15 flexRow"
                  text={_l('允许添加审批人')}
                  checked={_.includes(data.operationTypeList, 16)}
                  onClick={checked => this.switchApprovalSettings(!checked, 16)}
                />
              )}

              {!_.includes([1, 2], data.countersignType) && (
                <Checkbox
                  className="mTop15 flexRow"
                  text={_l('允许审批人加签')}
                  checked={_.includes(data.operationTypeList, 7)}
                  onClick={checked => this.switchApprovalSettings(!checked, 7)}
                />
              )}

              {data.countersignType !== 2 && (
                <Fragment>
                  <div className={cx('flexRow alignItemsCenter', data.isCallBack ? 'mTop10' : 'mTop15')}>
                    <Checkbox
                      className="flex flexRow"
                      text={_l('否决后，允许退回')}
                      disabled={data.countersignType === 2}
                      checked={data.isCallBack}
                      onClick={checked => {
                        this.updateSource({ isCallBack: !checked, callBackType: 0 });
                        if (data.selectNodeId && !checked) {
                          this.getCallBackNodeNames(data.selectNodeId, 0);
                        }
                      }}
                    />

                    {data.isCallBack && (
                      <Fragment>
                        <div className="Gray_75">{_l('处理完成后')}</div>
                        <Dropdown
                          menuStyle={{ left: 'inherit', right: 0 }}
                          style={{ marginTop: -1 }}
                          data={[
                            { text: _l('重新执行流程'), value: 0 },
                            { text: _l('直接返回审批节点'), value: 1 },
                          ]}
                          value={data.callBackType}
                          onChange={callBackType => {
                            this.updateSource({ callBackType });
                            if (data.selectNodeId) {
                              this.getCallBackNodeNames(data.selectNodeId, callBackType);
                            }
                          }}
                        />
                      </Fragment>
                    )}
                  </div>
                  {data.isCallBack && (
                    <div className="backBox">
                      <div className="Font12 Gray_9e">{_l('允许退回的节点')}</div>
                      <div className="mTop4">{data.callBackNodeList.join('、') || _l('无可退回节点')}</div>
                    </div>
                  )}
                </Fragment>
              )}

              <div className="Font13 bold mTop25">{_l('审批意见')}</div>
              <div className="flexRow mTop15">
                <Checkbox
                  className="InlineFlex flex"
                  text={_l('通过时必填')}
                  checked={_.includes(data.auth.passTypeList, 100)}
                  onClick={checked => this.opinionRequiredChange(!checked, 'passTypeList')}
                />
                <Checkbox
                  className="InlineFlex flex"
                  text={_l('否决时必填')}
                  checked={_.includes(data.auth.overruleTypeList, 100)}
                  onClick={checked => this.opinionRequiredChange(!checked, 'overruleTypeList')}
                />
              </div>

              <div className="Font13 bold mTop25">
                {data.authTypeList.length === 1 ? authTypeListText[data.authTypeList[0].value] : _l('认证')}
              </div>
              <div className="flexRow mTop15">
                <Checkbox
                  className="InlineFlex flex"
                  text={_l('通过时必须认证')}
                  checked={!!data.auth.passTypeList.filter(i => i !== 100).length}
                  onClick={checked => this.authRequiredChange(!checked, 'passTypeList')}
                />
                <Checkbox
                  className="InlineFlex flex"
                  text={_l('否决时必须认证')}
                  checked={!!data.auth.overruleTypeList.filter(i => i !== 100).length}
                  onClick={checked => this.authRequiredChange(!checked, 'overruleTypeList')}
                />
              </div>

              {data.authTypeList.length === 1 ||
              data.auth.passTypeList.filter(i => i !== 100).length +
                data.auth.overruleTypeList.filter(i => i !== 100).length ===
                0 ? null : (
                <Fragment>
                  <div className="Font13 bold mTop25">{_l('认证等级')}</div>
                  <Dropdown
                    className="flowDropdown mTop10"
                    data={data.authTypeList.map(({ value, disabled }) => {
                      return { value, text: authTypeListText[value], disabled };
                    })}
                    value={data.auth.passTypeList.concat(data.auth.overruleTypeList).filter(item => item !== 100)[0]}
                    border
                    onChange={this.authRankChange}
                  />
                </Fragment>
              )}

              {data.selectNodeId && (
                <Fragment>
                  <div className="Font13 bold mTop25">{_l('设置字段')}</div>
                  <WriteFields
                    processId={this.props.processId}
                    nodeId={this.props.selectNodeId}
                    selectNodeId={data.selectNodeId}
                    data={data.formProperties}
                    updateSource={this.updateSource}
                  />
                </Fragment>
              )}

              <div className="Font13 bold mTop25">{_l('按钮名称')}</div>
              <ButtonName
                dataKey="passBtnName"
                name={data.passBtnName}
                buttonName={_l('通过按钮')}
                onChange={this.updateSource}
              />
              <ButtonName
                dataKey="overruleBtnName"
                name={data.overruleBtnName}
                buttonName={_l('否决按钮')}
                onChange={this.updateSource}
              />
            </div>
          </ScrollView>
        </div>
        <DetailFooter
          isCorrect={data.selectNodeId && !!data.accounts.length}
          onSave={this.onSave}
          closeDetail={this.props.closeDetail}
        />
      </Fragment>
    );
  }
}
