import React, { Component } from 'react';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import './index.less';
import { Link } from 'react-router-dom';
import { LoadDiv, DatePicker, Icon, ScrollView, DeleteReconfirm, Dialog, Checkbox, Button, Dropdown } from 'ming-ui';
import cx from 'classnames';
import Search from 'src/pages/workflow/components/Search';
import UserHead from 'src/pages/feed/components/userHead/userHead';
import PaginationWrap from '../components/PaginationWrap';
import ajaxRequest from 'src/api/externalPortal';
import projectAjax from 'src/api/project';
import _ from 'lodash';
import moment from 'moment';

const DATE_TYPE = [
  { key: ['lastTimeStart', 'lastTimeTimeEnd'], text: _l('最近登录时间'), id: 'last' },
  { key: ['createTimeStart', 'createTimeEnd'], text: _l('注册时间'), id: 'create' },
];

const formatDate = value => {
  return moment(value).format('YYYY-MM-DD');
};

const getValue = (value, type) => {
  if (type === 'start') {
    return value ? `${value} 00:00` : value;
  }
  return value ? `${value} 23:59` : value;
};

export default class Portal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: null,
      total: 0,
      selectedColumnIds: [],
      loading: false,
      projectId: '',
      apps: [],

      appId: '',
      keywords: '',
      pageIndex: 1,
      pageSize: 50,
      createTimeStart: '',
      createTimeEnd: '',
      lastTimeStart: '',
      lastTimeTimeEnd: '',
      sortType: 0,

      expireDays: 0,
      limitExternalUserCount: 0,
      allowUpgradeExternalPortal: false,
      showOption: false,
      allCount: 0,
    };
  }

  postList = null;

  componentDidMount() {
    const { projectId } = this.props.match.params;
    projectAjax.getProjectLicenseSupportInfo({ projectId }).then(res => {
      this.setState(
        {
          expireDays: (res.nextLicense || {}).expireDays,
          limitExternalUserCount: res.limitExternalUserCount,
          allowUpgradeExternalPortal: res.allowUpgradeExternalPortal,
          projectId,
          showOption: res.licenseType === 1,
          loading: true,
        },
        () => {
          this.getPortalList();
          this.getApps();
        },
      );
    });
  }

  /**
   * 获取所有设置外部用户的应用
   */
  getApps() {
    ajaxRequest
      .getAppInfoByProject({
        projectId: this.state.projectId,
        pageIndex: 0,
        pageSize: 0,
      })
      .then(res => {
        this.setState({
          apps: (res.apps || []).map(({ appId: value, appName: text }) => ({ text, value })),
        });
      });
  }

  /**
   * 获取外部门户列表
   */
  getPortalList() {
    const {
      pageIndex,
      pageSize,
      keywords,
      createTimeStart,
      createTimeEnd,
      lastTimeStart,
      lastTimeTimeEnd,
      sortType,
      appId,
      projectId,
    } = this.state;

    this.setState({ loading: true });

    if (this.postList) {
      this.postList.abort();
    }

    this.postList = ajaxRequest.getUsers({
      projectId,
      pageIndex,
      pageSize,
      keywords,
      createTimeStart: getValue(createTimeStart, 'start'),
      createTimeEnd: getValue(createTimeEnd, 'end'),
      lastTimeStart: getValue(lastTimeStart, 'start'),
      lastTimeTimeEnd: getValue(lastTimeTimeEnd, 'end'),
      appId,
      sortType,
      isReturnTotal: pageIndex === 1 ? true : false,
    });
    this.postList.then(({ users, total }) => {
      this.setState({
        list: users,
        loading: false,
        total: pageIndex === 1 ? total : this.state.total,
        allCount:
          pageIndex === 1 &&
          !appId &&
          !getValue(createTimeStart, 'start') &&
          !getValue(createTimeEnd, 'end') &&
          !getValue(lastTimeStart, 'start') &&
          !getValue(lastTimeTimeEnd, 'end') &&
          !keywords &&
          sortType === 0
            ? total
            : this.state.allCount,
      });
    });
  }

  /**
   * 渲染列表
   */
  renderList() {
    const { list, pageIndex, loading } = this.state;

    if (list === null) return;

    if (!list.length) {
      return (
        <div className="manageListNull flex flexColumn">
          <div className="iconWrap">
            <Icon icon="draft-box" />
          </div>
          <div className="emptyExplain">{_l('无数据')}</div>
        </div>
      );
    }

    return (
      <ScrollView className="flex">
        {loading ? <LoadDiv className="mTop15" size="small" /> : list.map(item => this.renderListItem(item))}
      </ScrollView>
    );
  }

  /**
   * 渲染单个列表项
   */
  renderListItem(item) {
    const { selectedColumnIds = [] } = this.state;
    return (
      <div className="flexRow manageList" key={item.accountId}>
        <div className="w40 mRight20">
          <Checkbox
            size="small"
            checked={selectedColumnIds.includes(item.accountId)}
            onClick={() => this.handleSelect(item.accountId)}
          />
        </div>
        <div className="flex name mLeft10 mRight40 flexRow minWidth110">
          <UserHead size={28} lazy={'false'} user={{ userHead: item.avatar, accountId: item.accountId }} />
          <div className="mLeft12 ellipsis flex mRight20">{item.name}</div>
        </div>
        <div className="w150 ellipsis">{item.mobilePhone}</div>
        <div className="w150 ellipsis">{item.email}</div>
        <div className="columnWidth ellipsis">{item.appName}</div>
        <div className="columnWidth ellipsis">
          {item.createTime ? moment(item.createTime).format('YYYY年MM月DD日 HH:mm') : ''}
        </div>
        <div className="columnWidth ellipsis">
          {item.lastTime ? moment(item.lastTime).format('YYYY年MM月DD日 HH:mm') : ''}
        </div>
        <div className="w60 mRight20 TxtCenter">
          <span className="Hand deleteBtn" onClick={() => this.handleDelete([item.accountId])}>
            {_l('删除')}
          </span>
        </div>
      </div>
    );
  }

  /**
   * 批量选择
   */
  handleSelect(accountId) {
    this.setState({
      selectedColumnIds: _.includes(this.state.selectedColumnIds, accountId)
        ? this.state.selectedColumnIds.filter(i => i !== accountId)
        : this.state.selectedColumnIds.concat([accountId]),
    });
  }

  /**
   * 删除
   */
  handleDelete(ids) {
    Dialog.confirm({
      title: <span className="Red Font17 Bold">{_l('删除用户')}</span>,
      description: _l('删除后用户需要重新注册才可访问所在的应用'),
      onOk: () => {
        const exAccountInfos = ids.map(item => {
          return { exAccountId: item, appId: (_.find(this.state.list || [], i => i.accountId === item) || {}).appId };
        });
        ajaxRequest
          .removeUsersByPorject({
            projectId: this.state.projectId,
            exAccountInfos,
          })
          .then(res => {
            if (res) {
              alert(_l('删除成功'));
              this.updateState({ selectedColumnIds: [] });
            }
          });
      },
    });
  }

  /**
   * 更新状态
   */
  updateState = obj => {
    this.setState({ list: null, pageIndex: 1, ...obj }, this.getPortalList);
  };

  changPage = page => {
    this.setState({ pageIndex: page }, this.getPortalList);
  };

  render() {
    const {
      loading,
      pageIndex,
      list,
      selectedColumnIds,
      allowUpgradeExternalPortal,
      expireDays,
      limitExternalUserCount,
      apps,
      appId,
      sortType,
      showOption,
      total,
      allCount,
    } = this.state;
    const totalCount = (list || []).length;

    return (
      <div className="portalManagementList orgManagementWrap flex flexColumn">
        <AdminTitle prefix={_l('外部门户')} />

        <div className="orgManagementHeader flexRow">
          <div>
            <span className="Font17 bold">{_l('外部门户')}</span>
            <span className="Gray_9e mTop5 mLeft6 Font13">{_l('通过外部门户访问应用的用户')}</span>
          </div>
        </div>

        <div className="appManagementCount flexRow">
          <span className="Gray_9e mRight5">{_l('计费外部用户人数')}</span>
          <span className="bold">
            {allCount} / {limitExternalUserCount}
          </span>

          <span className="Gray_9e mLeft15 mRight5">{_l('剩余')}</span>
          <span className="bold">
            {_l('%0人', limitExternalUserCount - allCount < 0 ? 0 : limitExternalUserCount - allCount)}
          </span>

          {allowUpgradeExternalPortal && showOption && (
            <span className="mLeft20">
              {/* <span className="Gray_9e mRight5">{_l('%0天后到期', expireDays)}</span> */}
              <Link
                className="ThemeColor3 ThemeHoverColor2  NoUnderline"
                to={`/admin/expansionservicePotal/${this.props.match.params.projectId}/portalupgrade`}
              >
                {_l('续费')}
              </Link>
              <span className="Gray_9e mLeft5 mRight5">{_l('或')}</span>
            </span>
          )}

          {/* {showOption && (
            <Link
              className={cx('ThemeColor3 ThemeHoverColor2  NoUnderline', { mLeft20: !allowUpgradeExternalPortal })}
              to={`/admin/expansionservicePotal/${this.props.match.params.projectId}/portaluser`}
            >
              {_l('扩充')}
            </Link>
          )} */}
        </div>

        {selectedColumnIds.length > 0 ? (
          <div className="manageListSearch flexRow">
            <span className="Font17 Bold mRight32">{_l(`已选择%0条`, selectedColumnIds.length)}</span>
            <Button type="danger ghost" size="medium" onClick={() => this.handleDelete(selectedColumnIds)}>
              {_l('删除')}
            </Button>
          </div>
        ) : (
          <div className="manageListSearch flexRow">
            <Dropdown
              className="w200"
              placeholder={_l('应用')}
              data={apps}
              value={appId || undefined}
              border
              isAppendToBody
              openSearch
              cancelAble
              onChange={appId => this.updateState({ appId })}
            />
            {DATE_TYPE.map(item => {
              const [startDateKey, endDateKey] = item.key;
              const startDate = this.state[startDateKey];
              const endDate = this.state[endDateKey];
              return (
                <span className="InlineBlock mLeft12">
                  <DatePicker.RangePicker
                    selectedValue={[startDate ? moment(startDate) : '', endDate ? moment(endDate) : '']}
                    onClear={() =>
                      this.updateState({
                        [startDateKey]: '',
                        [endDateKey]: '',
                      })
                    }
                    locale={{
                      lang: {
                        today: _l('今天'),
                        clear: _l('取消'),
                        ok: _l('确认'),
                        tomorrow: _l('明天'),
                        timepicker: _l('时间'),
                        dateTimeFormat: 'YYYY/MM/DD',
                        dateFormat: 'YYYY/MM/DD',
                      },
                    }}
                    onOk={([start, end]) => {
                      if (start && end) {
                        this.updateState({
                          [startDateKey]: formatDate(start),
                          [endDateKey]: formatDate(end),
                        });
                      }
                    }}
                  >
                    <div
                      className="selectDateInput"
                      ref={con => (this.dateInput = con)}
                      onMouseEnter={() => {
                        if (startDate && endDate) {
                          $(`#dateArrowIcon_${item.id}`).hide();
                          $(`#dateDeleteIcon_${item.id}`).show();
                        }
                      }}
                      onMouseLeave={() => {
                        $(`#dateArrowIcon_${item.id}`).show();
                        $(`#dateDeleteIcon_${item.id}`).hide();
                      }}
                    >
                      <span className="flex overflow_ellipsis">
                        {startDate && endDate ? (
                          _l('%0 至 %1', startDate, endDate)
                        ) : (
                          <span className="Gray_9e">{item.text}</span>
                        )}
                      </span>
                      <span className="icon-arrow-down-border icon Gray_9e" id={`dateArrowIcon_${item.id}`} />
                      <span
                        className="icon-delete_out icon Gray_9e Hidden"
                        id={`dateDeleteIcon_${item.id}`}
                        onClick={e => {
                          e.stopPropagation();
                          this.updateState({
                            [startDateKey]: '',
                            [endDateKey]: '',
                          });
                        }}
                      />
                    </div>
                  </DatePicker.RangePicker>
                </span>
              );
            })}
            <div className="flex" />
            <Search
              className="w200"
              placeholder={_l('姓名 / 手机号 / 邮箱')}
              handleChange={keywords => this.updateState({ keywords: keywords.trim() })}
            />
          </div>
        )}

        <div className="flexRow manageList manageListHeader bold mTop16">
          <div className="w40 mRight20">
            <Checkbox
              size="small"
              checked={totalCount > 0 && selectedColumnIds.length === totalCount}
              onClick={checked =>
                this.setState({
                  selectedColumnIds: checked ? [] : (list || []).map(i => i.accountId),
                })
              }
            />
          </div>
          <div className="flex mLeft10 minWidth150">{_l('姓名')}</div>
          <div className="w150 flexRow">{_l('手机号')}</div>
          <div className="w150 flexRow">{_l('邮箱')}</div>
          <div className="columnWidth flexRow">{_l('加入应用')}</div>
          <div className="columnWidth flexRow">
            <div
              className="pointer ThemeHoverColor3 pRight12"
              style={{ zIndex: 1 }}
              onClick={() => this.updateState({ sortType: sortType === 10 ? 11 : 10 })}
            >
              {_l('注册时间')}
            </div>
            <div className="flexColumn manageListOrder">
              <Icon icon="arrow-up" className={cx({ ThemeColor3: sortType === 10 })} />
              <Icon icon="arrow-down" className={cx({ ThemeColor3: sortType === 11 })} />
            </div>
          </div>
          <div className="columnWidth flexRow">
            <div
              className="pointer ThemeHoverColor3 pRight12"
              style={{ zIndex: 1 }}
              onClick={() => this.updateState({ sortType: sortType === 20 ? 21 : 20 })}
            >
              {_l('最近登录时间')}
            </div>
            <div className="flexColumn manageListOrder">
              <Icon icon="arrow-up" className={cx({ ThemeColor3: sortType === 20 })} />
              <Icon icon="arrow-down" className={cx({ ThemeColor3: sortType === 21 })} />
            </div>
          </div>
          <div className="w60 mRight20">{_l('操作')}</div>
        </div>

        <div className="flex flexColumn mTop16">{loading ? <LoadDiv className="mTop15" /> : this.renderList()}</div>
        <PaginationWrap total={total} pageIndex={pageIndex} pageSize={this.state.pageSize} onChange={this.changPage} />
      </div>
    );
  }
}
