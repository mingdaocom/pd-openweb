import React, { Component, Fragment } from 'react';
import { Table } from 'antd';
import { Icon } from 'ming-ui';
import styled from 'styled-components';
import alertImg from '../../assets/alert.png';
import { addToken } from 'src/util';
import { getPssId } from 'src/util/pssId';
import moment from 'moment';

const FailInfoCon = styled.div`
  padding: 0 24px;
  .detailDes {
    justify-content: center;
    align-items: center;
    margin: 56px auto 35px;
    .alertIcon {
      width: 44px;
      height: 44px;
      margin-right: 20px;
    }
    .detailDesCount {
      font-size: 24px;
      color: #292929;
      font-weight: 600;
    }
    .desInfo {
      color: #898989;
      font-size: 14px;
    }
  }
  .listTitle {
    justify-content: space-between;
    font-size: 17px;
    color: #333;
    line-height: 36px;
    margin-bottom: 30px;
    .downloadBtn {
      width: 114px;
      height: 36px;
      text-align: center;
      line-height: 36px;
      background: #2196f3;
      border: 1px solid #2196f3;
      opacity: 1;
      border-radius: 28px;
      font-size: 13px;
      color: #fff;
      cursor: pointer;
    }
  }
  .ant-table-wrapper {
    width: 100%;
    .ant-table-thead {
      tr {
        th {
          background-color: #fff;
          padding: 10px 0 12px;
          color: #757575;
          font-weight: 400;
          .ant-checkbox-wrapper {
            .ant-checkbox {
              &.ant-checkbox-checked::after {
                border: none;
              }
              .ant-checkbox-inner {
                top: -8px;
              }
            }
          }
        }
      }
    }
    .ant-table-tbody {
      .ant-table-row {
        .ant-table-cell {
          padding: 8px 12px 8px 0;
          border: none;
          color: #333;
          .avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            vertical-align: middle;
            margin-right: 10px;
          }
          .ant-checkbox-wrapper {
            .ant-checkbox {
              &.ant-checkbox-checked::after {
                border: none;
              }
              .ant-checkbox-inner {
                top: -8px;
              }
            }
          }
          &.ant-table-selection-column {
            padding: 0;
          }
        }
        &.ant-table-row-selected {
          .ant-table-cell {
            background: #fff;
          }
        }
        &.ant-table-row-selected:hover {
          .ant-table-cell {
            background: #f5f5f5;
          }
        }
      }
      .ant-table-placeholder {
        display: none;
      }
    }
  }
`;

const ImportError = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .errorIcon {
    color: #f51744;
    font-size: 56px;
  }
  .errorTxt {
    font-size: 24px;
    color: #292929;
    font-weight: 600;
    margin: 36px 0 16px;
  }
  .errorDes {
    font-size: 14;
    color: #898989;
    margin-bottom: 78px;
  }
  .uploadBtnStyle {
    width: 108px;
    height: 36px;
    border: 1px solid rgba(33, 150, 243, 1);
    border-radius: 32px;
    background-color: #ffffff;
    color: rgba(33, 150, 243, 1);
    &:hover {
      color: #49adfc !important;
      border-color: #49adfc !important;
    }
  }
`;
export default class ImportResulFailtDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: props.resultDetail.failUsers || [],
    };
    this.columns = () => {
      const { currentTab } = this.props;
      const data = [
        {
          title: currentTab === 'import' ? _l('手机/邮箱') : _l('手机'),
          dataIndex: 'account',
          ellipsis: true,
          width: 160,
          show: true,
          render: (t, record) => {
            return record.account || record.mobile || '';
          },
        },
        { title: _l('邮箱'), dataIndex: 'email', ellipsis: true, width: 160, show: currentTab === 'export' },
        {
          title: _l('姓名'),
          dataIndex: 'fullName',
          ellipsis: true,
          width: 200,
          show: true,
          render: (t, record) => {
            return record.fullname || record.fullName || '';
          },
        },
        {
          title: _l('职位'),
          dataIndex: 'jobStr',
          ellipsis: true,
          width: 160,
          show: true,
          render: (t, record) => {
            return record.job || record.jobStr || '';
          },
        },
        {
          title: _l('部门'),
          dataIndex: 'departmentStr',
          ellipsis: true,
          width: 160,
          show: true,
          render: (t, record) => {
            return record.department || record.departmentStr || '';
          },
        },
        // { title: _l('工作地点'), dataIndex: 'workSite', ellipsis: true, width: 120, show: true },
        // { title: _l('工号'), dataIndex: 'jobNumber', ellipsis: true, width: 120, show: true },
        // {
        //   title: _l('工作电话'),
        //   dataIndex: 'workPhone',
        //   ellipsis: true,
        //   width: 160,
        //   show: true,
        //   render: (t, record) => {
        //     return record.contactPhone || record.workPhone || '';
        //   },
        // },
        { title: _l('失败原因'), dataIndex: 'failReason', ellipsis: true, width: 180, show: true },
      ];
      return data.filter(item => item.show);
    };
  }
  exportExcel = () => {
    const { currentTab, projectId, resultDetail = {} } = this.props;
    const { dowloadId } = resultDetail;
    var url =
      currentTab === 'import'
        ? `${md.global.Config.AjaxApiUrl}Download/ExportImportUserFailList`
        : `${md.global.Config.AjaxApiUrl}Download/ExportImportEditUserFailList`;
    let args = {
      projectId,
      dowloadId,
    };
    fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `md_pss_id ${getPssId()}`,
      },
      body: JSON.stringify(args),
    })
      .then(res => res.blob())
      .then(blob => {
        let name = currentTab === 'import' ? _l('导入新成员失败列表') : _l('导入修改用户信息失败列表');
        const date = moment().format('YYYYMMDDhhmmss');
        const fileName = `${name}-${date}` + '.xlsx';
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(link.href);
      });
  };
  render() {
    const { resultDetail = {}, currentTab, importError } = this.props;
    let { dataSource = [] } = this.state;
    const { successCount } = resultDetail;
    return (
      <Fragment>
        {!importError && (
          <FailInfoCon>
            <div className="detailDes flexRow">
              <img src={alertImg} className="alertIcon" />
              <div>
                <div className="detailDesCount">
                  {currentTab === 'import'
                    ? _l('成功导入 %0 人，失败 %1 人', successCount, dataSource.length)
                    : _l('成功更新%0人，未更新 %1 人', successCount, dataSource.length)}
                </div>
                <div className="desInfo">{_l('成功导入的成员可以收到邀请链接')}</div>
              </div>
            </div>
            <div className="listTitle flexRow">
              <div>{currentTab === 'import' ? _l('导入新成员失败列表') : _l('更新成员信息失败列表')}</div>
              {resultDetail.dowloadId && (
                <div onClick={this.exportExcel} className="downloadBtn">
                  {_l('下载失败列表')}
                </div>
              )}
            </div>
            <Table
              rowKey={record => record.accountId}
              columns={this.columns()}
              dataSource={dataSource}
              pagination={false}
              scroll={{ x: 300, y: 'calc(100vh - 300px)' }}
            />
          </FailInfoCon>
        )}
        {importError && (
          <ImportError>
            <Icon icon="task-folder-message" className="errorIcon" />
            <div className="errorTxt">{_l('导入错误')}</div>
            <div className="errorDes">
              {_l('请')}
              <a className="Font16 ThemeColor3 Hover_49" href="/staticfiles/template/importuser.xlsx" target="_blank">
                {_l('下载模板')}
              </a>
              {_l('，按格式修改后重新导入')}
            </div>
            <button className="ming Button uploadBtnStyle mTop30" onClick={() => this.props.changeShowList(false)}>
              {_l('重新上传')}
            </button>
          </ImportError>
        )}
      </Fragment>
    );
  }
}
