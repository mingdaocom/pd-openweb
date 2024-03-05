import React, { Fragment } from 'react';
import moment from 'moment';
import Trigger from 'rc-trigger';
import { Tooltip, Icon, Dialog, Menu, MenuItem } from 'ming-ui';
import UserHead from 'src/components/userHead';
import UserName from 'src/components/userName';
import PageTableCon from '../../../components/PageTableCon';
import userAjax from 'src/api/user';
import HandOver from './handOver';
import styled from 'styled-components';
import SearchInput from './SearchInput';
import WorkHandoverDialog from '../../../components/WorkHandoverDialog';
import userController from 'src/api/user';
import { getCurrentProject } from 'src/util';

const MenuWrap = styled(Menu)`
  width: 130px !important;
`;

const TableWrap = styled(PageTableCon)`
  &.resignTableList {
    .actionWrap {
      width: 20px;
    }
    .ant-table-tbody > tr.ant-table-row {
      .icon-moreop {
        display: none;
      }
      &:hover {
        .icon-moreop {
          display: inline;
        }
      }
    }
  }
`;

const Wrap = styled.div`
  justify-content: space-between;
`;

export default class extends React.Component {
  constructor(props) {
    super();
    this.state = {
      level: 'index', // index | detail
      activeTab: 'transfer',
      keywords: '',
      columns: [],
    };
    this.getColumns = () => {
      return [
        {
          title: _l('用户'),
          dataIndex: 'accountId',
          fixed: 'left',
          disabled: true,
          render: (text, record) => {
            const { avatar, accountId, fullname } = record;
            return (
              <div className="flexRow alignItemsCenter">
                <UserHead
                  className="circle mRight8"
                  user={{
                    userHead: avatar,
                    accountId: accountId,
                  }}
                  lazy={'false'}
                  size={32}
                  projectId={props.projectId}
                />
                <UserName
                  className="Gray Font13 pLeft5 pRight10 pTop3 flex ellipsis"
                  user={{
                    userName: fullname,
                    accountId: accountId,
                  }}
                />
              </div>
            );
          },
        },
        {
          title: _l('工号'),
          dataIndex: 'jobNumber',
        },
        {
          title: _l('部门'),
          dataIndex: 'departmentInfos',
          render: (text, record) => {
            const { departmentInfos = [] } = record;
            const txt = departmentInfos.map((item, index) => {
              return item.departmentName + (index < departmentInfos.length - 1 ? ';' : '');
            });
            return (
              <div className="ellipsis">
                <Tooltip text={<span>{txt}</span>}>
                  <span>{txt}</span>
                </Tooltip>
              </div>
            );
          },
        },
        {
          title: _l('职位'),
          dataIndex: 'jobInfos',
          render: (text, record) => {
            const { jobInfos = [] } = record;
            const txt = jobInfos.map((item, index) => {
              return item.jobName + (index < jobInfos.length - 1 ? ';' : '');
            });
            return (
              <div className="ellipsis">
                <Tooltip text={<span>{txt}</span>}>
                  <span>{txt}</span>
                </Tooltip>
              </div>
            );
          },
        },
        {
          title: _l('加入天数'),
          dataIndex: 'joinDays',
          render: (text, record) => {
            return moment().diff(moment(record.createTime), 'days');
          },
        },
        {
          title: _l('离职时间'),
          dataIndex: 'updateTime',
          width: 200,
        },
      ].map(item => ({
        ...item,
        onCell: () => {
          return {
            style: {
              maxWidth: item.width || 150,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            },
          };
        },
      }));
    };
  }

  componentDidMount() {
    this.getColumns();
    this.getData();
  }

  getData = (params = {}) => {
    this.setState({ loading: true, pageIndex: params.pageIndex || 1 });
    let { pageIndex = 1 } = params;
    let requestParams = {
      projectId: this.props.projectId,
      pageIndex,
      pageSize: 50,
      userStatus: 4,
      keywords: this.state.keywords,
    };
    userAjax
      .getUserList(requestParams)
      .then(res => {
        this.setState({
          dataSource: res.list || [],
          count: res.allCount || 0,
          loading: false,
        });
      })
      .fail(err => {
        this.setState({
          dataSource: [],
          count: 0,
          loading: false,
        });
      });
  };

  // 恢复权限
  recovery = (accountId, fullName) => {
    const { projectId } = this.props;
    const ele = document.querySelector('.actionTrigger');
    ele.classList.add('rc-trigger-popup-hidden');

    Dialog.confirm({
      title: _l('确认框'),
      description: _l('确定恢复[%0]权限吗？', fullName),
      onOk: () => {
        userController
          .recoveryUser({
            accountId,
            projectId,
          })
          .then(data => {
            if (data == 1) {
              this.getData();
              alert(_l('恢复成功'));
            } else if (data == 4) {
              const { licenseType } = getCurrentProject(projectId, true);
              let link = '';
              if (licenseType === 0) {
                link = (
                  <span>
                    {_l('当前用户数已超出人数限制，请去购买')}
                    <a
                      href="javascript:void(0);"
                      onClick={() => {
                        purchaseMethodFunc({ projectId });
                      }}
                    >
                      {_l('付费版本')}
                    </a>
                  </span>
                );
              } else {
                link = (
                  <span>
                    {_l('当前用户数已超出人数限制，请去购买')}
                    <a href={`/admin/expansionserviceResign/${projectId}/user`} target="_self">
                      {_l('用户包')}
                    </a>
                  </span>
                );
              }
              alert(link, 3);
            } else {
              alert(_l('恢复失败'), 2);
            }
          });
      },
    });
  };

  render() {
    const { projectId } = this.props;
    const {
      loading,
      dataSource = [],
      count = 0,
      pageIndex,
      handoverVisible,
      showWorkHandover,
      transferor,
    } = this.state;

    return (
      <div className="flexColumn flex minHeight0">
        <Wrap className="flexRow">
          <SearchInput placeholder={_l('搜索成员')} onSearch={val => this.setState({ keywords: val }, this.getData)} />
          <span className="ThemeColor Hand Font13 Normal" onClick={() => this.setState({ handoverVisible: true })}>
            {_l('交接协作')}
          </span>
        </Wrap>
        <div className="flex">
          <TableWrap
            className="resignTableList"
            loading={loading}
            columns={this.getColumns().concat({
              title: '',
              dataIndex: 'action',
              width: 80,
              render: (text, record) => {
                const { accountId, fullname } = record;
                const { isSuperAdmin, isProjectAppManager } =
                  _.find(md.global.Account.projects, v => v.projectId === projectId) || {};

                return (
                  <div className="actionWrap">
                    <Trigger
                      popupClassName="actionTrigger"
                      action={['click']}
                      popupAlign={{ points: ['tc', 'bc'], offset: [-120, 30] }}
                      popup={
                        <MenuWrap>
                          <MenuItem onClick={() => this.recovery(accountId, fullname)}>{_l('恢复')}</MenuItem>
                          {(isSuperAdmin || isProjectAppManager) && (
                            <MenuItem
                              onClick={() => {
                                const ele = document.querySelector('.actionTrigger');
                                ele.classList.add('rc-trigger-popup-hidden');
                                this.setState({ showWorkHandover: true, transferor: record });
                              }}
                            >
                              {_l('交接工作')}
                            </MenuItem>
                          )}
                        </MenuWrap>
                      }
                    >
                      <Icon icon="moreop" className="Gray_9e Font16 Hand" />
                    </Trigger>
                  </div>
                );
              },
            })}
            dataSource={dataSource}
            count={count}
            getDataSource={this.getData}
            paginationInfo={{ pageIndex, pageSize: 50 }}
          />
        </div>
        {handoverVisible && (
          <HandOver
            projectId={projectId}
            visible={handoverVisible}
            onCancel={() => {
              this.setState({ handoverVisible: false });
            }}
          />
        )}

        {showWorkHandover && (
          <WorkHandoverDialog
            visible={showWorkHandover}
            projectId={projectId}
            transferor={transferor}
            onCancel={() => this.setState({ showWorkHandover: false })}
          />
        )}
      </div>
    );
  }
}
