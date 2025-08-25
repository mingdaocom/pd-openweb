import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Table } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { captcha } from 'ming-ui/functions';
import departmentController from 'src/api/department';
import { IMPORT_EXPORT_SHOWLIST } from 'src/pages/Admin/user/membersDepartments/structure/constant';
import Config from '../../../../../config';
import { loadDepartments, updateImportExportResult, updateImportType, updateShowExport } from '../../actions/entities';
import UploadFile from './UploadFile';

const ImportWrap = styled.div`
  background: #fff;
  border-radius: 4px;
  height: 100%;
  min-width: 750px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .exportHeader {
    height: 56px;
    line-height: 56px;
    font-weight: 600;
    font-size: 17px;
    padding-left: 24px;
    border-bottom: 1px solid #eaeaea;
    .icon {
      margin-right: 18px;
      cursor: pointer;
    }
  }
  .importContent {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 24px;
    .uploadStep {
      width: 640px;
      margin: 0 auto;
      .serialTitle {
        font-size: 14px;
        font-family: FZLanTingHeiS;
        font-weight: 600;
        color: #151515;
        margin-bottom: 17px;
      }
      .color_b {
        color: #151515;
      }
      .color_gr {
        color: #1bb954;
      }
      .color_g {
        color: #9e9e9e;
      }
      .color_d {
        color: #d9d9d9;
      }
      .color_dd {
        color: #757575;
      }
      .color_r {
        color: #f51744;
      }
      .color_blue {
        color: #1677ff;
      }
      .importUploadModule {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 56px;
        padding: 0 25px;
        border: 1px solid rgba(227, 227, 227, 1);
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.12);
        border-radius: 3px;
        box-sizing: border-box;
        .importUploadText {
          display: flex;
          align-items: center;
          line-height: 37px;
        }
        .downloadBtn {
          display: inline-block;
          height: 32px;
          font-size: 16px;
          font-weight: 600;
          line-height: 32px;
          text-align: center;
          border: none;
          border-radius: 32px;
          background-color: #fff;
        }
      }
      .importExcelBox {
        height: 271px;
        border: 3px dashed #eaeaea;
        border-radius: 3px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        .icon-new_excel {
          font-size: 50px;
        }
        .uploadBtnStyle {
          margin-top: 33px !important;
          width: 108px;
          height: 32px;
          border-radius: 32px;
          border: 1px solid #1677ff;
          background-color: #ffffff;
          color: #1677ff;
        }
      }
      .importBtn {
        width: 193px;
        height: 34px;
        margin: 44px auto 0;
        text-align: center;
        line-height: 34px;
        background: #219dff;
        border-radius: 32px;
        font-size: 14px;
        font-family: FZLanTingHeiS;
        font-weight: 600;
        color: #ffffff;
        &.notAllowed {
          cursor: not-allowed;
        }
      }
      .colErrorInfo {
        display: flex;
      }
    }
  }
`;
const ColErrorInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;
  height: calc(100% - 56px);
  align-items: center;
  .colErrorInfo {
    font-size: 24px;
    font-family: FZLanTingHeiS;
    font-weight: 600;
    color: #292929;
    .errorIcon {
      font-size: 44px;
      color: #f51744;
      vertical-align: middle;
      margin-right: 19px;
    }
    > span {
      vertical-align: middle;
    }
  }
  .backact {
    width: 193px;
    height: 34px;
    line-height: 34px;
    text-align: center;
    background: #219dff;
    border-radius: 32px;
    margin-top: 50px;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
  }
`;
const ListErrorInfo = styled.div`
  height: calc(100% - 56px);
  padding: 58px 33px 0;
  font-size: 24px;
  font-family: FZLanTingHeiS;
  font-weight: 600;
  color: #292929;
  overflow-y: auto;
  .listErrorInfo {
    display: flex;
    justify-content: center;
    .errorIcon {
      font-size: 44px;
      line-height: 57px;
      color: #f51744;
      vertical-align: middle;
      margin-right: 19px;
    }
    .Gray_89 {
      color: #898989;
    }
    .primaryColor {
      color: #1677ff;
    }
  }
  .errorList {
    width: 100%;
    .ant-table-thead {
      tr {
        th {
          background-color: #fff;
          padding: 14px 10px;
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
          padding: 18px 10px;
          border: none;
          color: #151515;
          border-bottom: 1px solid #eaeaea;
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

const SuccessInfo = styled.div`
  height: calc(100% - 56px);
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  font-size: 24px;
  font-family: FZLanTingHeiS;
  font-weight: 600;
  color: #292929;
  .successIcon {
    font-size: 44px;
    vertical-align: middle;
    color: #00c345;
    margin-right: 19px;
  }
  .backact {
    width: 193px;
    height: 34px;
    line-height: 34px;
    text-align: center;
    background: #219dff;
    border-radius: 32px;
    margin-top: 50px;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
  }
`;

// 导入部门模版
const dptTemplatePaths = {
  0: '/staticfiles/template/部门导入模板.xlsx',
  1: '/staticfiles/template/Department Import Template.xlsx',
  2: '/staticfiles/template/部門インポートテンプレート.xlsx',
  3: '/staticfiles/template/部門導入模板.xlsx',
};

class ImportDepAndPosition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      actionResultStatus: '', // 1: 成功  2: 导入列表失败返回错误信息列表  5: 导入文件列名有误
      columns: [
        { dataIndex: 'rowNum', title: _l('错误行'), width: 100 },
        { dataIndex: 'failReason', title: _l('错误原因') },
      ],
      dataSource: [],
    };
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.importExportResult, nextProps.importExportResult)) {
      let { actionResult } = nextProps.importExportResult;
      if (actionResult === 1) {
        this.setState({ actionResultStatus: 1 });
      } else {
        this.setState({ actionResultStatus: 2 });
      }
    }
  }
  renderImport = () => {
    let { fileName, importFileLoading } = this.state;

    return (
      <div className="uploadStep">
        <div className="serialTitle mTop32">{_l('1.下载导入模版')}</div>
        <div className="importUploadModule">
          <div className="importUploadText">
            <span className="Font20 mRight10 mBottom2 icon-new_excel color_gr TxtMiddle" />
            <span className="Font17">{_l('导入部门模板')}</span>
          </div>
          <a className="Font16 downloadBtn" href={dptTemplatePaths[getCurrentLangCode()]} target="_blank">
            {_l('下载')}
          </a>
        </div>
        <div className="serialTitle mTop32 mBottom14">{_l('2.上传完善后的表格')}</div>
        {this.renderUpload()}
        {fileName && (
          <div
            className={cx('importBtn', { notAllowed: importFileLoading, Hand: !importFileLoading })}
            onClick={importFileLoading ? () => {} : this.importAction}
          >
            {importFileLoading ? _l('正在导入...') : _l('导入')}
          </div>
        )}
      </div>
    );
  };
  updateUploadInfo = ({ fileName, fileUrl }) => {
    this.setState({ fileName, fileUrl });
  };
  renderUpload = () => {
    let { fileName } = this.state;
    return (
      <div className="importExcelBox" id="importExcelBox">
        <span className={cx('icon-new_excel', fileName ? 'color_gr' : 'color_d')} />
        <span className="Font13 mTop10 color_dd">{fileName ? fileName : _l('支持 excel')}</span>
        <UploadFile fileName={fileName} updateUploadInfo={this.updateUploadInfo} />
      </div>
    );
  };
  // 导入
  importAction = () => {
    const { importExportType } = this.props;
    this.setState({ importFileLoading: true });
    const _this = this;
    const callback = rsp => {
      // 开始导入
      const requestData = {
        projectId: Config.projectId,
        fileName: this.state.fileUrl,
        originalFileName: this.state.fileName,
        ticket: rsp.ticket,
        randstr: rsp.randstr,
        captchaType: md.global.getCaptchaType(),
      };

      departmentController
        .importDepartmentList(requestData)
        .then(result => {
          const { actionResult, failes } = result;
          if (actionResult === 1 || actionResult === 6) {
            if (!_.isEmpty(failes)) {
              _this.setState({
                resultDetail: result,
                importFileLoading: false,
                actionResultStatus: 2,
              });
              return;
            }
            if (importExportType === 'importDepartment') {
              this.props.loadDepartments('', 1);
            }
            _this.setState({
              importFileLoading: false,
              fileName: '',
              fileUrl: '',
              actionResultStatus: 1,
              resultDetail: result,
            });
          } else {
            this.setState({
              actionResultStatus: actionResult,
              importFileLoading: false,
              fileName: '',
              fileUrl: '',
            });
          }
        })
        .catch(() => {
          _this.setState({ importError: true, importFileLoading: false });
        });
    };

    new captcha(callback);
  };
  // 返回导入
  backAct = () => {
    this.setState({ actionResultStatus: '' });
  };
  renderImportResult = () => {
    let { actionResultStatus, columns, resultDetail = {} } = this.state;
    const { failes = [], successCount } = resultDetail;
    const { importExportType } = this.props;
    if (actionResultStatus === 1) {
      return (
        <SuccessInfo>
          <div className="successInfo">
            <Icon icon="check_circle" className="successIcon" />
            <span>{_l('成功导入%0条记录', successCount)}</span>
          </div>
          <div className="backact Hand" onClick={() => this.props.updateShowExport(false)}>
            {_l('返回')}
          </div>
        </SuccessInfo>
      );
    } else if (actionResultStatus === 3) {
      return (
        <ColErrorInfo>
          <div className="colErrorInfo">
            <Icon icon="cancel" className="errorIcon" />
            <span>{_l('超出导入数量限制,单次导入上限1000行记录！')}</span>
          </div>
          <div className="backact Hand" onClick={this.backAct}>
            {_l('返回')}
          </div>
        </ColErrorInfo>
      );
    } else if (actionResultStatus === 5) {
      return (
        <ColErrorInfo>
          <div className="colErrorInfo">
            <Icon icon="cancel" className="errorIcon" />
            <span>{_l('导入文件列名有误，请检查，或从导入模版中重新下载！')}</span>
          </div>
          <div className="backact Hand" onClick={this.backAct}>
            {_l('返回')}
          </div>
        </ColErrorInfo>
      );
    } else {
      let importOrExport = importExportType.indexOf('import') > -1 ? _l('导入') : _l('导出');
      return (
        <ListErrorInfo>
          <div className="listErrorInfo">
            <Icon icon="cancel" className="errorIcon" />
            <div>
              <div>{_l('%0错误，请检查！', importOrExport)}</div>
              <div className="Gray_89 Font14">
                {_l('请调整后，')}
                <a className="Hand primaryColor" onClick={this.backAct}>
                  {_l('重新上传')}
                </a>
              </div>
            </div>
          </div>
          <div className="Font17 mBottom30">{_l('错误信息')}</div>
          <Table className="errorList" columns={columns} dataSource={failes} pagination={false} />
        </ListErrorInfo>
      );
    }
  };
  render() {
    const { importExportType } = this.props;
    let { actionResultStatus } = this.state;
    return (
      <ImportWrap>
        <div className="exportHeader">
          <Icon
            icon="backspace"
            onClick={() => {
              this.props.updateShowExport(false);
              this.props.updateImportType('');
            }}
          />
          {IMPORT_EXPORT_SHOWLIST[importExportType]}
        </div>
        <div className="importContent">{!actionResultStatus && this.renderImport()}</div>
        {actionResultStatus && this.renderImportResult()}
      </ImportWrap>
    );
  }
}
export default connect(
  state => {
    const { current, entities } = state;
    const { projectId } = current;
    const { importExportType, importExportResult } = entities;
    return {
      projectId,
      importExportType,
      importExportResult,
    };
  },
  { updateShowExport, updateImportExportResult, updateImportType, loadDepartments },
)(ImportDepAndPosition);
