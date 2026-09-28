import React, { Component, Fragment } from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Button } from 'ming-ui/antd-components';
import PageTableCon from 'src/pages/Admin/components/PageTableCon/index.js';
import { downloadFile } from '../../../../../util';
import alertImg from '../../assets/alert.png';

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
      font-weight: 600;
    }
    .desInfo {
      color: var(--color-text-secondary);
      font-size: 14px;
    }
  }
  .listTitle {
    justify-content: space-between;
    font-size: 17px;
    color: var(--color-text-title);
    line-height: 36px;
    margin-bottom: 30px;
  }
`;

const ImportError = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .errorIcon {
    color: var(--color-error);
    font-size: 56px;
  }
  .errorTxt {
    font-size: 24px;
    font-weight: 600;
    margin: 36px 0 16px;
  }
  .errorDes {
    font-size: 14px;
    color: var(--color-text-secondary);
    margin-bottom: 78px;
  }
`;

const userTemplatePaths = {
  0: '/staticfiles/template/importUserTemplate/导入用户.xlsx',
  1: '/staticfiles/template/importUserTemplate/import user.xlsx',
  2: '/staticfiles/template/importUserTemplate/ユーザーをインポートする.xlsx',
  3: '/staticfiles/template/importUserTemplate/導入用戶.xlsx',
  4: '/staticfiles/template/importUserTemplate/แม่แบบการนำเข้าผู้ใช้งาน.xlsx',
  5: '/staticfiles/template/importUserTemplate/Templat Import Pengguna.xlsx',
};
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
        {
          title: _l('角色'),
          dataIndex: 'orgRoleStr',
          ellipsis: true,
          width: 160,
          show: true,
          render: (t, record) => {
            return record.orgRole || record.orgRoleStr || '';
          },
        },
        { title: _l('工作地点'), dataIndex: 'workSite', ellipsis: true, width: 120, show: true },
        { title: _l('工号'), dataIndex: 'jobNumber', ellipsis: true, width: 120, show: true },
        {
          title: _l('工作电话'),
          dataIndex: 'workPhone',
          ellipsis: true,
          width: 160,
          show: true,
          render: (t, record) => {
            return record.contactPhone || record.workPhone || '';
          },
        },
        {
          title: _l('加入时间'),
          dataIndex: 'joinDate',
          ellipsis: true,
          width: 160,
          show: true,
        },
        { title: _l('失败原因'), dataIndex: 'failReason', fixed: 'right', ellipsis: true, width: 180, show: true },
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
    let name = currentTab === 'import' ? _l('导入新成员失败列表') : _l('导入修改用户信息失败列表');
    const date = moment().format('YYYYMMDDhhmmss');
    const fileName = `${name}-${date}` + '.xlsx';

    downloadFile({
      url,
      params: args,
      exportFileName: fileName,
    });
  };
  render() {
    const { resultDetail = {}, currentTab, importError } = this.props;
    let { dataSource = [] } = this.state;
    const { successCount } = resultDetail;
    return (
      <Fragment>
        {!importError && (
          <FailInfoCon className="flexColumn flex minHeight0">
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
                <Button type="primary" shape="round" onClick={this.exportExcel}>
                  {_l('下载失败列表')}
                </Button>
              )}
            </div>
            <div className="flex minHeight0">
              <PageTableCon columns={this.columns()} dataSource={dataSource} />
            </div>
          </FailInfoCon>
        )}
        {importError && (
          <ImportError>
            <Icon icon="error1" className="errorIcon" />
            <div className="errorTxt">{_l('导入错误')}</div>
            <div className="errorDes">
              {_l('请')}
              <a
                className="Font16 colorPrimary hoverColorPrimaryLight"
                href={userTemplatePaths[getCurrentLangCode()]}
                target="_blank"
              >
                {_l('下载模板')}
              </a>
              {_l('，按格式修改后重新导入')}
            </div>
            <Button
              color="primary"
              variant="outlined"
              shape="round"
              className="mTop30"
              onClick={() => this.props.changeShowList(false)}
            >
              {_l('重新上传')}
            </Button>
          </ImportError>
        )}
      </Fragment>
    );
  }
}
