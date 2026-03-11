import React, { Component, Fragment } from 'react';
import { ActionSheet, Button } from 'antd-mobile';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import favoriteApi from 'src/api/favorite';
import worksheetApi from 'src/api/worksheet';
import sheetSetAjax from 'src/api/worksheetSetting';
import { getDynamicValue } from 'src/components/Form/core/formUtils';
import { SHARECARDTYPS, WX_ICON_LIST } from 'src/components/ShareCardConfig/config.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { getTitleTextFromControls } from 'src/utils/control';
import { renderText } from 'src/utils/control';
import { compatibleMDJS } from 'src/utils/project';
import { replaceBtnsTranslateInfo } from 'src/utils/translate';
import AiActionButtons from './RecordAction/AiActionButtons';
import CustomButtons from './RecordAction/CustomButtons';

const CustomBtnBox = styled.div`
  ${({ load }) => !load && 'display: none !important;'}
  flex: 1;
  display: flex;
  gap: 6px;
  overflow: hidden;
  .customBtnItem {
    flex: 1;
    flex-shrink: 0;
    max-width: 100%;
  }
  .btn-full {
    flex: 1 1 100%;
    max-width: 100%;
  }
`;

export const getRecordUrl = ({ appId, worksheetId, recordId, viewId }) => {
  const shareUrl = `${location.origin}/mobile/record/${appId}/${worksheetId}/${viewId}/${recordId}`;

  copy(shareUrl);
  alert(_l('复制成功'));
};

const updateWorksheetRowShareRange = ({ appId, worksheetId, rowId, viewId }) => {
  worksheetApi.updateWorksheetRowShareRange({
    appId,
    worksheetId,
    rowId,
    viewId,
    shareRange: 2,
    objectType: 2,
  });
};

export const getWorksheetShareUrl = ({ appId, worksheetId, recordId, viewId }) => {
  return worksheetApi
    .getWorksheetShareUrl({
      appId,
      worksheetId,
      rowId: recordId,
      viewId,
      objectType: 2,
    })
    .then(data => {
      return data.shareLink;
    });
};

export const copyWorksheetShareUrl = ({ shareLink, isPublic, isCharge, appId, worksheetId, recordId, viewId }) => {
  copy(shareLink);
  alert(_l('复制成功'));

  // 在H5上执行对外公开分享，默认需要打开PC对外公开分享的链接开关
  if (!isPublic && isCharge) {
    updateWorksheetRowShareRange({ appId, worksheetId, rowId: recordId, viewId, isPublic });
  }
};

export default class RecordFooter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recordActionVisible: false,
      loading: true,
      customBtns: [],
      btnDisable: {},
      isFavorite: false,
      RecordAction: null,
      shareCardSet: {},
      aiActionBtns: [],
      shareLink: '',
    };
  }
  recordRef = React.createRef();

  componentDidMount() {
    if (
      this.props.getDataType !== 21 &&
      !this.props.isPublicShare &&
      !_.get(window, 'shareState.isPublicForm') &&
      !_.get(window, 'shareState.isPublicWorkflowRecord')
    ) {
      this.loadCustomBtns();
    }

    this.props.addRefreshEvents('loadCustomBtns', () => {
      setTimeout(() => {
        this.setState({ btnDisable: {} });
      }, 500);
      this.loadCustomBtns();
    });

    this.setState({ isFavorite: this.props.recordInfo.isFavorite });

    import('mobile/components/RecordInfo/RecordAction').then(component => {
      this.setState({ RecordAction: component.default });
    });

    this.getShareCardSet();
  }
  componentWillUnmount() {
    this.actionSheetHandler && this.actionSheetHandler.close();
    this.shareSheetHandler && this.shareSheetHandler.close();
  }

  loadCustomBtns = () => {
    if (location.pathname.indexOf('public') > -1) return;

    const { recordBase } = this.props;
    const { appId, worksheetId, viewId, recordId } = recordBase;

    const promises = [
      worksheetApi.getWorksheetBtns({
        appId,
        worksheetId,
        rowId: recordId,
        viewId: viewId === 'null' ? '' : viewId,
      }),
      worksheetApi.getWorksheetBtns({
        // appId,
        worksheetId,
        // rowId: recordId,
        // viewId: viewId === 'null' ? '' : viewId,
        btnType: 1,
      }),
    ];

    Promise.all(promises).then(res => {
      this.setState(
        {
          customBtns: replaceBtnsTranslateInfo(appId, res[0]),
          aiActionBtns: replaceBtnsTranslateInfo(appId, res[1]),
          loading: false,
        },
        () => {
          this.adjustButtons();
        },
      );
    });
  };

  getShareCardSet = () => {
    const { recordBase = {}, formData } = this.props;
    const { worksheetId } = recordBase;

    if (!window.isMingDaoApp) return;

    const renderTxt = value => {
      if (!value || !value.startsWith('[')) {
        return value;
      }
      return getDynamicValue(formData, {
        type: 2,
        advancedSetting: {
          defsource: value,
        },
      });
    };

    if (worksheetId) {
      sheetSetAjax.getShareCardSetting({ shareCardId: `${worksheetId}_${SHARECARDTYPS.RECORD}` }).then(res => {
        if (res) {
          const desc = renderTxt(res.desc);
          const title = renderTxt(res.title);

          this.setState({ shareCardSet: { desc, title, iconUrl: res.iconUrl } });
        }
      });
    }
  };

  getButtons = () => {
    const { recordInfo, recordBase } = this.props;
    const publicShare = isOpenPermit(permitList.recordShareSwitch, recordInfo.switchPermit, recordBase.viewId);
    const innerShare = isOpenPermit(permitList.embeddedLink, recordInfo.switchPermit, recordBase.viewId);
    const shareObj = {
      innerShare: {
        key: 'innerShare',
        name: _l('内部成员访问'),
        info: _l('仅限内部成员登录系统后根据权限访问'),
        icon: 'share',
        iconClass: 'Font18 textTertiary',
        fn: () => (window.isMingDaoApp ? this.handleAPPShare(false) : getRecordUrl(recordBase)),
        className: 'mBottom10',
      },
      publicShare: {
        key: 'publicShare',
        name: _l('对外公开分享'),
        info: _l('获得链接的所有人都可以查看'),
        icon: 'trash',
        iconClass: 'Font22 Red',
        fn: () =>
          window.isMingDaoApp
            ? this.handleAPPShare(true)
            : copyWorksheetShareUrl({
                ...recordBase,
                isPublic: recordInfo.shareRange === 2,
                shareLink: this.state.shareLink,
              }),
      },
    };
    return [publicShare ? shareObj.publicShare : undefined, innerShare ? shareObj.innerShare : undefined].filter(
      item => item,
    );
  };

  handleShare = () => {
    const { formData, recordBase, recordInfo } = this.props;
    const recordTitle = getTitleTextFromControls(formData);

    getWorksheetShareUrl({ ...recordBase, isPublic: recordInfo.shareRange === 2 }).then(shareLink => {
      this.setState({ shareLink });
    });

    this.shareSheetHandler = ActionSheet.show({
      actions: this.getButtons().map(item => {
        return {
          key: item.icon,
          text: (
            <div className={cx('flexRow valignWrapper w100', item.className)} onClick={item.fn}>
              <div className="flex flexColumn" style={{ lineHeight: '22px' }}>
                <span className="Bold">{item.name}</span>
                <span className="Font12 textSecondary">{item.info}</span>
              </div>
              <Icon className="Font18 textTertiary" icon="arrow-right-border" />
            </div>
          ),
        };
      }),
      extra: (
        <div className="flexRow header">
          <span className="Font13">{recordTitle || _l('分享')}</span>
          <div className="closeIcon" onClick={() => this.shareSheetHandler.close()}>
            <Icon icon="close" />
          </div>
        </div>
      ),
      onAction: () => {
        this.shareSheetHandler.close();
      },
    });
  };

  handleAPPShare = async publicShare => {
    const { recordInfo, recordBase, worksheetInfo, formData = [] } = this.props;
    const { appId, worksheetId, viewId, recordId } = recordBase;
    const { shareCardSet } = this.state;
    const rowData = recordInfo.rowData ? safeParse(recordInfo.rowData) : {};
    let { shareLink } = !publicShare
      ? {}
      : (await worksheetApi.getWorksheetShareUrl({
          appId,
          worksheetId,
          rowId: recordId,
          viewId,
          objectType: 2,
        })) || {};

    compatibleMDJS('shareContent', {
      // 数据, 分享到聊天使用
      mdItem: {
        type: 1,
        title: renderText(formData.find(o => o.attribute === 1)),
        rowId: recordId,
        sheetId: worksheetId,
        viewId,
        appId,
        ownerName: _.get(safeParse(rowData.ownerid), '[0].fullname'),
        entityName: worksheetInfo.entityName,
        url: publicShare ? shareLink : `${location.origin}/mobile/record/${appId}/${worksheetId}/${viewId}/${recordId}`,
        public: publicShare,
      }, //  mdItem{type=1, title, rowId, sheetId, viewId, appId, url, public, ownerName(拥有者姓名), entityName(实体名称 如"记录")}
      // 通用参数
      type: 3, // 0: 文本, 1: 链接, 3: 明道云内容; (2: 图片暂不支持)
      title: shareCardSet.title || renderText(formData.find(o => o.attribute === 1)) || _l('未命名'), // 标题
      desc: shareCardSet.desc || '', // 描述
      url: '', // 链接
      icon: shareCardSet.iconUrl || `${md.global.FileStoreConfig.pubHost}/${WX_ICON_LIST[0]}`, // 图标链接
      success: function (res) {
        console.log(res, 'success');
      },
      cancel: function (res) {
        console.log(res, 'cancel');
      },
    });
  };

  handlePrint = () => {
    const { instanceId, workId, recordBase, recordInfo } = this.props;
    const { projectId } = recordInfo;
    const { worksheetId, recordId, viewId, appId } = recordBase;
    // js sdk 对接原生打印
    compatibleMDJS(
      'showPrintList',
      {
        type: instanceId || workId ? 'workflow' : 'row', // row/workflow
        projectId, // 网络ID
        appId, // 应用ID
        // row
        sheetId: worksheetId, // 工作表ID
        viewId: viewId, // 视图ID
        rowId: recordId, // 记录ID
        // workflow
        workId,
        instanceId,
      },
      () => {},
    );
  };

  handleCollectRecord = () => {
    const { recordBase, recordInfo, refreshCollectRecordList = () => {} } = this.props;
    const { worksheetId, recordId, viewId } = recordBase;
    const { isFavorite } = this.state;

    if (isFavorite) {
      // 取消收藏
      favoriteApi
        .removeFavorite({
          projectId: recordInfo.projectId,
          rowId: recordId,
          worksheetId,
          viewId,
        })
        .then(res => {
          if (res) {
            alert(_l('已取消收藏'));
            refreshCollectRecordList();
            this.setState({ isFavorite: false });
          }
        });
    } else {
      // 添加收藏
      favoriteApi
        .addFavorite({
          worksheetId,
          rowId: recordId,
          viewId,
        })
        .then(res => {
          if (res) {
            alert(_l('收藏成功'));
            refreshCollectRecordList();
            this.setState({ isFavorite: true });
          }
        });
    }
  };

  adjustButtons = () => {
    const { recordBase } = this.props;
    const container = document.getElementById(`actionBar-${recordBase.recordId}`);
    if (!container) return;

    const buttons = container.querySelectorAll('[data-action-btn]');
    if (buttons.length < 2) return;

    const btn1 = buttons[0];
    const btn2 = buttons[1];
    const gap = 6;
    const EPSILON = 2;

    // 复位状态
    btn1.style.flex = 'none';
    btn2.style.flex = 'none';
    btn2.style.display = 'inline-flex';
    btn1.style.maxWidth = 'none';
    btn2.style.maxWidth = 'none';

    const containerWidth = Math.floor(container.getBoundingClientRect().width);
    const btn1Width = Math.ceil(btn1.getBoundingClientRect().width);
    const btn2Width = Math.ceil(btn2.getBoundingClientRect().width);

    // 第一个按钮都放不下
    if (btn1Width > containerWidth) {
      btn2.style.display = 'none';
      btn1.style.flex = '1 1 auto';
      btn1.style.maxWidth = '100%';
      return;
    }

    const halfContainer = (containerWidth - gap) / 2;

    // 两个按钮都能放下 且 两个按钮 ≤ 一半 → 平分
    if (btn1Width + gap + btn2Width <= containerWidth && btn1Width <= halfContainer && btn2Width <= halfContainer) {
      btn1.style.flex = '1 1 0';
      btn2.style.flex = '1 1 0';
      return;
    }

    // -------- 自适应布局 ----------
    const remainWidth = containerWidth - btn1Width - gap;

    if (remainWidth + EPSILON < containerWidth / 3) {
      // 第二个隐藏
      btn2.style.display = 'none';
      btn1.style.flex = '1 1 auto';
      btn1.style.maxWidth = '100%';
    } else {
      // 第二个显示，但限制在剩余空间
      btn1.style.flex = '1 1 auto';
      btn1.style.maxWidth = '100%';
      btn2.style.maxWidth = `${remainWidth}px`;
    }
  };

  renderContent() {
    const {
      editable,
      isSubList,
      getDataType,
      hideOtherOperate,
      isMobileOperate,
      recordBase,
      recordInfo,
      isDraft,
      editLockedUser,
      isRecordLock,
      worksheetInfo,
    } = this.props;
    const { onEditRecord, onSubmitRecord } = this.props;
    const { loading, customBtns, aiActionBtns, printList = [] } = this.state;
    const allowEdit = recordInfo.allowEdit || editable;
    const allowDelete =
      (isOpenPermit(permitList.recordDelete, recordInfo.switchPermit, recordBase.viewId) && recordInfo.allowDelete) ||
      (isSubList && editable);
    const allowShare =
      (isOpenPermit(permitList.recordShareSwitch, recordInfo.switchPermit, recordBase.viewId) ||
        isOpenPermit(permitList.embeddedLink, recordInfo.switchPermit, recordBase.viewId)) &&
      !md.global.Account.isPortal;
    const isPublicShare =
      _.get(window, 'shareState.isPublicRecord') ||
      _.get(window, 'shareState.isPublicView') ||
      _.get(window, 'shareState.isPublicPage') ||
      _.get(window, 'shareState.isPublicQuery') ||
      _.get(window, 'shareState.isPublicForm') ||
      _.get(window, 'shareState.isPublicWorkflowRecord') ||
      _.get(window, 'shareState.isPublicPrint');
    const allowPrint =
      !isPublicShare &&
      !window.isMingDaoApp &&
      !window.isWeiXin &&
      !window.isWeLink &&
      !window.isDingTalk &&
      printList.length;

    return (
      <Fragment>
        {(allowEdit || isDraft) && !isRecordLock && (
          <Button
            className={cx('mRight6 Font13 flex-shrink-0', { flex: !customBtns.length })}
            style={{ width: customBtns.length ? 100 : 'unset' }}
            onClick={onEditRecord}
            disabled={!!editLockedUser}
          >
            <Icon icon="edit" className={`Font15 mRight6 ${!editLockedUser ? 'colorPrimary' : 'textTertiary'}`} />
            <span className={`bold ${!editLockedUser ? 'colorPrimary' : 'textTertiary'}`}>{_l('编辑')}</span>
          </Button>
        )}
        {isDraft && (
          <Button className="flex mLeft6 mRight6 Font13" color="primary" onClick={onSubmitRecord}>
            <span>{recordInfo.advancedSetting.sub || _l('提交')}</span>
          </Button>
        )}
        {!isDraft && !loading && (
          <Fragment>
            <CustomBtnBox
              load={customBtns.length > 0 || (aiActionBtns.length > 0 && !md.global.SysSettings.hideAIBasicFun)}
              id={`actionBar-${recordBase.recordId}`}
            >
              <CustomButtons
                classNames="customBtnItem flexRow ellipsis justifyContentCenter"
                customBtns={customBtns}
                isSlice
                btnDisable={this.state.btnDisable}
                isEditLock={!!editLockedUser}
                isRecordLock={isRecordLock}
                entityName={recordInfo.entityName}
                viewId={recordBase.viewId}
                handleClick={btn => {
                  if (this.recordRef.current) {
                    this.recordRef.current.handleTriggerCustomBtn(btn);
                  }
                }}
              />
              <AiActionButtons
                appId={recordBase.appId}
                customBtns={customBtns}
                aiActionBtns={aiActionBtns}
                isSlice
                worksheetId={recordBase.worksheetId}
                recordInfo={recordInfo}
                worksheetInfo={worksheetInfo}
              />
            </CustomBtnBox>
            {(!getDataType || getDataType !== 21) &&
            (allowDelete || allowShare || allowPrint) &&
            !customBtns.length &&
            !hideOtherOperate ? (
              <Button
                className="flex mLeft6 Font13"
                color="primary"
                onClick={() => this.setState({ recordActionVisible: true })}
              >
                <span className="bold">{_l('更多操作')}</span>
              </Button>
            ) : (
              ''
            )}
            {!!customBtns.length && recordBase.appId && !isMobileOperate && (
              <div className="moreOperation flex-shrink-0" onClick={() => this.setState({ recordActionVisible: true })}>
                <Icon icon="expand_less" className="Font20" />
              </div>
            )}
          </Fragment>
        )}
      </Fragment>
    );
  }

  renderEditContent() {
    const { onCancelSave, onSaveRecord } = this.props;
    return (
      <Fragment>
        <Button className="flex mLeft6 mRight6 Font13 bold textSecondary" onClick={onCancelSave}>
          <span>{_l('取消')}</span>
        </Button>
        <Button className="flex mLeft6 mRight6 Font13 bold" color="primary" onClick={onSaveRecord}>
          {_l('保存')}
        </Button>
      </Fragment>
    );
  }

  renderRecordAction() {
    const {
      recordInfo,
      recordBase,
      loadRecord,
      handleDeleteSuccess = () => {},
      isRecordLock,
      updateRecordLock,
      editLockedUser,
      onUpdate,
      worksheetInfo,
    } = this.props;
    const { recordActionVisible, customBtns, isFavorite, RecordAction, aiActionBtns } = this.state;

    if (!RecordAction) return null;

    return (
      <RecordAction
        appId={recordBase.appId}
        worksheetId={recordBase.worksheetId}
        viewId={recordBase.viewId}
        rowId={recordBase.recordId}
        sheetRow={recordInfo}
        customBtns={customBtns}
        aiActionBtns={aiActionBtns}
        switchPermit={recordInfo.switchPermit}
        loadRow={loadRecord}
        isFavorite={isFavorite}
        loadCustomBtns={this.loadCustomBtns}
        handleDeleteSuccess={handleDeleteSuccess}
        recordActionVisible={recordActionVisible}
        onShare={this.handleShare}
        handlePrint={this.handlePrint}
        hideRecordActionVisible={() => {
          this.setState({ recordActionVisible: false });
        }}
        ref={this.recordRef}
        updateBtnDisabled={val => {
          this.setState({ btnDisable: val });
        }}
        handleCollectRecord={this.handleCollectRecord}
        isRecordLock={isRecordLock}
        updateRecordLock={updateRecordLock}
        isEditLock={!!editLockedUser}
        updatePrintList={list => this.setState({ printList: list })}
        onUpdate={onUpdate}
        worksheetInfo={worksheetInfo}
      />
    );
  }

  render() {
    const { isEditRecord } = this.props;

    return (
      <Fragment>
        <div className="flexRow alignItemsCenter bgPrimary pAll10 footer">
          {isEditRecord ? this.renderEditContent() : this.renderContent()}
        </div>
        {this.renderRecordAction()}
      </Fragment>
    );
  }
}
