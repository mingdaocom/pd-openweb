import React, { Component, Fragment } from 'react';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import { WingBlank, Button, ActionSheet, Toast, Modal } from 'antd-mobile';
import RecordAction from './RecordAction';
import CustomButtons from './RecordAction/CustomButtons';
import copy from 'copy-to-clipboard';
import worksheetApi from 'src/api/worksheet';
import favoriteApi from 'src/api/favorite';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { replaceBtnsTranslateInfo } from 'worksheet/util';
import { getCurrentProject } from 'src/util';
import _ from 'lodash';

const getRecordUrl = ({ appId, worksheetId, recordId, viewId }) => {
  const shareUrl = `${location.origin}/mobile/record/${appId}/${worksheetId}/${viewId}/${recordId}`;
  if (navigator.share) {
    navigator.share({
      title: _l('系统'),
      text: document.title,
      url: shareUrl,
    }).then(() => {
      Toast.info(_l('分享成功'));
    });
  } else {
    copy(shareUrl);
    Toast.info(_l('复制成功'));
  }
}

const getWorksheetShareUrl = ({ appId, worksheetId, recordId, viewId }) => {
  Toast.loading();
  worksheetApi.getWorksheetShareUrl({
    appId,
    worksheetId,
    rowId: recordId,
    viewId,
    objectType: 2,
  }).then(data => {
    Toast.hide();
    if (navigator.share) {
      navigator.share({
        title: _l('系统'),
        text: document.title,
        url: data.shareLink,
      }).then(() => {
        Toast.info(_l('分享成功'));
      });
    } else {
      copy(data.shareLink);
      Toast.info(_l('复制成功'));
    }
  });
}

const onDeleteRecord = ({ isSubList, recordBase }) => {
  const ok = () => {
    const { appId, worksheetId, viewId, recordId } = recordBase;
    worksheetApi.deleteWorksheetRows({
      worksheetId,
      viewId,
      appId,
      rowIds: [recordId],
    }).then(({ isSuccess }) => {
      if (isSuccess) {
        alert(_l('删除成功'));
        history.back();
      } else {
        alert(_l('删除失败'), 2);
      }
    });
  }
  Modal.alert(isSubList ? _l('是否删除子表记录 ?') : _l('是否删除此条记录 ?'), '', [
    { text: _l('取消'), style: 'default', onPress: () => { } },
    { text: _l('确定'), style: { color: 'red' }, onPress: ok },
  ]);
}

export default class RecordFooter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recordActionVisible: false,
      loading: true,
      customBtns: [],
      btnDisable: {},
      isFavorite: false,
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
    const { isSubList, recordBase, recordInfo = {} } = this.props;
    const { isFavorite } = this.state;
    const isExternal = _.isEmpty(getCurrentProject(recordInfo.projectId));

    const BUTTONS = [
      allowShare ? { name: _l('分享'), icon: 'share', iconClass: 'Font20 Gray_9e', fn: this.handleShare } : null,
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
            fn: () => onDeleteRecord({ isSubList, recordBase }),
          }
        : null,
    ].filter(_ => _);
    ActionSheet.showActionSheetWithOptions({
      options: BUTTONS.map(item => (
        <div className={cx('flexRow valignWrapper w100', item.class)} onClick={item.fn}>
          <Icon className={cx('mRight10', item.iconClass)} icon={item.icon} />
          <span className="Bold">{item.name}</span>
        </div>
      )),
      message: (
        <div className="flexRow header">
          <span className="Font13">{_l('更多操作')}</span>
          <div className="closeIcon" onClick={() => ActionSheet.close()}>
            <Icon icon="close" />
          </div>
        </div>
      ),
    });
  }
  handleShare = () => {
    const { recordInfo, recordBase } = this.props;
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
    ].filter(v => isOpenPermit(permitList.recordShareSwitch, recordInfo.switchPermit, recordBase.viewId) ? true : v.key !== 'publicShare');
    ActionSheet.showActionSheetWithOptions({
      options: BUTTONS.map(item => (
        <div className={cx('flexRow valignWrapper w100', item.className)} onClick={item.fn}>
          <div className="flex flexColumn" style={{ lineHeight: '22px' }}>
            <span className="Bold">{item.name}</span>
            <span className="Font12 Gray_75">{item.info}</span>
          </div>
          <Icon className="Font18 Gray_9e" icon="arrow-right-border" />
        </div>
      )),
      message: (
        <div className="flexRow header">
          <span className="Font13">{_l('分享')}</span>
          <div className="closeIcon" onClick={() => ActionSheet.close()}>
            <Icon icon="close" />
          </div>
        </div>
      ),
    });
  }
  
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
      childTableControlIds,
      canSubmitDraft,
      hideOtherOperate,
      isMobileOperate,
      recordBase,
      recordInfo,
    } = this.props;
    const { onEditRecord, onSubmitRecord, onSaveRecord } = this.props;
    const { loading, customBtns } = this.state;
    const allowEdit = recordInfo.allowEdit || editable;
    const allowDelete = recordInfo.allowDelete || (isSubList && editable);
    const allowShare = !md.global.Account.isPortal;
    return (
      <Fragment>
        {(allowEdit || getDataType === 21) && !recordBase.workId && (
          <WingBlank className="flex mLeft6 mRight6" size="sm">
            <Button
              disabled={getDataType === 21 ? false : recordInfo.rulesLocked}
              className="Font13 edit letterSpacing"
              onClick={onEditRecord}
            >
              <Icon icon="edit" className="Font15 mRight6" />
              <span>{_l('编辑')}</span>
            </Button>
          </WingBlank>
        )}
        {recordBase.workId && recordBase.from === 6 && (
          <WingBlank className="flex" size="sm">
            <Button
              className="Font13 bold"
              type="primary"
              onClick={onSaveRecord}
            >
              {_l('保存')}
            </Button>
          </WingBlank>
        )}
        {getDataType === 21 && ((childTableControlIds && !_.isEmpty(childTableControlIds) && canSubmitDraft) || !childTableControlIds) && (
          <WingBlank className="flex mLeft6 mRight6" size="sm">
            <Button
              className="Font13"
              type="primary"
              onClick={onSubmitRecord}
            >
              <span>{recordInfo.advancedSetting.sub || _l('提交')}</span>
            </Button>
          </WingBlank>
        )}
        {!loading && (
          <Fragment>
            <CustomButtons
              classNames="flex flexShink flexRow ellipsis mLeft6 mRight6 justifyContentCenter"
              customBtns={customBtns}
              isSlice
              btnDisable={this.state.btnDisable}
              handleClick={btn => {
                if (this.recordRef.current) {
                  this.recordRef.current.handleTriggerCustomBtn(btn);
                }
              }}
            />
            {(!getDataType || getDataType !== 21) && (allowDelete || allowShare) && !customBtns.length && !hideOtherOperate && (
              <WingBlank className="flex mLeft6 mRight6" size="sm">
                <Button
                  className="Font13"
                  type="primary"
                  onClick={() => this.handleMoreOperation({ allowDelete, allowShare })}
                >
                  <span>{_l('更多操作')}</span>
                </Button>
              </WingBlank>
            )}
            {!!customBtns.length && recordBase.appId && !isMobileOperate && (
              <div
                className="moreOperation"
                onClick={() => this.setState({ recordActionVisible: true })}
              >
                <Icon icon="expand_less" className="Font20" />
              </div>
            )}
          </Fragment>
        )}
      </Fragment>
    );
  }
  renderEditContent() {
    const { onCancelSave, onSaveRecord } = this.props
    return (
      <Fragment>
        <WingBlank className="flex" size="sm">
          <Button
            className="Font13 bold Gray_75"
            onClick={onCancelSave}
          >
            <span>{_l('取消')}</span>
          </Button>
        </WingBlank>
        <WingBlank className="flex" size="sm">
          <Button
            className="Font13 bold"
            type="primary"
            onClick={onSaveRecord}
          >
            {_l('保存')}
          </Button>
        </WingBlank>
      </Fragment>
    );
  }
  renderRecordAction() {
    const { recordInfo, recordBase, loadRecord } = this.props;
    const { recordActionVisible, customBtns, isFavorite } = this.state;
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
        recordActionVisible={recordActionVisible}
        onShare={this.handleShare}
        hideRecordActionVisible={() => {
          this.setState({ recordActionVisible: false });
        }}
        ref={this.recordRef}
        updateBtnDisabled={(val) => {
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
        <div className="btnsWrapper">
          <div className="flexRow">
            {isEditRecord ? this.renderEditContent() : this.renderContent()}
          </div>
        </div>
        {this.renderRecordAction()}
      </Fragment>
    );
  }
}
