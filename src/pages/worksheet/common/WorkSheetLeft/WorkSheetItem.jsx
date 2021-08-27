import React, { Component } from 'react';
import Tooltip from 'ming-ui/components/Tooltip';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import Icon from 'ming-ui/components/Icon';
import { navigateTo } from 'src/router/navigateTo';
import { SelectIcon, SheetMove } from '../../common';
import Trigger from 'rc-trigger';
import { withRouter } from 'react-router-dom';
import { setWorksheetStatus } from 'src/api/homeApp';
import SvgIcon from 'src/components/SvgIcon';

@withRouter
export default class WorkSheetItem extends Component {
  static propTypes = {
    name: PropTypes.string,
    count: PropTypes.number,
    showRight: PropTypes.bool,
    id: PropTypes.string,
    sheetInfo: PropTypes.object,
    className: PropTypes.string,
    changeTop: PropTypes.func,
    showDeleteWorkSheet: PropTypes.func,
    hideDeleteWorkSheet: PropTypes.func,
    hideCopyWorkSheet: PropTypes.func,
    hideSearchList: PropTypes.func, // 工作表查询列表
    showHead: PropTypes.bool, // 负责人头表
  };
  static defaultProps = {
    showRight: true,
  };
  constructor(props) {
    super(props);
    this.state = {
      selectIconVisible: false,
      showSheetGroup: false,
    };
    this.timer = null;
  }
  componentWillUnmount() {
    clearTimeout(this.timer);
  }
  handleClick(appId, groupId, workSheetId, event) {
    if (this.timer || $(event.target).closest('.moreBtn,.worksheetItemOperate,.sheetSelectIconWrap').length) return;
    this.timer = setTimeout(() => {
      clearTimeout(this.timer);
      this.timer = null;

      const storage = JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${appId}`)) || {};
      const viewId =
        (_.find(storage.worksheets || [], item => item.groupId === groupId && item.worksheetId === workSheetId) || {})
          .viewId || '';
      let url = `/app/${appId}/${groupId}/${workSheetId}${viewId ? `/${viewId}` : ''}`;
      if (this.props.isActive) {
        url += `?flag=${new Date().getTime()}`;
      }
      navigateTo(url);
    }, 200);
  }
  handleDbClick() {
    this.setState({ selectIconVisible: true });
    clearTimeout(this.timer);
    this.timer = null;
  }

  setWorksheetStatus() {
    const { sheetInfo, updateSheetInfo, updateSheetList } = this.props;
    const status = sheetInfo.status === 1 ? 2 : 1;

    setWorksheetStatus({ appId: this.props.match.params.appId, worksheetId: sheetInfo.workSheetId, status }).then(
      result => {
        if (result.data) {
          updateSheetList(sheetInfo.workSheetId, { status });
        }
      },
    );
  }

  renderMenu({ appId, groupId, type }) {
    const { menuIsVisible } = this.state;
    const { sheetInfo } = this.props;
    const isWorksheet = type === 0;
    return (
      <Menu className="worksheetItemOperate">
        <MenuItem
          icon={<Icon icon="edit" className="Font16" />}
          onClick={() => {
            this.setState({
              selectIconVisible: true,
              menuIsVisible: !menuIsVisible,
            });
          }}
        >
          <span className="text">{_l('修改名称和图标')}</span>
        </MenuItem>
        <MenuItem
          icon={<Icon icon="content-copy" className="Font16" />}
          onClick={() => {
            this.setState({ menuIsVisible: !menuIsVisible });
            this.props.onCopy();
          }}
        >
          <span className="text">{_l('复制')}</span>
        </MenuItem>
        <Trigger
          popupVisible={this.state.showSheetGroup}
          onPopupVisibleChange={showSheetGroup => {
            this.setState({ showSheetGroup });
          }}
          action={['hover']}
          mouseEnterDelay={0.1}
          popupAlign={{ points: ['tl', 'tr'], offset: [1, -5], overflow: { adjustX: 1, adjustY: 2 } }}
          popup={
            <SheetMove
              className="worksheetItemOperate grouping"
              appId={appId}
              groupId={groupId}
              onSave={args => {
                this.props.moveSheet(sheetInfo, args);
                this.setState({
                  menuIsVisible: false,
                  showSheetGroup: false,
                });
              }}
              onHide={() => {
                this.setState({
                  menuIsVisible: false,
                  showSheetGroup: false,
                });
              }}
            />
          }
        >
          <MenuItem
            className={cx({ moveSheetActive: this.state.showSheetGroup })}
            icon={<Icon icon="swap_horiz" className="Font18" />}
          >
            <span className="text">{_l('移动到')}</span>
            <Icon icon="arrow-right-tip" className="Font14" />
          </MenuItem>
        </Trigger>

        {
          <MenuItem
            icon={<Icon icon="public-folder-hidden" className="Font14" />}
            onClick={() => {
              this.setWorksheetStatus();
              this.setState({ menuIsVisible: false });
            }}
          >
            <span className="text flexRow">
              <span className="flex">{sheetInfo.status === 1 ? _l('从导航中隐藏') : _l('取消隐藏')}</span>
              <Tooltip
                popupPlacement="right"
                text={
                  <span>
                    {isWorksheet
                      ? _l('通常用于不需要用户直接访问的仅作为配置用途的表。如：关联的明细表、参数表等。')
                      : _l('隐藏后，普通用户在导航中将看不到此页面入口。')}
                  </span>
                }
              >
                <Icon className="Font14" icon={'help'} style={{ position: 'relative', left: 5 }} />
              </Tooltip>
            </span>
          </MenuItem>
        }

        <hr className="splitter" />

        <MenuItem
          icon={<Icon icon="delete2" className="Font16" />}
          className="delete"
          onClick={() => {
            this.props.showDeleteWorkSheet(sheetInfo);
            this.setState({ menuIsVisible: false });
          }}
        >
          <span className="text">{isWorksheet ? _l('删除工作表') : _l('删除自定义页面')}</span>
        </MenuItem>
      </Menu>
    );
  }
  render() {
    const { sheetInfo, match, isCharge, appPkg, sheetListVisible, projectId } = this.props;
    const { workSheetId, workSheetName, icon, iconUrl, status, type } = sheetInfo;
    const { iconColor } = appPkg;
    const { appId, groupId } = match.params;
    return (
      <Tooltip
        popupAlign={{ offset: [-10, 0] }}
        disable={sheetListVisible}
        popupPlacement="right"
        text={<span>{workSheetName}</span>}
      >
        <div
          style={this.props.style}
          className={cx(
            'workSheetItem ThemeColor10 flexRow',
            { hover: this.state.menuIsVisible },
            this.props.className,
          )}
          data-id={workSheetId}
          onClick={this.handleClick.bind(this, appId, groupId, workSheetId)}
          onDoubleClick={sheetListVisible && isCharge ? this.handleDbClick.bind(this) : _.noop}
        >
          <div className="NoUnderline valignWrapper ThemeColor10 h100 nameWrap">
            <div className="iconWrap">
              <SvgIcon url={iconUrl} fill={iconColor} size={22} />
            </div>
            <span className="name ellipsis Font14 mLeft10 mRight10" title={workSheetName}>
              {workSheetName}
            </span>
            {status === 2 && (
              <Tooltip popupPlacement="bottom" text={<span>{_l('仅管理员可见')}</span>}>
                <Icon className="Font14 mRight10" icon={'public-folder-hidden'} style={{ color: '#ee6f09' }} />
              </Tooltip>
            )}
            <div className="flex" />
          </div>
          {isCharge && (
            <Trigger
              popupVisible={this.state.menuIsVisible}
              onPopupVisibleChange={menuIsVisible => {
                this.setState({ menuIsVisible });
              }}
              action={['click']}
              popup={this.renderMenu({ appId, groupId, type })}
              popupAlign={{ points: ['tl', 'bl'], offset: [1, 1], overflow: { adjustX: 1, adjustY: 2 } }}
            >
              <div className="rightArea">
                <i className="icon icon-more_horiz Font18 moreBtn" />
              </div>
            </Trigger>
          )}
          {this.state.selectIconVisible && (
            <Trigger
              popupVisible={this.state.selectIconVisible}
              action={['click']}
              popup={
                <SelectIcon
                  projectId={projectId}
                  className="sheetSelectIconWrap relative"
                  isActive={this.props.isActive}
                  name={workSheetName}
                  icon={icon}
                  iconColor={iconColor}
                  appId={appId}
                  groupId={groupId}
                  workSheetId={workSheetId}
                  updateWorksheetInfo={this.props.updateSheetInfo}
                  updateSheetList={this.props.updateSheetList}
                  onCancel={() => {
                    this.setState({ selectIconVisible: false });
                  }}
                />
              }
              popupAlign={{ points: ['tl', 'bl'], offset: [-220, 20], overflow: { adjustX: 1, adjustY: 2 } }}
            >
              <div className="setSheetInfo"></div>
            </Trigger>
          )}
        </div>
      </Tooltip>
    );
  }
}
