import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Dialog, Dropdown, Tooltip, UserHead, UserName } from 'ming-ui';
import userAjax from 'src/api/user';
import { hasPermission } from 'src/components/checkPermission';
import { purchaseMethodFunc } from 'src/components/pay/versionUpgrade/PurchaseMethodModal';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import { getCurrentProject } from 'src/utils/project';
import PageTableCon from '../../../components/PageTableCon';
import WorkHandoverDialog from '../../../components/WorkHandoverDialog';
import ActionDrop from './ActionDrop';
import HandOver from './handOver';
import SearchInput from './SearchInput';

const KEYWORDS_TYPES = [
  {
    text: _l('姓名'),
    value: 1,
  },
  {
    text: _l('工号'),
    value: 2,
  },
];

const TableWrap = styled(PageTableCon)`
  &.resignTableList {
    .actionWrap {
      width: 20px;
      margin-left: auto;
      margin-right: 0;
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
  .actionWrap {
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  .keywordsTypeOptions.ming.Dropdown {
    border-right: 1px solid #ddd;
  }
  .resignationSearch {
    background: #fff;
    input {
      background: #fff;
    }
  }
`;

export default class extends React.Component {
  constructor(props) {
    super();
    this.state = {
      level: 'index', // index | detail
      activeTab: 'transfer',
      keywords: '',
      columns: [],
      keywordsType: 1,
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
          title: _l('部门'),
          dataIndex: 'departmentInfos',
          width: 200,
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
          title: _l('工号'),
          dataIndex: 'jobNumber',
          width: 100,
        },
        {
          title: _l('加入天数'),
          dataIndex: 'joinDays',
          width: 100,
          render: (text, record) => {
            return moment().diff(moment(record.createTime), 'days');
          },
        },
        {
          title: _l('离职时间'),
          dataIndex: 'updateTime',
          width: 200,
          render: value => {
            return createTimeSpan(value);
          },
        },
      ].map(item => ({
        ...item,
        width: item.width || 150,
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
    const { pageIndex = 1 } = params;

    this.setState({ loading: true, pageIndex });

    const requestParams = {
      projectId: this.props.projectId,
      pageIndex,
      pageSize: 50,
      keywords: this.state.keywords,
      keywordsType: this.state.keywordsType,
    };

    userAjax
      .pagedRemovedUsers(requestParams)
      .then(res => {
        this.setState({
          dataSource: res.list || [],
          count: res.allCount || 0,
          loading: false,
        });
      })
      .catch(err => {
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

    Dialog.confirm({
      title: _l('确认框'),
      description: _l('确定恢复[%0]权限吗？', fullName),
      onOk: () => {
        userAjax
          .recoveryUser({
            accountId,
            projectId,
          })
          .then(data => {
            if (data == 1) {
              this.getData();
              alert(_l('恢复成功'));
            } else if (data == 4) {
              const { licenseType, version } = getCurrentProject(projectId, true);
              let link = '';
              if (licenseType === 0) {
                link = (
                  <span>
                    {_l('当前用户数已超出人数限制')}
                  </span>
                );
              } else {
                link = (
                  <span>
                    {_l('当前用户数已超出人数限制')}
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
    const { projectId, authority = [] } = this.props;
    const {
      loading,
      dataSource = [],
      count = 0,
      pageIndex,
      handoverVisible,
      showWorkHandover,
      transferor,
      keywordsType,
    } = this.state;

    return (
      <div className="flexColumn flex minHeight0 h100">
        <Wrap className="flexRow">
          <div className="valignWrapper actionWrap">
            <Dropdown
              className="keywordsTypeOptions"
              value={keywordsType === 0 ? undefined : keywordsType}
              data={KEYWORDS_TYPES}
              onChange={value => this.setState({ keywordsType: value })}
            />
            <SearchInput
              className="resignationSearch"
              placeholder={_l('搜索成员')}
              onSearch={val => this.setState({ keywords: val }, this.getData)}
            />
          </div>

          {hasPermission(authority, PERMISSION_ENUM.DEPUTE_HANDOVER_MANAGE) && (
            <span className="ThemeColor Hand Font13 Normal" onClick={() => this.setState({ handoverVisible: true })}>
              {_l('交接协作相关数据')}
            </span>
          )}
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
                const prop = {
                  record,
                  authority,
                  recovery: this.recovery,
                  updateData: data => {
                    this.setState({ ...data });
                  },
                };
                return <ActionDrop {...prop} />;
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
