import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Drawer } from 'antd';
import cx from 'classnames';
import { List } from 'immutable';
import { min } from 'lodash';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { ScrollView } from 'ming-ui';
import LoadDiv from 'ming-ui/components/LoadDiv';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withDragSelect from 'ming-ui/decorators/withDragSelect';
import { navigateTo } from 'src/router/navigateTo';
import AttachmentsPreview from '../../common/AttachmentsPreview';
import Detail from '../../components/Detail';
import KcAppItem from '../../components/KcAppItem';
import KcListEmpty from '../../components/KcListEmpty';
import KcListHeader from '../../components/KcListHeader';
import KcNewFolder from '../../components/KcNewFolder';
import RightMenu from '../../components/RightMenu';
import {
  NODE_OPERATOR_TYPE,
  NODE_SORT_BY,
  NODE_SORT_TYPE,
  NODE_STATUS,
  PICK_TYPE,
  ROOT_PERMISSION_TYPE,
} from '../../constant/enum';
import * as kcActions from '../../redux/actions/kcAction';
import * as selectActions from '../../redux/actions/selectAction';
import { getRootNameAndLink } from '../../utils';
import { handleDownloadOne, updateNodeName } from '../../utils/common';
import {
  bindEvent,
  handleDragSelect,
  handleDragSelectClickOnly,
  handleDragSelectFromGap,
  registerNodeItemEvent,
} from '../../utils/kcevent';
import './KcMain.less';

const DragSelect = createDecoratedComponent(withDragSelect);

class KcMain extends Component {
  static propTypes = {
    path: PropTypes.string,
    baseUrl: PropTypes.string,
    appBaseUrl: PropTypes.string,
    query: PropTypes.shape({
      q: PropTypes.string,
    }),
    list: PropTypes.shape({}),
    totalCount: PropTypes.number,
    currentRoot: PropTypes.oneOfType([PropTypes.number, PropTypes.shape({})]),
    selectedItems: PropTypes.shape({}),
    currentFolder: PropTypes.shape({}),
    isGlobalSearch: PropTypes.bool,
    isRecycle: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    selectAll: PropTypes.bool,
    listLoading: PropTypes.bool,
    params: PropTypes.shape({}),
    updateKcListElement: PropTypes.func,
    searchNodes: PropTypes.func,
    startGlobalSearch: PropTypes.func,
    loadMoreKcNodes: PropTypes.func,
    triggerLoadMoreNodes: PropTypes.func,
    changeFolder: PropTypes.func,
    openUploadAssistant: PropTypes.func,
    addLinkFile: PropTypes.func,
    addNewFolder: PropTypes.func,
    updateNodeItem: PropTypes.func,
    removeNodeItem: PropTypes.func,
    shareNode: PropTypes.func,
    starNode: PropTypes.func,
    moveOrCopyClick: PropTypes.func,
    removeNode: PropTypes.func,
    selectItem: PropTypes.func,
    selectSingleItem: PropTypes.func,
    selectItems: PropTypes.func,
    selectAllItems: PropTypes.func,
    changeSortBy: PropTypes.func,
    restoreNode: PropTypes.func,
    reloadList: PropTypes.func,
    updateKcBaseUrl: PropTypes.func,
    loadListById: PropTypes.func,
    batchDownload: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      selectedItems: List(),
      isList: true, // 显示为列表
      isShowDetail: false, // 显示节点详情
      isPinDetail: false,
      newFolderVisible: false,
      isPreviewFile: false,
      previewIndex: 0,
      rightMenuOption: undefined,
      detailAttamentsPreviewActive: false,
    };
  }
  componentDidMount() {
    const { path, appBaseUrl, updateKcListElement, changeFolder, updateKcBaseUrl } = this.props;
    this.jqns = Math.floor(Math.random() * 100000);
    updateKcBaseUrl(appBaseUrl || '/apps/kc');
    updateKcListElement(this.kclist);
    if (!path) {
      navigateTo(appBaseUrl + '/my');
    } else {
      changeFolder(path);
    }
    bindEvent(
      this.jqns,
      Object.assign({}, this.props, {
        showDetail: this.showDetail,
        handlePreview: this.handlePreview,
        getRootNameAndLink,
      }),
      this.getEventLatestData,
    );
    this.handleRegisterNodeItemEvent();
  }

  componentWillReceiveProps(nextProps) {
    const { path, query, changeFolder } = this.props;
    if (nextProps.path !== path || nextProps.query.q !== query.q) {
      changeFolder(nextProps.path);
    }
  }

  componentWillUnmount() {
    $(document).off('.' + this.jqns);
  }

  handleRegisterNodeItemEvent = () => {
    const _this = this;
    const { selectItem, selectSingleItem, updateNodeItem, baseUrl } = this.props;
    registerNodeItemEvent(this.kcApp, {
      findItemById: id => {
        const { list } = _this.props;
        return list.filter(_.identity).find(i => i.id === id);
      },
      changeRightMenuOption: rightMenuOption => _this.setState({ rightMenuOption }),
      baseUrl,
      handlePreview: this.handlePreview,
      selectSingleItem,
      selectItem,
      updateNodeItem,
      startDragItems: evt => {
        _this.setState({ draggingItemsStartPos: { left: evt.clientX, top: evt.clientY } });
      },
      getLatestData: this.getEventLatestData,
    });
  };

  getEventLatestData = () => {
    return Object.assign({}, this.props, {
      dragSelectEle: this.dragSelect,
      previewFile: this.state.previewFile,
    });
  };

  showDetail = () => {
    this.setState({
      isShowDetail: true,
    });
  };

  togglePinDetail = () => {
    const { isPinDetail } = this.state;
    this.setState({ isPinDetail: !isPinDetail });
  };

  toggleDetailAndTogglePin = () => {
    let { isPinDetail, isShowDetail } = this.state;
    if (isPinDetail === isShowDetail) {
      isPinDetail = isShowDetail = !isShowDetail;
    } else {
      isPinDetail = isShowDetail = true;
    }
    this.setState({ isShowDetail, isPinDetail });
  };

  changeKcView = () => {
    const { isList } = this.state;
    this.setState({
      isList: !isList,
    });
  };

  handleAddNewFolder = visible => {
    this.setState({
      newFolderVisible: visible,
    });
  };

  handlePreview = item => {
    const { list } = this.props;
    const index = list.filter(item => item && item.type !== 1).findIndex(i => i.id === item.id);
    this.setState({
      isPreviewFile: true,
      previewIndex: index,
    });
  };

  hasMultipleSelectedItems = () => {
    const { selectAll, selectedItems, list } = this.props;
    return selectedItems.size > 1 || (selectAll && list.size > 1);
  };
  render() {
    const {
      path,
      list,
      totalCount,
      baseUrl,
      listLoading,
      currentRoot,
      currentFolder,
      params,
      searchNodes,
      startGlobalSearch,
      isGlobalSearch,
      triggerLoadMoreNodes,
      openUploadAssistant,
      addLinkFile,
      addNewFolder,
      updateNodeItem,
      removeNodeItem,
      loadMoreKcNodes,
      shareNode,
      starNode,
      moveOrCopyClick,
      removeNode,
      selectedItems,
      selectAll,
      selectAllItems,
      selectItem,
      selectItems,
      selectSingleItem,
      changeSortBy,
      restoreNode,
      isRecycle,
      isReadOnly,
      reloadList,
      loadListById,
      batchDownload,
    } = this.props;
    const { keywords, sortBy, sortType } = params.toObject();
    let kclist;
    const {
      isShowDetail,
      isList,
      isPinDetail,
      newFolderVisible,
      isPreviewFile,
      previewIndex,
      rightMenuOption,
      detailAttamentsPreviewActive,
    } = this.state;
    const validList = list.filter(x => x);
    const selectAllUnchecked =
      selectAll && list.size !== selectedItems.size
        ? list.filter(item => !selectedItems.some(selectItem => selectItem.id === item.id))
        : null;
    const selectedCount = selectAll
      ? list.size === selectedItems.size
        ? totalCount - list.size + validList.size
        : totalCount - selectAllUnchecked.size
      : selectedItems.size;

    // 添加文件夹
    const addFolder = newFolderVisible && (
      <KcNewFolder
        isList={isList}
        addNewFolder={addNewFolder}
        onHideAddNewFolder={() => this.handleAddNewFolder(false)}
      />
    );

    // 知识列表组件
    const kclistProps = {
      id: 'kclistContainer',
      className: cx(
        'noContextMenu noSelect cursorDefault',
        { noMultiItemsSelected: !this.hasMultipleSelectedItems() },
        isList || isRecycle ? 'kclist' : 'thumbnail',
        { relative: !validList.size && !addFolder && !listLoading },
        { noListItem: !validList.size },
      ),
      ref: kclistcon => (this.kclist = kclistcon),
    };

    if (!validList.size && !addFolder) {
      kclist = (
        <div {...kclistProps}>
          {listLoading ? (
            <LoadDiv size="big" />
          ) : (
            <KcListEmpty
              isReadOnly={isReadOnly}
              isRecycle={isRecycle}
              root={currentRoot}
              keywords={keywords}
              openUploadAssistant={openUploadAssistant}
            />
          )}
        </div>
      );
    } else {
      const last = validList.count() - 1;
      kclist = (
        <div {...kclistProps}>
          <ScrollView className="kclistScrollContent" onScrollEnd={triggerLoadMoreNodes}>
            <DragSelect
              key="nodeList"
              containerSelector="#kclistContainer"
              component="ul"
              ref={dragSelect => (this.dragSelect = dragSelect)}
              className="clearfix"
              style={{ position: 'relative' }}
              onDragSelectStart={() => (this.selectedItemsBeforeDragSelect = selectedItems)}
              onDragSelectEnd={() => (this.selectedItemsBeforeDragSelect = null)}
              manuallyStart
              clickOnlyDistance={3}
              onClickOnly={(child, evt) => {
                handleDragSelectClickOnly({
                  child,
                  evt,
                  selectedItems,
                  list,
                  selectItem,
                  selectItems,
                  selectSingleItem,
                });
              }}
              onDragSelect={(children, evt) => {
                handleDragSelect({
                  children,
                  evt,
                  selectItems,
                  selectedItems,
                  selectedItemsBeforeDragSelect: this.selectedItemsBeforeDragSelect,
                });
              }}
              onMouseDown={evt => {
                handleDragSelectFromGap(evt, this.dragSelect);
              }}
            >
              {addFolder}
              {validList
                .map(
                  (item, i) =>
                    !!item && (
                      <KcAppItem
                        key={item.id}
                        path={path}
                        baseUrl={baseUrl}
                        item={item}
                        keywords={keywords}
                        permission={currentRoot.permission}
                        isList={isList}
                        className={cx({ 'first-child': i === 0, 'last-child': i === last })}
                        animation={i < 20 ? 'fadeInUp ani' + min([i * 100, 900]) : ''}
                        isRecycle={isRecycle}
                        selected={selectedItems.contains(item) || (selectAll && list.size === selectedItems.size)}
                        handlePreview={this.handlePreview}
                        selectedItems={selectedItems}
                        removeNode={removeNode}
                        moveOrCopyClick={moveOrCopyClick}
                        restoreNode={restoreNode}
                        updateNodeName={updateNodeName}
                        updateNodeItem={updateNodeItem}
                        onShareNode={shareNode}
                        loadListById={loadListById}
                        handleAddLinkFile={this.handleAddLinkFile}
                        showDetail={this.showDetail}
                        download={() => handleDownloadOne(item)}
                        onStarNode={starNode}
                        onAddLinkFile={addLinkFile}
                      />
                    ),
                )
                .toArray()}
            </DragSelect>
            {listLoading && <LoadDiv size="big" className="mTop10 mBottom10" key="nodeListLoading" />}
          </ScrollView>
        </div>
      );
    }
    // 主体
    return (
      <div className="kcMain kcMain flex" ref={kcApp => (this.kcApp = kcApp)}>
        <div className="previewFileMain">
          {isPreviewFile && (
            <AttachmentsPreview
              options={{
                attachments: list.filter(item => item && item.type !== 1).toArray(),
                hideFunctions: isRecycle ? ['share'] : [],
                callFrom: 'kc',
                fromType: 7,
                index: previewIndex || 0,
              }}
              extra={{
                performUpdateItem: updateNodeItem,
                performRemoveItems: removeNodeItem,
                loadMoreAttachments:
                  list.size < totalCount
                    ? () =>
                        new Promise((resolve, reject) => {
                          loadMoreKcNodes(data => {
                            if (!data.list || typeof data.list !== 'object') {
                              reject();
                            }
                            resolve(
                              data.list
                                .filter(item => item.type !== 1)
                                .map(item =>
                                  Object.assign({}, item, {
                                    previewAttachmentType: 'KC',
                                  }),
                                ),
                            );
                          });
                        })
                    : undefined,
              }}
              onClose={() => {
                this.setState({
                  isPreviewFile: false,
                });
              }}
            />
          )}
        </div>
        <div className="kcRightContent borderContainer boxSizing flexColumn Relative">
          <KcListHeader
            currentRoot={currentRoot}
            currentFolder={currentFolder}
            baseUrl={baseUrl}
            isList={isList}
            isReadOnly={isReadOnly}
            isRecycle={isRecycle}
            keywords={keywords}
            rootNameAndLink={getRootNameAndLink(baseUrl, currentRoot)}
            searchNodes={searchNodes}
            openUploadAssistant={openUploadAssistant}
            startGlobalSearch={startGlobalSearch}
            isGlobalSearch={isGlobalSearch}
            isPinDetail={isPinDetail}
            onRemoveNode={removeNode}
            onSelectAllItems={selectAllItems}
            onShowAddNewFolder={() => this.handleAddNewFolder(true)}
            changeKcView={this.changeKcView}
            addLinkFile={addLinkFile}
            loadRecycleBin={reloadList}
            toggleDetailAndTogglePin={this.toggleDetailAndTogglePin}
          />
          <div
            className={cx(
              'flex kcMainContent Relative transitions boxSizing',
              isShowDetail ? 'showDetail' : 'removeDetail',
            )}
          >
            <div className={cx('kcToolbar boxSizing', { hide: !validList.size })}>
              <span className="selectAll boderRadAll_3" data-tip={_l('全选')} onClick={() => selectAllItems(false)}>
                <i className={cx('icon-ok', { hide: !(selectAll && list.size === selectedItems.size) })} />
              </span>
              <span className={cx('kcToolbarSingle', { hide: selectedItems.size >= 2 || !isList })}>
                <span
                  className={cx('kcToolbarLabel', { disabledSort: currentRoot === PICK_TYPE.RECENT })}
                  onClick={() => changeSortBy(NODE_SORT_BY.NAME)}
                >
                  {_l('文件名')}
                  <i
                    className={cx(
                      'ThemeColor3',
                      { hide: sortBy !== NODE_SORT_BY.NAME || currentRoot === PICK_TYPE.RECENT },
                      sortType === NODE_SORT_TYPE.ASC ? 'icon-goprev' : 'icon-gonext',
                    )}
                  />
                </span>
                <div className="kcToolbarRight transitions">
                  <span className={cx('createUser ellipsis', { hide: isRecycle })}>{_l('创建人')}</span>
                  {!isRecycle ? (
                    <span
                      className={cx('editTime ellipsis', { disabledSort: currentRoot === PICK_TYPE.RECENT })}
                      onClick={() => changeSortBy(NODE_SORT_BY.UPDATE_TIME)}
                    >
                      {_l('修改时间')}
                      <i
                        className={cx(
                          'ThemeColor3',
                          { hide: sortBy !== NODE_SORT_BY.UPDATE_TIME || currentRoot === PICK_TYPE.RECENT },
                          sortType === NODE_SORT_TYPE.ASC ? 'icon-goprev' : 'icon-gonext',
                        )}
                      />
                    </span>
                  ) : (
                    <span
                      className="deleteTime ellipsis ThemeColor3"
                      onClick={() => changeSortBy(NODE_SORT_BY.UPDATE_TIME)}
                    >
                      删除时间
                      <i
                        className={cx(
                          'ThemeColor3',
                          { hide: sortBy !== NODE_SORT_BY.UPDATE_TIME },
                          sortType === NODE_SORT_TYPE.ASC ? 'icon-goprev' : 'icon-gonext',
                        )}
                      />
                    </span>
                  )}
                  <span className="size ellipsis">{_l('大小')}</span>
                </div>
              </span>
              <span className={cx('kcToolbarMultiple', { hide: selectedItems.size < 2 })}>
                {_l('已选中') + selectedCount + _l('项')}
                <span className={cx({ hide: isRecycle })} data-tip={_l('批量下载')}>
                  <i className="icon-kc-hover-download ThemeColor3 pointer" onClick={batchDownload} />
                </span>
                <span className={cx({ hide: isRecycle || isReadOnly })} data-tip={_l('批量移动')}>
                  <i
                    className="icon-task-replace ThemeColor3 pointer"
                    onClick={() =>
                      moveOrCopyClick(
                        NODE_OPERATOR_TYPE.MOVE,
                        typeof currentRoot === 'object' &&
                          currentRoot.permission != ROOT_PERMISSION_TYPE.OWNER &&
                          currentRoot.permission != ROOT_PERMISSION_TYPE.ADMIN
                          ? currentRoot.id
                          : null,
                      )
                    }
                  />
                </span>
                <span className={cx({ hide: isRecycle })} data-tip={_l('批量复制')}>
                  <i
                    className="icon-knowledge-more-folder ThemeColor3 pointer"
                    onClick={() => moveOrCopyClick(NODE_OPERATOR_TYPE.COPY)}
                  />
                </span>
                <span className={cx({ hide: isRecycle || isReadOnly })} data-tip={_l('批量删除')}>
                  <i className="icon-trash ThemeColor3 pointer" onClick={() => removeNode(NODE_STATUS.RECYCLED)} />
                </span>
                <span className={cx({ hide: !isRecycle })} data-tip="批量彻底删除">
                  <i className="icon-trash ThemeColor3 pointer" onClick={() => removeNode(NODE_STATUS.DELETED)} />
                </span>
                <span className={cx({ hide: !isRecycle })} data-tip={_l('批量还原')}>
                  <i className="icon-rotate ThemeColor3 pointer" onClick={restoreNode} />
                </span>
              </span>
            </div>
            {kclist}
          </div>
          {rightMenuOption && (
            <RightMenu
              item={rightMenuOption.item}
              kcApp={this.kcApp}
              permission={currentRoot.permission}
              hideRightMenu={() => this.setState({ rightMenuOption: null })}
              onClickAway={() => this.setState({ rightMenuOption: null })}
              onClickAwayExceptions={[this.dragSelect]}
              clientX={rightMenuOption.clientX}
              clientY={rightMenuOption.clientY}
              isRecycle={isRecycle}
              isMulti={rightMenuOption.isMulti}
              removeNode={removeNode}
              moveOrCopyClick={moveOrCopyClick}
              restoreNode={restoreNode}
              updateNodeName={updateNodeName}
              performUpdateItem={updateNodeItem}
              onShareNode={shareNode}
              changeFolder={item => {
                navigateTo('/apps/kc' + item.position.replace(md.global.Account.accountId, 'my'));
              }}
              handlePreview={this.handlePreview}
              handleAddLinkFile={this.handleAddLinkFile}
              download={selectedItems.size === 1 ? handleDownloadOne : batchDownload}
              showDetail={this.showDetail}
              onStarNode={starNode}
              onAddLinkFile={addLinkFile}
            />
          )}
        </div>

        <Drawer
          className="kcMain"
          visible={isShowDetail}
          width={408}
          mask={false}
          drawerStyle={{
            position: 'absolute',
            top: 95,
            bottom: 0,
            height: 'auto',
            right: 68,
            width: 340,
          }}
          style={{ zIndex: detailAttamentsPreviewActive ? 16 : 6, overflow: 'visible' }}
          bodyStyle={{ padding: 0 }}
          headerStyle={{ display: 'none' }}
          onClose={isPinDetail ? null : () => this.setState({ isShowDetail: false })}
        >
          <Detail
            data={selectedItems.size === 1 ? selectedItems.toArray()[0] : selectedItems}
            togglePinned={this.togglePinDetail}
            isPinned={isPinDetail}
            performUpdateItem={updateNodeItem}
            selectAllSize={selectAll ? selectedCount : 0}
            selectAllUnchecked={selectAllUnchecked}
            rootType={typeof currentRoot === 'object' ? PICK_TYPE.ROOT : currentRoot}
            parentId={currentFolder ? currentFolder.id : null}
            rootId={typeof currentRoot === 'object' ? currentRoot.id : null}
            rootProjectId={
              typeof currentRoot === 'object' ? (currentRoot.project && currentRoot.project.projectId) || '' : null
            }
            status={isRecycle ? NODE_STATUS.RECYCLED : NODE_STATUS.NORMAL}
            updateDetailAttachmentsPreviewState={state => {
              this.setState({
                detailAttamentsPreviewActive: state,
              });
            }}
          />
        </Drawer>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  listLoading: state.kc.listLoading,
  totalCount: state.kc.totalCount,
  params: state.kc.params,
  baseUrl: state.kc.baseUrl,
  list: state.kc.list,
  selectAll: state.kc.selectAll,
  currentRoot: state.kc.currentRoot,
  currentFolder: state.kc.currentFolder,
  isGlobalSearch: state.kc.isGlobalSearch,
  isRecycle: state.kc.isRecycle,
  isReadOnly: state.kc.isReadOnly,
  selectedItems: state.kc.selectedItems,
});

const mapDispatchToProps = dispatch => ({
  updateKcListElement: bindActionCreators(kcActions.updateKcListElement, dispatch),
  changeFolder: bindActionCreators(kcActions.changeFolder, dispatch),
  changeSortBy: bindActionCreators(kcActions.changeSortBy, dispatch),
  searchNodes: bindActionCreators(kcActions.searchNodes, dispatch),
  startGlobalSearch: bindActionCreators(kcActions.startGlobalSearch, dispatch),
  loadMoreKcNodes: bindActionCreators(kcActions.loadMoreKcNodes, dispatch),
  triggerLoadMoreNodes: bindActionCreators(kcActions.triggerLoadMoreNodes, dispatch),
  openUploadAssistant: bindActionCreators(kcActions.openUploadAssistant, dispatch),
  addLinkFile: bindActionCreators(kcActions.addLinkFile, dispatch),
  addNewFolder: bindActionCreators(kcActions.addNewFolder, dispatch),
  updateNodeItem: bindActionCreators(kcActions.updateNodeItem, dispatch),
  updateKcBaseUrl: bindActionCreators(kcActions.updateKcBaseUrl, dispatch),
  removeNodeItem: bindActionCreators(kcActions.removeNodeItem, dispatch),
  removeNode: bindActionCreators(kcActions.removeNode, dispatch),
  shareNode: bindActionCreators(kcActions.shareNode, dispatch),
  starNode: bindActionCreators(kcActions.starNode, dispatch),
  restoreNode: bindActionCreators(kcActions.restoreNode, dispatch),
  moveOrCopyClick: bindActionCreators(kcActions.moveOrCopyClick, dispatch),
  selectItem: bindActionCreators(selectActions.selectItem, dispatch),
  selectItems: bindActionCreators(selectActions.selectItems, dispatch),
  selectAllItems: bindActionCreators(selectActions.selectAllItems, dispatch),
  selectSingleItem: bindActionCreators(selectActions.selectSingleItem, dispatch),
  reloadList: bindActionCreators(kcActions.reloadList, dispatch),
  loadListById: bindActionCreators(kcActions.loadListById, dispatch),
  batchDownload: bindActionCreators(kcActions.batchDownload, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(KcMain);
