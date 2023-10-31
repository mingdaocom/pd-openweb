import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Icon, LoadDiv, Support } from 'ming-ui';
import Confirm from 'ming-ui/components/Dialog/Confirm';
import { showEditFn, getRulesAll, deleteRules, saveFn } from '../actions/action';
import { Prompt } from 'react-router';
import './index.less';
import EditCon from '../modules/editCon';
import PeopleAvatar from '../modules/peopleAvatar';
import cx from 'classnames';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import _ from 'lodash';

let rules = [
  { type: 'hiddeRules', title: _l('隐藏的成员'), description: _l('被隐藏的成员 ，不会显示在通讯录中') },
  {
    type: 'refuseExternalDepRules',
    title: _l('限制查看外部门'),
    description: _l('被限制后，只能看到本部门的通讯录'),
    editDescription: _l('规则生效范围包含所选部门的子部门'),
    limitTxt: _l('只允许查看本部门通讯录'),
    extraTxt: _l('额外可见的成员'),
    ruleType: 10,
  },
  {
    type: 'refuseUserRules',
    title: _l('限制查看所有人'),
    description: _l('被隐藏的成员 被限制后，不能看到企业所有通讯录'),
    editDescription: '',
    limitTxt: _l('不能看到组织所有通讯录'),
    extraTxt: _l('额外可见的成员'),
    ruleType: 15,
  },
];

class ContactsHidden extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { projectId, dispatch } = this.props;

    dispatch(getRulesAll(projectId));
  }

  renderList = (type, ruleType) => {
    const { data = [], dispatch, projectId } = this.props;
    const rulesData = _.filter(data, it => it.ruleType === ruleType);
    return _.map(rulesData, (item, i) => {
      return (
        <div className="rulesBox" key={item.ruleId}>
          <span className="nameTop">{_l('规则 %0', i + 1)}</span>
          <div className="userBox">
            {_.map(item.items, user => {
              return (
                <div className="userItem">
                  {user.targetType === 20 || user.targetType === 30 ? (
                    <React.Fragment>
                      <span className={cx('depIcon', { orgRoleIcon: user.targetType === 30 })}>
                        <Icon className="department Hand" icon="department" />
                      </span>
                      <span className="fullname">{user.targetName}</span>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <PeopleAvatar user={user} />
                      <span className="fullname">{user.targetName}</span>
                    </React.Fragment>
                  )}
                </div>
              );
            })}
          </div>
          <span
            className="editRule"
            onClick={() => {
              dispatch(showEditFn(true, type, item.ruleId));
            }}
          >
            {_l('编辑')}
          </span>
          <span
            className="deleteRule"
            onClick={() => {
              Confirm({
                className: '',
                title: _l('确定删除这条规则么？'),
                okText: _l('确认'),
                buttonType: 'primary',
                cancelText: _l('取消'),
                onOk: () => {
                  dispatch(deleteRules(projectId, item.ruleId));
                },
              });
            }}
          >
            {_l('删除')}
          </span>
        </div>
      );
    });
  };

  renderCon = () => {
    const { data = [], dispatch } = this.props;
    return rules.map(item => {
      if (item.type === 'hiddeRules') return;
      return (
        <div className="ruleItem">
          <h6 className="Gray Font15">{item.title}</h6>
          <p className={cx('Gray_9e Font13 mTop12', { mBottom10: data.length > 0 })}>{item.description}</p>
          {this.renderList(item.type, item.ruleType)}
          <span
            className="addBtn Font13 Hand mTop24"
            onClick={e => {
              dispatch(showEditFn(true, item.type));
            }}
          >
            <Icon className="Font16 mRight5" icon="add" />
            {_l('新建规则')}
          </span>
        </div>
      );
    });
  };

  refreshFn = () => {
    const { dispatch, isEdit, projectId } = this.props;
    if (isEdit) {
      Confirm({
        className: '',
        title: _l('你修改的设置尚未保存，确定要离开吗？'),
        okText: _l('确认'),
        buttonType: 'primary',
        cancelText: _l('取消'),
        onOk: () => {
          this.setState({ errorIds: [] });
          dispatch(getRulesAll(projectId));
          dispatch(showEditFn(false));
        },
      });
    } else {
      this.setState({ errorIds: [] });
      dispatch(showEditFn(false));
    }
  };

  errorCallback = errorIds => {
    this.setState({ errorIds });
  };

  render() {
    const {
      showEdit = false,
      editType,
      dispatch,
      loading,
      isEdit,
      dataByRuleId = [],
      projectId,
      ruleId,
      isSaveing,
    } = this.props;
    if (loading) return <LoadDiv className="mTop10" />;
    const featureType = getFeatureStatus(projectId, VersionProductType.contactsHide);
    if (featureType === '2') {
      return (
        <div className="orgManagementWrap">
          {buriedUpgradeVersionDialog(projectId, VersionProductType.contactsHide, { dialogType: 'content' })}
        </div>
      );
    }
    if (this.state.pageLoading) {
      return <LoadDiv className="mTop80" />;
    }
    const currentEditRule = _.find(rules, it => it.type === editType) || {};

    return (
      <div className="contactsHiddenBox orgManagementWrap">
        {showEdit ? (
          <div className="editCon flexColumn">
            {isEdit && (
              <div>
                <Prompt when={true} message={_l('你修改的设置尚未保存，确定要离开吗？')} />
              </div>
            )}
            <div className="headerCon">
              <h5 className="Font17">
                <Icon
                  className="Font20 mRight5 Gray Hand"
                  icon="backspace"
                  onClick={() => {
                    this.refreshFn();
                  }}
                />
                {currentEditRule.title}
              </h5>
              <span className="Right Gray_75 Font13">{currentEditRule.editDescription}</span>
            </div>
            <div className="conBox flex">
              <EditCon
                rules={rules}
                editType={editType}
                currentEditRule={currentEditRule}
                errorIds={this.state.errorIds || []}
              />
              <span
                className={cx('saveBtn', { disable: !isEdit || dataByRuleId.length <= 0 })}
                onClick={() => {
                  if (isEdit && !isSaveing && dataByRuleId.length > 0) {
                    let data = [];
                    dataByRuleId.map(it => {
                      data.push({
                        ruleItemType: it.ruleItemType,
                        targetType: it.targetType,
                        targetId: it.targetId,
                      });
                    });
                    dispatch(saveFn(projectId, data, ruleId, currentEditRule.ruleType, this.errorCallback));
                  } else {
                    return;
                  }
                }}
              >
                {_l('保存')}
              </span>
            </div>
          </div>
        ) : (
          <div className="con flexColumn">
            <div className="headerCon orgManagementHeader">
              <h5 className="Font17">{_l('通讯录隔离')}</h5>
              <Support className="forHelp" type={2} href="https://help.mingdao.com/geli" text={_l('帮助')} />
            </div>
            <div className="conBox flex">
              <div className="">{this.renderCon(2)}</div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { contact } = state;
  return {
    ...contact,
  };
};

export default connect(mapStateToProps)(ContactsHidden);
