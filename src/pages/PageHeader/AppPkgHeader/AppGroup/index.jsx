import React, { Component, Fragment } from 'react';
import { oneOf, func } from 'prop-types';
import { arrayMove } from 'react-sortable-hoc';
import { connect } from 'react-redux';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import api from 'api/homeApp';
import { isHaveCharge } from 'src/pages/worksheet/redux/actions/util';
import AppExtension from '../AppExtension';
import SortableAppList from './SortableAppList';
import AppGroupIntro from './AppGroupIntro';
import DelAppGroup from './DelAppGroup';
import { navigateTo } from '../../../../router/navigateTo';
import { getIds, compareProps } from '../../util';
import { DEFAULT_CREATE, ADVANCE_AUTHORITY } from '../config';
import { updateAppGroup } from '../../redux/action';
import './index.less';

const mapStateToProps = () => ({});
const mapDispatchToProps = dispatch => ({
  updateAppGroup: appGroups => dispatch(updateAppGroup(appGroups)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class extends Component {
  static propTypes = {
    permissionType: oneOf([0, 50, 100, 200, 300]),
    appStatus: oneOf([0, 1, 2, 3, 4, 5]),
    updateAppGroup: func,
  };
  static defaultProps = {
    updateAppGroup: _.noop,
  };
  constructor(props) {
    super(props);
    this.ids = getIds(props);
    this.state = {
      appRoleType: null,
      data: [],
      delAppItemVisible: false,
      appItemIntroVisible: false,
      disabledPointer: 'left',
      // 分组是否溢出容器
      isAppItemOverflow: false,
      activeAppItemId: null,
      // 当前聚焦分组Id
      focusGroupId: '',
    };
  }

  componentDidMount() {
    this.getData();
    this.removeEventBind = this.bindEvent();
  }

  componentWillReceiveProps(nextProps) {
    this.ids = getIds(nextProps);
    if (compareProps(nextProps.match.params, this.props.match.params, ['appId'])) {
      this.getData();
    }
  }

  componentWillUnmount() {
    this.removeEventBind && this.removeEventBind();
  }
  // 当前处理的分组id
  handledAppItemId = '';

  getData = () => {
    const { appId } = this.ids;
    if (!appId) return;
    api.getAppInfo({ appId }).then(({ appRoleType, isLock, appSectionDetail: data = [] }) => {
      this.props.updateAppGroup(data);
      window[`app_${appId}_is_charge`] = isHaveCharge(appRoleType, isLock);
      this.setState({ appRoleType, data }, () => {
        setTimeout(() => {
          this.ensurePointerVisible();
        }, 0);
      });
    });
  };

  // 函数节流
  throttleFunc = fn => _.throttle(fn);

  // 绑定事件
  bindEvent = () => {
    const throttledEnsurePointerVisible = this.throttleFunc(this.ensurePointerVisible);
    window.addEventListener('resize', throttledEnsurePointerVisible);
    document.addEventListener('readystatechange', this.ensurePointerVisibleWhenLoaded);
    return () => {
      window.removeEventListener('resize', throttledEnsurePointerVisible);
      document.removeEventListener('readystatechange', this.ensurePointerVisibleWhenLoaded);
    };
  };

  // 当资源加载完再计算滚动指示器的状态,防止取到的位置是css加载之前的
  ensurePointerVisibleWhenLoaded = () => {
    if (document.readyState === 'complete') {
      this.ensurePointerVisible();
    }
  };

  switchVisible = (obj, cb) => {
    this.setState(obj, cb);
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    const { data } = this.state;
    if (oldIndex === newIndex) return;
    this.setState(
      {
        data: arrayMove(data, oldIndex, newIndex),
      },
      () => {
        this.props.updateAppGroup(this.state.data);
        this.updateAppGroupSort();
      },
    );
  };

  // 更新应用分组排序
  updateAppGroupSort = () => {
    const { appId } = this.ids;
    const { data } = this.state;
    const sortedAppGroupIds = data.map(({ appSectionId }) => appSectionId);
    api.updateAppSectionSort({ appId, appSectionIds: sortedAppGroupIds }).then(res => {
      if (res) {
        this.updateAppGroup(data);
      }
    });
  };

  // 确认滚动指示器状态
  ensurePointerStatus = () => {
    const $ele = document.querySelector('.appItemsInnerWrap');
    if (!$ele) return;
    const { disabledPointer } = this.state;
    const { offsetWidth, scrollLeft, scrollWidth } = $ele;
    const actualWidth = scrollLeft + offsetWidth;
    if (!scrollLeft && disabledPointer !== 'left') {
      this.setState({ disabledPointer: 'left' });
      return;
    }
    if (actualWidth === scrollWidth && disabledPointer !== 'right') {
      this.setState({ disabledPointer: 'right' });
      return;
    }
    if (scrollLeft && actualWidth < scrollWidth && disabledPointer !== null) {
      this.setState({ disabledPointer: null });
    }
  };

  // 确认滚动指示器是否显示
  ensurePointerVisible = () => {
    const $ele = document.querySelector('.appItemsInnerWrap');
    if (!$ele) {
      this.setState({ isAppItemOverflow: false });
      return;
    }
    const { offsetWidth, scrollWidth } = $ele;
    this.setState({ isAppItemOverflow: offsetWidth < scrollWidth });
  };

  scrollEle = ($ele, distance) => {
    if (!$ele) return;
    $ele.scrollLeft = distance;
  };

  // 滚动指示器点击
  handlePointerClick = e => {
    const $ele = e.target;
    const $wrap = document.querySelector('.appItemsInnerWrap');
    const { offsetWidth, scrollLeft } = $wrap || {};
    const isLeftClicked = $ele.classList.contains('leftPointer');
    const isRightClicked = $ele.classList.contains('rightPointer');
    const scrollDistance = Math.floor(offsetWidth / 2);
    if (isLeftClicked) {
      this.scrollEle($wrap, Math.max(0, scrollLeft - scrollDistance));
    }
    if (isRightClicked) {
      this.scrollEle($wrap, scrollLeft + scrollDistance);
    }
    this.ensurePointerStatus();
  };

  // 分组配置点击
  handleAppItemConfigClick = ({ id, type, appSectionId }) => {
    const { data } = this.state;
    const { appId } = this.ids;
    this.handledAppItemId = appSectionId;
    switch (id) {
      case 'rename':
        this.setState({ focusGroupId: appSectionId });
        return;
      case 'addAfter':
        this.handleAddAppGroup({ type, appSectionId });
        return;
      case 'del':
        if (data.length <= 1) {
          this.delLastAppGroup();
        } else {
          api.getAppSectionDetail({ appSectionId, appId }).then(({ workSheetInfo = [] }) => {
            if (workSheetInfo.length < 1) {
              this.handleDelAppSection();
            } else {
              this.setState({ delAppItemVisible: true });
            }
          });
        }
        return;
    }
  };

  delLastAppGroup = () => {
    const { data } = this.state;
    const { appSectionId } = data[0];
    this.handleRenameAppGroup(appSectionId, { name: '' });
  };

  // 删除分组
  handleDelAppSection = sourceAppSectionId => {
    const { appId } = this.ids;

    api.deleteAppSection({ appId, appSectionId: this.handledAppItemId, sourceAppSectionId }).then(res => {
      if (res.data) {
        const temp = _.clone(this.state.data);
        const deletedAppIndex = _.findIndex(temp, ({ appSectionId }) => appSectionId === this.handledAppItemId);
        temp.splice(deletedAppIndex, 1);
        this.setState({ data: temp });
        this.props.updateAppGroup(temp);
        navigateTo(`/app/${appId}`);
      }
    });
    this.setState({ delAppItemVisible: false });
  };

  // 从空白创建分组，应用创建时会默认创建一个名字为空的分组。则第一次创建分组实质上是为默认创建的空分组改名字
  handleAddAppGroupFromEmpty = () => {
    this.switchVisible({ appItemIntroVisible: false });
    const { data } = this.state;
    const { appSectionId } = data[0] || {};
    const temp = _.cloneDeep(data);
    temp[0] = { ...temp[0], name: '未命名分组', type: DEFAULT_CREATE };
    this.setState({ focusGroupId: appSectionId, data: temp });
    this.props.updateAppGroup(temp);
  };

  // 添加分组
  handleAddAppGroup = obj => {
    let sourceAppSectionId = obj ? obj.appSectionId : '';
    const { data } = this.state;
    const { appId } = this.ids;
    const defaultAppGroup = { name: _l('未命名分组') };
    api
      .addAppSection({ appId, sourceAppSectionId, ...defaultAppGroup })
      .then(({ data: appSectionId }) => {
        const appGroupItem = { appSectionId, ...defaultAppGroup };
        if (sourceAppSectionId) {
          const temp = _.cloneDeep(data);
          const baseIndex = temp.findIndex(item => item.appSectionId === sourceAppSectionId);
          temp.splice(baseIndex + 1, 0, appGroupItem);
          this.props.updateAppGroup(temp);
          this.setState({ data: temp, focusGroupId: appSectionId });
        } else {
          this.props.updateAppGroup(data.concat(appGroupItem));
          this.setState({ data: data.concat(appGroupItem), focusGroupId: appSectionId });
        }
        navigateTo(`/app/${appId}/${appSectionId}`, true);
        this.ensurePointerVisible();
      })
      .fail(() => {
        this.setState({ focusGroupId: null });
      });
  };

  /**
   *  分组更名
   * @param {String} appSectionId
   * @param {Object} obj
   * @param {Boolean} isNeedModify 是否需要更新
   */
  handleRenameAppGroup = (appSectionId, obj, isNeedModify = true) => {
    const { appId } = this.ids;
    if (isNeedModify) {
      api.updateAppSectionName({ appSectionId, appId, ...obj }).then(({ data }) => {
        if (data) {
          this.updateSingleAppGroup(appSectionId, obj);
        }
      });
    }
    this.ensurePointerVisible();
    this.setState({ focusGroupId: null, activeAppItemId: '' });
  };

  // 更新单个应用分组数据
  updateSingleAppGroup = (appSectionId, obj) => {
    const { data } = this.state;
    const temp = _.cloneDeep(data);
    for (let i = 0; i < temp.length; i++) {
      let item = temp[i];
      if (item.appSectionId === appSectionId) {
        temp[i] = { ...item, ...obj };
        break;
      }
    }
    this.setState({ data: temp });
    this.props.updateAppGroup(temp);
  };

  // 要移入的分组下拉列表数据转换
  formatDataToDropdownItems = data =>
    data
      .filter(({ appSectionId, name }) => !!name && appSectionId !== this.handledAppItemId)
      .map(({ appSectionId, name }) => ({ value: appSectionId, text: name }));

  render() {
    const { permissionType, appStatus, isLock } = this.props;
    const {
      delAppItemVisible,
      appItemIntroVisible,
      focusGroupId,
      isAppItemOverflow,
      activeAppItemId,
      disabledPointer,
      appRoleType,
      data = [],
    } = this.state;
    if (!data.length && typeof appRoleType !== 'number') return null;
    const { appId } = this.ids;
    const throttledEnsurePointerStatus = this.throttleFunc(this.ensurePointerStatus);
    const isOnlyDefaultGroup = data.length === 1 && !data[0].name;
    const renderedData = data.filter(({ name }) => !!name);
    return (
      <Fragment>
        {isOnlyDefaultGroup ? (
          <div className="emptyAppItemWrap">
            {permissionType >= ADVANCE_AUTHORITY && (
              <Fragment>
                <div
                  className={cx('emptyAppItem', { active: appItemIntroVisible })}
                  onClick={e => {
                    this.switchVisible({ appItemIntroVisible: true });
                  }}
                >
                  <Icon className="emptyGroupIcon" icon="app_grouping" />
                </div>
                <AppGroupIntro
                  className={cx({ appItemIntroVisible })}
                  addAppGroup={this.handleAddAppGroupFromEmpty}
                  onClickAway={() => this.switchVisible({ appItemIntroVisible: false })}
                  onClose={() => this.switchVisible({ appItemIntroVisible: false })}
                />
              </Fragment>
            )}
          </div>
        ) : (
          <div className="appItemsOuterWrap">
            {_.includes([1, 5], appStatus) && (
              <div className="appItemsInnerWrap" onScroll={throttledEnsurePointerStatus}>
                <SortableAppList
                  items={renderedData}
                  onSortEnd={this.onSortEnd}
                  axis={'x'}
                  lockAxis={'x'}
                  distance={5}
                  transitionDuration={0}
                  helperClass="appGroupSortHelperClass"
                  focusGroupId={focusGroupId}
                  isAppItemOverflow={isAppItemOverflow}
                  onScroll={throttledEnsurePointerStatus}
                  activeAppItemId={activeAppItemId}
                  onClickAway={() => this.setState({ activeAppItemId: '' })}
                  ensurePointerVisible={this.ensurePointerVisible}
                  onAppItemConfigClick={this.handleAppItemConfigClick}
                  renameAppGroup={this.handleRenameAppGroup}
                  handleAddAppGroup={this.handleAddAppGroup}
                  {...this.props}
                />
              </div>
            )}
          </div>
        )}
        <div
          className={cx('appItemPointerWrap pointer', { visible: isAppItemOverflow })}
          onClick={this.handlePointerClick}
        >
          <div className={cx('leftPointer appItemPointer', { disable: disabledPointer === 'left' })} />
          <div className={cx('rightPointer appItemPointer', { disable: disabledPointer === 'right' })} />
        </div>
        {_.includes([1, 5], appStatus) && (
          <AppExtension appId={appId} permissionType={permissionType} isLock={isLock} />
        )}
        {delAppItemVisible && (
          <DelAppGroup
            data={this.formatDataToDropdownItems(data)}
            onOk={id => this.handleDelAppSection(id)}
            onCancel={() => this.switchVisible({ delAppItemVisible: false })}
          />
        )}
      </Fragment>
    );
  }
}
