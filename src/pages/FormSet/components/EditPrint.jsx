import React from 'react';
import { Icon, Checkbox, Menu, MenuItem, LoadDiv } from 'ming-ui';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import withClickAway from 'ming-ui/decorators/withClickAway';
import './editPrint.less';
import createUploader from 'src/library/plupload/createUploader';
import { getUrlByBucketName, getFeatureStatus } from 'src/util';
import appManagementAjax from 'src/api/appManagement';
import sheetAjax from 'src/api/worksheet';
import RegExpValidator from 'src/util/expression';
import { VersionProductType } from 'src/util/enum';
import attachmentAjax from 'src/api/attachment';
import { createEditFileLink } from 'src/pages/UploadTemplateSheet/utils';

const SUFFIX = {
  Word: 'docx',
  Excel: 'xlsx',
};

const AJAX_URL = {
  Word: 'Word',
  Excel: 'Xlsx',
};

const EXPORT_URL = {
  UploadWord: '/ExportWord/UploadWord',
  UploadExcel: '/ExportXlsx/UploadXlsx',
  CreateWord: '/ExportWord/CreateWord',
  CreateExcel: '/ExportXlsx/CreateXlsx',
};

const EDIT_OPTIONS = [
  {
    label: _l('从空白创建'),
    value: 1,
  },
  {
    label: _l('从模版创建'),
    value: 2,
  },
];

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
      allowDownloadPermission: 0,
      allowDownloadChange: false,
      popupVisible: false,
      error: false,
      createEditLoading: false,
      allowEditAfterPrint: false,
      featureType: getFeatureStatus(props.projectId, VersionProductType.editAttachment),
    };
    this.con = React.createRef();
  }

  componentDidMount() {
    this.setData();
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.templateId !== this.props.templateId || nextProps.fileType !== this.props.fileType) {
      this.uploaderDestroy();
      this.setData(nextProps);
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.state.bindCreateUpload) {
      this.createUploader(this.props.fileType);
    }
  }

  componentWillUnmount() {
    this.uploaderDestroy();
  }

  setData = nextProps => {
    const { fileType, templateData = {} } = nextProps || this.props;
    this.setState({
      templateName: templateData.name,
      fileName: templateData.formName,
      hasChange: false,
      allowDownloadPermission: templateData.allowDownloadPermission || 0,
      allowEditAfterPrint: templateData.allowEditAfterPrint || false,
    });

    this.createUploader(fileType);
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
  createUploader(fileType = 'Word') {
    this.uploader = createUploader({
      browse_button: 'editorFiles',
      bucket: 3,
      filters: {
        mime_types: [{ extensions: SUFFIX[fileType] }],
      },
      type: 33,
      init: {
        BeforeUpload: (up, file) => {
          if (RegExpValidator.getExtOfFileName(file.name) != SUFFIX[fileType]) {
            alert(_l('上传失败，文件错误'), 3, 1000);
            return false;
          }
          this.setState({
            loading: true,
            suc: false,
            loadPer: 0,
            fileName: file.name,
            file: file,
            hasChange: true,
            error: false,
          });
        },
        FilesAdded: (up, file) => {
          up.setOption('auto_start', true);
        },
        UploadProgress: (uploader, file) => {
          this.setState({ loading: true, suc: false, loadPer: file.percent });
        },
        FileUploaded: (up, file, info) => {
          const { bucket, key, fsize } = info.response;
          this.setState(
            {
              loading: false,
              suc: true,
              loadPer: file.percent,
              url: getUrlByBucketName(bucket) + key,
              key: key,
              file: file,
            },
            () => {
              this.onOk();
            },
          );
        },
        Error: (up, err, errTip) => {
          this.setState({
            loading: false,
            suc: false,
            loadPer: 0,
            fileName: '',
            url: '',
            key: '',
            error: true,
          });
          if (errTip) {
            alert(errTip, 2);
          }
        },
      },
    });

    this.setState({ bindCreateUpload: true });
  }

  editDownload = (key = 'allowDownloadPermission') => {
    const { hasChange } = this.state;
    const value = !this.state[key];
    this.setState(
      {
        [key]: key === 'allowDownloadPermission' ? Number(value) : Boolean(value),
        allowDownloadChange: true,
      },
      () => {
        if (!hasChange && !!this.props.templateId) this.onOk(false);
      },
    );
  };

  onOk = async (closeFlag = true) => {
    const { fileName, hasChange, allowDownloadPermission, allowDownloadChange, allowEditAfterPrint } = this.state;
    const {
      onClose,
      worksheetId,
      downLoadUrl,
      templateId,
      refreshFn,
      fileType = 'Word',
      appId,
      updatePrint,
    } = this.props;

    if (allowDownloadChange && templateId) {
      sheetAjax
        .editTemplateDownloadPermission({
          id: templateId,
          allowDownloadPermission,
          allowEditAfterPrint,
        })
        .then(res => {
          if (!hasChange) {
            closeFlag && onClose();
            updatePrint(templateId, { allowDownloadPermission, allowEditAfterPrint });
          }
        });
    }
    if (!hasChange) {
      return;
    }
    let ajaxUrl;
    let option;
    //功能模块 token枚举，3 = 导出excel，4 = 导入excel生成表，5= word打印
    const token = await appManagementAjax.getToken({
      worksheetId: worksheetId || templateId,
      tokenType: 5,
    });
    if (templateId) {
      ajaxUrl = downLoadUrl + EXPORT_URL[`Upload${fileType}`];
      option = {
        id: templateId,
        accountId: md.global.Account.accountId,
        doc: this.state.key,
        name: fileName,
        token,
      };
    } else {
      ajaxUrl = downLoadUrl + EXPORT_URL[`Create${fileType}`];
      option = {
        worksheetId: worksheetId,
        accountId: md.global.Account.accountId,
        doc: this.state.key,
        name: fileName,
        token,
        appId,
      };
    }
    window
      .mdyAPI('', '', option, {
        ajaxOptions: {
          url: ajaxUrl,
          header: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
        customParseResponse: true,
      })
      .then(res => {
        if (res.status !== 1) {
          alert(res.message, 2);
          this.setState({ error: true });
          this.uploaderDestroy();
          this.createUploader(this.props.fileType);
        } else {
          if (!templateId && res.data) {
            this.setState({ templateId: res.data });

            sheetAjax
              .editTemplateDownloadPermission({
                id: res.data,
                allowDownloadPermission,
                allowEditAfterPrint,
              })
              .then(res => {
                if (res) {
                  refreshFn();
                  alert(_l('添加成功'));
                  return;
                }
              });
          } else {
            refreshFn();
            alert(templateId ? _l('修改成功') : _l('添加成功'));
          }
        }
      });
  };

  onCreateEdit = item => {
    const { worksheetId, downLoadUrl, fileType = 'Word', refreshFn, appId } = this.props;
    const { allowDownloadPermission, allowEditAfterPrint } = this.state;

    this.setState({ createEditLoading: true, popupVisible: false });
    createEditFileLink({
      worksheetId,
      downLoadUrl,
      allowDownloadPermission,
      allowEditAfterPrint,
      fileType: AJAX_URL[fileType],
      type: item.value,
      editTemplateDownloadPermission: true,
      appId,
      createCompleted: id => {
        this.setState({ createEditLoading: false });
        refreshFn(true, id);
      },
    });
  };

  onEdit = () => {
    const { templateId, worksheetId, createEditLoading } = this.props;

    if (createEditLoading) return;

    this.setState({ createEditLoading: true });
    attachmentAjax
      .getAttachmentEditDetail({
        fileId: templateId,
        editType: 2,
        worksheetId,
      })
      .then(res => {
        if (res.wpsEditUrl) window.open(res.wpsEditUrl);
        this.setState({ createEditLoading: false });
      });
  };

  renderEditFileBtn = () => {
    const { popupVisible, createEditLoading, featureType } = this.state;
    const { templateId, roleType, fileType } = this.props;
    const isAdmin = roleType === 2;

    if (!isAdmin || featureType !== '1' || md.global.Config.EnableDocEdit === false || fileType === 'Excel')
      return null;

    if (templateId)
      return (
        <span className={cx('editBtn mLeft10', { disable: createEditLoading })} onClick={this.onEdit}>
          <Icon icon="edit" className="mRight2 Font14" />
          {createEditLoading ? _l('请稍等...') : _l('在线编辑')}
        </span>
      );

    return (
      <Trigger
        popupVisible={popupVisible}
        onPopupVisibleChange={visible => this.setState({ popupVisible: visible })}
        action={createEditLoading ? [] : ['click']}
        popup={() => {
          return (
            <Menu style={{ left: 'initial', right: 0, width: 180 }}>
              {EDIT_OPTIONS.map((item, index) => (
                <MenuItem className="TxtLeft" key={index} onClick={() => this.onCreateEdit(item)}>
                  <span>{item.label}</span>
                </MenuItem>
              ))}
            </Menu>
          );
        }}
        popupAlign={{
          points: ['tr', 'br'],
          offset: [0, 10],
          overflow: { adjustX: true, adjustY: true },
        }}
        getPopupContainer={triggerNode => triggerNode.parentElement}
      >
        <span className={cx('editBtn mLeft10', { disable: createEditLoading })}>
          {createEditLoading ? (
            <LoadDiv size={12} className="mRight2" />
          ) : (
            <Icon icon="edit" className="mRight2 Font14" />
          )}
          {createEditLoading ? _l('创建中...') : _l('在线新建')}
        </span>
      </Trigger>
    );
  };

  render() {
    const {
      loading,
      loadPer,
      fileName,
      file,
      templateName,
      hasChange,
      allowDownloadPermission,
      error,
      createEditLoading,
      allowEditAfterPrint,
      featureType,
    } = this.state;
    const { onClose, worksheetId, downLoadUrl, templateId, fileType = 'Word', roleType } = this.props;

    const isAdmin = roleType === 2;

    return (
      <div className="editPrint upload flexColumn h100">
        <h5 className="title overflow_ellipsis">
          {templateId ? _l('编辑模板: %0', templateName) : _l('新建模板')}
          <Icon
            icon="clear_1"
            className="closeBtnN"
            onClick={() => {
              onClose();
            }}
          />
        </h5>
        <div className="uploadBoxCon flex">
          <div className="uploadCon">
            <p className="tiTop">{_l('1.下载示范模板')}</p>
            <p className="desc mTop20">
              <span className="Font13 Gray_9e">
                {_l(
                  '请先根据系统提供的字段代码对照表将所需要的字段代码复制后粘贴到对应 的本地的 %0 模板中制作成模板。',
                  fileType,
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
            <div className="tiTop mTop50 valignWrapper">
              <div>{_l('2.制作模板')}</div>
            </div>
            <p
              className={cx('uploadBtn mTop20', { loading: loading })}
              ref={con => {
                this.con = con;
              }}
            >
              {fileName && !error ? (
                <span className={fileType === 'Excel' ? 'icon-new_excel Font50 excelIcon' : 'wordIcon'}></span>
              ) : (
                <Icon icon="file" className="LightGray" />
              )}
              <p className="mTop15 TxtCenter">
                {(fileName && !error) || templateId ? (
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
                  <span className="Gray_9e">
                    {_l('若选择本地上传，请选择%0格式的%1文件；', SUFFIX[fileType], fileType)}
                    <br />
                    {isAdmin &&
                      featureType === '1' &&
                      md.global.Config.EnableDocEdit !== false &&
                      fileType !== 'Excel' &&
                      _l('您也可以在线新增模板')}
                  </span>
                )}
              </p>
              {!loading ? (
                <div className="valignWrapper mTop32 justifyContentCenter">
                  <span
                    id="editorFiles"
                    onClick={() => {
                      $('#fileDemo').click();
                    }}
                  >
                    <Icon icon="file_upload" className="mRight2 Font14" />
                    {!fileName && !error ? _l('本地上传') : _l('重新上传')}
                  </span>
                  {this.renderEditFileBtn()}
                </div>
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
            <div className="checkBoxCon">
              <Checkbox
                className="Font14 mTop18"
                onClick={() => this.editDownload()}
                checked={!allowDownloadPermission}
              >
                {_l('允许成员下载打印文件')}
              </Checkbox>
              {md.global.Config.EnableDocEdit !== false && (
                <Checkbox
                  className="Font14 mTop18"
                  onClick={() => this.editDownload('allowEditAfterPrint')}
                  checked={allowEditAfterPrint}
                >
                  {_l('允许编辑后再打印')}
                </Checkbox>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default EditPrint;
