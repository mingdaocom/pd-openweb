import React, { Component, Fragment } from 'react';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Dialog, Icon, Input, LoadDiv, Radio, SvgIcon, UserHead } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { dialogSelectApp, dialogSelectWorksheet } from 'ming-ui/functions';
import appManagementAjax from 'src/api/appManagement';
import dataLimitAjax from 'src/api/dataLimit';
import workflowDataLimitAjax from 'src/pages/workflow/api/DataLimit';
import PaginationWrap from 'src/pages/Admin/components/PaginationWrap';
import { getTranslateInfo } from 'src/utils/app';

const ContentWrap = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 66px !important;
  .limitWrap {
    height: 40px;
    line-height: 40px;
    background: #f6fafe;
    border-radius: 3px;
    padding-left: 12px;
    margin-bottom: 24px;
  }
  input {
    width: 120px;
    &.overLimit {
      border: 1px solid #f44336;
    }
  }
  .appName {
    width: 262px;
  }
  .appIcon {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    margin-right: 8px;
    text-align: center;
  }
  .size {
    margin-right: 70px;
  }

  .action {
    display: flex;
    justify-content: flex-end;
  }

  .footer {
    width: 100%;
    height: 66px;
    padding: 15px 0;
    position: absolute;
    bottom: 0;
    background-color: #fff;
  }
  .saveBtn,
  .delBtn {
    height: 36px;
    line-height: 36px;
    padding: 0 30px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition:
      color ease-in 0.2s,
      border-color ease-in 0.2s,
      background-color ease-in 0;
  }

  .saveBtn {
    margin-right: 20px;
    background: #1e88e5;
    color: #fff;
    &:hover {
      background: #1565c0;
    }
    &.disabled {
      color: #fff;
      background: #b2dbff;
      cursor: not-allowed;
      &:hover {
        background: #b2dbff;
      }
    }
  }
  .delBtn {
    border: 1px solid #eaeaea;
    &:hover {
      border: 1px solid #ccc;
    }
    &.disabled {
      color: #eaeaea;
      cursor: not-allowed;
      &:hover {
        border: 1px solid #eaeaea;
      }
    }
  }
  .addAndFilterWrap {
    display: flex;
    height: 36px;
    .add {
      color: #2196f3;
      border: 1px solid #2196f3;
      line-height: 34px;
      cursor: pointer;
      padding: 0 20px;
      border-radius: 3px;
      &:hover {
        color: #fff;
        border: 1px solid #2196f3;
        background-color: #2196f3;
      }
    }
    .w200 {
      width: 200px;
    }
  }
  .header {
    border-bottom: 1px solid #e0e0e0;
    padding: 12px 0;
  }

  .searchButton {
    min-width: 0;
  }
  .resetBtn {
    line-height: 36px;
    color: #1677ff;
    &:hover {
      color: #1565c0;
    }
  }
`;

const ResetDialog = styled(Dialog)`
  /* .resetDialogContent {
    height: 24px;
    align-items: center;
    .appIcon {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      margin-right: 8px;
      text-align: center;
    }
  } */
  .mui-dialog-desc {
    background-color: #f5f5f5;
  }
`;

const func = (ids, limits) => {
  return ids.map(item => {
    const { size, entityId } = _.find(limits, v => item === v.entityId) || {};
    return { size: size, entityId };
  });
};

export default class LimitAttachmentUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialLimits: [],
      limits: [],
      total: 0,
      initialTotal: 0,
      size: _.isNumber(props.globalSize) ? props.globalSize : -1,
      initialSize: _.isNumber(props.globalSize) ? props.globalSize : -1,
      appList: [],
      appIds: [],
      worksheetList: [],
      worksheetIds: [],
      pageIndex: 1,
      appPageIndex: 1,
    };
    this.appPromise = null;
    this.savePromise = null;
  }

  componentDidMount() {
    if (this.props.businessType === 2) {
      this.getLimitRowTotal();
    }
    this.getLimits();
  }

  getLimitRowTotal = () => {
    const { projectId } = this.props;
    dataLimitAjax.getLimitRowTotal({ projectId }).then(res => {
      this.setState({
        limitRowTotal:
          res.limitWorksheetRowCount >= 2147483647 ? undefined : _.floor(res.limitWorksheetRowCount / 10000, 4),
      });
    });
  };
  getLimits = () => {
    const { projectId, businessType = 1 } = this.props;
    const { appIds, worksheetIds, pageIndex, limits, initialLimits } = this.state;

    this.setState({ loading: true });

    if (businessType === 4) {
      workflowDataLimitAjax
        .GetUageLimits({
          projectId,
          pageIndex,
          pageSize: 50,
          entityIds: appIds,
        })
        .then(res => {
          const list = res.data.map(item => ({
            ...item,
            app: {
              appName: _.get(item, 'app.name'),
              appIconColor: _.get(item, 'app.iconColor'),
              appIconUrl: _.get(item, 'app.iconUrl'),
            },
          }));
          this.setState({
            loading: false,
            limits: list,
            initialLimits: list,
            total: res.total,
            initialTotal: res.total,
          });
        })
        .catch(() => {
          this.setState({ size: 0, limits: [], loading: false });
        });
      return;
    }

    dataLimitAjax
      .getUageLimits({
        projectId,
        businessType,
        pageIndex,
        pageSize: 50,
        entityIds: businessType === 2 ? worksheetIds : appIds,
      })
      .then(res => {
        this.setState({
          loading: false,
          limits: pageIndex === 1 ? res.data : limits.concat(res.data),
          initialLimits: pageIndex === 1 ? res.data : initialLimits.concat(res.data),
          total: res.total,
          initialTotal: res.total,
        });
      })
      .catch(() => {
        this.setState({ size: 0, limits: [], loading: false });
      });
  };

  showAddAppList = () => {
    const { projectId, businessType } = this.props;
    if (businessType == 2) {
      dialogSelectWorksheet({ projectId, title: _l('添加工作表'), onOk: this.handleAddWorksheetList });
      return;
    }
    dialogSelectApp({
      projectId,
      title: _l('添加应用'),
      onOk: this.handleAddAppList,
    });
  };

  handleAddAppList = data => {
    const { businessType } = this.props;
    const { limits, size, total } = this.state;
    const { accountId, fullname, avatar } = _.get(md, 'global.Account') || {};

    const temp = data
      .filter(
        item =>
          !_.includes(
            limits.map(v => v.entityId),
            item.appId,
          ),
      )
      .map(item => ({
        app: { ...item, appIconColor: item.iconColor, appIconUrl: item.iconUrl },
        entityId: item.appId,
        size: size === -1 ? (_.includes([1, 2, 4], businessType) ? 1 : 0) : size,
        user: { accountId, fullname, avatar },
      }));

    this.setState({ limits: limits.concat(temp), total: total + temp.length });
  };

  handleAddWorksheetList = data => {
    const { businessType } = this.props;
    const { limits, size, total } = this.state;
    const { accountId, fullname, avatar } = _.get(md, 'global.Account') || {};

    const temp = data
      .filter(
        item =>
          !_.includes(
            limits.map(v => v.entityId),
            item.workSheetId,
          ),
      )
      .map(item => ({
        app: { ...item.app, appIconColor: _.get(item, 'app.iconColor'), appIconUrl: _.get(item, 'app.iconUrl') },
        appItem: {
          color: item.iconColor,
          iconUrl: item.iconUrl,
          id: item.workSheetId,
          name: item.workSheetName,
        },
        entityId: item.workSheetId,
        size: size === -1 ? (_.includes([1, 2, 4], businessType) ? 1 : 0) : size,
        user: { accountId, fullname, avatar },
      }));

    this.setState({ limits: limits.concat(temp), total: total + temp.length });
  };

  getAppList = () => {
    const { projectId } = this.props;
    const { appPageIndex, isMoreApp, loadingApp, appList, keyword = '' } = this.state;
    // 加载更多
    if (appPageIndex > 1 && ((loadingApp && isMoreApp) || !isMoreApp)) {
      return;
    }
    this.setState({ loadingApp: true });
    if (this.appPromise) {
      this.appPromise.abort();
    }
    this.appPromise = appManagementAjax.getAppsByProject({
      projectId,
      status: '',
      order: 3,
      pageIndex: appPageIndex,
      pageSize: 50,
      keyword,
    });

    this.appPromise
      .then(({ apps }) => {
        const newAppList = (apps || []).map(item => ({ label: item.appName, value: item.appId }));
        this.setState({
          appList: appPageIndex === 1 ? newAppList : appList.concat(newAppList),
          isMoreApp: newAppList.length >= 50,
          loadingApp: false,
          appPageIndex: appPageIndex + 1,
        });
      })
      .catch(() => {
        this.setState({ loadingApp: false });
      });
  };

  getWorksheetList = (ids = []) => {
    const { projectId, businessType } = this.props;
    const { appIds, worksheetIds = [] } = this.state;

    if (businessType !== 2) return;

    appManagementAjax.getWorksheetsUnderTheApp({ projectId, appIds: ids, isFilterCustomPage: true }).then(res => {
      let newWorksheetList = [];
      appIds.forEach(item => {
        newWorksheetList = newWorksheetList.concat(
          (res[item] || []).map(it => ({
            label: getTranslateInfo(item, null, it.worksheetId).name || it.worksheetName,
            value: it.worksheetId,
          })),
        );
      });

      const newWorksheetIds = worksheetIds.filter(item => _.find(newWorksheetList, v => v.value === item));
      this.setState({
        worksheetList: _.isEmpty(appIds) ? [] : newWorksheetList,
        worksheetIds: newWorksheetIds,
      });
    });
  };

  changeItemSize = (val, item) => {
    const limits = _.clone(this.state.limits);
    const index = _.findIndex(limits, v => v.entityId === item.entityId);
    limits[index] = { ...limits[index], size: val };

    this.setState({ limits });
  };

  handleReset = (app, projectId) => {
    Dialog.confirm({
      title: _l('重置应用的附件上传量'),
      description: (
        <div className="Gray flexRow alignItemsCenter" style={{ height: '24px' }}>
          <span>{_l('确认将')}</span>
          <div className="mLeft10 mRight10 flexRow alignItemsCenter" style={{ height: '24px' }}>
            <div
              className="appIcon"
              style={{
                background: app.appIconColor,
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                marginRight: '8px',
                textAlign: 'center',
              }}
            >
              <SvgIcon url={app.appIconUrl} fill="#fff" size={18} className="mTop3" />
            </div>
            <span className="flex ellipsis" title={app.appName}>
              {app.appName}
            </span>
          </div>
          <span>{_l('的已使用附件上传量重置为0?')}</span>
        </div>
      ),
      onOk: () => {
        dataLimitAjax.resetUsage({ projectId: projectId, appId: app.appId }).then(res => {
          if (res) {
            alert(_l('重置成功'));
          } else {
            alert(_l('重置失败'), 2);
          }
        });
      },
    });
  };

  remove = entityId => {
    const { limits, total } = this.state;
    this.setState({ limits: limits.filter(v => v.entityId !== entityId), total: total - 1 });
  };

  getLimitParams = () => {
    const { initialLimits = [], limits = [] } = this.state;

    const initialIds = initialLimits.map(item => item.entityId);
    const currentIds = limits.map(item => item.entityId);

    const addIds = currentIds.filter(v => !_.includes(initialIds, v));
    const deleteIds = initialIds.filter(v => !_.includes(currentIds, v));
    const editIds = currentIds.filter(v => !_.includes(addIds, v) && !_.includes(deleteIds, v));
    const edits = func(editIds, limits).filter(item => {
      const init = _.find(initialLimits, v => v.entityId === item.entityId) || {};

      return item.size !== init.size;
    });

    return {
      adds: func(addIds, limits),
      edits,
      dels: func(deleteIds, initialLimits),
    };
  };

  onSave = () => {
    const { projectId, businessType, updateData = () => {} } = this.props;
    const { limits, size, initialLimits, initialSize, loading, total, limitRowTotal } = this.state;
    const limitSize =
      businessType === 1
        ? md.global.SysSettings.fileUploadLimitSize || 4 * 1024
        : businessType === 2
          ? limitRowTotal * 10
          : 0;

    if (loading || (_.isEqual(initialLimits, limits) && _.isEqual(size, initialSize))) return;

    if (limitSize && (size > limitSize || _.findIndex(limits, v => v.size > limitSize) > -1)) {
      this.setState({ clickSubmit: true });
      return alert(_l('保存失败，超出上限'), 2);
    } else {
      this.setState({ clickSubmit: false });
    }

    this.setState({ saveLoading: true });
    const limitParams = this.getLimitParams();
    const params = {
      projectId,
      size: size,
      ...limitParams,
    };

    if (_.includes([1, 2, 3], businessType)) {
      params.businessType = businessType;
    }

    if (this.savePromise) {
      this.savePromise.abort();
    }
    this.savePromise =
      businessType === 4 ? workflowDataLimitAjax.EditUageLimit(params) : dataLimitAjax.editUageLimit(params);

    this.savePromise
      .then(res => {
        if (res) {
          alert(_l('保存成功'));
          this.setState(
            { initialLimits: limits, initialSize: size, initialTotal: total, pageIndex: 1 },
            () => (!_.isEmpty(limitParams.adds) || !_.isEmpty(limitParams.dels)) && this.getLimits(),
          );
          updateData();
        } else {
          alert(_l('保存失败'), 2);
        }
        this.setState({ saveLoading: false });
      })
      .catch(() => {
        this.setState({ saveLoading: false });
      });
  };

  onBlur = (e, callback) => {
    const { businessType } = this.props;
    let val = e.target.value;
    val = val.replace(/^[0]+/, '');

    if (!val && _.includes([1, 2, 4], businessType)) {
      return callback(1);
    } else if (!_.trim(val) || val < 0) {
      val = 0;
    }

    callback(+val);
  };

  renderLimitSizeInfo = () => {
    const { limitRowTotal } = this.state;
    let text = '';
    const { businessType } = this.props;
    switch (businessType) {
      case 1:
        const limitSize = md.global.SysSettings.fileUploadLimitSize || 4 * 1024;
        text = _l(
          '系统支持的附件大小上限为 %0，可设置组织下允许的附件大小上限',
          `${md.global.Config.IsLocal ? limitSize + 'M' : '4G'}`,
        );
        break;
      case 2:
        text = limitRowTotal
          ? _l(
              '设置每个工作表行记录数量上限。可为所有工作表全局配置，也可以为特殊的工作表单独设置。组织可设置最大上限为 %0万行 / 每个表',
              limitRowTotal,
            )
          : _l('设置每个工作表行记录数量上限。可为所有工作表全局配置，也可以为特殊的工作表单独设置');

        break;
      case 3:
        text = _l(
          '设置应用中工作表附件字段、讨论附件，上传量的上限。可为所有应用全局配置，也可以为特殊的应用单独设置。',
        );
        break;
      case 4:
        text = _l('设置一天内每个应用的工作流执行次数上限。可为所有应用全局配置，也可以为特殊的应用单独设置。');
        break;
      default:
    }

    return text;
  };

  renderGlobalSetting = () => {
    const { globalDesc, globalUnit, businessType } = this.props;
    const { size, clickSubmit, limitRowTotal } = this.state;
    const limitSize =
      businessType === 1
        ? md.global.SysSettings.fileUploadLimitSize || 4 * 1024
        : businessType === 2
          ? limitRowTotal * 10
          : 0;

    return (
      <div className="mBottom32">
        <div className="mBottom16 bold">{globalDesc}</div>
        <div className="flexRow mBottom20 alignItemsCenter">
          <Radio className="mRight8" checked={size === -1} onClick={() => this.setState({ size: -1 })} />
          <span>{_l('不限')}</span>
          <Tooltip title={_l('设置为“不限”，实际使用不得超过系统限制')}>
            <Icon icon="info_outline" className="Font16 Gray_9e mLeft5 Hand" />
          </Tooltip>
        </div>
        <div className="flexRow alignItemsCenter">
          <Radio
            className="mRight8"
            checked={size !== -1}
            onClick={() =>
              this.setState({
                size: businessType === 3 ? 0 : 1,
              })
            }
          />
          <span className="mRight10">{_l('限制上限')}</span>
          <Input
            disabled={size === -1}
            className={cx('mLeft10 mRight10', { overLimit: clickSubmit && size > limitSize })}
            value={size === -1 ? '' : size}
            onChange={val => this.setState({ size: +val.replace(/\D/g, '') })}
            onBlur={e => this.onBlur(e, val => this.setState({ size: +val }))}
          />
          <div>{globalUnit}</div>
        </div>
      </div>
    );
  };

  renderContent = (col, data) => {
    const { projectId, businessType } = this.props;
    const { clickSubmit, limitRowTotal } = this.state;
    const { app = {}, user = {}, size, entityId, appItem, createTime } = data;
    const limitSize =
      businessType === 1
        ? md.global.SysSettings.fileUploadLimitSize || 4 * 1024
        : businessType === 2
          ? limitRowTotal * 10
          : 0;

    switch (col.dataIndex) {
      case 'app':
        return (
          <div className="flexRow alignItemsCenter">
            {app.appName ? (
              <Fragment>
                <div className="appIcon" style={{ background: app.appIconColor }}>
                  <SvgIcon url={app.appIconUrl} fill="#fff" size={18} className="mTop3" />
                </div>
                <span className="flex ellipsis mRight10" title={app.appName}>
                  {app.appName}
                </span>
              </Fragment>
            ) : (
              <span className="Red">{_l('应用已删除')}</span>
            )}
          </div>
        );
      case 'worksheet':
        return (
          <div className="flexRow alignItemsCenter">
            <div className="appIcon">
              <SvgIcon url={appItem.iconUrl} fill="#9e9e9e" size={18} className="mTop3" />
            </div>
            <span className="flex ellipsis mRight10" title={appItem.name}>
              {appItem.name}
            </span>
          </div>
        );
      case 'createTime':
        return createTime;
      case 'user':
        return (
          <Fragment>
            <UserHead
              projectId={projectId}
              user={{
                userHead: user.avatar,
                accountId: user.accountId,
              }}
              size={24}
            />
            <span className="mLeft10 ellipsis">{user.fullname}</span>
          </Fragment>
        );
      case 'size':
        return (
          <Fragment>
            <Input
              className={cx('mRight10', { overLimit: clickSubmit && size > limitSize })}
              value={size}
              onChange={val => this.changeItemSize(val.replace(/\D/g, ''), data)}
              onBlur={e => this.onBlur(e, val => this.changeItemSize(val, data))}
            />
            <div>{col.unit}</div>
          </Fragment>
        );
      case 'action':
        return (
          <Fragment>
            {!!createTime && app.appName && (
              <div className="Gray_bd Hand Hover_21 mRight10" onClick={() => this.handleReset(app, projectId)}>
                {_l('重置')}
              </div>
            )}
            <div className="Gray_bd Hand Hover_21" onClick={() => this.remove(entityId)}>
              {_l('移除')}
            </div>
          </Fragment>
        );
      default:
    }
  };

  render() {
    const { title, columns = [], businessType, onClose = () => {} } = this.props;
    const {
      size,
      limits,
      initialLimits,
      initialSize,
      loading,
      saveLoading,
      appList,
      appIds,
      worksheetList,
      worksheetIds,
      isMoreApp,
      pageIndex,
      total,
      initialTotal,
      appPageIndex,
      limitRowTotal,
    } = this.state;
    const disabled = _.isEqual(initialLimits, limits) && _.isEqual(size, initialSize);

    return (
      <div className="orgManagementWrap">
        <div className="orgManagementHeader">
          <div className="flexRow alignItemsCenter">
            <Icon icon="backspace" className="Font22 ThemeHoverColor3 pointer" onClick={onClose} />
            <div className="Font17 bold flex mLeft10">{title}</div>
          </div>
        </div>
        <ContentWrap className="orgManagementContent Raletive">
          <div className="limitWrap">{this.renderLimitSizeInfo()}</div>
          <div className="Font15 bold mBottom12">{_l('全局配置')}</div>
          {this.renderGlobalSetting()}
          <div className="Font15 bold mBottom12">{_l('额外配置')}</div>
          <div className="addAndFilterWrap mBottom10">
            <div className="flex flexRow">
              <div className="flexRow alignItemsCenter">
                <div className="mRight10 Gray_75">{_l('应用')}</div>
                <Select
                  className="mdAntSelect w200 mRight20"
                  placeholder={_l('所属应用')}
                  showSearch
                  allowClear
                  options={appList}
                  value={appIds}
                  mode="multiple"
                  maxTagCount="responsive"
                  notFoundContent={() => <span className="Gray_9e">{_l('无搜索结果')}</span>}
                  filterOption={(inputValue, option) => {
                    return (
                      appList
                        .find(item => item.value === option.value)
                        .label.toLowerCase()
                        .indexOf(inputValue.toLowerCase()) > -1
                    );
                  }}
                  onSearch={_.debounce(val => this.setState({ keyword: val, appPageIndex: 1 }, this.getAppList), 500)}
                  onClear={() =>
                    this.setState({ appPageIndex: 1, keyword: '', worksheetIds: [] }, () => {
                      this.getAppList();
                      businessType !== 2 && this.getLimits();
                    })
                  }
                  onPopupScroll={e => {
                    e.persist();
                    const { scrollTop, offsetHeight, scrollHeight } = e.target;
                    if (scrollTop + offsetHeight === scrollHeight && isMoreApp) {
                      this.getAppList();
                    }
                  }}
                  onFocus={appPageIndex === 1 && _.isEmpty(appList) && this.getAppList}
                  onDropdownVisibleChange={open => !open && businessType !== 2 && this.getLimits()}
                  onChange={value => {
                    this.setState({ appIds: value }, () => {
                      !_.isEmpty(value) && businessType === 2 && this.getWorksheetList(value);
                    });
                  }}
                >
                  {appList.map(it => (
                    <Select.Option className="mdAntSelectOption" key={it.value} value={it.value}>
                      {it.label}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              {businessType === 2 && (
                <div className="flexRow alignItemsCenter">
                  <div className="mRight10 Gray_75">{_l('工作表')}</div>
                  <Select
                    className="mdAntSelect w200"
                    placeholder={_l('请选择')}
                    showSearch
                    allowClear
                    value={worksheetIds}
                    mode="multiple"
                    maxTagCount="responsive"
                    disabled={_.isEmpty(appIds)}
                    notFoundContent={() => <span className="Gray_9e">{_l('无搜索结果')}</span>}
                    filterOption={(inputValue, option) => {
                      return (
                        worksheetList
                          .find(item => item.value === option.value)
                          .label.toLowerCase()
                          .indexOf(inputValue.toLowerCase()) > -1
                      );
                    }}
                    onClear={() => this.setState({ worksheetIds: [] })}
                    onChange={value => this.setState({ worksheetIds: value })}
                  >
                    {worksheetList.map(it => (
                      <Select.Option className="mdAntSelectOption" key={it.value} value={it.value}>
                        {it.label}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              )}

              {businessType === 2 && (
                <Fragment>
                  <Button
                    type="primary"
                    className="pLeft16 pRight16 mLeft20 searchButton"
                    onClick={() => {
                      if (_.isEmpty(worksheetIds)) {
                        alert(_l('请选择查询的工作表'), 3);
                        return;
                      }
                      this.getLimits();
                    }}
                  >
                    {_l('查询')}
                  </Button>
                  <div
                    className="Hand mLeft20 resetBtn"
                    onClick={() => this.setState({ appIds: [], worksheetIds: [] }, this.getLimits)}
                  >
                    {_l('重置')}
                  </div>
                </Fragment>
              )}
            </div>
            <div className="add" onClick={this.showAddAppList}>
              <i className="icon icon-plus" />
              <san>{businessType === 2 ? _l('工作表') : _l('应用')}</san>
            </div>
          </div>
          <div className="list">
            <div className="header flexRow mBottom10">
              {columns.map((item, index) => (
                <div
                  key={index}
                  className={`pLeft8 ${item.dataIndex} ${item.className ? item.className : undefined}`}
                  style={{ width: item.width }}
                >
                  {item.title}
                </div>
              ))}
            </div>
            <div className="listContent">
              {loading && pageIndex === 1 ? (
                <LoadDiv />
              ) : _.isEmpty(limits) ? (
                <div className="mTop40 Gray_75 TxtCenter">
                  {businessType === 2 ? _l('未添加工作表') : _l('未添加应用')}
                </div>
              ) : (
                limits.map((row, index) => (
                  <div className="flexRow alignItemsCenter pTop6 pBottom6" key={index}>
                    {columns.map((col, i) => (
                      <div
                        key={i}
                        className={`pLeft8 flexRow ${col.dataIndex} ${col.className ? col.className : ''}`}
                        style={{ width: col.width }}
                      >
                        {this.renderContent(col, row)}
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
            {!loading && (
              <PaginationWrap
                total={total}
                pageIndex={pageIndex}
                pageSize={50}
                onChange={pageIndex => this.setState({ pageIndex }, this.getLimits)}
              />
            )}
          </div>
          <div className="footer flexRow">
            <div className={cx('saveBtn', { disabled: loading || saveLoading || disabled })} onClick={this.onSave}>
              {saveLoading ? _l('处理中') : _l('保存')}
            </div>
            <div
              className={cx('delBtn', { disabled: loading || disabled })}
              onClick={() => this.setState({ limits: initialLimits, size: initialSize, total: initialTotal })}
            >
              {_l('取消')}
            </div>
          </div>
        </ContentWrap>
      </div>
    );
  }
}
