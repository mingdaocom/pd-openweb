import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Dialog, Icon, LoadDiv, Tooltip, UpgradeIcon, UserHead } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import SearchInput from 'worksheet/components/SearchInput';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { getDefaultSizeByType, SearchFn } from 'src/pages/widgetConfig/util';
import { handleAddWidgets, handleMoveWidgets } from 'src/pages/widgetConfig/util/data';
import WidgetDetail from 'src/pages/widgetConfig/widgetSetting';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import { checkWidgetMaxNumErr, getWidgetInfo } from '../../util';
import { isExceedMaxControlLimit } from '../../util/setting';
import './FieldRecycleBin.less';

export default class FieldRecycleBin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      originList: [],
      filterList: [],
      keywords: '',
      loading: false,
      isAdmin: false,
      activeWidget: null,
      isComplete: false,
    };
  }

  getRecycleList() {
    const { globalSheetInfo } = this.props;

    this.setState({ loading: true });

    worksheetAjax
      .getWorksheetControls({
        worksheetId: globalSheetInfo.worksheetId,
        getControlType: 9,
        resultType: 3,
      })
      .then(({ data = [] }) => {
        const tempList = _.get(data, 'controls') || [];
        this.setState({
          originList: tempList,
          filterList: tempList,
          activeWidget: tempList[0],
          isAdmin: [2, 4, 6].includes(globalSheetInfo.roleType), //开发者和管理员
          loading: false,
        });
      });
  }

  searchList = () => {
    const { originList, keywords } = this.state;
    const newFilterList = originList.filter(
      item =>
        SearchFn(keywords, item.controlName) || SearchFn(keywords, item.controlId) || SearchFn(keywords, item.alias),
    );
    this.setState({
      filterList: newFilterList,
      activeWidget: newFilterList[0],
    });
  };

  renderHeader = () => {
    const { originList } = this.state;
    return (
      <Fragment>
        <span>
          <span className="Font17">{_l('回收站（字段）')}</span>
          <span className="Font13 Gray_9e">
            {_l('可恢复%0天内删除的字段', md.global.SysSettings.worksheetRowRecycleDays)}
          </span>
        </span>
        <SearchInput
          className="searchContainer"
          placeholder={_l('字段名称/id/别名')}
          onOk={value => {
            this.setState({ keywords: value.trim() }, this.searchList);
          }}
          onClear={() => {
            this.setState({
              keywords: '',
              filterList: originList,
              activeWidget: originList[0],
            });
          }}
        />
      </Fragment>
    );
  };

  handleDelete = item => {
    Dialog.confirm({
      width: 440,
      title: (
        <span className="Font17 Red">
          <span className="icon-error mRight5"></span>
          {_l('确定彻底删除这个字段？')}
        </span>
      ),
      description: _l('彻底删除该数据后，将无法恢复。'),
      buttonType: 'danger',
      onOk: () => {
        this.updateStatus(item, 'delete');
      },
    });
  };

  updateStatus = (item, status) => {
    const { filterList, activeWidget = {}, isComplete } = this.state;
    const { globalSheetInfo = {}, allControls } = this.props;

    if (status === 'recover') {
      if (isExceedMaxControlLimit(allControls)) {
        alert(_l('恢复失败，表单控件数量已达到上限'), 3);
        return;
      }
      const err = checkWidgetMaxNumErr(item, allControls);
      if (err) {
        alert(err, 3);
        return;
      }
    }

    if (isComplete) return;

    this.setState({ isComplete: true });

    worksheetAjax
      .editControlsStatus({
        worksheetId: globalSheetInfo.worksheetId,
        controlIds: [item.controlId],
        status: status === 'delete' ? 999 : 1,
      })
      .then(res => {
        if (_.isArray(res.data) ? res.data.length > 0 : res.data) {
          if (status === 'recover') {
            const parentControl = item.sectionId ? _.find(allControls, a => a.controlId === item.sectionId) : '';
            const tempData = [
              {
                ..._.head(res.data),
                attribute: 0,
                sectionId: parentControl ? item.sectionId : '',
                size: item.size || getDefaultSizeByType(item.type),
                ...(item.type === 34 && _.isUndefined(item.relationControls) ? { needUpdate: true } : {}),
              },
            ];

            if (parentControl) {
              handleMoveWidgets(tempData, {
                ...this.props,
                activeWidget: parentControl,
              });
            } else {
              handleAddWidgets(tempData, {}, this.props);
            }
          }

          const newFilterList = filterList.filter(i => item.controlId !== i.controlId);
          this.setState({
            filterList: newFilterList,
            activeWidget: item.controlId === activeWidget.controlId ? newFilterList[0] : activeWidget,
            isComplete: false,
          });
          alert(status === 'recover' ? _l('恢复成功') : _l('彻底删除成功'));
        } else {
          if (res.msg) alert(res.msg);
        }
      });
  };

  renderListItem = item => {
    const { activeWidget = {}, isAdmin } = this.state;
    const { icon, widgetName } = getWidgetInfo(item.type);
    return (
      <div
        className={cx('flexRow fieldRecycleList', { active: activeWidget.controlId === item.controlId })}
        key={item.controlId}
        onClick={() => this.setState({ activeWidget: item })}
      >
        <div className="flex name">
          <Icon className="icon Font17 mRight5" icon={icon} />
          <Tooltip text={<span>{_l('ID: %0', item.controlId)}</span>} popupPlacement="bottom">
            <div className="ellipsis InlineBlock Font14">{item.controlName}</div>
          </Tooltip>
        </div>
        <div className="columnWidth">{widgetName}</div>
        <div className="columnWidth Gray_75 flexRow">
          <UserHead
            size={21}
            disabled={true}
            user={{ userHead: _.get(item.deleteAccount, 'avatar'), accountId: _.get(item.deleteAccount, 'accountId') }}
          />
          <div className="mLeft8 ellipsis flex">{_.get(item.deleteAccount, 'fullname')}</div>
        </div>
        <div className="columnWidth Gray_9e ellipsis">{item.deleteTime}</div>
        {isAdmin && (
          <div className="editOption">
            <Tooltip text={<span>{_l('恢复')}</span>} popupPlacement="bottom">
              <Icon
                icon="reply1"
                className="mRight20 Gray_9d"
                onClick={e => {
                  e.stopPropagation();
                  this.updateStatus(item, 'recover');
                }}
              />
            </Tooltip>
            <Tooltip text={<span>{_l('彻底删除')}</span>} popupPlacement="bottom">
              <Icon
                icon="hr_delete"
                className="Gray_9d"
                onClick={e => {
                  e.stopPropagation();
                  this.handleDelete(item, 'delete');
                }}
              />
            </Tooltip>
          </div>
        )}
      </div>
    );
  };

  renderContent = () => {
    const { filterList, loading, isAdmin, activeWidget, keywords } = this.state;

    if (loading) {
      return <LoadDiv className="mTop15" />;
    }

    if (!filterList.length) {
      return (
        <div className="FieldRecycleBinTableNull">
          <div className="iconWrap">
            <Icon icon="recycle" />
          </div>
          <div className="emptyExplain">{keywords ? _l('没有找到符合条件的结果') : _l('回收站暂无内容')}</div>
        </div>
      );
    }

    return (
      <Fragment>
        <div className="FieldRecycleBinTable">
          <div className="flexRow fieldRecycleList fieldRecycleHeader">
            <div className="flex pLeft5">{_l('字段名称')}</div>
            <div className="columnWidth">{_l('类型')}</div>
            <div className="columnWidth">{_l('删除者')}</div>
            <div className="columnWidth">{_l('删除时间')}</div>
            {isAdmin && <div className="editOption" />}
          </div>
          <div className="tableContent">{filterList.map(item => this.renderListItem(item))}</div>
        </div>
        <div className="FieldRecycleBinDetail">
          <WidgetDetail {...this.props} activeWidget={activeWidget} isRecycle={true} />
        </div>
      </Fragment>
    );
  };

  render() {
    const { globalSheetInfo: { projectId } = {} } = this.props;
    const { visible } = this.state;
    const isFree =
      _.get(
        _.find(md.global.Account.projects, item => item.projectId === projectId),
        'licenseType',
      ) === 0;
    const featureType = getFeatureStatus(projectId, VersionProductType.recycle);
    return (
      <Fragment>
        <Dialog
          visible={visible}
          title={<div className="FieldRecycleBinHeader">{this.renderHeader()}</div>}
          type="fixed"
          className="FieldRecycleBinDialog"
          onCancel={() => this.setState({ visible: false })}
          footer={null}
        >
          <div className="FieldRecycleBinContent">{this.renderContent()}</div>
        </Dialog>

        {featureType && (
          <div
            className="fieldRecycleBinText"
            onClick={() => {
              if (featureType === '2') {
                buriedUpgradeVersionDialog(projectId, VersionProductType.recycle);
                return;
              }
              this.setState({ visible: true }, this.getRecycleList);
            }}
          >
            <Icon icon="trash" />
            <div className="recycle">{_l('回收站')}</div>
            {isFree && <UpgradeIcon />}
          </div>
        )}
      </Fragment>
    );
  }
}
