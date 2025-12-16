import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { Button, Icon, LoadDiv, Menu, MenuItem } from 'ming-ui';
import appManagementAjax from 'src/api/appManagement';
import attachmentAjax from 'src/api/attachment';
import sheetAjax from 'src/api/worksheet';
import createUploader from 'src/library/plupload/createUploader';
import { createEditFileLink } from 'src/pages/UploadTemplateSheet/utils';
import { VersionProductType } from 'src/utils/enum';
import RegExpValidator from 'src/utils/expression';
import { getFeatureStatus } from 'src/utils/project';
import PrintTemSetting from './PrintTemSetting';
import './editPrint.less';

const SUFFIX = {
  Word: 'docx',
  Excel: 'xlsx',
};

const EDIT_PRINT_URL = '/PrintTemplate/EditPrint';

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
      advanceSettings: [],
      createType: undefined,
    };
    this.con = React.createRef();
  }

  componentDidMount() {
    this.setData();
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.templateId !== this.props.templateId ||
      nextProps.fileType !== this.props.fileType ||
      !_.isEqual(nextProps.templateData, this.props.templateData)
    ) {
      this.uploaderDestroy();
      this.setData(nextProps);
    }
  }

  componentDidUpdate() {
    if (!this.state.bindCreateUpload) {
      this.createUploader(this.props.fileType);
    }
  }

  componentWillUnmount() {
    this.uploaderDestroy();
  }

  setData = nextProps => {
    const { fileType, templateData = {}, worksheetName, type } = nextProps || this.props;

    this.setState({
      templateName: templateData.name || worksheetName,
      fileName: templateData.formName,
      hasChange: !!this.state.createType,
      allowDownloadPermission: templateData.allowDownloadPermission || 0,
      allowEditAfterPrint: templateData.allowEditAfterPrint || false,
      advanceSettings: templateData.advanceSettings || [],
      isCreate: type !== 'edit',
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

  refreshUploader = () => {
    this.uploaderDestroy();
    this.createUploader(this.props.fileType);
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
          if (RegExpValidator.getExtOfFileName(file.name).toLocaleLowerCase() !== SUFFIX[fileType]) {
            alert(_l('上传失败，文件错误'), 3);
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
        FilesAdded: up => {
          up.setOption('auto_start', true);
          up.disableBrowse();
        },
        UploadProgress: (uploader, file) => {
          this.setState({ loading: true, suc: false, loadPer: file.percent });
        },
        FileUploaded: (up, file, info) => {
          const { key } = info.response;
          this.setState(
            {
              loading: false,
              suc: true,
              loadPer: file.percent,
              url: md.global.FileStoreConfig.documentHost + '/' + key,
              key: key,
              file: file,
              createType: undefined,
            },
            this.refreshUploader,
          );
          up.disableBrowse(false);
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

  onOk = async () => {
    const { fileName, createType, key, templateName, allowDownloadPermission, allowEditAfterPrint, advanceSettings } =
      this.state;
    const { worksheetId, downLoadUrl, templateId, refreshFn, fileType = 'Word', onClose } = this.props;

    this.setState({ saveLoading: true });
    let option;
    //功能模块 token枚举，3 = 导出excel，4 = 导入excel生成表，5= word打印
    const token = await appManagementAjax.getToken({
      worksheetId: worksheetId || templateId,
      tokenType: 5,
    });

    option = {
      token,
      worksheetId,
      accountId: md.global.Account.accountId,
      doc: key || undefined,
      fileName,
      id: templateId,
      type: fileType === 'Word' ? 2 : 5,
      createType,
      name: templateName,
      allowDownloadPermission,
      allowEditAfterPrint,
      advanceSettings,
    };

    window
      .mdyAPI('', '', option, {
        ajaxOptions: {
          url: downLoadUrl + EDIT_PRINT_URL,
        },
      })
      .then(res => {
        if (res) {
          refreshFn();
          onClose();
          alert(templateId ? _l('修改成功') : _l('添加成功'));
        } else {
          alert(templateId ? _l('修改失败') : _l('添加失败'), 2);
          this.setState({ error: true, saveLoading: false });
          this.refreshUploader();
        }
      });
  };

  onCreateEdit = item => {
    const { worksheetId, downLoadUrl, fileType = 'Word', refreshFn } = this.props;
    const { allowDownloadPermission, allowEditAfterPrint, templateName, advanceSettings } = this.state;

    this.setState({ createEditLoading: true, popupVisible: false, createType: item.value });
    createEditFileLink({
      worksheetId,
      downLoadUrl,
      type: fileType === 'Word' ? 2 : 5,
      createType: item.value,
      name: templateName,
      params: {
        doc: undefined,
        fileName: undefined,
        allowDownloadPermission,
        allowEditAfterPrint,
        advanceSettings,
      },
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
        this.setState({ createEditLoading: false, hasChange: true });
      });
  };

  onChange = value => this.setState(value);

  getDisabledOkBtn = () => {
    const {
      loading,
      fileName,
      templateName,
      hasChange,
      allowDownloadPermission,
      error,
      allowEditAfterPrint,
      advanceSettings,
      saveLoading,
    } = this.state;
    const { templateData } = this.props;

    return (
      (!hasChange &&
        _.isEqual(_.pick(templateData, ['name', 'allowDownloadPermission', 'allowEditAfterPrint', 'advanceSettings']), {
          name: templateName,
          allowDownloadPermission,
          allowEditAfterPrint,
          advanceSettings,
        })) ||
      loading ||
      !fileName ||
      !templateName ||
      !!error ||
      !!saveLoading ||
      (_.get(
        advanceSettings.find(l => l.key === 'export_type'),
        'value',
      ) === '1' &&
        !_.get(
          advanceSettings.find(l => l.key === 'export_name'),
          'value',
        ))
    );
  };

  handleClose = () => {
    const { isCreate } = this.state;
    const { templateId, onClose, refreshFn } = this.props;

    if (isCreate && templateId) {
      sheetAjax.deletePrint({ id: templateId }).then(res => {
        res && refreshFn();
      });
      return;
    }

    onClose();
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
      allowEditAfterPrint,
      featureType,
      advanceSettings,
      isCreate,
    } = this.state;
    const {
      onClose,
      worksheetId,
      downLoadUrl,
      templateId,
      fileType = 'Word',
      roleType,
      controls,
      projectId,
      templateData,
      exampleData,
      updateExampleData,
    } = this.props;

    const isAdmin = roleType === 2;
    const disabledOkBtn = this.getDisabledOkBtn();

    return (
      <div className="editPrint upload flexColumn h100">
        <h5 className="tempTitle flexRow alignItemsCenter">
          <span className="flex overflow_ellipsis">
            {templateId && !isCreate ? _l('编辑模板: %0', _.get(templateData, 'name')) : _l('新建模板')}
          </span>
          <Icon
            icon="close"
            className="mLeft10 Gray_9e ThemeHoverColor3 Hand"
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
                          let ajaxUrl = downLoadUrl + '/ExportWord/DownloadWord';
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
            <PrintTemSetting
              controls={controls}
              projectId={projectId}
              worksheetId={worksheetId}
              exampleData={exampleData}
              templateName={templateName}
              advanceSettings={advanceSettings}
              allowEditAfterPrint={allowEditAfterPrint}
              allowDownloadPermission={allowDownloadPermission}
              onChange={this.onChange}
              updateExampleData={updateExampleData}
            />
          </div>
        </div>
        <div className="btnWrap">
          <Button size="mdbig" disabled={disabledOkBtn} onClick={this.onOk}>
            {_l('确定')}
          </Button>
          <Button size="mdbig" type="ghost" onClick={this.handleClose}>
            {_l('取消')}
          </Button>
        </div>
      </div>
    );
  }
}

export default EditPrint;
