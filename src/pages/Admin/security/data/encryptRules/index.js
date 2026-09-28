import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Icon, LoadDiv, ScrollView, UserHead } from 'ming-ui';
import { Button, Dropdown, Input, Modal, Select, Switch, Tooltip } from 'ming-ui/antd-components';
import { withOpeners } from 'ming-ui/hooks/useFunctionWrapComponent';
import projectEncryptAjax from 'src/api/projectEncrypt';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import Empty from 'src/pages/Admin/common/TableEmpty';
import PaginationWrap from 'src/pages/Admin/components/PaginationWrap';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { getFeatureStatus } from 'src/utils/services/project';
import AddEditRulesDialog from './AddEditRulesDialog';
import { encryptList, statusList } from './constant';
import { useEncryptDetail } from './EncryptDetail';
import './index.less';

class EncryptRules extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      pageIndex: 1,
      pageSize: 50,
      searchValues: { type: '', state: '', name: '' },
      dataSource: [],
    };
    this.promise = null;
  }
  componentDidMount() {
    this.getDataList();
  }
  getDataList = () => {
    const { projectId } = this.props;
    const { searchValues, pageIndex, pageSize } = this.state;

    this.setState({ loading: true });

    if (this.promise) {
      this.promise.abort();
    }

    this.promise = projectEncryptAjax.pagedEncryptRules({
      projectId,
      pageIndex,
      pageSize,
      ...searchValues,
      isReturnTotal: pageIndex === 1 ? true : false,
    });

    this.promise
      .then(res => {
        this.setState({
          dataSource: res.encryptRules,
          loading: false,
          totalCount: pageIndex === 1 ? res.totalCount : this.state.totalCount,
        });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };
  changeSearchParams = (field, val) => {
    const { searchValues } = this.state;
    this.setState({ searchValues: { ...searchValues, [field]: val }, pageIndex: 1 }, _.debounce(this.getDataList, 500));
  };

  handleDefaultAndDeleteRule = ({
    encryptRuleId,
    requestFuncName,
    successTxt = _l('设置成功'),
    failTxt = _l('设置失败'),
  }) => {
    this.setState({ showMoreRuleId: null });
    projectEncryptAjax[requestFuncName]({
      projectId: this.props.projectId,
      encryptRuleId,
    }).then(res => {
      if (res.success === true) {
        alert(successTxt);
        if (requestFuncName === 'setDefaultEncryptRule') {
          this.setState({
            dataSource: this.state.dataSource.map(it => {
              if (it.encryptRuleId === encryptRuleId) {
                return { ...it, isDefault: true };
              }

              return { ...it, isDefault: false };
            }),
          });
        } else {
          this.setState({ dataSource: this.state.dataSource.filter(it => it.encryptRuleId !== encryptRuleId) });
        }
      } else if (res.code === 101) {
        alert(_l('删除失败，引用的规则不能删除'), 2);
      } else {
        alert(failTxt, 2);
      }
    });
  };

  render() {
    const { onClose, projectId } = this.props;
    const { searchValues, dataSource = [], showAddEditDialog, loading, pageIndex, totalCount } = this.state;
    const { type, state, name } = searchValues;
    const featureType = getFeatureStatus(projectId, VersionProductType.dataEnctypt);

    return (
      <div className="orgManagementWrap">
        <div className="orgManagementHeader">
          <div className="flexRow alignItemsCenter">
            <Icon icon="backspace" className="Font22 hoverColorPrimary pointer" onClick={onClose} />
            <div className="Font17 bold flex mLeft10">{_l('加密规则')}</div>
          </div>
          <Button
            shape="round"
            type="primary"
            icon={<Icon icon="add" className="Font18" />}
            onClick={() => {
              if (featureType === '2') {
                buriedUpgradeVersionDialog(projectId, VersionProductType.dataEnctypt);
                return;
              }

              this.setState({ showAddEditDialog: true });
            }}
          >
            {_l('新建规则')}
          </Button>
        </div>
        <div className="orgManagementContent flex flexColumn pTop16">
          <div className="searchWrap flexRow">
            <Select
              className="mRight16"
              value={type}
              onChange={val => this.changeSearchParams('type', val)}
              style={{ width: 160 }}
              options={encryptList}
            />
            <Select
              value={state}
              className="mRight16"
              onChange={val => this.changeSearchParams('state', val)}
              style={{ width: 160 }}
              options={statusList}
            />
            <Input
              value={name}
              placeholder={_l('搜索规则名称')}
              style={{ width: 200 }}
              onChange={e => this.changeSearchParams('name', e.target.value)}
            />
          </div>
          <div className="flexRow listHead">
            <div className="flex">{_l('规则名称')}</div>
            <div className="w150">{_l('状态')}</div>
            <div className="w150">{_l('加密方式')}</div>
            <div className="w150">{_l('创建时间')}</div>
            <div className="w150">{_l('创建人')}</div>
            <div className="w80"></div>
          </div>
          <div className="flex flexColumn mTop16 mBottom16 listContent overflowHidden">
            <ScrollView className="flex">
              {loading ? (
                <LoadDiv className="mTop40" />
              ) : _.isEmpty(dataSource) ? (
                <Empty className="w100 h100" detail={{ icon: 'icon-verify', desc: _l('无数据') }} />
              ) : (
                dataSource.map(item => (
                  <div className="flexRow listItem">
                    <div className="flex ellipsis">
                      {item.name}
                      {!!item.remark && (
                        <Tooltip title={item.remark}>
                          <Icon icon="info_outline" className="textDisabled mLeft5" />
                        </Tooltip>
                      )}
                      {item.isDefault && <span className="defaultRule bold">{_l('默认')}</span>}
                    </div>
                    <div className="w150">
                      <Switch
                        className="mTop18"
                        checked={item.state === 1}
                        checkedChildren={item.state === 1 ? _l('启用') : _l('停用')}
                        unCheckedChildren={item.state === 1 ? _l('启用') : _l('停用')}
                        onClick={(checked, event) => {
                          event.stopPropagation();
                          projectEncryptAjax
                            .setEncryptRuleState({
                              projectId,
                              encryptRuleId: item.encryptRuleId,
                              state: !checked ? 2 : 1,
                            })
                            .then(res => {
                              if (res.success) {
                                const tempData = dataSource.map(it => {
                                  if (it.encryptRuleId === item.encryptRuleId) {
                                    return {
                                      ...it,
                                      state: !checked ? 0 : 1,
                                    };
                                  }

                                  return it;
                                });
                                this.setState({
                                  dataSource: tempData,
                                });
                              } else {
                                alert(_l('操作失败'), 2);
                              }
                            });
                        }}
                      />
                    </div>
                    <div className="w150">
                      {_.get(_.find(encryptList, it => it.value === item.type) || {}, 'label')}
                    </div>
                    <div className="w150">{moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')}</div>
                    <div className="w150 flexRow">
                      <UserHead
                        className="circle mRight6"
                        user={{
                          userHead: item.createAccountAvatar,
                          accountId: item.createAccountId,
                        }}
                        size={24}
                        projectId={projectId}
                      />
                      {item.createAccountName}
                    </div>
                    <div className="w80 TxtCenter">
                      <Dropdown
                        trigger={['click']}
                        open={this.state.showMoreRuleId === item.encryptRuleId}
                        onOpenChange={visible => this.setState({ showMoreRuleId: visible ? item.encryptRuleId : null })}
                        menu={{
                          items: [
                            {
                              key: 'detail',
                              label: _l('详情'),
                              onClick: () => {
                                this.setState({ showMoreRuleId: null });
                                this.props.openEncryptDetail({
                                  projectId: this.props.projectId,
                                  encryptRuleId: item.encryptRuleId,
                                  ruleDetail: item,
                                  updateCurrentRow: ({ name, remark, ...rest }) => {
                                    console.log(rest, 'rest', name, remark);
                                    const tempData = dataSource.map(it => {
                                      if (it.encryptRuleId === item.encryptRuleId) {
                                        return { ...it, name, remark, ...rest };
                                      }

                                      return it;
                                    });
                                    this.setState({ dataSource: tempData });
                                  },
                                });
                              },
                            },
                            ...(!item.isDefault && item.state
                              ? [
                                  {
                                    key: 'setDefault',
                                    label: _l('设置默认规则'),
                                    onClick: () =>
                                      this.handleDefaultAndDeleteRule({
                                        encryptRuleId: item.encryptRuleId,
                                        requestFuncName: 'setDefaultEncryptRule',
                                      }),
                                  },
                                ]
                              : []),
                            ...(!item.isSystem
                              ? [
                                  {
                                    key: 'delete',
                                    danger: true,
                                    label: _l('删除'),
                                    onClick: () => {
                                      this.setState({ showMoreRuleId: null });
                                      Modal.confirm({
                                        title: <span className="textError">{_l('删除 %0 加密规则', item.name)}</span>,
                                        content: (
                                          <span className="textPrimary">
                                            {_l('若此规则有被字段使用，则该规则不能删除')}
                                          </span>
                                        ),
                                        okText: _l('删除'),
                                        okButtonProps: {
                                          danger: true,
                                        },
                                        onOk: () => {
                                          this.handleDefaultAndDeleteRule({
                                            encryptRuleId: item.encryptRuleId,
                                            requestFuncName: 'removeEncryptRule',
                                            successTxt: _l('删除成功'),
                                            failTxt: _l('删除失败'),
                                          });
                                        },
                                      });
                                    },
                                  },
                                ]
                              : []),
                          ],
                          style: { minWidth: 180 },
                        }}
                      >
                        <Icon icon="moreop" className="textTertiary Hand Font18 hoverColorPrimary" />
                      </Dropdown>
                    </div>
                  </div>
                ))
              )}
            </ScrollView>
            <PaginationWrap
              total={totalCount}
              pageIndex={pageIndex}
              pageSize={50}
              onChange={pageIndex => this.setState({ pageIndex }, this.getDataList)}
            />
          </div>
        </div>

        {showAddEditDialog && (
          <AddEditRulesDialog
            projectId={projectId}
            visible={showAddEditDialog}
            ruleList={dataSource}
            onCancel={() => this.setState({ showAddEditDialog: false })}
            getDataList={() => this.setState({ pageIndex: 1 }, this.getDataList)}
          />
        )}
      </div>
    );
  }
}

export default withOpeners(EncryptRules, {
  openEncryptDetail: useEncryptDetail,
});
