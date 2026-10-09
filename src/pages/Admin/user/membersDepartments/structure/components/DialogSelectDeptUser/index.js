import React, { Component } from 'react';
import _ from 'lodash';
import { LoadDiv, ScrollView } from 'ming-ui';
import { Checkbox, Input, Modal } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import departmentController from 'src/api/department';
import './index.less';

const USER_CHECKBOX_STYLES = {
  root: { flex: 1, minWidth: 0, alignItems: 'center' },
  label: { display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, paddingInlineEnd: 0 },
};

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
      <Modal
        width={480}
        open={visible}
        title={_l('设置部门负责人')}
        mask={{ closable: true }}
        keyboard
        onCancel={onCancel}
        onOk={this.onOk}
      >
        <div className="selectDepartmentUserContainer overflowHidden">
          <div>
            <Input
              type="text"
              className="searchInput"
              value={keywords}
              allowClear
              prefix={<span className="icon-search textTertiary Font20" />}
              placeholder={_l('搜索成员')}
              onChange={e =>
                this.setState(
                  { keywords: e.target.value, pageIndex: 1 },
                  _.debounce(() => this.getData(), 500),
                )
              }
            />
          </div>
          {!loading && _.isEmpty(dataList) ? (
            <div className="selectDepartmentUserContent emptyUserWrap flexColumn justifyContentCenter alignItemsCenter">
              <div className="iconWrap">
                <i className="icon-Empty_data" />
              </div>
              <div className="mTop10 textSecondary">{_.trim(keywords) ? _l('无搜索结果') : _l('暂无成员')}</div>
            </div>
          ) : (
            <div className="selectDepartmentUserContent">
              <ScrollView className="h100" onScrollEnd={this.onScrollEnd}>
                {dataList.map(item => {
                  const { accountId, avatar, fullname, job } = item;
                  return (
                    <div className="userItem" key={accountId}>
                      <Checkbox
                        checked={_.includes(selectedUsersIds, accountId)}
                        styles={USER_CHECKBOX_STYLES}
                        onChange={event => this.checkedCurrentUser(!event.target.checked, item)}
                      >
                        <img className="circle userAvatar InlineBlock" src={avatar} alt={fullname} />
                        <span className="userName overflow_ellipsis">{fullname}</span>
                        <span className="profession overflow_ellipsis">{job}</span>
                      </Checkbox>
                    </div>
                  );
                })}
              </ScrollView>
              {loading && <LoadDiv />}
            </div>
          )}
        </div>
      </Modal>
    );
  }
}

export function useDialogSelectDeptUser() {
  return useFunctionWrapComponent(SelectDeptUser);
}
