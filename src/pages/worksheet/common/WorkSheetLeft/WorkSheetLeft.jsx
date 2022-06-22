import cx from 'classnames';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import DeleteConfirm from 'ming-ui/components/DeleteReconfirm';
import { ScrollView, Dialog, Tooltip, Menu, MenuItem } from 'ming-ui';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import color from 'color';
import Skeleton from 'src/router/Application/Skeleton';
import Guidance from 'src/pages/worksheet/components/Guidance';
import * as sheetListActions from 'src/pages/worksheet/redux/actions/sheetList';
import CreateNew from './CreateNew';
import WorkSheetItem from './WorkSheetItem';
import './WorkSheetLeft.less';
import { browserIsMobile, getAppFeaturesVisible } from 'src/util';

function getProjectfoldedFromStorage() {
  let result = {};
  const storageStr = window.localStorage.getItem(`worksheet_left_projectfolded_${md.global.Account.accountId}`);
  if (!storageStr) {
    return result;
  }
  try {
    result = JSON.parse(storageStr);
  } catch (err) {
    return {};
  }
  return result;
}

function convertColor(colorStr) {
  return colorStr ? color(colorStr).alpha(0.2) : '#bbdefb';
}

const SortableItem = SortableElement(({ sheet, index, ...other }) => {
  const { id, activeSheetId, onClick, onCopy, appPkg } = other;
  return (
    <WorkSheetItem
      {...other}
      isActive={activeSheetId === sheet.workSheetId}
      style={{ backgroundColor: activeSheetId === sheet.workSheetId ? convertColor(appPkg.iconColor) : '' }}
      // className={cx(id === sheet.workSheetId && activeSheetId === sheet.workSheetId ? '' : 'ThemeHoverBGColor7')}
      sheetInfo={Object.assign(sheet)}
      onClick={() => {
        onClick(sheet.workSheetId);
      }}
      onCopy={() => {
        onCopy(sheet);
      }}
    />
  );
});

const SortableList = SortableContainer(({ sheetList, ...other }) => {
  return (
    <div>
      {sheetList.map((item, index) => (
        <SortableItem key={item.workSheetId} index={index} sheet={item} {...other} />
      ))}
    </div>
  );
});

class WorkSheetLeft extends Component {
  static propTypes = {
    id: PropTypes.string,
    sheetListActions: PropTypes.object,
    sheetList: PropTypes.array,
    activeSheetId: PropTypes.string,
  };
  constructor(props) {
    super(props);
    this.state = {
      projectFolded: getProjectfoldedFromStorage(),
      createType: '',
      createMenuVisible: false,
    };
    this.getSheetList = this.getSheetList.bind(this);
  }
  componentWillMount = function () {
    this.getSheetList(this.props);
  };
  componentDidMount = function () {
    window.__worksheetLeftReLoad = this.getSheetList;
  };
  componentWillReceiveProps(nextProps) {
    if (nextProps.groupId !== this.props.groupId) {
      this.getSheetList(nextProps);
    }
  }
  componentWillUnmount = function () {
    delete window.__worksheetLeftReLoad;
  };
  getSheetList(props) {
    const { appId, groupId } = props || this.props;
    if (appId && groupId) {
      this.props.sheetListActions.getSheetList({
        appId,
        appSectionId: groupId,
      });
    }
  }
  // 删除工作表弹层
  showDeleteWorkSheet = deleteSheetInfo => {
    const { sheetListActions, appId, projectId, groupId } = this.props;
    const { workSheetName: name, type } = deleteSheetInfo;
    DeleteConfirm({
      clickOmitText: true,
      style: { width: '560px' },
      title: (
        <div className="Bold">
          <i className="icon-error error" style={{ fontSize: '28px', marginRight: '8px' }}></i>
          {type ? _l('删除自定义页面 “%0”', name) : _l('删除工作表 “%0”', name)}
        </div>
      ),
      description: (
        <div>
          <span style={{ color: '#333', fontWeight: 'bold' }}>
            {type ? _l('注意：自定义页面下所有配置和数据将被删除。') : _l('注意：工作表下所有配置和数据将被删除。')}
          </span>
          {type
            ? _l('请务必确认所有应用成员都不再需要此自定义页面后，再执行此操作。')
            : _l('请务必确认所有应用成员都不再需要此工作表后，再执行此操作。')}
        </div>
      ),
      data: [{ text: type ? _l('我确认删除自定义页面和所有数据') : _l('我确认删除工作表和所有数据'), value: 1 }],
      onOk: () => {
        sheetListActions.deleteSheet({
          type,
          appId,
          projectId,
          groupId,
          worksheetId: deleteSheetInfo.workSheetId,
        });
      },
    });
  };
  handleSortEnd({ oldIndex, newIndex }) {
    if (oldIndex === newIndex) return;
    const { appId, groupId, data } = this.props;
    const newSheetList = arrayMove(data, oldIndex, newIndex);
    this.props.sheetListActions.sortSheetList(appId, groupId, newSheetList);
  }
  handleCopy = ({ workSheetId, workSheetName, icon, iconColor, iconUrl, type = 0 }) => {
    const { appId, groupId, sheetListActions } = this.props;
    const copyArgs = {
      worksheetId: workSheetId,
      appId,
      appSectionId: groupId,
      name: workSheetName,
    };
    Dialog.confirm({
      title: type ? _l('复制自定义页面 “%0”', workSheetName) : _l('复制工作表 “%0”', workSheetName),
      description: type
        ? _l('将复制当前自定义页面的所有配置')
        : _l('将复制目标工作表的所有配置。工作表下的数据不会被复制'),
      okText: _l('复制'),
      onOk: () => {
        if (type === 1) {
          sheetListActions.copyCustomPage({
            appId,
            appSectionId: groupId,
            name: _l('%0-复制', workSheetName),
            id: workSheetId,
            icon,
            iconColor,
            iconUrl,
          });
          return;
        }
        sheetListActions.copySheet(copyArgs, {
          icon,
          iconColor,
          iconUrl,
        });
      },
    });
  };
  moveSheet = (sheetInfo, { resultAppId, ResultAppSectionId }) => {
    const { appId, groupId, sheetListActions } = this.props;
    sheetListActions.moveSheet({
      sourceAppId: appId,
      resultAppId,
      sourceAppSectionId: groupId,
      ResultAppSectionId,
      workSheetsInfo: [sheetInfo],
    });
  };
  switchCreateType = type => {
    this.setState({ createType: type, createMenuVisible: false });
  };
  handleCreate = (type, name) => {
    const { onCreateItem } = this.props;
    if (!name) {
      alert(_l('请填写名称'));
      return;
    }
    onCreateItem({ type, name: name.slice(0, 25), icon: type === 0 ? '1_worksheet' : '1_0_home' });
    this.setState({ createType: '' });
  };
  getAlign = () => {
    const $item = document.getElementById('createCustomItem');
    if (!$item) return;
    const { bottom } = $item.getBoundingClientRect();
    if (window.innerHeight - bottom > 75) {
      return { points: ['tl', 'bl'], offset: [10, 0] };
    } else {
      return { points: ['bl', 'tl'], offset: [10, -60] };
    }
  };
  renderMenu() {
    return (
      <Menu className="createNewMenu">
        <MenuItem
          onClick={() => {
            this.switchCreateType('worksheet');
          }}
        >
          <i className="icon-view  Font16"></i>
          <span className="mLeft5">{_l('工作表')}</span>
        </MenuItem>
        <MenuItem
          onClick={() => {
            this.switchCreateType('customPage');
          }}
        >
          <i className="icon-home_dashboard  Font18"></i>
          <span className="mLeft5">{_l('自定义页面')}</span>
        </MenuItem>
      </Menu>
    );
  }
  renderContent() {
    const { id, data, isCharge, isUnfold, appPkg } = this.props;
    const { createMenuVisible } = this.state;
    const workSheetItemProps = {
      disabled: browserIsMobile() ? true : !isCharge,
      helperClass: 'sortableWorkSheetItem',
      axis: 'y',
      lockAxis: 'y',
      distance: 5,
      sheetList: data,
      id,
      activeSheetId: id,
      onSortEnd: this.handleSortEnd.bind(this),
      onCopy: this.handleCopy,
      showHead: true,
      showDeleteWorkSheet: this.showDeleteWorkSheet,
      hideDeleteWorkSheet: this.hideDeleteWorkSheet,
      updateSheetInfo: this.props.sheetListActions.updateWorksheetInfo,
      updateSheetList: this.props.sheetListActions.updateSheetList,
      moveSheet: this.moveSheet,
      isCharge,
      sheetListVisible: isUnfold,
      appPkg,
      ..._.pick(appPkg, ['projectId']),
    };
    return (
      <div className="flex">
        <ScrollView
          className="sheetList"
          scrollEvent={() => {
            if (window.hideSheetItemOperate) {
              window.hideSheetItemOperate();
            }
          }}
        >
          <SortableList {...workSheetItemProps} />
          {isCharge && (
            <Trigger
              forceRender={true}
              popupVisible={createMenuVisible}
              onPopupVisibleChange={visible => this.setState({ createMenuVisible: visible })}
              action={['click']}
              popupAlign={this.getAlign()}
              popup={this.renderMenu()}
            >
              <div
                id="createCustomItem"
                className={cx('newWorkSheet pAll12 pLeft20 pointer mLeft2', { active: createMenuVisible })}
              >
                <Tooltip disable={isUnfold} popupPlacement="right" text={<span>{_l('新建应用项')}</span>}>
                  <i className="ming Icon icon icon-add mRight10 Font20 pointer" />
                </Tooltip>
                <span className="Font14 text">{_l('应用项')}</span>
              </div>
            </Trigger>
          )}
        </ScrollView>
      </div>
    );
  }
  render() {
    const { id, loading, isUnfold, data, guidanceVisible } = this.props;
    const { createType } = this.state;
    const sheetInfo = _.find(data, { workSheetId: id }) || {};

    // 获取url参数
    const { ln } = getAppFeaturesVisible();
    return (
      <div className={cx('workSheetLeft flexRow', { workSheetLeftHide: !isUnfold && ln, hide: !ln })}>
        {loading || _.isEmpty(data) ? <Skeleton active={true} /> : this.renderContent()}
        {!!createType && (
          <CreateNew type={createType} onCreate={this.handleCreate} onCancel={() => this.switchCreateType('')} />
        )}
        {guidanceVisible && sheetInfo.type === 0 && (
          <Guidance
            sheetListVisible={isUnfold}
            onClose={() => {
              this.props.sheetListActions.updateGuidanceVisible(false);
            }}
          />
        )}
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  sheetListActions: bindActionCreators(sheetListActions, dispatch),
  dispatch,
});

const mapStateToProps = state => ({
  data: state.sheetList.isCharge
    ? state.sheetList.data.filter(_ => _)
    : state.sheetList.data.filter(item => item.status === 1 && !item.navigateHide), //左侧列表状态为1 且 角色权限没有设置隐藏
  loading: state.sheetList.loading,
  isCharge: state.sheetList.isCharge,
  isUnfold: state.sheetList.isUnfold,
  appPkg: state.appPkg,
  guidanceVisible: state.sheetList.guidanceVisible,
});

export default connect(mapStateToProps, mapDispatchToProps)(WorkSheetLeft);
