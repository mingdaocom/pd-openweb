import React, { Component, Fragment } from 'react';
import { Icon, Dialog } from 'ming-ui';
import { Input } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../../actions/entities';
import DialogSelectDept from 'dialogSelectDept';
import cx from 'classnames';
import Config from '../../../config';
import importUser from 'src/api/importUser';
import captcha from 'src/components/captcha';
import UploadFile from './UploadFile';
import ImportResulFailtDetail from './ImportResulFailtDetail';
import AccountController from 'src/api/account';
import { encrypt } from 'src/util';
import { getPssId } from 'src/util/pssId';
import styled from 'styled-components';

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

const errorMsg = {
  6: _l('密码错误'),
  8: _l('验证码错误'),
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
  // 导出
  exportFile = () => {
    const { projectId } = this.props;
    const _this = this;
    new DialogSelectDept({
      projectId,
      unique: false,
      showCreateBtn: false,
      isShowAllOrg: true,
      allProject: true,
      selectFn(departments) {
        let orgList = departments.map(item => {
          if (item.departmentId.indexOf('orgs') > -1) {
            return { ...item, departmentId: '' };
          }
          return item;
        });
        _this.setState({
          orgnazation: orgList,
          showInputPassword: true,
        });
      },
    });
  };
  dialogInputPassword = () => {
    let { showInputPassword, password } = this.state;
    if (showInputPassword) {
      return (
        <Dialog
          className="dialogInputPassword"
          visible={showInputPassword}
          title={_l('请输入登录密码，以验证管理员身份')}
          footer={
            <div className="Hand" onClick={this.confirmPassword}>
              {_l('确认')}
            </div>
          }
          onCancel={() => {
            this.setState({ showInputPassword: false, password: undefined });
          }}
        >
          <div>{_l('登录密码')}</div>
          <Input.Password
            value={password}
            autocomplete="new-password"
            onChange={e => this.setState({ password: e.target.value })}
          />
        </Dialog>
      );
    } else {
      return '';
    }
  };
  confirmPassword = () => {
    const { projectId } = this.props;
    let { password, orgnazation = [] } = this.state;
    let _this = this;
    if (!password) {
      alert(_l('请输入登录密码'), 3);
      return;
    }
    let throttled = function (res) {
      if (res.ret !== 0) {
        return;
      }
      AccountController.checkAccount({
        ticket: res.ticket,
        randStr: res.randstr,
        captchaType: md.staticglobal.getCaptchaType(),
        password: encrypt(password),
      }).then(res => {
        if (res === 1) {
          _this.exportUsers(
            projectId,
            orgnazation.map(item => item.departmentId),
          );
          _this.setState({ showInputPassword: false, password: undefined });
        } else {
          alert(errorMsg[res] || _l('操作失败'), 2);
        }
      });
    };

    if (md.staticglobal.getCaptchaType() === 1) {
      new captcha(throttled);
    } else {
      new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), throttled).show();
    }
  };
  exportUsers = (projectId, departmentIds = []) => {
    let projectName = (md.global.Account.projects || []).filter(item => item.projectId === projectId).length
      ? (md.global.Account.projects || []).filter(item => item.projectId === projectId)[0].companyName
      : '';
    fetch(`${md.global.Config.AjaxApiUrl}download/exportProjectUserList`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `md_pss_id ${getPssId()}`,
      },
      body: JSON.stringify({
        userStatus: '1',
        projectId,
        departmentIds: departmentIds.join(','),
      }),
    })
      .then(response => response.blob())
      .then(blob => {
        let date = moment(new Date()).format('YYYYMMDDHHmmss');
        const fileName = `${projectName}_${date}` + '.xlsx';
        const link = document.createElement('a');

        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(link.href);
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
    let { currentTab } = this.state;
    const _this = this;
    const callback = rsp => {
      // 开始导入
      const requestData = {
        projectId: Config.projectId,
        fileName: this.state.fileUrl,
        ticket: rsp.ticket,
        randstr: rsp.randstr,
        captchaType: md.staticglobal.getCaptchaType(),
      };
      let promiseRequest =
        currentTab === 'import' ? importUser.importUserList(requestData) : importUser.importEditUserList(requestData);
      promiseRequest
        .then(result => {
          const { dowloadId, actionResult, failUsers } = result;
          this.setState({ importFileLoading: false, resultDetail: result });
          if (actionResult === 1) {
            if (_.isEmpty(failUsers)) alert(_l('导入成功'));
            _this.setState({
              importError: false,
              isShowFailList: dowloadId || actionResult === 0,
              fileName: '',
              fileUrl: '',
            });
          } else if (actionResult === 0) {
            alert(_l('导入失败'), 2);
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
        .fail(res => {
          _this.setState({ resultDetail: res, importError: true, isShowFailList: false, importFileLoading: false });
        });
    };
    if (md.staticglobal.getCaptchaType() === 1) {
      new captcha(callback);
    } else {
      new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), callback).show();
    }
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
          <a
            className="Font16 downloadBtn"
            href={
              !md.global.Config.IsLocal || md.global.Config.IsPlatformLocal
                ? '/staticfiles/template/memberImport.xlsx'
                : '/staticfiles/template/user.xlsx'
            }
            target="_blank"
          >
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
            <span className="Font20 mRight10 mBottom2 icon-task_custom_excel_01 color_gr TxtMiddle" />
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
        {this.dialogInputPassword()}
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
