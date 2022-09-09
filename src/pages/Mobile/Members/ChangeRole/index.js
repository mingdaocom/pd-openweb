import React from 'react';
import { connect } from 'react-redux';
import * as actions from './redux/actions';
import {
  WingBlank,
  WhiteSpace,
  Card,
  List,
  Flex,
  ActionSheet,
  Modal,
  ActivityIndicator,
  Button,
  Switch,
} from 'antd-mobile';
import { Icon } from 'ming-ui';
import { ROLE_TYPES, ROLE_CONFIG } from 'pages/Roles/config';
import cx from 'classnames';
import './index.less';

let modal = null;
class ChangeRole extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checkId: '',
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
    if (modal) {
      modal.close();
    } else {
      modal = null;
    }
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
        <Flex justify="center" align="center" className="h100">
          <ActivityIndicator size="large" />
        </Flex>
      );
    }
    return (
      <React.Fragment>
        <List style={{ overflow: 'scroll', background: '#fff' }}>
          {roleList.list.map((item, i) => {
            return (
              <List.Item
                key={item.roleId}
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
                <span className={cx('Gray Font16', { Gray_9e: params.roleId === item.roleId })}>{item.name}</span>
              </List.Item>
            );
          })}
        </List>
        <WingBlank size="md">
          <Button
            type="primary"
            className="mTop20"
            onClick={() => {
              if (!this.state.checkId) {
                modal = Modal.alert('', _l('请选择要更换的角色'), [{ text: _l('确定'), onPress: () => {} }]);
              } else {
                this.props.dispatch(
                  actions.removeUserToRole({
                    projectId: params.projectId === 'individual' ? '' : params.projectId,
                    appId: params.appId,
                    sourceAppRoleId: params.roleId,
                    resultAppRoleId: this.state.checkId,
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
        </WingBlank>
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
