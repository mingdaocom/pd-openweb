import React, { Component } from 'react';
import cx from 'classnames';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import { Menu, Tooltip, Icon, Dialog, MenuItem } from 'ming-ui';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import sheetAjax from 'src/api/worksheet';
import { VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
import { getDefaultViewSet } from 'worksheet/constants/common';
import ViewDisplayMenu from './viewDisplayMenu';
import './ViewItems.less';
import Item from './Item';
import { formatValuesOfOriginConditions } from 'src/pages/worksheet/common/WorkSheetFilter/util';

const confirm = Dialog.confirm;

const SortableItem = SortableElement(({ ...props }) => {
  return <Item {...props} />;
});

const SortableList = SortableContainer(({ list, onScroll, ...other }) => {
  return (
    <div className="viewsScroll" onScroll={onScroll}>
      <div className="stance" />
      {list.map((item, index) => (
        <SortableItem key={index} index={index} item={item} {...other} />
      ))}
      <div className="stance" />
    </div>
  );
});

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
    };
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
    this.computeDirectionVisible();
  }
  componentDidUpdate() {
    if (!this.flag) {
      this.computeDirectionVisible();
    }
  }
  getWorksheetViews(worksheetId) {
    const { appId } = this.props;
    sheetAjax
      .getWorksheetViews({
        appId,
        worksheetId,
      })
      .then(res => {
        this.props.updateViewList(res, res[0]);
        this.computeDirectionVisible();
      })
      .fail(err => {
        alert(_l('获取视图列表失败'));
      });
  }
  handleAddView = (viewType = 'sheet') => {
    const { worksheetId, viewList, appId, worksheetControls } = this.props;
    const titleControl = _.get(
      _.find(worksheetControls, item => item.attribute === 1),
      'controlId',
    );
    const defaultDisplayControls = worksheetControls
      .filter(item => item.controlId !== titleControl && !_.includes([22, 10010], item.type))
      .map(item => item.controlId);
    const coverCid = _.get(
      _.find(worksheetControls, item => item.type === 14),
      'controlId',
    );
    let params = {
      viewId: '',
      appId,
      viewType: VIEW_DISPLAY_TYPE[viewType],
      displayControls: _.slice(defaultDisplayControls, 0, 2),
      // showControls: worksheetControls
      //   .filter(
      //     item =>
      //       !_.includes(['ownerid', 'caid', 'ctime', 'utime'], item.controlId) && !_.includes([22, 10010], item.type),
      //   )
      //   .map(item => item.controlId),
      coverCid,
      name: viewList.length ? _l('视图%0', viewList.length) : _l('视图'),
      sortType: 0,
      coverType: 0,
      worksheetId,
      controls: [],
      filters: [],
      sortCid: '',
      showControlName: true, // 新创建的表格默认 显示字段名称
    };
    params = getDefaultViewSet(params);
    sheetAjax
      .saveWorksheetView(Object.assign({}, params))
      .then(result => {
        params.viewId = result.viewId;
        params.isNewView = true;
        const newViewList = viewList.concat(params);
        this.props.onAddView(newViewList, params);
        this.handleScrollPosition(0);
      })
      .fail(err => {
        alert(_l('新建视图失败'));
      });
  };
  handleRemoveView = view => {
    const { viewList, appId, worksheetId } = this.props;
    if (viewList.length === 1) {
      alert(_l('必须保留一个视图'));
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
          })
          .then(result => {
            this.props.onRemoveView(
              viewList.filter(item => item.viewId !== view.viewId),
              view.viewId,
            );
            this.handleScrollPosition(0);
          })
          .fail(err => {
            alert(_l('删除视图失败'));
          });
      },
    });
  };
  handleOpenView = view => {
    this.props.onViewConfigVisible(view);
  };
  handleCopyView = view => {
    const { viewList, appId } = this.props;
    sheetAjax
      .copyWorksheetView({
        appId,
        viewId: view.viewId,
      })
      .then(result => {
        const newViewList = viewList.concat(result);
        this.props.onAddView(newViewList, result);
      })
      .fail(err => {
        alert(_l('复制视图失败'));
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
  handleSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) return;
    const { viewList, worksheetId, appId } = this.props;
    const newViewList = arrayMove(viewList, oldIndex, newIndex);
    this.props.updateViewList(newViewList);
    sheetAjax
      .sortWorksheetViews({
        appId,
        worksheetId,
        viewIds: newViewList.map(item => item.viewId),
      })
      .then(result => {})
      .fail(err => {
        alert(_l('退拽排序视图失败'));
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
  renderMore() {
    const { currentViewId, viewList } = this.props;
    return (
      <Menu className={cx('workSheetViewsMenu', { hide: !viewList.length })}>
        {viewList.map((item, index) => (
          <MenuItem
            className={cx({ active: currentViewId === item.viewId })}
            onClick={() => {
              this.props.onSelectView(item);
            }}
            key={index}
          >
            <span className="text">{item.name}</span>
          </MenuItem>
        ))}
      </Menu>
    );
  }
  handleAdd = id => {
    this.handleAddView(id);
    this.setState({ addMenuVisible: false });
  };
  render() {
    const { directionVisible, hideDirection, addMenuVisible } = this.state;
    const { viewList, currentViewId, isCharge, changeViewDisplayType, sheetSwitchPermit } = this.props;
    return (
      <div className="valignWrapper flex">
        {isCharge ? (
          <Trigger
            popupAlign={{ points: ['tl', 'bl'], offset: [-10, 8] }}
            popupVisible={addMenuVisible}
            popup={
              <ViewDisplayMenu onClickAway={() => this.setState({ addMenuVisible: false })} onClick={this.handleAdd} />
            }
          >
            <Tooltip popupPlacement="bottom" text={<span>{_l('添加视图')}</span>}>
              <Icon
                icon="add"
                className="Font20 Gray_9d mLeft10 pointer addViewIcon"
                onClick={() => this.setState(({ addMenuVisible }) => ({ addMenuVisible: !addMenuVisible }))}
              />
            </Tooltip>
          </Trigger>
        ) : null}
        <div
          className="valignWrapper flex workSheetViewsWrapper"
          ref={scrollWraperEl => {
            this.scrollWraperEl = scrollWraperEl;
          }}
        >
          <SortableList
            axis="x"
            lockAxis={'x'}
            disabled={!isCharge}
            helperClass="workSheetSortableViewItem"
            distance={5}
            list={viewList}
            currentViewId={currentViewId}
            currentView={_.find(viewList, { viewId: currentViewId }) || _.object()}
            changeViewDisplayType={changeViewDisplayType}
            onSortEnd={this.handleSortEnd}
            onRemoveView={this.handleRemoveView}
            onOpenView={this.handleOpenView}
            onSelectView={this.props.onSelectView}
            onCopyView={this.handleCopyView}
            onShare={this.props.onShare}
            onExport={this.props.onExport}
            onScroll={this.updateScrollBtnState}
            updateViewName={this.updateViewName}
            isCharge={isCharge}
            sheetSwitchPermit={sheetSwitchPermit}
          />
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
