import React from 'react';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import withClickAway from 'ming-ui/decorators/withClickAway';
import './editPrint.less';
import { createUploader } from 'src/pages/kc/utils/qiniuUpload';
import { getUrlByBucketName } from 'src/util';

@withClickAway
class EditPrint extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      suc: false,
      loadPer: 0,
      bindCreateUpload: false,
      url: '',
      key: '',
      fileName: '',
      templateName: '',
      file: {},
      hasChange: false,
    };
    this.con = React.createRef();
  }

  componentDidMount() {
    this.setData();
  }
  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.templateId !== this.props.templateId) {
      this.uploaderDestroy();
      this.setData(nextProps);
    }
  }
  componentDidUpdate(prevProps) {
    if (!this.state.bindCreateUpload) {
      this.createUploader();
    }
  }
  componentWillUnmount() {
    this.uploaderDestroy();
  }
  setData = nextProps => {
    const { printData = [], templateId } = nextProps || this.props;
    let templatedata = printData.find(it => it.id === templateId) || [];
    this.setState({
      templateName: templatedata.name,
      fileName: templatedata.formName,
      hasChange: false,
    });
    this.createUploader();
    this.con.addEventListener('dragover', e => {
      e.stopPropagation();
      //阻止浏览器默认打开文件的操作
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });
    //拖拽区域
    this.con.addEventListener(
      'drop',
      e => {
        e.stopPropagation();
        //阻止浏览器默认打开文件的操作
        e.preventDefault();
      },
      false,
    );
  };

  uploaderDestroy = () => {
    if (this.uploader) {
      this.uploader.destroy();
    }
  };
  /**
   * 创建上传
   */
  createUploader() {
    this.uploader = createUploader({
      browse_button: 'editorFiles',
      bucket: 3,
      filters: {
        mime_types: [{ extensions: 'docx' }],
      },
      init: {
        BeforeUpload: (up, file) => {
          if (File.GetExt(file.name) != 'docx') {
            alert(_l('上传失败，文件错误'), 3, 1000);
            return false;
          }
          this.setState({ loading: true, suc: false, loadPer: 0, fileName: file.name, file: file, hasChange: true });
        },
        FilesAdded: (up, file) => {
          up.setOption('auto_start', true);
        },
        UploadProgress: (uploader, file) => {
          this.setState({ loading: true, suc: false, loadPer: file.percent });
        },
        FileUploaded: (up, file, info) => {
          const { bucket, key, fsize } = info.response;
          this.setState({
            loading: false,
            suc: true,
            loadPer: file.percent,
            url: getUrlByBucketName(bucket) + key,
            key: key,
            file: file,
          });
        },
        Error: (up, err, errTip) => {
          this.setState({
            loading: false,
            suc: false,
            loadPer: 0,
            fileName: '',
            url: '',
            key: '',
          });
          if (errTip) {
            alert(errTip);
          }
        },
      },
    });

    this.setState({ bindCreateUpload: true });
  }

  render() {
    const { loading, suc, loadPer, fileName, file, url, templateName, hasChange } = this.state;
    const { onClose, worksheetId, downLoadUrl, templateId, refreshFn } = this.props;
    return (
      <div className="editPrint upload">
        <h5 className="title">
          {templateId ? _l('编辑模板: %0', templateName) : _l('新建模板')}
          <Icon
            icon="clear_1"
            className="closeBtnN"
            onClick={() => {
              onClose();
            }}
          />
        </h5>
        <div className="uploadBoxCon">
          <div className="uploadCon">
            <p className="tiTop">
              <span className="num">1</span>
              {_l('制作模板')}
            </p>
            <p className="desc mTop20">
              <span className="Font13 Gray_9e">
                {_l(
                  '请先根据系统提供的字段代码对照表将所需要的字段代码复制后粘贴到对应 的本地的 Word 模板中制作成模板。',
                )}
              </span>
            </p>
            <p
              className="btnTable mTop20 Hand"
              onClick={() => {
                window.open(`/worksheet/uploadTemplateSheet/${worksheetId}`);
              }}
            >
              {_l('开始制作')}
              <Icon icon="navigate_next" className="mLeft8" />
            </p>
            <p className="tiTop mTop50">
              <span className="num">2</span>
              {_l('上传制作好的模板')}
            </p>
            <p
              className={cx('uploadBtn mTop20', { loading: loading })}
              ref={con => {
                this.con = con;
              }}
            >
              {fileName ? <span className="wordIcon"></span> : <Icon icon="file" className="LightGray" />}
              <p className="mTop15 TxtCenter">
                {fileName ? (
                  <React.Fragment>
                    <span className="form">{fileName}</span>
                    {templateId && !hasChange && (
                      <span
                        className="downLoad"
                        onClick={() => {
                          let ajaxUrl;
                          let option;
                          ajaxUrl = downLoadUrl + '/ExportWord/DownloadWord';
                          option = {
                            id: templateId,
                          };
                          const exportDocument = document;
                          const form = exportDocument.createElement('form');
                          const hiddenField = exportDocument.createElement('input');
                          form.setAttribute('method', 'get');
                          form.setAttribute('action', ajaxUrl);
                          hiddenField.setAttribute('value', templateId);
                          hiddenField.setAttribute('name', 'id');
                          hiddenField.setAttribute('type', 'hidden');
                          form.appendChild(hiddenField);
                          exportDocument.body.appendChild(form);
                          form.submit();
                        }}
                      >
                        {_l('下载')}
                      </span>
                    )}
                  </React.Fragment>
                ) : (
                  <span className="Gray_9e">{_l('请选择docx格式的Word文件')}</span>
                )}
              </p>
              {!loading ? (
                <React.Fragment>
                  <span
                    id="editorFiles"
                    onClick={() => {
                      $('#fileDemo').click();
                    }}
                  >
                    {!fileName ? _l('上传模板') : _l('重新上传')}
                  </span>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <span className="lineBox">
                    <span className="line" style={{ width: `${loadPer}%` }}></span>
                    {/* <span className="text">{_l('上传中…')}</span> */}
                  </span>
                  <span className="per">{loadPer}%</span>
                  <Icon
                    icon="workflow_cancel"
                    className="closeIcon"
                    onClick={() => {
                      if (this.uploader) {
                        this.uploader.stop();
                        this.uploader.removeFile(file);
                        this.setState({
                          loading: false,
                          suc: false,
                          loadPer: 0,
                          fileName: '',
                          url: '',
                          key: '',
                        });
                      }
                    }}
                  />
                </React.Fragment>
              )}
            </p>
          </div>
        </div>
        <div className="activeBox">
          <span
            className={cx('sure', { disa: !this.state.hasChange })}
            onClick={() => {
              if (!this.state.hasChange) {
                return;
              }
              let ajaxUrl;
              let option;
              if (templateId) {
                ajaxUrl = downLoadUrl + '/ExportWord/UploadWord';
                option = {
                  id: templateId,
                  accountId: md.global.Account.accountId,
                  doc: this.state.key,
                  name: fileName,
                };
              } else {
                ajaxUrl = downLoadUrl + '/ExportWord/CreateWord';
                option = {
                  worksheetId: worksheetId,
                  accountId: md.global.Account.accountId,
                  doc: this.state.key,
                  name: fileName,
                };
              }
              $.ajax({
                type: 'POST',
                url: ajaxUrl,
                data: option,
              }).done(res => {
                if (res.status !== 1) {
                  alert(res.message);
                } else {
                  refreshFn();
                  alert(templateId ? _l('修改成功') : _l('添加成功'));
                }
              });
            }}
          >
            {_l('确定')}
          </span>
          <span
            className="cancle"
            onClick={() => {
              onClose();
            }}
          >
            {_l('取消')}
          </span>
        </div>
      </div>
    );
  }
}

export default EditPrint;
