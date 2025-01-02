import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';
import cx from 'classnames';
import Record from '../Record';
import { Menu, Dropdown } from 'antd';
import { Icon } from 'ming-ui';
import { MenuOverlayWrapper } from 'worksheet/views/GunterView/Directory';
import GroupContent from 'worksheet/views/GunterView/components/GroupContent';
import * as actions from 'worksheet/redux/actions/gunterview';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import _ from 'lodash';

const GroupingItem = styled.div`
  width: 100%;
  height: 32px;
  padding: 0 20px 0 12px;
  .addCoin {
    color: #2196f3;
    display: none;
    transform: translateX(5px);
  }
  &.addRecord:hover {
    color: #2196f3 !important;
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

@connect(
  state => ({
    ..._.pick(state.sheet.gunterView, ['grouping', 'viewConfig', 'withoutArrangementVisible']),
    ..._.pick(state.sheet, ['base', 'controls', 'worksheetInfo', 'sheetSwitchPermit']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class GroupItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createRecordVisible: false,
      defaultFormData: {},
      NewRecordComponent: null
    };
  }
  componentDidMount() {
    import('worksheet/common/newRecord/NewRecord').then(component => {
      this.setState({
        NewRecordComponent: component.default
      });
    });
  }
  handleChangeSubVisible = id => {
    this.props.updateGroupSubVisible(id);
  }
  handleCreateRecord = (groupId, isMilepost) => {
    const { base, grouping, controls, viewConfig, sheetSwitchPermit } = this.props;
    const { viewControl, milepost } = viewConfig;
    const titleControl = _.find(controls, { attribute: 1 });
    const allowedit = isOpenPermit(permitList.quickSwitch, sheetSwitchPermit, base.viewId);
    if (titleControl.type === 2 && allowedit) {
      this.props.createRecord(groupId, isMilepost);
    } else {
      const defaultFormData = {};
      if (viewControl) {
        const groupControl = _.find(controls, { controlId: viewControl }) || {};
        let { key: value, name } = _.find(grouping, { key: groupId }) || {};
        if ([29].includes(groupControl.type)) {
          value = JSON.stringify([{ sid: groupId, name }]);
        }
        if ([9, 11].includes(groupControl.type)) {
          const { key } = _.find(groupControl.options, { key: groupId }) || {};
          value = JSON.stringify([key]);
        }
        if (value === '-1') {
          value = '';
        }
        defaultFormData[viewControl] = value;
      }
      if (isMilepost && milepost) {
        defaultFormData[milepost] = '1';
      }
      this.setState({ createRecordVisible: true, defaultFormData });
    }
  }
  renderOverlay({ key, subVisible }) {
    const { worksheetInfo, viewConfig } = this.props;
    const { milepost } = viewConfig;
    return (
      <MenuOverlayWrapper className="pTop6 pBottom6" style={{ width: 180 }}>
        <Menu.Item
          className="valignWrapper"
          onClick={() => {
            if (!subVisible) {
              this.handleChangeSubVisible(key);
            }
            this.handleCreateRecord(key);
          }}
        >
          <Icon className="Gray_9e Font20 mRight10" icon="add" />
          <span>{_l('新建%0', worksheetInfo.entityName)}</span>
        </Menu.Item>
        {milepost && (
          <Menu.Item
            className="valignWrapper"
            onClick={() => {
              if (!subVisible) {
                this.handleChangeSubVisible(key);
              }
              this.handleCreateRecord(key, true);
            }}
          >
            <Icon className="Gray_9e Font20 mRight10" icon="flag" />
            <span>{_l('新建里程碑')}</span>
          </Menu.Item>
        )}
      </MenuOverlayWrapper>
    );
  }
  renderContent() {
    const { width, viewConfig, widthConfig, group, worksheetInfo, sheetSwitchPermit, withoutArrangementVisible } = this.props;
    const { viewControl } = viewConfig;
    const rows = group.rows.filter(item => (withoutArrangementVisible ? true : item.diff > 0));
    const allowAdd = isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) && worksheetInfo.allowAdd && viewControl !== 'wfstatus';
    return (
      <Fragment>
        {!group.hide && (
          <GroupingItem className={cx('valignWrapper pointer', { allowAdd: allowAdd })}>
            <Icon
              className="Font12 Gray_9e mRight8"
              icon={group.subVisible ? 'arrow-down' : 'arrow-right-tip'}
              onClick={(event) => {
                this.handleChangeSubVisible(group.key);
              }}
            />
            <div className="valignWrapper h100" style={{ width: width - 50 }}>
              <div
                className="Gray_75 h100 valignWrapper flex overflow_ellipsis"
                onClick={(event) => {
                  this.handleChangeSubVisible(group.key);
                }}
              >
                <GroupContent group={group} />
              </div>
              <div className="Gray_9e totalNum">{rows.length}</div>
              {allowAdd && (
                <Dropdown overlay={this.renderOverlay(group)} trigger={['click']}>
                  <Icon className="addCoin Font18" icon="add_circle" />
                </Dropdown>
              )}
            </div>
          </GroupingItem>
        )}
        {group.subVisible && rows.map(row => <Record key={row.rowid} groupKey={group.key} row={row} widthConfig={widthConfig} />)}
        {_.isEmpty(viewControl) && allowAdd && (
          <GroupingItem
            className="valignWrapper addRecord Gray_9e pointer"
            onClick={() => {
              this.handleCreateRecord(group.key);
            }}
          >
            <Icon className="Font17 mBottom3" icon="add" />
            <div>{_l('点击添加%0', worksheetInfo.entityName)}</div>
          </GroupingItem>
        )}
      </Fragment>
    );
  }
  renderNewRecord() {
    const { base, worksheetInfo } = this.props;
    const { defaultFormData, NewRecordComponent } = this.state;
    return (
      <NewRecordComponent
        visible
        onAdd={record => {
          this.props.addNewRecord(record);
        }}
        defaultFormData={defaultFormData}
        hideNewRecord={() => this.setState({ createRecordVisible: false, defaultFormData: {} })}
        worksheetInfo={worksheetInfo}
        entityName={worksheetInfo.entityName}
        projectId={worksheetInfo.projectId}
        worksheetId={worksheetInfo.worksheetId}
        appId={base.appId}
        viewId={base.viewId}
      />
    );
  }
  render() {
    const { createRecordVisible } = this.state;
    return (
      <Fragment>
        {this.renderContent()}
        {createRecordVisible && this.renderNewRecord()}
      </Fragment>
    );
  }
}
