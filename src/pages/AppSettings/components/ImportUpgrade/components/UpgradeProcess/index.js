import React, { Component, Fragment } from 'react';
import { Steps } from 'antd';
import { QiniuUpload, Button, Support, Dialog, antNotification, Icon, Tooltip } from 'ming-ui';
import CheckBox from 'ming-ui/components/Checkbox';
import SvgIcon from 'src/components/SvgIcon';
import UpgradeDetail from '../UpgradeDetail';
import UpgradeItemWrap from '../UpgradeItemWrap';
import UpgradeStatus from '../UpgradeStatus';
import Beta from '../Beta';
import { UPGARADE_TYPE_LIST, UPGRADE_ERRORMSG, UPGRADE_DETAIL_TYPE_LIST } from '../../../../config';
import { getCheckedInfo, getViewIcon } from '../../../../util';
import { formatFileSize } from 'src/util';
import appManagementAjax from 'src/api/appManagement';
import importDisabledImg from 'src/pages/Admin/appManagement/img/import_disabled.png';
import importActiveImg from 'src/pages/Admin/appManagement/img/import_active.png';
import { getIconByType } from 'src/pages/widgetConfig/util';
import cx from 'classnames';
import './index.less';
import _ from 'lodash';

const { Step } = Steps;

const items = [{ title: _l('上传文件') }, { title: _l('升级范围') }, { title: _l('开始导入') }];
const detailTypeList = UPGRADE_DETAIL_TYPE_LIST.map(v => v.type);
const upgradeTypeList = UPGARADE_TYPE_LIST.map(v => v.type);
let timeout = null;
export default class UpgradeProcess extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contrasts: {},
      currentWorksheet: {},
      current: 0,
      file: {},
      errTip: _l('导入文件不在允许升级范围内'),
      compareLoading: false,
      isEncrypt: false,
      expandTypeList: ['worksheets', 'pages', 'roles', 'workflows'],
      checkedInfo: getCheckedInfo({
        typeList: upgradeTypeList,
        source: [],
        defaultCheckedAll: true,
      }),
      worksheetDetailData: {},
      worksheetDetailParams: {},
      backupCurrentVersion: true,
      matchOffice: true,
      showUpgradeStatus: false,
    };
  }

  componentDidMount() {
    this.getUpgradeStatus();
  }

  getUpgradeStatus = () => {
    if (!window.IM) return;
    const { appDetail } = this.props;
    IM.socket.on('upgrade_app', result => {
      const { id, appId, projectId, status } = result;
      const appName = appDetail.name;
      let title = status === 1 ? _l('应用正在导入升级中...') : status === 2 ? _l('导入升级完成') : _l('导入升级失败');
      let msg =
        status === 1
          ? _l(`应用“${appName}”正在导入升级，完成后会通知您`)
          : status === 2
          ? _l(`应用“${appName}”导入升级完成`)
          : _l(`应用“${appName}”导入升级失败`);
      let action = '';
      if (status === 1) {
        action = 'info';
      } else if (status === 2) {
        action = 'success';
      } else if (status === 3) {
        action = 'warning';
      } else {
        action = 'error';
      }
      antNotification[action]({
        key: id,
        className: 'customNotification',
        closeIcon: <Icon icon="close" className="Font20 Gray_9d ThemeHoverColor3" />,
        duration: 5,
        message: title,
        description: <div dangerouslySetInnerHTML={{ __html: msg }} />,
        loading: status === 1,
        onBtnClick: () => {
          antNotification.close(id);
        },
      });
      if (status === 0) {
        this.setState({ showUpgradeStatus: false });
      }
      if (status === 2) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          location.href = `/app/${appId}`;
        }, 500);
      }
    });
  };

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
    const { file } = this.state;
    this.setState({ compareLoading: true });
    const params = {
      password: this.state.password || '',
      url: this.state.url,
      appId: appDetail.id,
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
              current: _.isEmpty(worksheets) ? 0 : 1,
              contrasts,
              upgradeId: id,
              compareLoading: false,
              analyzeLoading: false,
              checkedInfo: getCheckedInfo({
                typeList: upgradeTypeList,
                source: contrasts,
                defaultCheckedAll: true,
              }),
              errTip: _.isEmpty(worksheets) ? _l('应用中没有可导入的数据') : '',
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
      .fail(err => {
        this.setState({ compareLoading: false, analyzeLoading: false });
      });
  };

  renderUploadBtn = chidren => {
    return (
      <QiniuUpload
        ref={ele => (this.uploaderWrap = ele)}
        className="upgradeAppUpload mTop24"
        options={{
          filters: {
            mime_types: [{ extensions: 'mdy' }],
          },
        }}
        onAdd={(up, files) => {
          this.setState({ isEncrypt: false, errTip: '' });
        }}
        onBeforeUpload={(up, file) => {
          setTimeout(() => {
            this.setState({ file, analyzeLoading: true });
          }, 200);
        }}
        onUploaded={(up, file, response) => {
          const { key } = response;
          this.setState(
            {
              file: file,
              url: md.global.FileStoreConfig.documentHost + key,
              errTip: '',
              analyzeLoading: false,
            },
            this.checkUpgrade,
          );
        }}
        onError={() => {
          this.setState({
            file: {},
            url: '',
            password: '',
            errTip: _l('文件上传失败'),
            analyzeLoading: false,
          });
        }}
      >
        {chidren}
      </QiniuUpload>
    );
  };

  renderUploadFile = () => {
    const { file, errTip, isEncrypt, password, compareLoading, analyzeLoading } = this.state;

    return (
      <Fragment>
        <div className="Gray_75 mBottom20">
          {_l(
            '导入单个应用文件，实现对当前应用快速升级。请确认私有部署的版本，高版本向低版本导入，可能会导入失败。应用升级需要一段时间，正在升级中的应用将为不可用状态。',
          )}
          <Support text={_l('帮助')} type={3} href="https://help.mingdao.com/apply19" />
        </div>
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
                disabled={!password}
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
                      <span className="icon-closeelement-bg-circle Font15 mRight6"></span>
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

          {compareLoading
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
      </Fragment>
    );
  };

  checkAllCurrentType = (checked, type) => {
    const { contrasts, worksheetDetailData, currentWorksheet } = this.state;
    const { id } = currentWorksheet || {};
    const { checkedInfo, data } = (id && worksheetDetailData[id]) || {};
    const isDetail = _.includes(detailTypeList, type);
    const copyCheckedInfo = isDetail ? checkedInfo : this.state.checkedInfo;
    const currentTypeAllIds = this.getIds(type, isDetail ? data : contrasts);
    const obj = {
      ...copyCheckedInfo,
      [`${type}CheckAll`]: !checked ? true : false,
      [`${type}CheckIds`]: !checked ? currentTypeAllIds : [],
    };
    const isEmptyCheckedDetail = id && Object.keys(obj).every(v => !obj[v]);
    this.setState({
      checkedInfo: isDetail
        ? this.state.checkedInfo
        : isEmptyCheckedDetail
        ? {
            ...obj,
            [`${type}CheckAll`]: false,
            [`${type}CheckIds`]: obj[`${type}CheckIds`].filter(v => v !== id),
          }
        : obj,
      worksheetDetailData: isDetail
        ? {
            ...worksheetDetailData,
            [id]: {
              ...worksheetDetailData[id],
              checkedInfo: obj,
              isPartialChanges: Object.keys(obj).some(v => !obj[v]),
            },
          }
        : worksheetDetailData,
    });
  };

  checkItem = ({ checked, type, it, currentItemAllList = [] }) => {
    const { worksheetDetailData, currentWorksheet } = this.state;
    const { id } = currentWorksheet || {};
    const { checkedInfo } = (id && worksheetDetailData[id]) || {};
    const isDetail = _.includes(detailTypeList, type);
    const copyCheckedInfo = isDetail ? checkedInfo : this.state.checkedInfo;
    const currentTypeAllIds = currentItemAllList.map(v => v.id);
    const checkedIds = copyCheckedInfo[`${type}CheckIds`] || [];
    const currentCheckedIds = !checked ? checkedIds.concat(it.id) : checkedIds.filter(v => v !== it.id);
    const isCheckedAll = currentTypeAllIds.every(v => _.includes(currentCheckedIds, v));
    const obj = {
      ...copyCheckedInfo,
      [`${type}CheckAll`]: isCheckedAll ? true : false,
      [`${type}CheckIds`]: currentCheckedIds,
    };
    const isEmptyCheckedDetail = id && Object.keys(obj).every(v => !obj[v]);

    this.setState({
      checkedInfo: isDetail
        ? this.state.checkedInfo
        : isEmptyCheckedDetail
        ? {
            ...obj,
            [`${type}CheckAll`]: false,
            [`${type}CheckIds`]: obj[`${type}CheckIds`].filter(v => v !== id),
          }
        : obj,
      worksheetDetailData: isDetail
        ? {
            ...worksheetDetailData,
            [id]: {
              ...worksheetDetailData[id],
              checkedInfo: obj,
              isPartialChanges: Object.keys(obj).some(v => !obj[v]),
            },
          }
        : worksheetDetailData,
    });
  };

  getWorksheetDetailParams = () => {
    const { worksheetDetailData, contrasts = {} } = this.state;
    const { worksheets } = contrasts;
    let result = worksheets.map(item => {
      const { id, upgradeType } = item;
      // if (_.get(worksheetDetailData, id)) {
      //   const { data, checkedInfo = {}, upgradeType } = _.get(worksheetDetailData, id);
      //   const {
      //     addViewCheckIds = [],
      //     updateViewCheckIds = [],
      //     addFieldsCheckIds = [],
      //     updateFieldsCheckIds = [],
      //   } = checkedInfo;
      //   let views = data['addView'].concat(data['updateView']).map(({ id, upgradeType }) => ({ id, upgradeType }));
      //   let controls = data['addFields']
      //     .concat(data['updateFields'])
      //     .map(({ id, upgradeType }) => ({ id, upgradeType }));
      //   let checkedCurrentWorksheet = _.includes(this.state.checkedInfo.worksheetsCheckIds || [], id);
      //   let obj = {
      //     worksheet: checkedCurrentWorksheet ? { id, upgradeType } : {},
      //     views: checkedCurrentWorksheet
      //       ? views.filter(v => v && _.includes([...addViewCheckIds, ...updateViewCheckIds], v.id))
      //       : [],
      //     controls: checkedCurrentWorksheet
      //       ? controls.filter(v => v && _.includes([...addFieldsCheckIds, ...updateFieldsCheckIds], v.id))
      //       : [],
      //   };
      //   return obj;
      // }
      return {
        worksheet: { id, upgradeType },
      };
    });

    return result;
  };

  getParams = type => {
    const { contrasts } = this.state;
    return (contrasts[type] || [])
      .filter(item => _.includes(this.state.checkedInfo[`${type}CheckIds`] || [], item.id))
      .map(({ id, upgradeType }) => ({ id, upgradeType }));
  };

  handleUpgrade = () => {
    this.setState({ showUpgradeStatus: true });
    const { appDetail } = this.props;
    const { upgradeId, backupCurrentVersion, matchOffice, url } = this.state;
    const params = {
      id: upgradeId,
      appId: appDetail.id,
      url,
      worksheets: this.getWorksheetDetailParams(),
      pages: this.getParams('pages'),
      roles: this.getParams('roles'),
      workflows: this.getParams('workflows'),
      backupCurrentVersion,
      matchOffice,
    };

    appManagementAjax.upgrade(params).then(res => {});
  };

  renderUpgradeScope = () => {
    const {
      expandTypeList,
      checkedInfo = {},
      contrasts,
      worksheetDetailData,
      backupCurrentVersion,
      matchOffice,
    } = this.state;

    let checkedUpgradeIds = [];
    upgradeTypeList.forEach(item => {
      const checkedIds = checkedInfo[`${item}CheckIds`];
      if (checkedIds && !_.isEmpty(checkedIds)) {
        checkedUpgradeIds = checkedUpgradeIds.concat(checkedIds);
      }
    });

    return (
      <div className="pBottom68">
        <div className="Font14 mBottom20">{_l('本次升级将会有以下变更')}</div>
        {UPGARADE_TYPE_LIST.map(item => {
          const { type } = item;
          const itemList = contrasts[type] || [];
          const isExpand = _.includes(expandTypeList, item.type);
          if (_.isEmpty(itemList)) return null;

          return (
            <UpgradeItemWrap
              isWorksheetDetail={false}
              itleClassName="Font15"
              item={item}
              itemList={itemList}
              isExpand={isExpand}
              checkedInfo={checkedInfo}
              worksheetDetailData={worksheetDetailData}
              handleExpandCollapse={this.handleExpandCollapse}
              checkAllCurrentType={this.checkAllCurrentType}
              checkItem={this.checkItem}
              openShowUpgradeDetail={this.openShowUpgradeDetail}
            />
          );
        })}
        <div className="importActionWrap">
          <div className="actionContent">
            <CheckBox
              checked={matchOffice}
              onClick={checked => {
                this.setState({ matchOffice: !checked });
              }}
            />
            <span className="mRight30">{_l('导入时匹配人员部门')}</span>
            <CheckBox
              checked={backupCurrentVersion}
              onClick={checked => {
                this.setState({ backupCurrentVersion: !checked });
              }}
            />
            <span>{_l('升级时同时备份当前版本')}</span>
            <Button
              type="primary"
              // disabled={_.isEmpty(checkedUpgradeIds)}
              className="mLeft30"
              onClick={this.handleUpgrade}
            >
              {_l('开始导入')}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  openShowUpgradeDetail = ({ id, upgradeType, sourceId }) => {
    const { appDetail } = this.props;
    const { worksheetDetailData, upgradeId } = this.state;
    if (worksheetDetailData[id]) {
      this.setState({
        currentWorksheet: { id, upgradeType },
        showUpgradeDetail: true,
      });
      return;
    }

    appManagementAjax
      .getWorksheetUpgrade({
        appId: appDetail.id,
        id: upgradeId,
        upgradeType,
        worksheetId: sourceId,
      })
      .then(res => {
        let { controls = [], views = [] } = res;
        controls = controls.map(item => {
          return { ...item, icon: getIconByType(item.type) };
        });
        views = views.map(item => {
          return { ...item, icon: getViewIcon(item.type) };
        });
        const data = {
          addFields: controls.filter(v => v.upgradeType === 3),
          updateFields: controls.filter(v => v.upgradeType === 2),
          addView: views.filter(v => v.upgradeType === 3),
          updateView: views.filter(v => v.upgradeType === 2),
        };
        this.setState({
          currentWorksheet: { id, upgradeType },
          showUpgradeDetail: true,
          worksheetDetailData: {
            ...worksheetDetailData,
            [id]: {
              upgradeType,
              data,
              checkedInfo: getCheckedInfo({
                typeList: detailTypeList,
                source: data,
                defaultCheckedAll: true,
              }),
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

  render() {
    const { appDetail = {} } = this.props;
    const { current, showUpgradeDetail, currentWorksheet, worksheetDetailData, showUpgradeStatus } = this.state;

    return (
      <div className="upgradeProcessWrap">
        <div className="upgradeProcessHeader">
          <div className="w110">
            <i className="icon-arrow_back Gray_9e Font24 Hand TxtMiddle" onClick={this.clickBack} />
            <span className="Font17 TxtMiddle mLeft12 bold">{_l('导入升级')}</span>
          </div>
          <Beta />
          <div className="flex flexRow justifyContentCenter">
            <div className="applicationIcon " style={{ backgroundColor: appDetail.iconColor }}>
              <SvgIcon url={appDetail.iconUrl} fill="#fff" size={18} />
            </div>
            <div className="Font15">{appDetail.name}</div>
          </div>
          <div className="Gray_9d Font14 w110 TxtRight">
            <Tooltip text={<span>{_l('帮助')}</span>}>
              <i
                className="icon-help Font20 Hand"
                onClick={() => {
                  window.open('https://help.mingdao.com/apply19');
                }}
              />
            </Tooltip>
          </div>
        </div>
        <div className="upgradeProcessContent">
          <Fragment>
            <Steps current={current} className="mBottom20">
              {items.map(item => {
                return <Step key={item.title} title={item.title} disabled={true}></Step>;
              })}
            </Steps>
          </Fragment>
          {current === 0 && this.renderUploadFile()}
          {current === 1 && this.renderUpgradeScope()}
        </div>

        {showUpgradeDetail && (
          <UpgradeDetail
            currentWorksheet={currentWorksheet}
            visible={showUpgradeDetail}
            worksheetDetailData={worksheetDetailData}
            checkAllCurrentType={this.checkAllCurrentType}
            checkItem={this.checkItem}
            onClose={() => this.setState({ showUpgradeDetail: false, currentWorksheet: {} })}
          />
        )}

        {showUpgradeStatus && <UpgradeStatus appPkg={appDetail} />}
      </div>
    );
  }
}
