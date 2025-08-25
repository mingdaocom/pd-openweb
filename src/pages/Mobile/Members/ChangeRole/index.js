import React from 'react';
import { connect } from 'react-redux';
import { Button, Dialog, List, SpinLoading } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import * as actions from './redux/actions';
import './index.less';

class ChangeRole extends React.Component {
  constructor(props) {
    super(props);
    const { params } = props.match;

    this.state = {
      checkId: params.roleId,
      departmentsInfos: [],
      users: [],
    };
  }

  componentDidMount() {
    const { params } = this.props.match;
    $('html').addClass('changeRoleCon');
    this.props.dispatch({ type: 'MOBILE_ROLE_MOVE_FETCH_START' });
    this.props.dispatch(actions.getMembersList(params.appId, params.roleId, params.accountId));
  }

  componentWillUnmount() {
    this.props.dispatch({ type: 'MOBILE_ROLE_MOVE_FETCH_START' });
    $('html').removeClass('changeRoleCon');
  }

  render() {
    const { isRoleListLoading, roleList, moveRoleFetch } = this.props;
    let accountIds = _.map(this.state.users, ({ accountId }) => accountId);
    let departmentIds = _.map(this.state.departmentsInfos, ({ departmentId }) => departmentId);
    let departmentTreeIds = _.map(this.state.departmentsInfos, ({ departmentId }) => departmentId);
    let projectOrganizeIds = _.map(this.state.projectOrganizeInfos, ({ projectOrganizeId }) => projectOrganizeId);
    let jobIds = _.map(this.state.jobInfos, ({ jobId }) => jobId);
    const { params } = this.props.match;
    if (moveRoleFetch) {
      this.props.history.push(`/mobile/members/${params.appId}`);
      return '';
    }
    if (isRoleListLoading) {
      return (
        <div className="flexRow justifyContentCenter alignItemsCenter h100">
          <SpinLoading color="primary" />
        </div>
      );
    }

    return (
      <React.Fragment>
        <List style={{ overflow: 'scroll', background: '#fff' }}>
          {roleList.list
            .filter(it => !_.includes([100, 2, 1], it.roleType))
            .map(item => {
              if (!item.canSetMembers) return;
              return (
                <List.Item
                  key={item.roleId}
                  arrow={false}
                  extra={this.state.checkId === item.roleId ? <Icon icon="ok" className="Font28 isCheck" /> : ''}
                  onClick={() => {
                    if (params.roleId === item.roleId) return;
                    this.setState({
                      checkId: item.roleId,
                      users: item.users,
                      departmentsInfos: item.departmentsInfos,
                    });
                  }}
                >
                  <span className={cx('Gray Font16')}>{item.name}</span>
                </List.Item>
              );
            })}
        </List>
        <div className="mLeft8 mRight8 mTop20">
          <Button
            size="middle"
            color="primary"
            className="w100"
            onClick={() => {
              if (!this.state.checkId) {
                Dialog.alert({
                  content: _l('请选择要更换的角色'),
                });
              } else {
                this.props.dispatch(
                  actions.removeUserToRole({
                    projectId: params.projectId === 'individual' ? '' : params.projectId,
                    appId: params.appId,
                    sourceAppRoleId: params.roleId,
                    resultAppRoleIds: [this.state.checkId],
                    userIds:
                      params.accountId === 'undefined'
                        ? accountIds
                        : accountIds.concat(params.accountId === 'undefined' ? null : params.accountId),
                    departmentIds:
                      params.departmentId === 'undefined' ? departmentIds : departmentIds.concat(params.departmentId),
                    departmentTreeIds:
                      params.departmentTreeId === 'undefined'
                        ? departmentTreeIds
                        : departmentTreeIds.concat(params.departmentTreeId),
                    projectOrganizeIds:
                      params.projectOrganizeId === 'undefined'
                        ? projectOrganizeIds
                        : projectOrganizeIds.concat(params.projectOrganizeId),
                    jobIds: params.jobId === 'undefined' ? jobIds : jobIds.concat(params.jobId),
                  }),
                );
              }
            }}
          >
            {_l('确定')}
          </Button>
        </div>
      </React.Fragment>
    );
  }
}

export default connect(state => {
  const { roleList, isRoleListLoading, moveRoleFetch } = state.mobile;
  return {
    roleList,
    moveRoleFetch,
    isRoleListLoading,
  };
})(ChangeRole);
