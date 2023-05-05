import React, { Component, Fragment } from 'react';
import { Dialog, Button, Icon, LoadDiv, Support } from 'ming-ui';
import Trigger from 'rc-trigger';
import SvgIcon from 'src/components/SvgIcon';
import SelectIcon from 'src/pages/AppHomepage/components/SelectIcon/index.jsx';
import successImg from '../images/succuss.png';
import congratulationImg from '../images/congratulation.png';
import { navigateTo } from 'src/router/navigateTo';

import cx from 'classnames';
import './index.less';
import _ from 'lodash';

export default class DialogCreateApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditSheetName: false,
    };
  }

  componentDidMount() {
    const { appInfo = {} } = this.props;
    if (this.inputBox) {
      this.inputBox.innerHTML = appInfo.appName;
    }
  }

  handleModify = obj => {
    const { appInfo = {} } = this.props;
    const appObj = obj.name ? { ...appInfo, appName: obj.name } : { ...appInfo, ...obj };
    this.props.updateAppInfo({ ...appInfo, ...appObj });
  };

  // 编辑表名称
  changeEditSheetName = item => {
    this.setState({ isEditSheetName: true, currentSheetId: item.sheetId }, () => {
      this.editInput.focus();
    });
  };
  changeSheetName = (e, item) => {
    const { excelDetailData = [] } = this.props;
    let val = e.target.value;
    const result = excelDetailData.map(sheet => {
      if (sheet.sheetId === item.sheetId) {
        return { ...sheet, sheetName: val };
      }
      return sheet;
    });
    this.props.updateExcelDetailData(result);
  };
  onBlur = (e, item) => {
    let val = _.trim(e.target.value);
    if (!val) {
      this.setState({ isEditSheetName: false });
      return;
    }
    this.setState({ isEditSheetName: false });
  };
  render() {
    const {
      visible,
      createType,
      projectId,
      createAppStatus,
      createAppLoading,
      appInfo,
      importSheets = [],
      freeRowCount,
    } = this.props;
    const { currentSheetId, isEditSheetName, editAppName } = this.state;
    const licenseType = _.get(
      _.find(md.global.Account.projects, project => project.projectId === projectId) || {},
      'licenseType',
    );
    const totalRows = _.reduce(
      importSheets,
      (result, current) => {
        return result + (current.total - current.rowNum);
      },
      0,
    );
    const isOverLimit = licenseType === 0 && totalRows + freeRowCount > 50000;

    return (
      <Dialog
        dialogClasses="dialogCreateApp"
        visible={visible}
        width={1000}
        height="100%"
        title={!createAppStatus ? <span className="Bold">{_l('准备创建应用')}</span> : null}
        onCancel={this.props.onCancel}
        footer={
          createAppStatus || createAppLoading ? null : (
            <div className="footer">
              <Support
                type={2}
                text={_l('帮助')}
                href="https://help.mingdao.com/zh/sheet50.html"
                className="Gray_bd mRight30"
              />
              <Button type="link" className="mRight15 stepLast" onClick={this.props.handleLast}>
                {_l('上一步')}
              </Button>
              <Button
                type="primary"
                className="bold"
                disabled={isOverLimit || !appInfo.appName}
                onClick={this.props.createApp}
              >
                {_l('创建应用')}
              </Button>
            </div>
          )
        }
      >
        <div className="createAppWrap">
          <div
            className={cx('Relative', {
              Font26: !createAppStatus && !createAppLoading,
              Font18: createAppStatus,
              appInfoAct: createAppLoading,
            })}
          >
            <div
              className="appIconWrap flexRow justifyContentCenter alignItemsCenter Relative"
              style={{ backgroundColor: appInfo.iconColor }}
            >
              <SvgIcon
                url={appInfo.iconUrl || md.global.FileStoreConfig.pubHost.replace(/\/$/, '') + '/customIcon/0_lego.svg'}
                fill="#fff"
                size={48}
              />

              {!createAppStatus && !createAppLoading && (
                <div className="editIcon Hand Hover_49">
                  <Trigger
                    action={['click']}
                    zIndex={1000}
                    popupClassName="myAppItemOperatorTriggerWrap"
                    popup={
                      <SelectIcon
                        projectId={projectId}
                        icon={appInfo.icon}
                        name={appInfo.appName}
                        iconColor={appInfo.iconColor}
                        onModify={this.handleModify}
                        hideInput={true}
                      />
                    }
                    popupAlign={{
                      points: ['tl', 'bl'],
                      offset: [-350, 5],
                      overflow: { adjustX: true },
                    }}
                  >
                    <Icon icon="edit Hand" className="Gray_bd editApp" />
                  </Trigger>
                </div>
              )}
            </div>
            {createAppStatus && !createAppLoading && (
              <img src={successImg} className={cx('successImg', { successBg: createAppStatus && !createAppLoading })} />
            )}
            <div className={cx('appName bold TxtCenter ellipsis', { bgColor: !createAppStatus && !createAppLoading })}>
              <label ref={node => (this.inputBox = node)} id="label" class="occupation"></label>
              {editAppName ? (
                <input
                  type="text"
                  id="input"
                  class={cx('inputCon TxtCenter bold bgColor')}
                  value={appInfo.appName}
                  onChange={e => {
                    let val = e.target.value;
                    if (this.inputBox) {
                      this.inputBox.innerHTML = val;
                    }
                    this.props.updateAppInfo({ ...appInfo, appName: val });
                  }}
                  onBlur={() => {
                    this.setState({ editAppName: false });
                  }}
                />
              ) : (
                <span
                  class={cx('inputCon ellipsis TxtCenter bold lineH46', {
                    bgColor: !createAppStatus && !createAppLoading,
                  })}
                  onClick={() => {
                    if (createAppStatus || createAppLoading) return;
                    this.setState({ editAppName: true });
                  }}
                >
                  {appInfo.appName}
                </span>
              )}
            </div>
          </div>
          {!createAppStatus && !createAppLoading && (
            <div className="Gray_76 TxtCenter mBottom40">
              {_l('包含 %0 张工作表，导入 %1 行数据', importSheets.length, totalRows)}
            </div>
          )}
          {!createAppStatus && !createAppLoading && isOverLimit && (
            <div className="colorF44 mBottom14 overLimit">{_l('超过导入上限 (上限 50000 行)，请调整导入数据')}</div>
          )}
          {!createAppStatus && !createAppLoading && (
            <div className="sheetInfo">
              {importSheets.map(item => {
                return (
                  <div className="sheetInfoItem flexRow">
                    {item.sheetId === currentSheetId && isEditSheetName ? (
                      <div className="flex">
                        <input
                          ref={node => (this.editInput = node)}
                          value={item.sheetName}
                          className="editSheetNameInput"
                          onChange={e => this.changeSheetName(e, item)}
                          onBlur={e => this.onBlur(e, item)}
                        />
                      </div>
                    ) : (
                      <div className="bold flex overflowHidden">
                        <span className="InlineBlock ellipsis sheetName">{item.sheetName}</span>
                        <Icon
                          icon="edit"
                          className="Gray_bd mLeft5 Hand"
                          onClick={() => {
                            this.changeEditSheetName(item);
                          }}
                        />
                      </div>
                    )}
                    <div className="Gray_9e width94 pLeft10">
                      {_l('%0行', item.total ? item.total - item.rowNum : 0)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {createAppLoading && (
            <div
              className={cx('flexRow justifyContentCenter createAppLoadingWrap', {
                loadingOpacity: createAppLoading,
              })}
            >
              <LoadDiv size="small" className="createAppLoading" />
              <span className="mLeft5">{_l('正在为您创建应用和工作表')}</span>
            </div>
          )}
          {createAppStatus && !createAppLoading && (
            <div className={cx('TxtCenter', { successInfoAct: createAppStatus && !createAppLoading })}>
              <div className="Font28 bold mBottom12">
                {_l('应用创建成功')} <img src={congratulationImg} className="congratulationImg" />
              </div>
              <div className=" Gray_9e mBottom50 Font15">{_l('离开当前页面不会影响数据导入，导入完成后会通知您')}</div>
              <Button
                type="primary"
                className="checkAppBtn bold"
                onClick={() => {
                  navigateTo(`/app/${appInfo.appId}`);
                }}
              >
                {_l('查看应用')}
              </Button>
            </div>
          )}
        </div>
      </Dialog>
    );
  }
}
