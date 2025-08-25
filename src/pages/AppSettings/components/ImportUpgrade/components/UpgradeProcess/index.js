import React, { Component, Fragment } from 'react';
import { Steps } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Button, Checkbox, Dialog, LoadDiv, QiniuUpload, Radio, Support, SvgIcon, Tooltip } from 'ming-ui';
import appManagementAjax from 'src/api/appManagement';
import importActiveImg from 'src/pages/Admin/app/appManagement/img/import_active.png';
import importDisabledImg from 'src/pages/Admin/app/appManagement/img/import_disabled.png';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { formatFileSize } from 'src/utils/common';
import {
  AdvancedConfig,
  ERROR_CODE,
  ITEMS,
  MAX_FILES,
  SETTINGS,
  UPDATE_METHOD,
  UPGARADE_TYPE_LIST,
  UPGRADE_DETAIL_TYPE_LIST,
  UPGRADE_ERRORMSG,
} from '../../../../config';
import { getViewIcon } from '../../../../util';
import UpgradeDetail from '../UpgradeDetail';
import UpgradeFileList from '../UpgradeFileList';
import UpgradeItemWrap from '../UpgradeItemWrap';
import UpgradeSelectApp from '../UpgradeSelectApp';
import UpgradeStatus from '../UpgradeStatus';
import './index.less';

const { Step } = Steps;

export const detailTypeList = UPGRADE_DETAIL_TYPE_LIST.map(v => v.type);
export const upgradeTypeList = UPGARADE_TYPE_LIST.map(v => v.type);
export default class UpgradeProcess extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contrasts: {},
      currentWorksheet: {},
      current: 0,
      file: {},
      files: [],
      errTip: _l('导入文件不在允许升级范围内'),
      compareLoading: false,
      isEncrypt: false,
      expandTypeList: ['worksheets', 'pages', 'roles', 'workflows'],
      worksheetDetailData: {},
      worksheetDetailParams: {},
      backupCurrentVersion: true,
      matchOffice: true,
      noUpgradeStyle: true,
      roleHide: true,
      showUpgradeStatus: false,
      batchUpdate: props.type === '2',
      batchId: '',
      currentAppIndex: 0,
      addFilesLoading: false,
      batchCheckUpgradeLoading: false,
      upgradeName: false,
      upgradeHide: false,
      upgradeStyle: false,
      upgradeLang: false,
      upgradeTimeZone: false,
      modelType: 0,
    };
  }

  componentDidMount() {
    if (this.state.batchUpdate) {
      appManagementAjax.getBatchId({ projectId: this.props.projectId }).then(({ batchId }) => {
        this.setState({ batchId: batchId });
      });
    }
  }

  getIds = (type, data) => {
    return (data[type] || []).map(({ id }) => id);
  };

  // 展开收起
  handleExpandCollapse = item => {
    const { expandTypeList } = this.state;
    this.setState({
      expandTypeList: !_.includes(expandTypeList, item.type)
        ? expandTypeList.concat(item.type)
        : expandTypeList.filter(v => item.type !== v),
    });
  };

  destroyUploadWrap = () => {
    if (this.uploaderWrap && this.uploaderWrap.uploader && !this.state.isEncrypt) {
      this.uploaderWrap.uploader.destroy();
    }
  };

  checkUpgrade = () => {
    const { appDetail } = this.props;
    const { file, batchUpdate, current } = this.state;

    this.setState({ compareLoading: true });

    const params = {
      password: this.state.password || '',
      url: this.state.url,
      appId: (appDetail || {}).id,
      fileName: file.name,
    };

    appManagementAjax
      .checkUpgrade(params)
      .then(res => {
        const { resultCode, contrasts = {}, id } = res;
        const { worksheets = [] } = contrasts;
        if (resultCode === 0) {
          this.setState(
            {
              isEncrypt: false,
              password: '',
              current: batchUpdate ? current : _.isEmpty(worksheets) ? 0 : 1,
              compareLoading: false,
              analyzeLoading: false,
              errTip: _.isEmpty(worksheets) ? _l('应用中没有可导入的数据') : '',
              contrasts,
              upgradeId: id,
            },
            () => {
              if (_.isEmpty(worksheets)) return;
              this.destroyUploadWrap();
            },
          );
        } else if (resultCode === 3) {
          if (this.state.password) {
            alert(_l('密码错误，校验失败'), 2);
          }
          this.setState({ isEncrypt: true, compareLoading: false, analyzeLoading: false, contrasts: {} });
        } else {
          this.setState({
            isEncrypt: false,
            password: '',
            compareLoading: false,
            analyzeLoading: false,
            contrasts: {},
            errTip: UPGRADE_ERRORMSG[resultCode],
          });
        }
      })
      .catch(() => {
        this.setState({ compareLoading: false, analyzeLoading: false });
      });
  };

  batchCheckFiles = async (checkFiles, isUpdate = false) => {
    const { projectId } = this.props;
    const { batchId } = this.state;

    this.setState({ checkFiles: [] });

    if (!isUpdate && this.state.files.length) {
      this.setState({ addFilesLoading: true });
    }

    this.setState({ batchCheckedLoading: true });

    const res = [];
    for (let l of checkFiles) {
      res.push(
        await appManagementAjax.batchImportCheck({
          projectId,
          batchId,
          url: md.global.FileStoreConfig.documentHost + l.key,
          password: l.password,
        }),
      );
    }

    const files = this.state.files;

    if (isUpdate) {
      !!checkFiles[0].password &&
        res[0].code === 3 &&
        alert(_l('%0密码错误，校验失败', _.get(checkFiles[0], 'apps[0].name')), 2);
      const index = _.findIndex(files, l => _.get(l, 'fileName') === _.get(checkFiles[0], 'fileName'));
      files[index] = { ...checkFiles[0], code: res[0].apps.length > 1 ? 1 : res[0].code };
      this.setState({ files: [...files], analyzeLoading: false, addFilesLoading: false, batchCheckedLoading: false });
    } else {
      const newList = res
        .filter((l, i) => {
          l.i = i;
          if (ERROR_CODE[l.code]) alert(ERROR_CODE[l.code], 2);
          return !ERROR_CODE[l.code] && !_.find(files, m => _.get(m, 'fileName') === _.get(l, 'fileName'));
        })
        .map(l => ({
          url: md.global.FileStoreConfig.documentHost + checkFiles[l.i].key,
          ...l,
          ..._.pick(checkFiles[l.i], ['key', 'password', 'fileName', 'name']),
          code: l.apps.length > 1 ? 1 : l.code,
        }));
      this.setState({
        files: files.concat(newList),
        analyzeLoading: false,
        addFilesLoading: false,
        batchCheckedLoading: false,
      });
    }

    this.destroyUploadWrap();
  };

  batchCheckUpgrade = i => {
    const { files } = this.state;

    if (files[i].index !== undefined) {
      this.setState({ currentAppIndex: i });
      return;
    }

    this.setState({ batchCheckUpgradeLoading: true });
    const promiseList = files
      .filter((l, i) => {
        l.index = i;
        return l.type === 0;
      })
      .map(item =>
        appManagementAjax.checkUpgrade({
          password: item.password || '',
          url: item.url,
          appId: item.selectApp.appId,
          fileName: item.name,
          batchId: item.batchId,
        }),
      );

    Promise.all(promiseList).then(res => {
      const filterFiles = files.filter(l => l.type === 0);
      res.forEach((item, itemIndex) => {
        const index = filterFiles[itemIndex].index;

        if (item.resultCode === 0) {
          files[index] = {
            ...files[index],
            contrasts: item.contrasts,
            upgradeId: item.id,
          };
        } else {
          files[index].checkUpdateErr = UPGRADE_ERRORMSG[item.resultCode];
        }
      });

      this.setState({
        files: [...files],
        currentAppIndex: i,
        batchCheckUpgradeLoading: false,
      });
    });
  };

  onUploadComplete = (up, file, response) => {
    const { batchUpdate, checkFiles = [] } = this.state;
    const { key } = response;

    if (batchUpdate) {
      this.setState(
        {
          checkFiles: checkFiles.concat({ ...file, key }),
        },
        () => {
          up.files.length === this.state.checkFiles.length && this.batchCheckFiles(this.state.checkFiles.slice(0, 10));
        },
      );
    } else {
      this.setState(
        {
          file: file,
          url: md.global.FileStoreConfig.documentHost + key,
          errTip: '',
          analyzeLoading: false,
        },
        this.checkUpgrade,
      );
    }
  };

  renderUploadBtn = children => {
    const { batchUpdate } = this.state;

    return (
      <QiniuUpload
        ref={ele => (this.uploaderWrap = ele)}
        className="upgradeAppUpload mTop24"
        options={{
          filters: {
            mime_types: [{ extensions: 'mdy' }],
          },
        }}
        onAdd={() => {
          this.setState({ isEncrypt: false, errTip: '' });
        }}
        onBeforeUpload={(up, file) => {
          setTimeout(() => {
            !this.state.analyzeLoading && this.setState({ file: batchUpdate ? {} : file, analyzeLoading: true });
          }, 200);
        }}
        onUploaded={this.onUploadComplete}
        onError={() => {
          this.setState({
            file: {},
            files: [],
            url: '',
            password: '',
            errTip: _l('文件上传失败'),
            analyzeLoading: false,
          });
        }}
      >
        {children}
      </QiniuUpload>
    );
  };

  renderUploadFile = () => {
    const {
      file,
      errTip,
      isEncrypt,
      password,
      compareLoading,
      analyzeLoading,
      files,
      batchUpdate,
      addFilesLoading,
      batchCheckedLoading,
    } = this.state;
    const IsLocal = _.get(md, 'global.Config.IsLocal');

    return (
      <Fragment>
        <div className="Gray_75 mBottom20">
          {batchUpdate
            ? _l('上传多个应用文件，实现多个应用整体升级。最多上传%0个文件。', MAX_FILES)
            : _l('导入单个应用文件，实现对当前应用快速升级。')}
          {IsLocal ? _l('请确认私有部署的版本，高版本向低版本导入，可能会导入失败。') : ''}
          {_l('应用升级需要一段时间，正在升级中的应用将为不可用状态。')}
          <Support text={_l('帮助')} type={3} href="https://help.mingdao.com/application/upgrade" />
        </div>
        {batchUpdate && files.length ? (
          <UpgradeFileList
            projectId={this.props.projectId}
            files={files}
            addFilesLoading={addFilesLoading}
            batchCheckFiles={this.batchCheckFiles}
            updateFiles={this.updateFiles}
          />
        ) : (
          <div className="uploadWrap flex">
            {isEncrypt ? (
              <Fragment>
                <div className="Font14">{_l('文件已加密，需要验证通过才能上传')}</div>
                <input
                  className="passwordInputBox mTop16 mBottom16"
                  placeholder={_l('请输入密码')}
                  value={password}
                  onChange={e => this.setState({ password: e.target.value })}
                />
                <Button
                  type="primary"
                  disabled={!(password || '').trim()}
                  onClick={() => this.setState({ isEncrypt: false, errTip: '' }, () => this.checkUpgrade())}
                >
                  {_l('确认')}
                </Button>
              </Fragment>
            ) : (
              <Fragment>
                <img className="uploadImg" src={file.name ? importActiveImg : importDisabledImg}></img>
                {file.name ? (
                  <Fragment>
                    <div className="Font17">{file.name}</div>
                    <div className="Gray_75 mTop6">{_l('大小：%0', formatFileSize(file.size))}</div>
                    {errTip && (
                      <div className="mTop15 errTip Font14">
                        <span className="icon-cancel Font15 mRight6"></span>
                        <span>{_l(errTip)}</span>
                      </div>
                    )}
                  </Fragment>
                ) : (
                  <div className="Gray_bd">{_l('请选择.mdy格式的应用文件')}</div>
                )}
                {(analyzeLoading || compareLoading) && (
                  <div className="flexRow mTop16">
                    <div className="notificationIconWrap">
                      <i className="icon-loading_button Font20 ThemeColor3"></i>
                    </div>
                    {
                      <span className="Gray_75 mLeft10">
                        {compareLoading ? _l('正在校验升级内容...') : _l('正在解析文件...')}
                      </span>
                    }
                  </div>
                )}
                {compareLoading && <div className="Gray_9e Font14 mTop16">{_l('此步骤可能耗时较久，请耐心等待')}</div>}
              </Fragment>
            )}
            {compareLoading || batchCheckedLoading
              ? ''
              : _.isEmpty(file)
                ? this.renderUploadBtn(
                    <Button type="primary" radius className={cx({ Visibility: analyzeLoading })}>
                      {_l('上传文件')}
                    </Button>,
                  )
                : this.renderUploadBtn(
                    <div className={cx('ThemeColor Hand', { Visibility: analyzeLoading })}>{_l('重新上传')}</div>,
                  )}
          </div>
        )}
      </Fragment>
    );
  };

  getWorksheetDetailParams = () => {
    const { batchUpdate, files, currentAppIndex, modelType } = this.state;
    const contrasts = (batchUpdate ? files[currentAppIndex].contrasts : this.state.contrasts) || {};
    const { worksheets } = contrasts;
    let result = worksheets
      .filter(v => (!modelType && v.upgradeType !== 4) || modelType)
      .map(item => {
        const { id, upgradeType } = item;
        return {
          worksheet: { id, upgradeType },
        };
      });

    return result;
  };

  getParams = type => {
    const { batchUpdate, files, currentAppIndex, modelType } = this.state;
    const contrasts = (batchUpdate ? files[currentAppIndex].contrasts : this.state.contrasts) || {};

    return (contrasts[type] || [])
      .map(({ id, upgradeType }) => ({ id, upgradeType }))
      .filter(v => (!modelType && v.upgradeType !== 4) || modelType);
  };

  handleUpgrade = () => {
    const { appDetail, projectId, type, onCancel } = this.props;
    const {
      batchUpdate,
      files,
      upgradeId,
      upgradeName,
      upgradeHide,
      upgradeStyle,
      upgradeLang,
      upgradeTimeZone,
      modelType,
    } = this.state;

    this.setState({ showUpgradeStatus: !batchUpdate });

    const params = batchUpdate
      ? {
          projectId,
          ..._.pick(this.state, ['batchId', 'noUpgradeStyle', 'matchOffice', 'roleHide', 'backupCurrentVersion']),
          datas: files.map(l => ({
            id: l.type === 0 ? l.upgradeId : '',
            appId: l.type === 0 ? _.get(l, 'selectApp.appId') : '',
            type: l.type,
            url: l.url,
          })),
        }
      : {
          id: upgradeId,
          appId: appDetail.id,
          worksheets: this.getWorksheetDetailParams(),
          pages: this.getParams('pages'),
          roles: this.getParams('roles'),
          workflows: this.getParams('workflows'),
          ..._.pick(this.state, ['url', 'noUpgradeStyle', 'matchOffice', 'roleHide', 'backupCurrentVersion']),
        };

    appManagementAjax[batchUpdate ? 'batchImport' : 'upgrade']({
      ...params,
      upgradeName,
      upgradeHide,
      upgradeStyle,
      upgradeLang,
      upgradeTimeZone,
      modelType,
    });
    type === '2' && onCancel();
  };

  selectAllSettings = value => {
    this.setState({
      upgradeName: value,
      upgradeHide: value,
      upgradeStyle: value,
      upgradeLang: value,
      upgradeTimeZone: value,
    });
  };

  renderUpgradeScope = () => {
    const {
      expandTypeList,
      worksheetDetailData,
      batchUpdate,
      files,
      currentAppIndex,
      batchCheckUpgradeLoading,
      modelType,
      upgradeName,
      upgradeHide,
      upgradeStyle,
      upgradeLang,
      upgradeTimeZone,
      matchOffice,
      backupCurrentVersion,
    } = this.state;
    const contrasts = (batchUpdate ? files[currentAppIndex].contrasts : this.state.contrasts) || {};

    const selectAll = _.some(
      ['upgradeName', 'upgradeHide', 'upgradeStyle', 'upgradeLang', 'upgradeTimeZone'],
      item => !this.state[item],
    );

    return (
      <div className={cx('pBottom68', { h100: batchCheckUpgradeLoading })}>
        <div className="Font14 mBottom20">
          {_l('本次升级将会有以下变更，请确认要更新的内容，取消勾选则表示不作变更')}
        </div>
        <div className="flexRow updateMethodWrap mBottom20">
          {UPDATE_METHOD.map((item, index) => (
            <div className={`updateMethodItem ${index === 0 ? 'mRight12' : ''}`} key={item.modelType}>
              <Radio
                className="bold"
                text={item.text}
                checked={modelType === item.modelType}
                onClick={() =>
                  this.setState({
                    modelType: item.modelType,
                    upgradeName: item.modelType ? true : upgradeName,
                    upgradeHide: item.modelType ? true : upgradeHide,
                    upgradeStyle: item.modelType ? true : upgradeStyle,
                    upgradeLang: item.modelType ? true : upgradeLang,
                    upgradeTimeZone: item.modelType ? true : upgradeTimeZone,
                    matchOffice: item.modelType ? true : matchOffice,
                    backupCurrentVersion: item.modelType ? true : backupCurrentVersion,
                  })
                }
              />
              <div className="Gray_75 Font12 mTop8 mLeft30">
                {' '}
                {!item.desc ? (
                  <Fragment>
                    {_l('新增目标应用中缺失项，更新已有项，')}
                    <span className="Red">{_l('删除多余项')}</span>
                    {_l('。升级后应用与源应用结构完全一致')}
                  </Fragment>
                ) : (
                  item.desc
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="settingsWrap">
          <div className="flexRow itemTitle">
            <i className="icon-admin-apps Gray_9e Font18 mRight7 TxtMiddle" />
            <span className="bold TxtMiddle">{_l('应用')}</span>
            {modelType === 0 && (
              <span className="mLeft5 Gray_9e Hand" onClick={() => this.selectAllSettings(selectAll)}>
                {selectAll ? _l('全选') : _l('取消全选')}
              </span>
            )}
          </div>
          <ul className="flexRow">
            {SETTINGS.map(v => (
              <li className="mRight24 flexRow alignItemsCenter" key={v.key}>
                <Checkbox
                  disabled={modelType === 1}
                  checked={this.state[v.key]}
                  onClick={checked => this.setState({ [v.key]: !checked })}
                />
                <span className="">{modelType === 1 && v.coverName ? v.coverName : v.name}</span>

                {v.desc && (
                  <Tooltip
                    text={modelType === 1 && v.coverdesc ? v.coverdesc : v.desc}
                    popupPlacement="bottom"
                    autoCloseDelay={0}
                  >
                    <i className="icon icon-info_outline mLeft5 Gray_75 Font16" />
                  </Tooltip>
                )}
              </li>
            ))}
          </ul>
        </div>
        {batchUpdate && (
          <ul className="upgradeScopeAppBox mBottom20">
            {files.map((item, i) => {
              const appInfo = item.type === 0 ? item.selectApp : _.get(item, 'apps[0]');

              return (
                <li
                  className={cx('Hand', { current: batchUpdate && currentAppIndex === i })}
                  onClick={() => this.batchCheckUpgrade(i)}
                  key={`upgradeScopeAppBox-${_.get(item, 'apps[0].appId')}`}
                >
                  <span className="iconWrap" style={{ background: appInfo.iconColor }}>
                    <SvgIcon url={appInfo.iconUrl} fill="#fff" size={20} />
                  </span>
                  <span className="text Font15">{appInfo.appName || appInfo.name}</span>
                  {item.type === 1 && <span className="tag font8">{_l('新增')}</span>}
                </li>
              );
            })}
          </ul>
        )}
        {batchUpdate && files[currentAppIndex].checkUpdateErr && <div>{files[currentAppIndex].checkUpdateErr}</div>}
        {batchCheckUpgradeLoading ? (
          <div className="h100 scopeLoadingWrap">
            <LoadDiv size="middle" className="mBottom14" />
            <div className="Gray_9e Font13 TxtCenter">{_l('数据正在加载中...')}</div>
          </div>
        ) : (
          UPGARADE_TYPE_LIST.map(item => {
            const { type } = item;
            const itemList = (contrasts[type] || []).filter(v => (!modelType && v.upgradeType !== 4) || modelType);
            const isExpand = _.includes(expandTypeList, item.type);

            if (_.isEmpty(itemList)) return null;

            return (
              <UpgradeItemWrap
                modelType={modelType}
                isWorksheetDetail={false}
                itleClassName="Font15"
                item={item}
                fileType={batchUpdate ? files[currentAppIndex].type : undefined}
                itemList={itemList}
                isExpand={isExpand}
                worksheetDetailData={worksheetDetailData}
                handleExpandCollapse={this.handleExpandCollapse}
                openShowUpgradeDetail={this.openShowUpgradeDetail}
              />
            );
          })
        )}
      </div>
    );
  };

  renderSelectApp = () => {
    const { projectId } = this.props;
    const { files = [] } = this.state;

    return (
      <Fragment>
        <div className="mTop18">{_l('选择需要升级的应用，可以选择同源应用升级或者生成为新的应用')}</div>
        <UpgradeSelectApp projectId={projectId} files={files} updateFields={this.updateFiles} />
      </Fragment>
    );
  };

  openShowUpgradeDetail = ({ id, upgradeType, sourceId }) => {
    const { appDetail } = this.props;
    const { worksheetDetailData, upgradeId, batchUpdate, files, currentAppIndex, batchId } = this.state;
    if (worksheetDetailData[id]) {
      this.setState({
        currentWorksheet: { id, upgradeType },
        showUpgradeDetail: true,
      });
      return;
    }

    appManagementAjax
      .getWorksheetUpgrade({
        appId: batchUpdate ? (files[currentAppIndex].selectApp || files[currentAppIndex].apps[0]).appId : appDetail.id,
        id: batchUpdate ? files[currentAppIndex].upgradeId : upgradeId,
        upgradeType,
        worksheetId: sourceId,
        batchId: batchUpdate ? batchId : undefined,
      })
      .then(res => {
        let { controls = [], views = [] } = res;
        const data = {
          ...res,
          controls: controls.map(item => {
            return { ...item, icon: getIconByType(item.type), originIcon: getIconByType(item.originalType) };
          }),
          views: views.map(item => {
            return { ...item, icon: getViewIcon(item.type), originIcon: getViewIcon(item.originalType) };
          }),
        };
        this.setState({
          currentWorksheet: { id, upgradeType },
          showUpgradeDetail: true,
          worksheetDetailData: {
            ...worksheetDetailData,
            [id]: {
              upgradeType,
              data: data,
            },
          },
        });
      });
  };

  clickBack = () => {
    Dialog.confirm({
      title: _l('退出导入升级'),
      description: _l('当前进程不会被保存'),
      okText: _l('退出'),
      onOk: () => {
        this.props.onCancel();
      },
    });
  };

  getNextStatus = () => {
    const { current, files } = this.state;

    switch (current) {
      case 0:
        return !files.length || _.some(files, l => l.code !== 0);
      case 1:
        return _.some(files, l => l.type === undefined);
    }
  };

  updateFiles = files => this.setState({ files });

  handleNext = () => {
    const { current, batchUpdate } = this.state;

    this.setState({ current: current + 1 });

    if (current === 1 && batchUpdate) {
      this.batchCheckUpgrade(0);
    }
  };

  renderFooter = () => {
    const { current, batchUpdate, batchCheckUpgradeLoading, modelType } = this.state;
    const items = ITEMS.filter((l, index) => index !== 1 || batchUpdate);
    const isUpgradeScope = items[current].key === 'renderUpgradeScope';
    if (!batchUpdate && !isUpgradeScope) return null;

    return (
      <div className="upgradeProcessFooter">
        {!isUpgradeScope ? (
          <div className="actionContent">
            <Button disabled={this.getNextStatus()} onClick={this.handleNext}>
              {_l('下一步')}
            </Button>
          </div>
        ) : (
          <div className="actionContent">
            <ul className="flexRow">
              {AdvancedConfig.map(l => (
                <li className="flexRow alignItemsCenter mLeft24" key={`upgradeScopeAdvancedConfig-${l.key}`}>
                  <Checkbox
                    disabled={modelType === 1}
                    checked={this.state[l.key]}
                    onClick={checked => {
                      this.setState({ [l.key]: !checked });
                    }}
                  />
                  <span className="">{l.label}</span>
                </li>
              ))}
            </ul>
            <Button type="primary" className="mLeft30" disabled={batchCheckUpgradeLoading} onClick={this.handleUpgrade}>
              {_l('开始导入')}
            </Button>
          </div>
        )}
      </div>
    );
  };

  render() {
    const { appDetail = {} } = this.props;
    const {
      current,
      showUpgradeDetail,
      currentWorksheet,
      worksheetDetailData,
      showUpgradeStatus,
      batchUpdate,
      files,
      currentAppIndex,
      modelType,
    } = this.state;
    const items = ITEMS.filter((l, index) => index !== 1 || batchUpdate);
    const appInfo = _.get(files[currentAppIndex], 'selectApp') || _.get(files[currentAppIndex], 'apps[0]');

    return (
      <div className="upgradeProcessWrap">
        <div className="upgradeProcessHeader">
          <div>
            <i className="icon-backspace Gray_9e Font24 Hand TxtMiddle" onClick={this.clickBack} />
            <span className="Font17 TxtMiddle mLeft12 bold">{_l('应用导入升级')}</span>
          </div>
          {(!batchUpdate || items[current].key === 'renderUpgradeScope') && (
            <div className="flex flexRow justifyContentCenter">
              <div
                className="applicationIcon "
                style={{ backgroundColor: batchUpdate ? appInfo.iconColor : appDetail.iconColor }}
              >
                <SvgIcon url={batchUpdate ? appInfo.iconUrl : appDetail.iconUrl} fill="#fff" size={18} />
              </div>
              <div className="Font15">{batchUpdate ? appInfo.name || appInfo.appName : appDetail.name}</div>
            </div>
          )}
          <div className="Gray_9d Font14 w110 TxtRight helpIcon">
            <Support title={_l('帮助')} type={1} href="https://help.mingdao.com/application/upgrade" />
          </div>
        </div>
        <div className={cx('upgradeProcessContent', { pBottom68: batchUpdate })}>
          <Fragment>
            <Steps current={current} className="mBottom20">
              {items.map(item => {
                return <Step key={item.title} title={item.title} disabled={true}></Step>;
              })}
            </Steps>
          </Fragment>
          {this[items[current].key]()}
          {this.renderFooter()}
        </div>

        {showUpgradeDetail && (
          <UpgradeDetail
            modelType={modelType}
            currentWorksheet={currentWorksheet}
            visible={showUpgradeDetail}
            worksheetDetailData={worksheetDetailData}
            onClose={() => this.setState({ showUpgradeDetail: false, currentWorksheet: {} })}
          />
        )}

        {showUpgradeStatus && <UpgradeStatus appPkg={{ ...appDetail, appStatus: 4 }} />}
      </div>
    );
  }
}
