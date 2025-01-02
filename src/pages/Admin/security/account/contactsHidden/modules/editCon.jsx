import React from 'react';
import { connect } from 'react-redux';
import '../container/index.less';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import PeopleAvatar from './peopleAvatar';
import { dialogSelectOrgRole, dialogSelectDept, dialogSelectUser } from 'ming-ui/functions';
import MoreActionDia from './moreActionDia';
import { updateRulesByRuleId } from '../actions/action';
import _ from 'lodash';

const targetType = {
  user: 10, // 10=人员、20=部门
  dept: 20,
  orgRole: 30, // 组织角色
};
const ruleItemType = {
  self: 10, // 10=只查看本部、15=额外可见成员
  extra: 15,
  whiteList: 20,
};
class EditCon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showMoreActionSelf: false,
      showMoreActionExtra: false,
    };
  }

  updateData = data => {
    const { dispatch } = this.props;
    dispatch(updateRulesByRuleId(data));
  };

  addUser = (data, type) => {
    const $this = this;
    const { projectId } = this.props;
    const SelectUserSettingsForAdd = {
      unique: false,
      projectId: projectId,
      filterAll: true,
      filterFriend: true,
      filterOthers: true,
      filterOtherProject: true,
      dataRange: 2,
      callback: accountIds => {
        $this.addDataFn(accountIds, type, targetType.user);
      },
    };

    dialogSelectUser({
      fromAdmin: true,
      showMoreInvite: false,
      SelectUserSettings: SelectUserSettingsForAdd,
    });
  };

  addDept = (data, type) => {
    const { projectId } = this.props;
    const $this = this;

    dialogSelectDept({
      projectId,
      unique: false,
      fromAdmin: true,
      selectedDepartment: [],
      showCreateBtn: false,
      selectFn(departments) {
        $this.addDataFn(departments, type, targetType.dept);
      },
    });
  };

  addOrgRoles = type => {
    const { projectId } = this.props;
    dialogSelectOrgRole({
      projectId,
      onSave: roles => {
        this.addDataFn(roles, type, targetType.orgRole);
      },
    });
  };

  addDataFn = (datas, type, tTData) => {
    const { dataByRuleId } = this.props;
    let ids = [];
    _.map(datas, user => {
      let userData = {
        targetId:
          tTData === targetType.dept
            ? user.departmentId
            : tTData === targetType.orgRole
            ? user.organizeId
            : user.accountId,
        targetType: tTData,
        ruleItemType: type,
        targetName:
          tTData === targetType.dept
            ? user.departmentName
            : tTData === targetType.orgRole
            ? user.organizeName
            : user.fullname,
        peopleAvatar: tTData === targetType.user ? user.avatar : '',
      };
      if (
        !_.find(
          dataByRuleId,
          it =>
            userData.targetId === it.targetId &&
            userData.targetType === it.targetType &&
            userData.ruleItemType === it.ruleItemType,
        )
      ) {
        ids.push(userData);
      }
    });
    this.updateData(dataByRuleId.concat(ids));
  };

  renderRuleItem = (list, type) => {
    const { dataByRuleId, errorIds } = this.props;
    return (
      <div className={cx({ mBottom15: list.length })}>
        {_.map(list, user => {
          return (
            <div className={cx('userItem', { active: _.includes(errorIds, user.targetId) })}>
              <Icon
                className="Font24 Red delete Hand"
                icon="cancel"
                onClick={() => {
                  let data = dataByRuleId.filter(
                    it =>
                      !(it.targetId === user.targetId && type === it.ruleItemType && it.targetType === user.targetType),
                  );
                  this.updateData(data);
                }}
              />
              {user.targetType === targetType.dept || user.targetType === targetType.orgRole ? (
                <React.Fragment>
                  <span className={cx('depIcon', { orgRoleIcon: user.targetType === targetType.orgRole })}>
                    <Icon
                      className="department Hand"
                      icon={user.targetType === targetType.dept ? 'department' : 'user'}
                    />
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
    );
  };

  rulesCon = (data, type) => {
    const { currentEditRule } = this.props;
    const depOrRoleIndex = _.findIndex(
      data,
      it => it.targetType === targetType.dept || it.targetType === targetType.orgRole,
    );
    const list = data.filter(it => it.ruleItemType === ruleItemType.self || it.ruleItemType === ruleItemType.extra);
    const whiteDataList = data.filter(it => it.ruleItemType === ruleItemType.whiteList);

    return (
      <React.Fragment>
        {this.renderRuleItem(list, type)}
        <span
          className="addBtn Font13 Hand mLeft15"
          onClick={e => {
            if (currentEditRule.type === 'hideForAllUser') {
              this.addUser(
                list.filter(it => it.targetType === targetType.user),
                type,
              );
            } else if (type === ruleItemType.self) {
              this.setState({
                showMoreActionSelf: true,
              });
            } else {
              this.setState({
                showMoreActionExtra: true,
              });
            }
          }}
        >
          <Icon className="Font16 mRight5" icon="add" />
          {_l('添加')}
          <MoreActionDia
            onClickAway={() => {
              if (type === ruleItemType.self) {
                this.setState({
                  showMoreActionSelf: false,
                });
              } else {
                this.setState({
                  showMoreActionExtra: false,
                });
              }
            }}
            showMoreAction={type === ruleItemType.self ? this.state.showMoreActionSelf : this.state.showMoreActionExtra}
            addUser={() =>
              this.addUser(
                list.filter(it => it.targetType === targetType.user),
                type,
              )
            }
            addDept={() =>
              this.addDept(
                list.filter(it => it.targetType === targetType.dept),
                type,
              )
            }
            addOrgRoles={() => this.addOrgRoles(type)}
          />
        </span>
        {type === ruleItemType.self && depOrRoleIndex !== -1 && (
          <div className="whitelist">
            <div className="Gray_9e mBottom15">{_l('白名单')}</div>
            {this.renderRuleItem(whiteDataList, ruleItemType.whiteList)}
            <span
              className="addBtn Font13 Hand"
              onClick={e => {
                this.setState({ showMoreActionWhiteList: true });
              }}
            >
              <Icon className="Font16 mRight5" icon="add" />
              {_l('添加')}
              <MoreActionDia
                onClickAway={() => {
                  this.setState({ showMoreActionWhiteList: false });
                }}
                showMoreAction={this.state.showMoreActionWhiteList}
                addUser={() =>
                  this.addUser(
                    list.filter(it => it.targetType === targetType.user),
                    ruleItemType.whiteList,
                  )
                }
                addDept={() =>
                  this.addDept(
                    list.filter(it => it.targetType === targetType.dept),
                    ruleItemType.whiteList,
                  )
                }
                addOrgRoles={() => this.addOrgRoles(ruleItemType.whiteList)}
              />
            </span>
          </div>
        )}
      </React.Fragment>
    );
  };

  listCon = (data, type) => {
    return <div className="listCon">{this.rulesCon(data, type)}</div>;
  };

  extraCon = extra => {
    const { editType, dispatch, currentEditRule } = this.props;
    return (
      <div>
        <p className="Font13">{currentEditRule.extraTxt}</p>
        {this.listCon(extra, ruleItemType.extra)}
      </div>
    );
  };

  render() {
    const { editType, dispatch, dataByRuleId = [], currentEditRule = {} } = this.props;
    let hiddenList = dataByRuleId.filter(
      it => it.ruleItemType === ruleItemType.self || it.ruleItemType === ruleItemType.whiteList,
    ); // 只查看本部+白名单
    let extra = dataByRuleId.filter(it => it.ruleItemType === ruleItemType.extra); // 额外可见成员
    return (
      <div className="">
        <p className="Font13">{currentEditRule.limitTxt}</p>
        {this.listCon(hiddenList, ruleItemType.self)}
        {currentEditRule.type !== 'hideForAllUser' && this.extraCon(extra)}
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

export default connect(mapStateToProps)(EditCon);
