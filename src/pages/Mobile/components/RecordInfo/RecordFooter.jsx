import React, { Component, Fragment } from 'react';
import { ActionSheet, Button, Toast } from 'antd-mobile';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import favoriteApi from 'src/api/favorite';
import worksheetApi from 'src/api/worksheet';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { compatibleMDJS, getCurrentProject } from 'src/utils/project';
import { replaceBtnsTranslateInfo } from 'src/utils/translate';
import CustomButtons from './RecordAction/CustomButtons';

const getRecordUrl = ({ appId, worksheetId, recordId, viewId }) => {
  const shareUrl = `${location.origin}/mobile/record/${appId}/${worksheetId}/${viewId}/${recordId}`;
  if (navigator.share) {
    navigator
      .share({
        title: _l('系统'),
        text: document.title,
        url: shareUrl,
      })
      .then(() => {
        alert(_l('分享成功'));
      });
  } else {
    copy(shareUrl);
    alert(_l('复制成功'));
  }
};

const getWorksheetShareUrl = ({ appId, worksheetId, recordId, viewId }) => {
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
      if (navigator.share) {
        navigator
          .share({
            title: _l('系统'),
            text: document.title,
            url: data.shareLink,
          })
          .then(() => {
            alert(_l('分享成功'));
          });
      } else {
        copy(data.shareLink);
        alert(_l('复制成功'));
      }
    });
};

const onDeleteRecord = ({ isSubList, recordBase, handleDeleteSuccess = () => {} }) => {
  const ok = () => {
    const { appId, worksheetId, viewId, recordId } = recordBase;
    worksheetApi
      .deleteWorksheetRows({
        worksheetId,
        viewId,
        appId,
        rowIds: [recordId],
      })
      .then(({ isSuccess }) => {
        if (isSuccess) {
          alert(_l('删除成功'));
          handleDeleteSuccess(recordId);
        } else {
          alert(_l('删除失败'), 2);
        }
      });
  };

  let actionDeleteHandler = ActionSheet.show({
    popupClassName: 'md-adm-actionSheet',
    actions: [],
    extra: (
      <div className="flexColumn w100">
        <div className="bold Gray Font17 pTop10">{isSubList ? _l('是否删除子表记录 ?') : _l('是否删除此条记录 ?')}</div>
        <div className="valignWrapper flexRow mTop24">
          <Button
            className="flex mRight6 bold Gray_75 flex ellipsis Font13"
            onClick={() => actionDeleteHandler.close()}
          >
            {_l('取消')}
          </Button>
          <Button
            className="flex mLeft6 bold ellipsis Font13"
            color="danger"
            onClick={() => {
              actionDeleteHandler.close();
              ok();
            }}
          >
            {_l('确认')}
          </Button>
        </div>
      </div>
    ),
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
      RecordAction: null
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
        viewId,
        rowId: recordId,
      })
      .then(data => {
        this.setState({
          customBtns: replaceBtnsTranslateInfo(appId, data),
          loading: false,
        });
      });
  };

  handleMoreOperation = ({ allowDelete, allowShare }) => {
    const { isSubList, recordBase, recordInfo = {}, handleDeleteSuccess = () => {} } = this.props;
    const { isFavorite } = this.state;
    const isExternal = _.isEmpty(getCurrentProject(recordInfo.projectId));

    const BUTTONS = [
      allowShare ? { name: _l('分享'), icon: 'share', iconClass: 'Font20 Gray_9e', fn: this.handleShare } : null,
      window.isMingDaoApp
        ? { name: _l('打印'), icon: 'install', iconClass: 'Font24 Gray_9e', fn: this.handlePrint }
        : null,
      !window.shareState.shareId && !md.global.Account.isPortal && !isExternal
        ? {
            name: isFavorite ? _l('取消收藏') : _l('收藏记录'),
            icon: 'star_3',
            iconClass: `Font20 Gray_9e ${isFavorite ? 'activeStar' : ''}`,
            fn: this.handleCollectRecord,
          }
        : null,
      allowDelete
        ? {
            name: _l('删除'),
            icon: 'delete2',
            iconClass: 'Font22 Red',
            class: 'Red',
            fn: () => onDeleteRecord({ isSubList, recordBase, handleDeleteSuccess }),
          }
        : null,
    ].filter(_ => _);
    this.actionSheetHandler = ActionSheet.show({
      actions: BUTTONS.map(item => {
        return {
          key: item.icon,
          text: (
            <div
              className={cx('flexRow valignWrapper w100', item.class)}
              onClick={item.fn}
              style={{ marginLeft: item.icon === 'install' ? -2 : 0 }}
            >
              <Icon className={cx('mRight20', item.iconClass)} icon={item.icon} />
              <span className="Bold">{item.name}</span>
            </div>
          ),
        };
      }),
      extra: (
        <div className="flexRow header">
          <span className="Font13">{_l('更多操作')}</span>
          <div className="closeIcon" onClick={() => this.actionSheetHandler.close()}>
            <Icon icon="close" />
          </div>
        </div>
      ),
      onAction: (action, index) => {
        this.actionSheetHandler.close();
      },
    });
  };
  handleShare = () => {
    const { recordInfo, recordBase } = this.props;
    const publicShare = isOpenPermit(permitList.recordShareSwitch, recordInfo.switchPermit, recordBase.viewId);
    const innerShare = isOpenPermit(permitList.embeddedLink, recordInfo.switchPermit, recordBase.viewId);

    const BUTTONS = [
      {
        key: 'innerShare',
        name: _l('内部成员访问'),
        info: _l('仅限内部成员登录系统后根据权限访问'),
        icon: 'share',
        iconClass: 'Font18 Gray_9e',
        fn: () => getRecordUrl(recordBase),
        className: 'mBottom10',
      },
      {
        key: 'publicShare',
        name: _l('对外公开分享'),
        info: _l('获得链接的所有人都可以查看'),
        icon: 'delete2',
        iconClass: 'Font22 Red',
        fn: () => getWorksheetShareUrl(recordBase),
      },
    ].filter(v =>
      publicShare && innerShare
        ? true
        : publicShare
          ? v.key === 'publicShare'
          : innerShare
            ? v.key === 'innerShare'
            : false,
    );

    this.shareSheetHandler = ActionSheet.show({
      actions: BUTTONS.map(item => {
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
          <span className="Font13">{_l('分享')}</span>
          <div className="closeIcon" onClick={() => this.shareSheetHandler.close()}>
            <Icon icon="close" />
          </div>
        </div>
      ),
      onAction: (action, index) => {
        this.shareSheetHandler.close();
      },
    });
  };

  // js sdk 对接原生打印
  handlePrint = () => {
    const { instanceId, workId, recordBase, recordInfo } = this.props;
    const { projectId } = recordInfo;
    const { worksheetId, recordId, viewId, appId } = recordBase;
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
        success: function (res) {
          // 当前版本H5无需处理! App会处理日志
          // 返回成功打印的模板信息, 备用, 可能需要上传日志
          let templatedId = res.templateId;
          let templateName = res.templateName;
        },
        cancel: function (res) {
          // 用户取消
        },
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
      formChanged,
      editable,
      isSubList,
      getDataType,
      hideOtherOperate,
      isMobileOperate,
      recordBase,
      recordInfo,
      isDraft,
    } = this.props;
    const { onEditRecord, onSubmitRecord, onSaveRecord } = this.props;
    const { loading, customBtns } = this.state;
    const allowEdit = recordInfo.allowEdit || editable;
    const allowDelete =
      (isOpenPermit(permitList.recordDelete, recordInfo.switchPermit, recordBase.viewId) && recordInfo.allowDelete) ||
      (isSubList && editable);
    const allowShare =
      (isOpenPermit(permitList.recordShareSwitch, recordInfo.switchPermit, recordBase.viewId) ||
        isOpenPermit(permitList.embeddedLink, recordInfo.switchPermit, recordBase.viewId)) &&
      !md.global.Account.isPortal;
    return (
      <Fragment>
        {(allowEdit || isDraft) && (
          <Button
            className={cx('mRight6 Font13', { flex: !customBtns.length })}
            style={{ width: customBtns.length ? 100 : 'unset' }}
            onClick={onEditRecord}
          >
            <Icon icon="edit" className="Font15 mRight6 ThemeColor" />
            <span className="ThemeColor bold">{_l('编辑')}</span>
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
              handleClick={btn => {
                if (this.recordRef.current) {
                  this.recordRef.current.handleTriggerCustomBtn(btn);
                }
              }}
            />
            {(!getDataType || getDataType !== 21) &&
              (allowDelete || allowShare) &&
              !customBtns.length &&
              !hideOtherOperate && (
                <Button
                  className="flex mLeft6 Font13"
                  color="primary"
                  onClick={() => this.handleMoreOperation({ allowDelete, allowShare })}
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
    const { recordInfo, recordBase, loadRecord, handleDeleteSuccess = () => {} } = this.props;
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
