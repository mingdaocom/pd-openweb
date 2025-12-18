import React, { Component, Fragment } from 'react';
import { ActionSheet, Button, Toast } from 'antd-mobile';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import favoriteApi from 'src/api/favorite';
import worksheetApi from 'src/api/worksheet';
import sheetSetAjax from 'src/api/worksheetSetting';
import { getDynamicValue } from 'src/components/Form/core/formUtils';
import { getTitleTextFromControls } from 'src/components/Form/core/utils';
import { SHARECARDTYPS, WX_ICON_LIST } from 'src/components/ShareCardConfig/config.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { renderText } from 'src/utils/control';
import { compatibleMDJS } from 'src/utils/project';
import { replaceBtnsTranslateInfo } from 'src/utils/translate';
import CustomButtons from './RecordAction/CustomButtons';

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

export const getWorksheetShareUrl = ({ appId, worksheetId, recordId, viewId, isPublic, isCharge }) => {
  Toast.show({ icon: 'loading' });
  worksheetApi
    .getWorksheetShareUrl({
      appId,
      worksheetId,
      rowId: recordId,
      viewId,
      objectType: 2,
    })
    .then(data => {
      Toast.clear();

      copy(data.shareLink);
      alert(_l('复制成功'));

      // 在H5上执行对外公开分享，默认需要打开PC对外公开分享的链接开关
      if (!isPublic && isCharge) {
        updateWorksheetRowShareRange({ appId, worksheetId, rowId: recordId, viewId, isPublic });
      }
    });
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

    worksheetApi
      .getWorksheetBtns({
        appId,
        worksheetId,
        rowId: recordId,
        viewId: viewId === 'null' ? '' : viewId,
      })
      .then(data => {
        this.setState({
          customBtns: replaceBtnsTranslateInfo(appId, data),
          loading: false,
        });
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
        iconClass: 'Font18 Gray_9e',
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
            : getWorksheetShareUrl({ ...recordBase, isPublic: recordInfo.shareRange === 2 }),
      },
    };
    return [publicShare ? shareObj.publicShare : undefined, innerShare ? shareObj.innerShare : undefined].filter(
      item => item,
    );
  };

  handleShare = () => {
    const { formData } = this.props;
    const recordTitle = getTitleTextFromControls(formData);

    this.shareSheetHandler = ActionSheet.show({
      actions: this.getButtons().map(item => {
        return {
          key: item.icon,
          text: (
            <div className={cx('flexRow valignWrapper w100', item.className)} onClick={item.fn}>
              <div className="flex flexColumn" style={{ lineHeight: '22px' }}>
                <span className="Bold">{item.name}</span>
                <span className="Font12 Gray_75">{item.info}</span>
              </div>
              <Icon className="Font18 Gray_9e" icon="arrow-right-border" />
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
    } = this.props;
    const { onEditRecord, onSubmitRecord } = this.props;
    const { loading, customBtns, printList = [] } = this.state;
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
            className={cx('mRight6 Font13', { flex: !customBtns.length })}
            style={{ width: customBtns.length ? 100 : 'unset' }}
            onClick={onEditRecord}
            disabled={!!editLockedUser}
          >
            <Icon icon="edit" className={`Font15 mRight6 ${!editLockedUser ? 'ThemeColor' : 'Gray_9e'}`} />
            <span className={`bold ${!editLockedUser ? 'ThemeColor' : 'Gray_9e'}`}>{_l('编辑')}</span>
          </Button>
        )}
        {isDraft && (
          <Button className="flex mLeft6 mRight6 Font13" color="primary" onClick={onSubmitRecord}>
            <span>{recordInfo.advancedSetting.sub || _l('提交')}</span>
          </Button>
        )}
        {!isDraft && !loading && (
          <Fragment>
            <CustomButtons
              classNames="flex flexShink flexRow ellipsis mLeft3 mRight3 justifyContentCenter"
              customBtns={customBtns}
              isSlice
              btnDisable={this.state.btnDisable}
              isEditLock={!!editLockedUser}
              isRecordLock={isRecordLock}
              entityName={recordInfo.entityName}
              handleClick={btn => {
                if (this.recordRef.current) {
                  this.recordRef.current.handleTriggerCustomBtn(btn);
                }
              }}
            />
            {(!getDataType || getDataType !== 21) &&
              (allowDelete || allowShare || allowPrint) &&
              !customBtns.length &&
              !hideOtherOperate && (
                <Button
                  className="flex mLeft6 Font13"
                  color="primary"
                  onClick={() => this.setState({ recordActionVisible: true })}
                >
                  <span className="bold">{_l('更多操作')}</span>
                </Button>
              )}
            {!!customBtns.length && recordBase.appId && !isMobileOperate && (
              <div className="moreOperation" onClick={() => this.setState({ recordActionVisible: true })}>
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
        <Button className="flex mLeft6 mRight6 Font13 bold Gray_75" onClick={onCancelSave}>
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
    } = this.props;
    const { recordActionVisible, customBtns, isFavorite, RecordAction } = this.state;

    if (!RecordAction) return null;

    return (
      <RecordAction
        appId={recordBase.appId}
        worksheetId={recordBase.worksheetId}
        viewId={recordBase.viewId}
        rowId={recordBase.recordId}
        sheetRow={recordInfo}
        customBtns={customBtns}
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
      />
    );
  }

  render() {
    const { isEditRecord } = this.props;

    return (
      <Fragment>
        <div className="flexRow alignItemsCenter WhiteBG pAll10 footer">
          {isEditRecord ? this.renderEditContent() : this.renderContent()}
        </div>
        {this.renderRecordAction()}
      </Fragment>
    );
  }
}
