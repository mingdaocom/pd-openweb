import React, { Component } from 'react';
import './index.less';
import { createUploader } from 'src/pages/kc/utils/qiniuUpload';
import cx from 'classnames';
import Config from '../../../config';
import importUser from 'src/api/importUser';
import captcha from 'src/components/captcha';

export default class ImportUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileName: '',
      fileUrl: '',
      showResult: false,
      resultDetail: {},
    };
  }

  componentDidMount() {
    this.uploadFile();
  }

  uploadFile() {
    let isUploading = false;
    const _this = this;
    createUploader({
      runtimes: 'html5',
      max_file_count: 1,
      browse_button: _this.con,
      multi_selection: false,
      max_file_size: '4mb',
      filters: [
        {
          title: 'File',
          extensions: 'xlsx,xls',
        },
      ],
      init: {
        BeforeUpload: function(up, file) {
          // 导入过程进行锁定，文件上传功能失效
          if (isUploading) {
            up.stop();
            up.removeFile(file);
            alert(_l('数据导入中，请稍后使用该功能'), 3, 1000);
            return false;
          }

          if (File.GetExt(file.name) != 'xlsx' && File.GetExt(file.name) != 'xls') {
            alert(_l('上传失败，文件错误，请下载专用模板'), 3, 1000);
            up.stop();
            up.removeFile(file);
            return false;
          }
          // 开始上传
          isUploading = true;
        },
        FileUploaded(up, file, info) {
          up.stop();
          _this.setState({
            fileName: file.name,
            fileUrl: md.global.FileStoreConfig.documentHost + info.response.key,
          });
          isUploading = false;
        },
      },
    });
  }

  handleUpload() {
    const _this = this;
    const callback = rsp => {
      if (rsp.ret !== 0) {
        return;
      }
      // 开始导入
      const requestData = {
        projectId: Config.projectId,
        fileName: _this.state.fileUrl,
        ticket: rsp.ticket,
        randstr: rsp.randstr,
        captchaType: md.staticglobal.CaptchaType()
      };

      $('#sendBtn')
        .prop('disabled', true)
        .html(_l('正在导入…'));
      $('#upload_field').addClass('hidden');
      importUser.importUserList(requestData).then(result => {
        _this.setState(
          {
            fileName: '',
            fileUrl: '',
            showResult: true,
            resultDetail: result,
          },
          () => {
            $('#sendBtn')
              .prop('disabled', false)
              .html(_l('导入'));
            $('#upload_field').removeClass('hidden');
          },
        );
      }).fail()
    };

    if (md.staticglobal.CaptchaType() === 1) {
      new captcha(callback);
    } else {
      new TencentCaptcha(md.staticglobal.TencentAppId, callback).show();
    }
  }

  renderResultReason(actionResult) {
    switch (actionResult) {
      case 0:
        return _l('用户导入出现错误，请重试');
      case 2:
        return _l('验证码错误');
      case 3:
        return _l('模板导入用户超过限制');
      case 4:
        return _l('导入用户数超过了邀请人数上限');
    }
  }

  handleChangeShow() {
    this.setState({ showResult: false, resultDetail: {} }, () => this.uploadFile());
  }

  renderResultContent() {
    const { resultDetail = {} } = this.state;
    const actionResult = Number(resultDetail.actionResult);
    const failCount = resultDetail.failUsers && resultDetail.failUsers.length;
    const successCount = resultDetail.successUsers && resultDetail.successUsers.length;
    if (_.includes([0, 2, 3, 4], actionResult)) {
      return (
        <div className="uploadUserResult">
          <span className="color_r Font56 icon-cancel"></span>
          <span className="Font24 color_b">{_l('导入失败')}</span>
          <span className="color_g mTop16">{this.renderResultReason(actionResult)}</span>
          <button
            type="button"
            className="ming Button Button--primary uploadBtn"
            onClick={this.handleChangeShow.bind(this)}
          >
            {_l('重新上传')}
          </button>
        </div>
      );
    } else if (actionResult === 1) {
      if (!failCount) {
        return (
          <div className="uploadUserResult">
            <span className="color_gr Font56 icon-check_circle"></span>
            <span className="Font24 color_b mTop35">{_l('成功导入 %0 人', successCount || 0)}</span>
            <span className="color_g mTop16">{_l('成功导入的成员可直接登录使用')}</span>
            <button
              type="button"
              className="ming Button Button--primary uploadBtn"
              onClick={() => this.props.closeDialog()}
            >
              {_l('完成')}
            </button>
          </div>
        );
      } else {
        return (
          <div className="uploadUserResult">
            <span className="color_blue Font56 icon-info"></span>
            <span className="Font24 color_b">
              {_l('成功导入 %0 人, 失败 ', successCount || 0)}
              <span className="color_r">{failCount}</span>
              {_l(' 人')}
            </span>
            <span className="color_g mTop16">{_l('成功导入的成员可以收到邀请链接')}</span>
            <button
              type="button"
              className="ming Button Button--primary uploadBtn"
              onClick={this.handleChangeShow.bind(this)}
            >
              {_l('重新上传')}
            </button>
            {/* <button type="button" className="ming Button Button--link ThemeColor3 Font12 mTop30">
                {_l('查看失败列表')}
              </button> */}
          </div>
        );
      }
    }
  }

  render() {
    const { fileName, showResult } = this.state;
    return (
      <div className="dialogImportUser">
        {showResult ? (
          this.renderResultContent()
        ) : (
          <div className="uploadStep">
            <div className="importUploadModule">
              <div className="importUploadText">
                <span className="Font20 mRight10 mBottom2 icon-task_custom_excel_01 ThemeColor3"></span>
                <span className="Font17 color_b">{_l('请下载模板，按格式修改后导入')}</span>
              </div>
              <a className="Font16 ThemeColor3 Hover_49" href="/staticfiles/template/user.xlsx" target="_blank">
                {_l('下载模板')}
              </a>
            </div>
            <div className="importExcelBox mTop24">
              <span className={cx('icon-task_custom_excel_01', fileName ? 'color_gr' : 'color_d')}></span>
              <span className="Font13 mTop10 color_dd">{fileName ? fileName : _l('支持 xlsx, xls文件')}</span>
              <button
                id="upload_field"
                ref={con => (this.con = con)}
                type="button"
                className="ming Button importBtnBorder mTop30"
              >
                {fileName ? _l('重新上传') : _l('上传文件')}
              </button>
            </div>
            {fileName ? (
              <div className="TxtCenter">
                <button
                  id="sendBtn"
                  type="button"
                  className="uploadBtn ming Button Button--primary"
                  onClick={this.handleUpload.bind(this)}
                >
                  {_l('导入')}
                </button>
              </div>
            ) : (
              <div className="color_g mTop24">{_l('最多一次可以导入 500 个用户，否则可能导致失效')}</div>
            )}
          </div>
        )}
      </div>
    );
  }
}
