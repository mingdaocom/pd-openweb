import React from 'react';
import { connect } from 'react-redux';
import '../container/index.less';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import PeopleAvatar from './peopleAvatar';
import DialogSelectDept from 'src/components/dialogSelectDept';
import MoreActionDia from './moreActionDia';
import { updateRulesByRuleId } from '../actions/action';

const targetType = {
  user: 10, // 10=人员、20=部门
  dept: 20,
};
const ruleItemType = {
  self: 10, // 10=只查看本部、15=额外可见成员
  extra: 15,
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
    import('src/components/dialogSelectUser/dialogSelectUser').then(() => {
      $({}).dialogSelectUser({
        fromAdmin: true,
        showMoreInvite: false,
        SelectUserSettings: SelectUserSettingsForAdd,
      });
    });
  };

  addDept = (data, type) => {
    const { projectId } = this.props;
    const $this = this;
    // const { departmentInfos } = data
    new DialogSelectDept({
      projectId,
      unique: false,
      fromAdmin: true,
      // selectedDepartment: departmentInfos,
      selectedDepartment: [],
      showCreateBtn: false,
      selectFn(departments) {
        $this.addDataFn(departments, type, targetType.dept);
      },
    });
  };

  addDataFn = (datas, type, tTData) => {
    const { dataByRuleId } = this.props;
    let ids = [];
    _.map(datas, user => {
      let userData = {
        targetId: tTData === targetType.dept ? user.departmentId : user.accountId,
        targetType: tTData,
        ruleItemType: type,
        targetName: tTData === targetType.dept ? user.departmentName : user.fullname,
        peopleAvatar: tTData === targetType.dept ? '' : user.avatar,
      };
      if (
        !_.find(dataByRuleId, it => userData.targetId === it.targetId && userData.targetType === it.targetType && userData.ruleItemType === it.ruleItemType)
      ) {
        ids.push(userData);
      }
    });
    this.updateData(dataByRuleId.concat(ids));
  };

  rulesCon = (list, type) => {
    const { dataByRuleId, errorIds } = this.props;

    return (
      <React.Fragment>
        <div className={cx({ mBottom15: list.length })}>
          {_.map(list, user => {
            return (
              <div className={cx('userItem', { active: _.includes(errorIds, user.targetId) })}>
                <Icon
                  className="Font24 Red delete Hand"
                  icon="cancel"
                  onClick={() => {
                    let data = dataByRuleId.filter(it => !(it.targetId === user.targetId && type === it.ruleItemType && it.targetType === user.targetType));
                    this.updateData(data);
                  }}
                />
                {user.targetType === targetType.dept ? (
                  <React.Fragment>
                    <span className="depIcon">
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
          className="addBtn Font13 Hand mLeft15"
          onClick={e => {
            if (type === ruleItemType.self) {
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
          {
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
                  type
                )
              }
              addDept={() =>
                this.addDept(
                  list.filter(it => it.targetType === targetType.dept),
                  type
                )
              }
            />
          }
        </span>
      </React.Fragment>
    );
  };

  listCon = (data, type) => {
    const { editType, dispatch, rulesType } = this.props;
    return (
      <div className="listCon">
        {this.rulesCon(data, type)}
        {/* {editType === rulesType[1] && <div className="noLimite">
        <p className='Gray_9e Font13'>{_l('不被限制的成员')}</p>
        {this.rulesCon(list)}
      </div>} */}
      </div>
    );
  };

  extraCon = extra => {
    const { editType, dispatch, rulesType } = this.props;
    return (
      <div>
        <p className="Font13">
          {editType === rulesType[0] ? _l('以下成员可以看到被隐藏的成员') : editType === rulesType[1] ? _l('额外可见的成员') : _l('额外可见的成员')}
        </p>
        {this.listCon(extra, ruleItemType.extra)}
      </div>
    );
  };

  render() {
    const { editType, dispatch, rulesType, dataByRuleId = [] } = this.props;
    let hiddenLsit = dataByRuleId.filter(it => it.ruleItemType === ruleItemType.self); // 只查看本部
    let extra = dataByRuleId.filter(it => it.ruleItemType === ruleItemType.extra); // 额外可见成员
    return (
      <div className="">
        <p className="Font13">
          {editType === rulesType[0] ? _l('对所有人隐藏的成员') : editType === rulesType[1] ? _l('只允许查看本部门通讯录') : _l('无法查看所有人的成员')}
        </p>
        {this.listCon(hiddenLsit, ruleItemType.self)}
        {this.extraCon(extra)}
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
