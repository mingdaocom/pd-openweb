import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Button } from 'ming-ui/antd-components';
import { captcha } from 'ming-ui/functions';
import departmentController from 'src/api/department';
import jobController from 'src/api/job';
import importOrgRoleListController from 'src/api/organize';
import { Table } from 'src/ming-ui/antd-components/AsyncAntd';
import Config from '../../config';
import UploadFile from '../UploadFile';

const ImportWrap = styled.div`
  background: var(--color-background-primary);
  border-radius: 4px;
  width: 100%;
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
    border-bottom: 1px solid var(--color-border-secondary);
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
        color: var(--color-text-title);
        margin-bottom: 17px;
      }
      .color_b {
        color: var(--color-text-title);
      }
      .color_gr {
        color: var(--color-success);
      }
      .color_g {
        color: var(--color-text-tertiary);
      }
      .color_d {
        color: var(--color-border-primary);
      }
      .color_dd {
        color: var(--color-text-secondary);
      }
      .color_r {
        color: var(--color-error);
      }
      .color_blue {
        color: var(--color-primary);
      }
      .importUploadModule {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 56px;
        padding: 0 25px;
        border: 1px solid var(--color-border-primary);
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.12);
        border-radius: 3px;
        box-sizing: border-box;
        .importUploadText {
          display: flex;
          align-items: center;
          line-height: 37px;
        }
      }
      .importExcelBox {
        height: 271px;
        border: 3px dashed var(--color-border-secondary);
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
    .errorIcon {
      font-size: 44px;
      color: var(--color-error);
      vertical-align: middle;
      margin-right: 19px;
    }
    > span {
      vertical-align: middle;
    }
  }
`;
const ListErrorInfo = styled.div`
  height: calc(100% - 56px);
  padding: 58px 33px 0;
  font-size: 24px;
  font-family: FZLanTingHeiS;
  font-weight: 600;
  overflow-y: auto;
  .listErrorInfo {
    display: flex;
    justify-content: center;
    .errorIcon {
      font-size: 44px;
      line-height: 57px;
      color: var(--color-error);
      vertical-align: middle;
      margin-right: 19px;
    }
    .primaryColor {
      color: var(--color-primary);
    }
  }
  .errorList {
    width: 100%;
    .hap-table-thead {
      tr {
        th {
          background-color: var(--color-background-primary);
          padding: 14px 10px;
          color: var(--color-text-secondary);
          font-weight: 400;
          .hap-checkbox-wrapper {
            .hap-checkbox {
              &.hap-checkbox-checked::after {
                border: none;
              }
              .hap-checkbox-inner {
                top: -8px;
              }
            }
          }
        }
      }
    }
    .hap-table-tbody {
      .hap-table-row {
        .hap-table-cell {
          padding: 18px 10px;
          border: none;
          color: var(--color-text-title);
          border-bottom: 1px solid var(--color-border-secondary);
          .avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            vertical-align: middle;
            margin-right: 10px;
          }
          .hap-checkbox-wrapper {
            .hap-checkbox {
              &.hap-checkbox-checked::after {
                border: none;
              }
              .hap-checkbox-inner {
                top: -8px;
              }
            }
          }
          &.hap-table-selection-column {
            padding: 0;
          }
        }
        &.hap-table-row-selected {
          .hap-table-cell {
            background: var(--color-background-primary);
          }
        }
        &.hap-table-row-selected:hover {
          .hap-table-cell {
            background: var(--color-background-secondary);
          }
        }
      }
      .hap-table-placeholder {
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
  .successIcon {
    font-size: 44px;
    vertical-align: middle;
    color: #00c345;
    margin-right: 19px;
  }
`;

const IMPORT_BUTTON_STYLE = { display: 'block', width: 193, margin: '44px auto 0' };
const BACK_BUTTON_STYLE = { width: 193, marginTop: 50 };

export default class ImportDeptAndRole extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileName: '',
      actionResultStatus: '', // 1: 成功  2: 导入列表失败返回错误信息列表  5: 导入文件列名有误
      columns: [
        { dataIndex: 'rowNum', title: _l('错误行'), width: 100 },
        { dataIndex: 'failReason', title: _l('错误原因') },
      ],
      dataSource: [],
    };
  }
  renderUpload = () => {
    let { fileName } = this.state;
    return (
      <div className="importExcelBox" id="importExcelBox">
        <span className={cx('icon-new_excel', fileName ? 'color_gr' : 'color_d')} />
        <span className="Font13 mTop10 color_dd">{fileName ? fileName : _l('支持 excel')}</span>
        <UploadFile
          fileName={fileName}
          updateUploadInfo={({ fileName, fileUrl }) => {
            this.setState({ fileName, fileUrl });
          }}
        />
      </div>
    );
  };
  // 导入
  importAction = () => {
    if (this.state.importFileLoading) return;

    const { importType } = this.props;
    const { fileName } = this.state;
    this.setState({ importFileLoading: true });
    const _this = this;

    const callback = rsp => {
      // 开始导入
      const requestData = {
        projectId: Config.projectId,
        fileName: this.state.fileUrl,
        ticket: rsp.ticket,
        randstr: rsp.randstr,
        captchaType: md.global.getCaptchaType(),
        originalFileName: fileName,
      };
      let promiseRequest =
        importType === 'position'
          ? jobController.importJobList(requestData)
          : importType === 'role'
            ? importOrgRoleListController.importOrgRoleList(requestData)
            : departmentController.importDepartmentList(requestData);

      promiseRequest
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

            this.props.updateList();
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
  renderImport = () => {
    const { txt, downLoadUrl } = this.props;
    let { fileName, importFileLoading } = this.state;
    return (
      <div className="uploadStep">
        <div className="serialTitle mTop32">{_l('1.下载导入模版')}</div>
        <div className="importUploadModule">
          <div className="importUploadText">
            <span className="Font20 mRight10 mBottom2 icon-new_excel color_gr TxtMiddle" />
            <span className="Font17">{_l('导入%0模板', txt)}</span>
          </div>
          <Button
            type="link"
            shape="round"
            className="Font16 Bold"
            href={downLoadUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {_l('下载')}
          </Button>
        </div>
        <div className="serialTitle mTop32 mBottom14">{_l('2.上传完善后的表格')}</div>
        {this.renderUpload()}
        {fileName && (
          <Button
            type="primary"
            shape="round"
            style={IMPORT_BUTTON_STYLE}
            loading={importFileLoading}
            onClick={this.importAction}
          >
            {importFileLoading ? _l('正在导入...') : _l('导入')}
          </Button>
        )}
      </div>
    );
  };
  renderImportResult = () => {
    let { actionResultStatus, columns, resultDetail = {} } = this.state;
    const { failes = [], successCount } = resultDetail;

    if (actionResultStatus === 1) {
      return (
        <SuccessInfo className="flexColumn">
          <div className="successInfo">
            <Icon icon="check_circle" className="successIcon" />
            <span>{_l('成功导入%0条记录', successCount)}</span>
          </div>
          <Button
            type="primary"
            shape="round"
            style={BACK_BUTTON_STYLE}
            onClick={() => this.props.clickBackList(false)}
          >
            {_l('返回')}
          </Button>
        </SuccessInfo>
      );
    } else if (actionResultStatus === 3) {
      return (
        <ColErrorInfo>
          <div className="colErrorInfo">
            <Icon icon="cancel" className="errorIcon" />
            <span>{_l('超出导入数量限制,单次导入上限1000行记录！')}</span>
          </div>
          <Button type="primary" shape="round" style={BACK_BUTTON_STYLE} onClick={this.backAct}>
            {_l('返回')}
          </Button>
        </ColErrorInfo>
      );
    } else if (actionResultStatus === 5) {
      return (
        <ColErrorInfo>
          <div className="colErrorInfo">
            <Icon icon="cancel" className="errorIcon" />
            <span>{_l('导入文件列名有误，请检查，或从导入模版中重新下载！')}</span>
          </div>
          <Button type="primary" shape="round" style={BACK_BUTTON_STYLE} onClick={this.backAct}>
            {_l('返回')}
          </Button>
        </ColErrorInfo>
      );
    } else {
      return (
        <ListErrorInfo>
          <div className="listErrorInfo">
            <Icon icon="cancel" className="errorIcon" />
            <div>
              <div>{_l('导入错误，请检查！')}</div>
              <div className="textSecondary Font14">
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
    const { txt, clickBackList = () => {} } = this.props;
    const { actionResultStatus } = this.state;
    return (
      <ImportWrap>
        <div className="exportHeader">
          <Icon icon="backspace" onClick={clickBackList} />
          {_l('导入%0', txt)}
        </div>
        <div className="importContent">
          {!actionResultStatus && this.renderImport()}
          {actionResultStatus && this.renderImportResult()}
        </div>
      </ImportWrap>
    );
  }
}
