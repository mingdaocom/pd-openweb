import React, { Component } from 'react';
import { Icon, Input, Switch, Menu, MenuItem, Tooltip, ScrollView, LoadDiv, Button } from 'ming-ui';
import Confirm from 'ming-ui/components/Dialog/Confirm';
import { Select } from 'antd';
import AddEditRulesDialog from './AddEditRulesDialog';
import { encryptDetailCon } from './EncryptDetail';
import projectEncryptAjax from 'src/api/projectEncrypt';
import PaginationWrap from 'src/pages/Admin/components/PaginationWrap';
import Empty from 'src/pages/Admin/common/TableEmpty';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import UserHead from 'src/components/userHead';
import Trigger from 'rc-trigger';
import './index.less';
import _ from 'lodash';

const { Option } = Select;
export const encryptList = [
  { value: '', label: _l('全部方式') },
  { value: 1, label: 'AES128' },
  { value: 2, label: 'AES192' },
  { value: 3, label: 'AES256' },
];
export const statusList = [
  { value: '', label: _l('全部状态') },
  { value: 1, label: _l('启用') },
  { value: 2, label: _l('停用') },
];
export default class EncryptRules extends Component {
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
      .fail(err => {
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
            <Icon icon="backspace" className="Font22 ThemeHoverColor3 pointer" onClick={onClose} />
            <div className="Font17 bold flex mLeft10">{_l('加密规则')}</div>
          </div>
          <Button
            radius
            type="primary"
            onClick={() => {
              if (featureType === '2') {
                buriedUpgradeVersionDialog(projectId, VersionProductType.dataEnctypt);
                return;
              }
              this.setState({ showAddEditDialog: true });
            }}
          >
            <Icon icon="add" className="Font18 mRight2" />
            {_l('新建规则')}
          </Button>
        </div>
        <div className="orgManagementContent flex flexColumn pTop16">
          <div className="searchWrap flexRow">
            <Select
              className="mRight16 mdAntSelect"
              value={type}
              onChange={val => this.changeSearchParams('type', val)}
              style={{ width: 160 }}
            >
              {encryptList.map(it => (
                <Option key={it.value} value={it.value}>
                  {it.label}
                </Option>
              ))}
            </Select>
            <Select
              value={state}
              className="mRight16 mdAntSelect"
              onChange={val => this.changeSearchParams('state', val)}
              style={{ width: 160 }}
            >
              {statusList.map(it => (
                <Option key={it.value} value={it.value}>
                  {it.label}
                </Option>
              ))}
            </Select>
            <Input
              value={name}
              placeholder={_l('搜索规则名称')}
              style={{ width: 200 }}
              onChange={val => this.changeSearchParams('name', val)}
            />
          </div>
          <div className="flexRow listHead">
            <div className="flex">{_l('规则名称')}</div>
            <div className="w150">{_l('状态')}</div>
            <div className="w150">{_l('加密方式')}</div>
            <div className="w150">{_l('创建时间')}</div>
            <div className="w150">{_l('创建人')}</div>
            <div className="w80">{_l('')}</div>
          </div>
          <div className="flex flexColumn mTop16 mBottom16 listContent">
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
                        <Tooltip text={item.remark}>
                          <Icon icon="info_outline" className="Gray_bd mLeft5" />
                        </Tooltip>
                      )}
                      {item.isDefault && <span className="defaultRule bold">{_l('默认')}</span>}
                    </div>
                    <div className="w150">
                      <Switch
                        className="mTop18"
                        checked={item.state === 1}
                        text={item.state === 1 ? _l('启用') : _l('停用')}
                        onClick={checked => {
                          projectEncryptAjax
                            .setEncryptRuleState({
                              projectId,
                              encryptRuleId: item.encryptRuleId,
                              state: checked ? 2 : 1,
                            })
                            .then(res => {
                              if (res.success) {
                                const tempData = dataSource.map(it => {
                                  if (it.encryptRuleId === item.encryptRuleId) {
                                    return { ...it, state: checked ? 0 : 1 };
                                  }
                                  return it;
                                });
                                this.setState({ dataSource: tempData });
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
                    <div className="w150">{item.createTime}</div>
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
                      <Trigger
                        action={['click']}
                        popupVisible={this.state.showMoreRuleId === item.encryptRuleId}
                        onPopupVisibleChange={visible =>
                          this.setState({ showMoreRuleId: visible ? item.encryptRuleId : null })
                        }
                        popup={() => {
                          return (
                            <Menu>
                              <MenuItem
                                onClick={() => {
                                  this.setState({ showMoreRuleId: null });
                                  encryptDetailCon({
                                    projectId: this.props.projectId,
                                    encryptRuleId: item.encryptRuleId,
                                    ruleDetail: item,
                                    updateCurrentRow: ({ name, remark }) => {
                                      const tempData = dataSource.map(it => {
                                        if (it.encryptRuleId === item.encryptRuleId) {
                                          return { ...it, name, remark };
                                        }
                                        return it;
                                      });
                                      this.setState({ dataSource: tempData });
                                    },
                                  });
                                }}
                              >
                                {_l('详情')}
                              </MenuItem>
                              {!item.isDefault && item.state && (
                                <MenuItem
                                  onClick={() =>
                                    this.handleDefaultAndDeleteRule({
                                      encryptRuleId: item.encryptRuleId,
                                      requestFuncName: 'setDefaultEncryptRule',
                                    })
                                  }
                                >
                                  {_l('设置默认规则')}
                                </MenuItem>
                              )}
                              {!item.isSystem && (
                                <MenuItem
                                  onClick={() => {
                                    this.setState({ showMoreRuleId: null });
                                    Confirm({
                                      title: _l('删除 %0 加密规则', item.name),
                                      description: (
                                        <span className="Gray">{_l('若此规则有被字段使用，则该规则不能删除')}</span>
                                      ),
                                      okText: _l('删除'),
                                      buttonType: 'danger',
                                      onOk: () => {
                                        this.handleDefaultAndDeleteRule({
                                          encryptRuleId: item.encryptRuleId,
                                          requestFuncName: 'removeEncryptRule',
                                          successTxt: _l('删除成功'),
                                          failTxt: _l('删除失败'),
                                        });
                                      },
                                    });
                                  }}
                                >
                                  {_l('删除')}
                                </MenuItem>
                              )}
                            </Menu>
                          );
                        }}
                        popupAlign={{
                          offset: [-180, 0],
                          points: ['tr', 'br'],
                        }}
                      >
                        <Icon icon="moreop" className="Gray_9e Hand Font18 Hover_21" />
                      </Trigger>
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
            encryptList={encryptList}
            ruleList={dataSource}
            onCancel={() => this.setState({ showAddEditDialog: false })}
            getDataList={() => this.setState({ pageIndex: 1 }, this.getDataList)}
          />
        )}
      </div>
    );
  }
}
