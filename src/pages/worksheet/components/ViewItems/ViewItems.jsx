import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Drawer } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Dialog, Icon, Input, SortableList, Tooltip } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import { getDefaultViewSet } from 'worksheet/constants/common';
import { VIEW_DISPLAY_TYPE, VIEW_TYPE_ICON } from 'worksheet/constants/enum';
import { getShowViews } from 'src/pages/worksheet/views/util';
import { navigateTo } from 'src/router/navigateTo';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import AddViewDisplayMenu from './AddViewDisplayMenu';
import HideItem from './HideItem';
import Item from './Item';
import 'rc-trigger/assets/index.css';
import './ViewItems.less';

const EmptyData = styled.div`
  font-size: 12px;
  color: #9e9e9e;
  text-align: center;
  margin-top: 120px;
`;

const confirm = Dialog.confirm;

@withRouter
export default class ViewItems extends Component {
  static defaultProps = {
    viewList: [],
  };
  constructor(props) {
    super(props);
    this.state = {
      directionVisible: false,
      hideDirection: 'left',
      addMenuVisible: false,
      setWorksheetHidden: false,
      searchWorksheetListValue: undefined,
      sideMenuVisible: false,
      hasClickDrawe: false,
      hasRecycle: getFeatureStatus(_.get(props, 'worksheetInfo.projectId'), VersionProductType.recycle) === '1',
      expandRecycle: false,
      recycleData: [],
    };
    this.searchRef = React.createRef();
    this.containerWrapper = document.getElementById('wrapper');
    this.containerWrapper.addEventListener('click', this.clickDrawerArea);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.sheetInfoLoading && !this.props.sheetInfoLoading) {
      this.flag = null;
      this.setState({
        directionVisible: false,
      });
    }
    if (nextProps.viewList.length !== this.props.viewList.length) {
      this.flag = null;
    }
    if (nextProps.viewList.length > this.props.viewList.length) {
      this.computeViewItemActiveLeft(500);
    }

    if (nextProps.currentViewId !== this.props.currentViewId) {
      const elem = $(`.workSheetViewsWrapper .viewsScroll .workSheetViewItemViewId-${nextProps.currentViewId}`);

      if (elem[0]) {
        setTimeout(() => {
          elem[0].scrollIntoView();
        }, 500);
      }
    }

    this.computeDirectionVisible();
  }
  componentDidUpdate() {
    if (!this.flag) {
      this.computeDirectionVisible();
    }
  }
  componentDidMount() {
    this.computeViewItemActiveLeft();
  }
  componentWillUnmount() {
    this.containerWrapper.removeEventListener('click', this.clickDrawerArea);
  }
  clickDrawerArea = e => {
    const { setWorksheetHidden } = this.state;
    this.setState({
      hasClickDrawe: false,
    });
    if (!setWorksheetHidden) return;
    let rect = document.querySelector('.drawerWorksheetHidden', 1).getBoundingClientRect();
    if (rect.right > e.clientX && e.clientX > rect.left && rect.bottom > e.clientY && e.clientY > rect.top) {
      return;
    } else {
      this.setState({
        setWorksheetHidden: false,
        hasClickDrawe: true,
      });
    }
  };
  getWorksheetViews(worksheetId, status) {
    const { appId } = this.props;
    sheetAjax
      .getWorksheetViews({
        appId,
        worksheetId,
        status,
      })
      .then(res => {
        if (status === 9) {
          this.setState({ recycleData: (res || []).sort((a, b) => (a.deleteTime > b.deleteTime ? -1 : 1)) });
        } else {
          this.props.updateViewList(res, res[0]);
          this.computeDirectionVisible();
        }
      })
      .catch(() => {
        alert(_l('获取视图列表失败'), 2);
      });
  }
  handleAddView = (data, callback) => {
    const { id = 'sheet', name, isManageView = false } = data;
    const { worksheetId, viewList, appId, worksheetControls, worksheetInfo } = this.props;
    const titleControl = _.get(
      _.find(worksheetControls, item => item.attribute === 1),
      'controlId',
    );
    const defaultDisplayControls = worksheetControls
      .filter(item => item.controlId !== titleControl && !_.includes([22, 43, 10010, 45, 51], item.type)) //卡片上不显示的类型
      .map(item => item.controlId);
    const coverId = _.get(
      _.find(worksheetControls, item => item.type === 14),
      'controlId',
    );
    const coverCid =
      id === 'gallery'
        ? _.get(worksheetInfo, ['advancedSetting', 'coverid']) || //默认取表单设置里的封面
          coverId
        : coverId;
    const viewType = VIEW_DISPLAY_TYPE[id];
    const view = _.find(VIEW_TYPE_ICON, { id }) || {};
    const viewTypeCount = viewList.filter(n => n.viewType == viewType).length;
    let params = {
      viewId: isManageView ? worksheetId : '',
      appId,
      viewType,
      displayControls: _.slice(defaultDisplayControls, 0, 2),
      coverCid,
      name: isManageView
        ? name
        : viewList.length
          ? `${name || view.text}${viewTypeCount ? viewTypeCount : ''}`
          : _l('视图'),
      sortType: 0,
      coverType: 0,
      worksheetId,
      controls: [],
      filters: [],
      sortCid: '',
      showControlName: true, // 新创建的表格默认 显示字段名称
    };
    if (id === 'customize') {
      // pluginSource 插件来源 0:开发 1:已发布
      const { pluginId, pluginName, pluginIcon, pluginIconColor, pluginSource, isNew } = data;
      const viewCustomViewCount = viewList.filter(
        n => (pluginId && _.get(n, 'pluginInfo.id') == pluginId) || n.name.indexOf(pluginName) >= 0,
      ).length;
      const newName = `${pluginName}${viewCustomViewCount > 0 ? viewCustomViewCount : ''}`; //插件视图的视图名称默认用插件名称
      params = {
        ...params,
        pluginId,
        pluginName: isNew ? newName : pluginName,
        pluginIcon,
        pluginIconColor,
        pluginSource,
        projectId: _.get(this.props, 'worksheetInfo.projectId'),
        name: newName,
      };
    }

    params = getDefaultViewSet(params);
    sheetAjax
      .saveWorksheetView(Object.assign({}, params))
      .then(result => {
        const newViewList = viewList.concat(result);
        this.props.onAddView(newViewList, result);
        this.handleScrollPosition(0);
        callback && callback(result);
      })
      .catch(() => {
        alert(_l('新建视图失败'), 2);
      });
  };
  handleRemoveView = view => {
    const { viewList, appId, worksheetId } = this.props;
    const showVies = getShowViews(viewList);
    if (showVies.filter(o => ![21].includes(o.viewType)).length === 1 && ![21].includes(view.viewType)) {
      alert(_l('必须保留一个默认视图'), 3);
      return;
    }
    confirm({
      title: <span className="Red">{_l('确定删除此视图吗？')}</span>,
      okText: _l('删除'),
      buttonType: 'danger',
      onOk: () => {
        sheetAjax
          .deleteWorksheetView({
            appId,
            viewId: view.viewId,
            worksheetId,
            status: 9,
          })
          .then(() => {
            this.props.onRemoveView(
              showVies.filter(item => item.viewId !== view.viewId),
              view.viewId,
            );
            this.handleScrollPosition(0);
            this.getWorksheetViews(worksheetId, 9);
          })
          .catch(() => {
            alert(_l('删除视图失败'), 2);
          });
      },
    });
  };
  handleOpenView = view => {
    this.props.onViewConfigVisible(view);
  };
  handleCopyView = view => {
    const { viewList, appId, worksheetId } = this.props;
    window.clearLocalDataTime({ requestData: { worksheetId }, clearSpecificKey: 'Worksheet_GetWorksheetInfo' });
    sheetAjax
      .copyWorksheetView({
        appId,
        viewId: view.viewId,
      })
      .then(result => {
        const list = viewList.slice();
        const newIndex = _.findIndex(list, { viewId: view.viewId });
        list.splice(newIndex + 1, 0, result);
        this.handleSortViews(list);
        this.props.onAddView(list, result);
      })
      .catch(() => {
        alert(_l('复制视图失败'), 2);
      });
  };
  handleSortViews = views => {
    const { appId, worksheetId } = this.props;
    sheetAjax.sortWorksheetViews({
      appId,
      worksheetId,
      viewIds: views.map(view => view.viewId),
    });
  };
  computeDirectionVisible() {
    if (!this.scrollWraperEl) return;
    const viewsScrollEl = this.scrollWraperEl.querySelector('.viewsScroll');
    if (viewsScrollEl) {
      const { offsetWidth, scrollWidth } = viewsScrollEl;
      this.flag = true;
      this.setState({
        directionVisible: offsetWidth < scrollWidth,
      });
    }
  }
  computeViewItemActiveLeft(delay = 300) {
    if (!this.scrollWraperEl) return;
    const viewsScrollEl = this.scrollWraperEl.querySelector('.viewsScroll');
    if (viewsScrollEl) {
      setTimeout(() => {
        const activeEl = viewsScrollEl.querySelector('.workSheetViewItem.active');
        if (activeEl) {
          if (activeEl.offsetLeft + activeEl.clientWidth > viewsScrollEl.clientWidth) {
            viewsScrollEl.scrollLeft = activeEl.offsetLeft;
          }
        }
      }, delay);
    }
  }
  handleScrollPosition = (direction = 0) => {
    if (!this.scrollWraperEl) return;
    const { clientWidth } = this.scrollWraperEl;
    const distance = direction ? clientWidth / 2 : -(clientWidth / 2);
    const viewsScrollEl = this.scrollWraperEl.querySelector('.viewsScroll');
    const { scrollLeft } = viewsScrollEl;
    viewsScrollEl.scrollLeft = scrollLeft + distance;
  };
  updateScrollBtnState = () => {
    const { hideDirection } = this.state;
    const viewsScrollEl = this.scrollWraperEl.querySelector('.viewsScroll');
    const { scrollWidth, scrollLeft, offsetWidth } = viewsScrollEl;
    const width = scrollLeft + offsetWidth;
    if (!scrollLeft && hideDirection !== 'left') {
      this.setState({
        hideDirection: 'left',
      });
      return;
    }
    if (width === scrollWidth && hideDirection !== 'right') {
      this.setState({
        hideDirection: 'right',
      });
      return;
    }
    if (scrollLeft && width < scrollWidth && hideDirection !== null) {
      this.setState({
        hideDirection: null,
      });
    }
  };

  getFilterManageViews = viewList => viewList.filter(l => l.viewId !== this.props.worksheetId);

  handleSortEnd = (newViewList, type) => {
    const { viewList, worksheetId, appId } = this.props;
    const list = this.getFilterManageViews(viewList);
    const otherSortList = _.differenceBy(list, newViewList, 'viewId');
    const newSortList = type ? newViewList.concat(otherSortList) : otherSortList.concat(newViewList);

    this.props.updateViewList(newSortList);
    sheetAjax
      .sortWorksheetViews({
        appId,
        worksheetId,
        viewIds: newSortList.map(l => l.viewId),
      })
      .then(() => {})
      .catch(() => {
        alert(_l('退拽排序视图失败'), 2);
      });
  };

  updateViewName = view => {
    this.props.updateCurrentView(
      {
        appId: this.props.appId,
        ...view,
        name: view.name,
        editAttrs: ['name'],
      },
      false,
    );
  };
  handleAdd = data => {
    this.handleAddView(data);
    this.setState({ addMenuVisible: false });
  };
  updateAdvancedSetting = data => {
    this.props.updateCurrentView(
      {
        appId: this.props.appId,
        ...data,
      },
      false,
    );
  };

  handleAutoFocus = () => {
    setTimeout(() => {
      this.searchRef.current.focus();
    }, 0);
  };

  loadManageView = callback => {
    const { worksheetId, loadManageView } = this.props;

    if (this.getManageView()) return;

    loadManageView(worksheetId, callback);
  };

  changeWorksheetHidden = () => {
    const { setWorksheetHidden, hasClickDrawe } = this.state;
    if (hasClickDrawe && !setWorksheetHidden) {
      return;
    }
    this.setState({
      setWorksheetHidden: true,
      hasClickDrawe: false,
    });
    this.handleAutoFocus();
    this.getWorksheetViews(this.props.worksheetId, 9);
  };

  handleExpandRecycle = () => this.setState({ expandRecycle: !this.state.expandRecycle });

  restoreWorksheetView = viewId => {
    const { recycleData } = this.state;
    const { worksheetId, appId } = this.props;

    sheetAjax
      .restoreWorksheetView({
        viewId,
        appId,
        worksheetId,
      })
      .then(res => {
        if (res) {
          this.getWorksheetViews(worksheetId);
          this.setState({ recycleData: recycleData.filter(l => l.viewId !== viewId) });
        } else {
          alert(_l('恢复视图失败'), 2);
        }
      });
  };

  hasSearchWords = name => _.toLower(name).includes(_.toLower(_.trim(this.state.searchWorksheetListValue)));

  renderSortList = (type, items) => {
    const { searchWorksheetListValue } = this.state;
    const {
      viewList,
      currentViewId,
      isCharge,
      worksheetControls,
      sheetSwitchPermit,
      getNavigateUrl,
      isLock,
      appId,
      changeViewDisplayType,
    } = this.props;
    const isNavSort = type === 'sortNav';

    const ItemComp = isNavSort ? Item : HideItem;
    const param = isNavSort
      ? {
          list: viewList,
          changeViewDisplayType,
          currentView: _.find(viewList, { viewId: currentViewId }) || {},
          getNavigateUrl,
          onSortEnd: this.handleSortEnd,
        }
      : {
          viewList,
          type,
          disabled: !isCharge,
        };
    const content = (
      <SortableList
        canDrag
        renderBody={!isNavSort}
        items={
          ['drawerWorksheetHiddenList', 'sortNav'].includes(type)
            ? items
            : items.filter(l => !searchWorksheetListValue || this.hasSearchWords(l.name))
        }
        itemKey="viewId"
        onSortEnd={newList => this.handleSortEnd(newList, type === 'drawerWorksheetShowList')}
        renderItem={options => (
          <ItemComp
            {...options}
            {...param}
            {..._.pick(this.props, ['onShare', 'onExport', 'onCopyConfig', 'onExportAttachment'])}
            isCharge={isCharge}
            isLock={isLock}
            currentViewId={currentViewId}
            appId={appId}
            style={{ zIndex: 999999 }}
            controls={worksheetControls}
            sheetSwitchPermit={sheetSwitchPermit}
            projectId={_.get(this.props, 'worksheetInfo.projectId')}
            onCopyView={this.handleCopyView}
            updateAdvancedSetting={this.updateAdvancedSetting}
            onRemoveView={this.handleRemoveView}
            updateViewName={this.updateViewName}
            onOpenView={this.handleOpenView}
            toView={() => navigateTo(getNavigateUrl(options.item))}
          />
        )}
      />
    );

    return isNavSort ? (
      <div className="viewsScroll" onScroll={this.updateScrollBtnState}>
        <div className="stance" />
        {this.renderCurrentView()}
        {content}
        <div className="stance" />
      </div>
    ) : (
      <ul className={type}>{content}</ul>
    );
  };

  renderRecycle = () => {
    const { hasRecycle, expandRecycle, recycleData, searchWorksheetListValue } = this.state;
    const { appId } = this.props;
    const data = recycleData.filter(l => !searchWorksheetListValue || this.hasSearchWords(l.name));

    if (!hasRecycle || !data.length) return null;

    return (
      <Fragment>
        <div className="drawerWorksheetRecycleListTitle Gray_9e valignWrapper" onClick={this.handleExpandRecycle}>
          <span className="flex valignWrapper">
            {_l('最近删除')}
            <Tooltip text={_l('视图60天后将被自动删除')}>
              <Icon icon="info" className="Gray_9e Font14 mLeft8" />
            </Tooltip>
          </span>
          <Icon icon={expandRecycle ? 'arrow-down' : 'arrow-right-tip'} className="mRight12" />
        </div>
        {expandRecycle && (
          <ul className="drawerWorksheetRecycleList">
            {data.map(l => {
              return (
                <HideItem
                  item={l}
                  appId={appId}
                  style={{ zIndex: 999999 }}
                  projectId={_.get(this.props, 'worksheetInfo.projectId')}
                  type="recycle"
                  onRecycle={this.restoreWorksheetView}
                />
              );
            })}
          </ul>
        )}
      </Fragment>
    );
  };

  getManageView = () => _.find(this.props.viewList, l => l.viewId === this.props.worksheetId);

  toManageView = (manageView, isToView) => {
    const { getNavigateUrl } = this.props;

    navigateTo(getNavigateUrl(manageView));
    !isToView && this.handleOpenView(manageView);
  };

  handleManageItem = (e, type) => {
    e.stopPropagation();
    const manageView = this.getManageView();
    const isToView = type === 'toView';

    if (!manageView) {
      this.loadManageView(result => this.toManageView(result, isToView));

      return;
    }

    this.toManageView(manageView, isToView);
  };

  renderManageViewItem = () => {
    const { worksheetInfo = {}, isLock, currentViewId } = this.props;
    const isAdmin = worksheetInfo.roleType === 2;

    if (!isAdmin) return null;

    return (
      <Tooltip
        text={_l(
          '数据管理视图中的记录不受字段属性和业务规则的隐藏、只读、验证影响，始终可查看、编辑所有数据。（仅应用管理员可访问此视图）',
        )}
        autoCloseDelay={0}
        popupPlacement={'right'}
      >
        <div
          className={cx('manageViewItem Hand valignWrapper mBottom6', {
            active: currentViewId === worksheetInfo.worksheetId,
          })}
          onClick={e => this.handleManageItem(e, 'toView')}
        >
          <span className="mLeft14 ellipsis Font13 ">{_l('数据管理')}</span>
          {!isLock && (
            <Icon
              icon="settings"
              className="Gray_75 Hover_21 hoverGray manageSettingIcon"
              onClick={this.handleManageItem}
            />
          )}
        </div>
      </Tooltip>
    );
  };

  renderCurrentView = () => {
    const {
      viewList,
      currentViewId,
      isCharge,
      worksheetControls,
      sheetSwitchPermit,
      getNavigateUrl,
      isLock,
      appId,
      changeViewDisplayType,
      worksheetId,
    } = this.props;

    const currentView = _.find(viewList, { viewId: currentViewId });

    if (
      ((!_.get(currentView, 'advancedSetting.showhide') ||
        _.get(currentView, 'advancedSetting.showhide').search(/hide|hpc/g) === -1) &&
        currentViewId !== worksheetId) ||
      !isCharge
    )
      return null;

    return (
      !!currentView && (
        <Item
          {..._.pick(this.props, ['onShare', 'onExport', 'onCopyConfig', 'onExportAttachment'])}
          fixed={true}
          item={currentView}
          list={viewList}
          changeViewDisplayType={changeViewDisplayType}
          currentView={currentView}
          getNavigateUrl={getNavigateUrl}
          isCharge={isCharge}
          isLock={isLock}
          currentViewId={currentViewId}
          appId={appId}
          style={{ zIndex: 999999 }}
          controls={worksheetControls}
          sheetSwitchPermit={sheetSwitchPermit}
          projectId={_.get(this.props, 'worksheetInfo.projectId')}
          onCopyView={this.handleCopyView}
          updateAdvancedSetting={this.updateAdvancedSetting}
          onRemoveView={this.handleRemoveView}
          updateViewName={this.updateViewName}
          onOpenView={this.handleOpenView}
        />
      )
    );
  };

  render() {
    const {
      directionVisible,
      hideDirection,
      addMenuVisible,
      setWorksheetHidden,
      searchWorksheetListValue,
      recycleData = [],
    } = this.state;
    const { viewList, currentViewId, isCharge, isLock } = this.props;
    const showViewList = this.getFilterManageViews(viewList);
    const isEmpty =
      searchWorksheetListValue &&
      !recycleData.find(l => this.hasSearchWords(l.name)) &&
      _.isEmpty(
        showViewList.filter(
          l =>
            (isCharge || (_.get(l, 'advancedSetting.showhide') || '').search(/hide|hpc/g) < 0) &&
            this.hasSearchWords(l.name),
        ),
      );
    const currentViewHideValue = _.get(
      showViewList.find(l => l.viewId === currentViewId) || {},
      'advancedSetting.showhide',
    );
    const hideList = showViewList.filter(
      l =>
        _.get(l, 'advancedSetting.showhide') === 'hide' && (!searchWorksheetListValue || this.hasSearchWords(l.name)),
    );

    return (
      <div className="valignWrapper flex">
        <div>
          <Tooltip popupPlacement="bottom" text={<span>{_l('全部视图%05005')}</span>}>
            <Icon
              icon="menu-02"
              className={cx('Font14 mLeft10 pointer Gray_75 allVieListwIcon hoverGray', {
                menuVisible: setWorksheetHidden,
                currentIsHide: currentViewHideValue && currentViewHideValue.search(/hpc|hide/g) > -1,
              })}
              onClick={e => this.changeWorksheetHidden(e)}
            />
          </Tooltip>
          <Drawer
            title=""
            width={280}
            className="drawerWorksheetHidden"
            placement="left"
            mask={false}
            closable={false}
            getContainer={() => document.querySelector('#worksheetRightContentBox')}
            style={{ position: 'absolute' }}
            onClose={() => this.setState({ setWorksheetHidden: false })}
            visible={setWorksheetHidden}
          >
            <div className="searchBox">
              <i className="icon icon-search Gray_9e Font20"></i>
              <Input
                value={searchWorksheetListValue}
                onChange={value => this.setState({ searchWorksheetListValue: value })}
                placeholder={_l(
                  '%0个视图',
                  showViewList.filter(
                    l => isCharge || (_.get(l, 'advancedSetting.showhide') || '').search(/hide|hpc/g) < 0,
                  ).length,
                )}
                type="text"
                className="drawerWorksheetHiddenSearch flex"
                manualRef={this.searchRef}
              />
              {!!searchWorksheetListValue && (
                <Icon
                  icon="cancel"
                  className="Font16 Hand Gray_9e mRight10"
                  onClick={() => {
                    this.setState({ searchWorksheetListValue: '' });
                  }}
                />
              )}
            </div>
            {this.renderManageViewItem()}
            {isEmpty ? (
              <EmptyData>{_l('没有搜索到相关视图')}</EmptyData>
            ) : (
              <Fragment>
                {this.renderSortList(
                  'drawerWorksheetShowList',
                  showViewList.filter(
                    l =>
                      _.get(l, 'advancedSetting.showhide') !== 'hide' &&
                      (isCharge || !(_.get(l, 'advancedSetting.showhide') || '').includes('hpc')),
                  ),
                )}
                {isCharge && !!hideList.length && (
                  <div className="drawerWorksheetHiddenListTitle Gray_9e">{_l('隐藏的视图')}</div>
                )}
                {isCharge && this.renderSortList('drawerWorksheetHiddenList', hideList)}
                {isCharge && this.renderRecycle()}
              </Fragment>
            )}
          </Drawer>
        </div>
        {isCharge && !isLock && (
          <Trigger
            action={['click']}
            popupAlign={{ points: ['tl', 'bl'], offset: [-6, 4] }}
            popupVisible={addMenuVisible}
            onPopupVisibleChange={visible => this.setState({ addMenuVisible: visible })}
            popup={
              <AddViewDisplayMenu
                canAddCustomView
                projectId={_.get(this.props, 'worksheetInfo.projectId')}
                onClick={this.handleAdd}
                popupVisible={addMenuVisible}
                appId={this.props.appId}
              />
            }
          >
            <Tooltip popupPlacement="bottom" text={<span>{_l('添加视图')}</span>}>
              <Icon
                icon="add"
                className={cx('Font20 Gray_75 pointer addViewIcon mLeft8 hoverGray', { menuVisible: addMenuVisible })}
              />
            </Tooltip>
          </Trigger>
        )}
        <div
          className="valignWrapper flex workSheetViewsWrapper"
          ref={scrollWraperEl => {
            this.scrollWraperEl = scrollWraperEl;
          }}
        >
          {this.renderSortList('sortNav', showViewList)}
        </div>
        {directionVisible ? (
          <div className="Width95">
            <Icon
              icon="arrow-left-tip"
              className={cx('Gray_9e pointer Font15', { Alpha3: hideDirection === 'left' })}
              onClick={() => this.handleScrollPosition(0)}
            />
            <Icon
              icon="arrow-right-tip"
              className={cx('Gray_9e pointer Font15', { Alpha3: hideDirection === 'right' })}
              onClick={() => this.handleScrollPosition(1)}
            />
          </div>
        ) : null}
      </div>
    );
  }
}
