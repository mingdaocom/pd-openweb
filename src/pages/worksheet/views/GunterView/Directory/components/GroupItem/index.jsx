import React, { Component, Fragment, lazy, Suspense } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';
import * as actions from 'worksheet/redux/actions/gunterview';
import GroupContent from 'worksheet/views/GunterView/components/GroupContent';
import { GUNTER_ROW_HEIGHT } from 'worksheet/views/GunterView/virtual';
import { permitList } from 'src/utils/domain/control/formEnum';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';
import Record from '../Record';

const GroupingItem = styled.div`
  width: 100%;
  height: 32px;
  padding: 0 20px 0 12px;
  .addCoin {
    color: var(--color-primary);
    display: none;
    transform: translateX(5px);
  }
  &.addGunterRecord:hover {
    color: var(--color-primary) !important;
  }
  &.allowAdd:hover {
    .addCoin {
      display: block;
    }
    .totalNum {
      display: none;
    }
  }
  .icon-add {
    opacity: 0;
    transform: translateX(-3px);
  }
  &:hover .icon-add {
    opacity: 1;
  }
`;
const LoadableNewRecord = lazy(() => import('worksheet/common/newRecord/NewRecord'));
let GroupItem = class GroupItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createRecordVisible: false,
      defaultFormData: {},
    };
  }

  handleChangeSubVisible = (id, visible) => {
    this.props.updateGroupSubVisible(id);
    setTimeout(() => {
      if (visible) {
        this.props.onUpdateHeaderWidth();
      }
    }, 100);
  };
  handleCreateRecord = (groupId, isMilepost) => {
    const { base, grouping, controls, viewConfig, sheetSwitchPermit } = this.props;
    const { viewControl, milepost, navTitle } = viewConfig;

    const titleControl = _.find(controls, {
      attribute: 1,
    });

    const allowedit = isOpenPermit(permitList.quickSwitch, sheetSwitchPermit, base.viewId);

    if (navTitle && titleControl.type === 2 && allowedit) {
      this.props.createRecord(groupId, isMilepost);
    } else {
      const defaultFormData = {};

      if (viewControl) {
        const groupControl =
          _.find(controls, {
            controlId: viewControl,
          }) || {};
        let { key: value, name } =
          _.find(grouping, {
            key: groupId,
          }) || {};

        if ([29].includes(groupControl.type)) {
          value = JSON.stringify([
            {
              sid: groupId,
              name,
            },
          ]);
        }

        if ([9, 11].includes(groupControl.type)) {
          const { key } =
            _.find(groupControl.options, {
              key: groupId,
            }) || {};
          value = JSON.stringify([key]);
        }

        if (value === '-1' || [30].includes(groupControl.type)) {
          value = '';
        }

        defaultFormData[viewControl] = value;
      }

      if (isMilepost && milepost) {
        defaultFormData[milepost] = '1';
      }

      this.setState({
        createRecordVisible: true,
        defaultFormData,
      });
    }
  };

  getOperateMenuItems({ key, subVisible }) {
    const { worksheetInfo, viewConfig } = this.props;
    const { milepost } = viewConfig;

    return [
      {
        key: 'createRecord',
        className: 'valignWrapper',
        icon: <Icon className="textTertiary Font20" icon="add" />,
        label: _l('新建%0', worksheetInfo.entityName),
        onClick: () => {
          if (!subVisible) {
            this.handleChangeSubVisible(key);
          }

          this.handleCreateRecord(key);
        },
      },
      milepost && {
        key: 'createMilepost',
        className: 'valignWrapper',
        icon: <Icon className="textTertiary Font20" icon="flag" />,
        label: _l('新建里程碑'),
        onClick: () => {
          if (!subVisible) {
            this.handleChangeSubVisible(key);
          }

          this.handleCreateRecord(key, true);
        },
      },
    ].filter(Boolean);
  }

  getRows() {
    const { group, withoutArrangementVisible } = this.props;

    return group.rows.filter(item => (withoutArrangementVisible ? true : item.diff > 0));
  }

  getAllowAdd() {
    const { viewConfig, worksheetInfo, sheetSwitchPermit } = this.props;
    const { viewControl } = viewConfig;

    return (
      isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) &&
      worksheetInfo.allowAdd &&
      viewControl !== 'wfstatus'
    );
  }

  renderGroupHeader(rows, allowAdd) {
    const { width, group } = this.props;

    if (group.hide) {
      return null;
    }

    return (
      <GroupingItem
        className={cx('valignWrapper pointer', {
          allowAdd: allowAdd,
        })}
      >
        <Icon
          className="Font12 textTertiary mRight8"
          icon={group.subVisible ? 'arrow-down' : 'arrow-right-tip'}
          onClick={() => {
            this.handleChangeSubVisible(group.key, !group.subVisible);
          }}
        />
        <div
          className="valignWrapper h100"
          style={{
            width: width - 50,
          }}
        >
          <div
            className="textSecondary h100 valignWrapper flex overflow_ellipsis"
            onClick={() => {
              this.handleChangeSubVisible(group.key, !group.subVisible);
            }}
          >
            <GroupContent group={group} />
          </div>
          <div className="textTertiary totalNum">{rows.length}</div>
          {allowAdd && (
            <Dropdown
              trigger={['click']}
              menu={{
                items: this.getOperateMenuItems(group),
                style: { minWidth: 180 },
                className: 'pTop6 pBottom6',
              }}
            >
              <Icon className="addCoin Font18" icon="add_circle" />
            </Dropdown>
          )}
        </div>
      </GroupingItem>
    );
  }

  renderRecord(row) {
    const { group, widthConfig } = this.props;

    return <Record key={row.rowid} groupKey={group.key} row={row} widthConfig={widthConfig} />;
  }

  renderAddRecord(allowAdd) {
    const { viewConfig, group, worksheetInfo } = this.props;
    const { viewControl } = viewConfig;

    if (!_.isEmpty(viewControl) || !allowAdd) {
      return null;
    }

    return (
      <GroupingItem
        className="valignWrapper addGunterRecord textTertiary pointer"
        onClick={() => {
          this.handleCreateRecord(group.key);
        }}
      >
        <Icon className="Font17 mBottom3" icon="add" />
        <div>{_l('点击添加%0', worksheetInfo.entityName)}</div>
      </GroupingItem>
    );
  }

  renderVirtualContent() {
    const { group, groupRowVisible, visibleRows = [], visibleRange = {} } = this.props;
    const rows = this.getRows();
    const allowAdd = this.getAllowAdd();
    const addRecordVisible = visibleRange.endIndex >= group.openCount - 1;

    return (
      <Fragment>
        {groupRowVisible && (
          <div
            className="gunterVirtualRow"
            style={{
              top: group.groupingIndex * GUNTER_ROW_HEIGHT,
            }}
          >
            {this.renderGroupHeader(rows, allowAdd)}
          </div>
        )}
        {group.subVisible &&
          visibleRows.map(({ row, rowIndex }) => (
            <div
              key={row.rowid}
              className="gunterVirtualRow"
              style={{
                top: rowIndex * GUNTER_ROW_HEIGHT,
              }}
            >
              {this.renderRecord(row)}
            </div>
          ))}
        {addRecordVisible && (
          <div
            className="gunterVirtualRow"
            style={{
              top: group.openCount * GUNTER_ROW_HEIGHT,
            }}
          >
            {this.renderAddRecord(allowAdd)}
          </div>
        )}
      </Fragment>
    );
  }

  renderContent() {
    const { group } = this.props;
    const rows = this.getRows();
    const allowAdd = this.getAllowAdd();

    return (
      <Fragment>
        {this.renderGroupHeader(rows, allowAdd)}
        {group.subVisible && rows.map(row => this.renderRecord(row))}
        {this.renderAddRecord(allowAdd)}
      </Fragment>
    );
  }

  renderNewRecord() {
    const { base, worksheetInfo } = this.props;
    const { defaultFormData } = this.state;
    return (
      <Suspense fallback={null}>
        <LoadableNewRecord
          visible
          onAdd={record => {
            this.props.addNewRecord(record);
          }}
          defaultFormData={defaultFormData}
          hideNewRecord={() =>
            this.setState({
              createRecordVisible: false,
              defaultFormData: {},
            })
          }
          worksheetInfo={worksheetInfo}
          entityName={worksheetInfo.entityName}
          projectId={worksheetInfo.projectId}
          worksheetId={worksheetInfo.worksheetId}
          appId={base.appId}
          viewId={base.viewId}
        />
      </Suspense>
    );
  }

  render() {
    const { createRecordVisible } = this.state;
    const { virtual } = this.props;
    return (
      <Fragment>
        {virtual ? this.renderVirtualContent() : this.renderContent()}
        {createRecordVisible && this.renderNewRecord()}
      </Fragment>
    );
  }
};
GroupItem = connect(
  state => ({
    ..._.pick(state.sheet.gunterView, ['grouping', 'viewConfig', 'withoutArrangementVisible']),
    ..._.pick(state.sheet, ['base', 'controls', 'worksheetInfo', 'sheetSwitchPermit']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)(GroupItem);
export default GroupItem;
