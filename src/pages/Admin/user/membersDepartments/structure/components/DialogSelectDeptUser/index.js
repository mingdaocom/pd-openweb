import React, { Component } from 'react';
import _ from 'lodash';
import { Dialog, LoadDiv, ScrollView } from 'ming-ui';
import Checkbox from 'ming-ui/components/Checkbox';
import FunctionWrap from 'ming-ui/components/FunctionWrap';
import departmentController from 'src/api/department';
import './index.less';

export default class SelectDeptUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageIndex: 1,
      pageSize: 20,
      keywords: '',
      selectedUsersIds: props.selectedUsersIds,
      dataList: [],
      loading: true,
    };
  }
  componentDidMount() {
    this.getData();
  }

  getData = () => {
    const { projectId, departmentId } = this.props;
    const { keywords = '', pageIndex, pageSize, dataList } = this.state;
    this.setState({ loading: true });
    departmentController
      .pagedDeptAccountShrotInfos({
        projectId,
        departmentId,
        keywords: _.trim(keywords),
        pageIndex,
        pageSize,
      })
      .then(res => {
        const { list = [], pageIndex } = res;
        this.setState({
          isMore: list.length >= pageSize,
          dataList: pageIndex === 1 ? list : dataList.concat(list),
          loading: false,
        });
      });
  };

  checkedCurrentUser = (checked, user) => {
    const { isUnique, maxCount } = this.props;
    const { selectedUsersIds } = this.state;
    const copySelectedUsersIds = !checked
      ? selectedUsersIds.concat(user.accountId)
      : selectedUsersIds.filter(v => v !== user.accountId);

    if (!isUnique && maxCount && maxCount < copySelectedUsersIds.length) {
      alert(_l('最多选择%0人', maxCount), 2);
      return;
    }

    this.setState({
      selectedUsersIds: copySelectedUsersIds,
    });
  };

  onScrollEnd = () => {
    const { isMore, loading, pageIndex } = this.state;
    if (!isMore || loading) return;
    this.setState({ pageIndex: pageIndex + 1 }, this.getData);
  };

  onOk = () => {
    const { callback = () => {}, onCancel } = this.props;
    const { dataList, selectedUsersIds } = this.state;

    const accounts = dataList.filter(item => _.includes(selectedUsersIds, item.accountId));
    callback(accounts);
    onCancel();
  };

  render() {
    const { visible, onCancel = () => {} } = this.props;
    const { dataList, loading, selectedUsersIds, keywords = '' } = this.state;

    return (
      <Dialog title={_l('设置部门负责人')} visible={visible} onCancel={onCancel} onOk={this.onOk}>
        <div className="selectDepartmentUserContainer overflowHidden">
          <div className="selectDepartmentUserContainer_search">
            <span className="searchIcon icon-search"></span>
            <input
              type="text"
              className="searchInput"
              placeholder={_l('搜索成员')}
              onChange={e =>
                this.setState(
                  { keywords: e.target.value, pageIndex: 1 },
                  _.debounce(() => this.getData(), 500),
                )
              }
            />
            <span className="searchClose icon-cancel"></span>
          </div>
          {!loading && _.isEmpty(dataList) ? (
            <div className="selectDepartmentUserContent emptyUserWrap flexColumn justifyContentCenter alignItemsCenter">
              <div className="iconWrap">
                <i className="icon-Empty_data" />
              </div>
              <div className="mTop10 Gray_75">{_.trim(keywords) ? _l('无搜索结果') : _l('暂无成员')}</div>
            </div>
          ) : (
            <div className="selectDepartmentUserContent">
              <ScrollView className="h100" onScrollEnd={this.onScrollEnd}>
                {dataList.map(item => {
                  const { accountId, avatar, fullname, job } = item;
                  return (
                    <div className="userItem">
                      <Checkbox
                        checked={_.includes(selectedUsersIds, accountId)}
                        onClick={checked => this.checkedCurrentUser(checked, item)}
                      />
                      <img className="circle userAvatar InlineBlock" src={avatar} alt={fullname} />
                      <span className="userName overflow_ellipsis">{fullname}</span>
                      <span className="profession overflow_ellipsis">{job}</span>
                    </div>
                  );
                })}
              </ScrollView>
              {loading && <LoadDiv />}
            </div>
          )}
        </div>
      </Dialog>
    );
  }
}

export const dialogSelectDeptUser = props => FunctionWrap(SelectDeptUser, { ...props });
