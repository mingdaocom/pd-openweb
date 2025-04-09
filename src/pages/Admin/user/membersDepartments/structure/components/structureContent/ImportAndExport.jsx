import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Icon, VerifyPasswordConfirm } from 'ming-ui';
import { captcha, dialogSelectDept } from 'ming-ui/functions';
import importUser from 'src/api/importUser';
import { getCurrentProject } from 'src/util';
import Config from '../../../../../config';
import { downloadFile } from '../../../../../util';
import * as actions from '../../actions/entities';
import ImportResulFailtDetail from './ImportResulFailtDetail';
import UploadFile from './UploadFile';

const ImportBtn = styled.div`
  background: #219dff;
  border-radius: 32px;
  color: #fff;
  height: 36px;
  line-height: 36px;
  margin: 44px auto 24px;
  text-align: center;
  width: 193px;
  cursor: ${props => (props.notAllowed ? 'not-allowed' : 'pointer')};
`;

const userTemplatePaths = {
  0: md.global.Config.IsPlatformLocal ? '/staticfiles/template/成员导入模板.xlsx' : '/staticfiles/template/成员导入模板_v2.xlsx',
  1: md.global.Config.IsPlatformLocal ? '/staticfiles/template/User Import Template.xlsx' : '/staticfiles/template/User Import Template_v2.xlsx',
  2: md.global.Config.IsPlatformLocal ? '/staticfiles/template/メンバーインポートテンプレート.xlsx' : '/staticfiles/template/メンバーインポートテンプレート_v2.xlsx',
  3: md.global.Config.IsPlatformLocal ? '/staticfiles/template/成員導入模板.xlsx' : '/staticfiles/template/成員導入模板_v2.xlsx',
};
class ImportAndExport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 'import',
      fileName: '',
      fileUrl: '',
      resultDetail: {},
      isShowFailList: false,
      importFileLoading: false,
    };
  }
  componentDidMount() {}

  changeTab = currentTab => {
    this.setState({ currentTab, fileName: '', fileUrl: '' });
  };

  verifyPasswordDialog = () => {
    const { projectId } = this.props;
    const { orgnazation = [] } = this.state;

    VerifyPasswordConfirm.confirm({
      allowNoVerify: false,
      isRequired: false,
      closeImageValidation: false,
      onOk: () => {
        this.exportUsers(
          projectId,
          orgnazation.map(item => item.departmentId),
        );
        this.setState({ password: undefined });
      },
    });
  };

  // 导出
  exportFile = () => {
    const { projectId } = this.props;
    const _this = this;

    dialogSelectDept({
      projectId,
      unique: false,
      showCreateBtn: false,
      isShowAllOrg: true,
      fromAdmin: true,
      allProject: true,
      selectFn(departments) {
        let orgList = departments.map(item => {
          if (item.departmentId.indexOf('orgs') > -1) {
            return { ...item, departmentId: '' };
          }
          return item;
        });
        _this.setState({ orgnazation: orgList }, _this.verifyPasswordDialog);
      },
    });
  };

  exportUsers = (projectId, departmentIds = []) => {
    const url = `${md.global.Config.AjaxApiUrl}download/exportProjectUserList`;
    let projectName = getCurrentProject(projectId, true).companyName;
    let date = moment().format('YYYYMMDDHHmmss');
    const fileName = `${projectName}_${date}` + '.xlsx';

    downloadFile({
      url,
      params: {
        userStatus: '1',
        projectId,
        departmentIds: departmentIds.join(','),
      },
      exportFileName: fileName,
    });
  };

  changeShowList = flag => {
    this.setState({ isShowFailList: flag });
  };
  renderFailDetail = () => {
    let { currentTab, resultDetail = {}, importError } = this.state;
    return (
      <ImportResulFailtDetail
        currentTab={currentTab}
        resultDetail={resultDetail}
        projectId={this.props.projectId}
        importError={importError}
        changeShowList={this.changeShowList}
      />
    );
  };
  updateUploadInfo = ({ fileName, fileUrl }) => {
    this.setState({ fileName, fileUrl });
  };
  importFile = () => {
    this.setState({ importFileLoading: true });
    let { currentTab, fileName } = this.state;
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
        currentTab === 'import' ? importUser.importUserList(requestData) : importUser.importEditUserList(requestData);
      promiseRequest
        .then(result => {
          const { dowloadId, actionResult, failUsers, successCount } = result;
          this.setState({ importFileLoading: false, resultDetail: result });
          if (actionResult === 0 || (actionResult === 1 && !failUsers.length && !successCount)) {
            alert(_l('导入失败'), 2);
          } else if (actionResult === 1) {
            if (_.isEmpty(failUsers)) alert(_l('导入成功'));
            _this.setState({
              importError: false,
              isShowFailList: dowloadId || actionResult === 0,
              fileName: '',
              fileUrl: '',
            });
          } else if (actionResult === 2) {
            alert(_l('验证码错误'), 3);
          } else if (actionResult === 3) {
            alert(_l('超出导入数量限制'), 3);
          } else if (actionResult === 4) {
            alert(_l('超出邀请数量限制'), 3);
          } else {
            _this.setState({
              importError: true,
              isShowFailList: false,
            });
          }
        })
        .catch(res => {
          _this.setState({ resultDetail: res, importError: true, isShowFailList: false, importFileLoading: false });
        });
    };

    new captcha(callback);
  };
  renderImport = () => {
    let { fileName } = this.state;

    return (
      <div className="uploadStep">
        <div className="serialTitle">{_l('1.下载导入模版')}</div>
        <div className="importUploadModule">
          <div className="importUploadText">
            <span className="Font20 mRight10 mBottom2 icon-task_custom_excel_01 color_gr TxtMiddle" />
            <span className="Font17">{_l('导入模板')}</span>
          </div>
          <a className="Font16 downloadBtn" href={userTemplatePaths[getCurrentLangCode()]} target="_blank">
            {_l('下载')}
          </a>
        </div>
        <div className="serialTitle mTop30">{_l('2.上传完善后的表格')}</div>
        {this.renderUpload()}
        {!fileName && <div className="Gray_75">{_l('·最多一次可以导入 500 个用户，否则可能导致失效')}</div>}
      </div>
    );
  };
  renderExport = () => {
    return (
      <div className="exportInfo">
        <div className="templateInfo">
          <div>
            <span className="Font20 mRight10 mBottom2 icon-supervisor_account ThemeColor TxtMiddle" />
            {_l('成员列表')}
          </div>
          <div className="exportBtn " onClick={this.exportFile}>
            {_l('导出')}
          </div>
        </div>
        <div className="Gray_75 mBottom16">{_l('如果需要修改成员信息，可在本地编辑后，上传表格完成修改')}</div>
        {this.renderUpload()}
      </div>
    );
  };
  renderUpload = () => {
    let { fileName } = this.state;
    return (
      <div className="importExcelBox">
        <span className={cx('icon-task_custom_excel_01', fileName ? 'color_gr' : 'color_d')} />
        <span className="Font13 mTop10 color_dd">{fileName ? fileName : _l('支持 excel')}</span>
        <UploadFile fileName={fileName} updateUploadInfo={this.updateUploadInfo} />
      </div>
    );
  };

  render() {
    let { currentTab, isShowFailList, fileName, importFileLoading } = this.state;
    return (
      <div className="exportContainer">
        <div className="exportHeader">
          <Icon
            icon="arrow_back"
            onClick={() => {
              this.props.updateShowExport(false);
            }}
          />
          {_l('导入 / 导出 / 修改')}
        </div>
        {!isShowFailList && (
          <div className="exportContent">
            <div className="tabs">
              <div
                className={cx('tabItem', { activeTab: currentTab === 'import' })}
                onClick={() => this.changeTab('import')}
              >
                {_l('导入新成员')}
              </div>
              <div
                className={cx('tabItem', { activeTab: currentTab === 'export' })}
                onClick={() => this.changeTab('export')}
              >
                {_l('导出 / 修改')}
              </div>
            </div>
            {currentTab === 'import' && this.renderImport()}
            {currentTab === 'export' && this.renderExport()}
            {fileName ? (
              <ImportBtn notAllowed={importFileLoading} onClick={importFileLoading ? () => {} : this.importFile}>
                {importFileLoading ? _l('正在导入...') : _l('导入')}
              </ImportBtn>
            ) : (
              ''
            )}
          </div>
        )}
        {isShowFailList && this.renderFailDetail()}
      </div>
    );
  }
}

export default connect(
  state => {
    const { current } = state;
    const { projectId } = current;
    return {
      projectId,
    };
  },
  dispatch => bindActionCreators({ ..._.pick(actions, ['updateShowExport']) }, dispatch),
)(ImportAndExport);
