import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { quickSelectDept } from 'ming-ui/functions';
import cx from 'classnames';
import { Tooltip, SortableList } from 'ming-ui';
import SelectUser from 'mobile/components/SelectUser';
import departmentAjax from 'src/api/department';
import { getTabTypeBySelectUser } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { browserIsMobile, getCurrentProject } from 'src/util';
import { dealRenderValue, dealUserRange } from '../../tools/utils';
import _ from 'lodash';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';

export default class Widgets extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.string,
    projectId: PropTypes.string,
    enumDefault: PropTypes.number,
    onChange: PropTypes.func,
  };

  state = {
    showSelectDepartment: false,
  };

  componentDidMount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.SHOW);
    }
  }

  /**
   * 选择部门
   */
  pickDepartment = e => {
    const { projectId, enumDefault, advancedSetting = {}, formData, enumDefault2, value } = this.props;
    const that = this;

    if (!_.find(md.global.Account.projects, item => item.projectId === projectId)) {
      alert(_l('您不是该组织成员，无法获取其部门列表，请联系组织管理员'), 3);
      return;
    }
    if (browserIsMobile()) {
      this.setState({ showSelectDepartment: true });
    } else {
      const deptRange = dealUserRange(this.props, formData);

      quickSelectDept(e.target, {
        projectId,
        isIncludeRoot: false,
        unique: enumDefault === 0,
        showCreateBtn: false,
        allPath: advancedSetting.allpath === '1',
        departrangetype: advancedSetting.departrangetype,
        appointedDepartmentIds: _.get(deptRange, 'appointedDepartmentIds') || [],
        appointedUserIds: _.get(deptRange, 'appointedAccountIds') || [],
        selectedDepartment: JSON.parse(value || '[]'),
        selectFn: that.onSave,
      });
    }
  };

  onSave = (data, isCancel = false) => {
    const { enumDefault, onChange, value } = this.props;
    const valueArr = JSON.parse(value || '[]');
    const lastIds = _.sortedUniq(valueArr.map(l => l.departmentId));
    const newIds = _.sortedUniq(data.map(l => l.departmentId));

    if ((data.length === 0 || _.isEqual(lastIds, newIds)) && !isCancel) return;

    const newData =
      enumDefault === 0
        ? data
        : isCancel
        ? valueArr.filter(l => l.departmentId !== data[0].departmentId)
        : _.uniqBy(valueArr.concat(data), 'departmentId');

    onChange(JSON.stringify(newData));
  };

  /**
   * 删除部门
   */
  removeDepartment(departmentId) {
    const { onChange, value } = this.props;
    const newValue = departmentId
      ? JSON.parse(value || '[]').filter(item => item.departmentId !== departmentId)
      : JSON.parse(value || '[]').filter(i => !i.isDelete);

    onChange(JSON.stringify(newValue));
  }

  componentWillUnmount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.HIDE);
    }
  }

  renderItem({ item, items = [], dragging }) {
    const { projectId, disabled, enumDefault, advancedSetting = {} } = this.props;
    const { allpath } = advancedSetting;

    return (
      <Tooltip
        key={item.departmentId}
        mouseEnterDelay={0.6}
        disable={!projectId || dragging}
        text={
          !_.get(window, 'shareState.shareId')
            ? () =>
                new Promise((resolve, reject) => {
                  if (!projectId) {
                    return reject();
                  }

                  if (item.isDelete) {
                    resolve(_l('%0部门已被删除', item.deleteCount > 1 ? `${item.deleteCount}个` : ''));
                    return;
                  }

                  if (allpath === '1' || _.isEmpty(getCurrentProject(projectId))) {
                    return resolve(item.departmentName);
                  }

                  departmentAjax
                    .getDepartmentFullNameByIds({
                      projectId,
                      departmentIds: [item.departmentId],
                    })
                    .then(res => {
                      resolve(_.get(res, '0.name'));
                    });
                })
            : null
        }
      >
        <div
          className={cx('customFormControlTags pLeft10', {
            selected: browserIsMobile() && !disabled,
            isDelete: item.isDelete,
          })}
          key={item.departmentId}
        >
          <span
            className="ellipsis"
            style={{
              maxWidth: 200,
              ...(allpath === '1' && !item.isDelete ? { direction: 'rtl', unicodeBidi: 'normal' } : {}),
            }}
          >
            {item.departmentName}
            {item.deleteCount > 1 && <span className="Gray mLeft5">{item.deleteCount}</span>}
          </span>

          {((enumDefault === 0 && items.length === 1) || enumDefault !== 0) && !disabled && (
            <i className="icon-minus-square Font16 tagDel" onClick={() => this.removeDepartment(item.departmentId)} />
          )}
        </div>
      </Tooltip>
    );
  }

  handleSort = items => {
    const { onChange, value } = this.props;

    onChange(
      JSON.stringify(
        items
          .map(l => ({
            ...l,
            departmentName: !l.departmentId
              ? l.departmentName
              : _.get(
                  safeParse(value || '[]').find(m => m.departmentId === l.departmentId),
                  'departmentName',
                ),
          })),
      ),
    );
  };

  render() {
    const { projectId, disabled, enumDefault, appId, advancedSetting = {}, formData, masterData = {} } = this.props;
    const value = dealRenderValue(this.props.value, advancedSetting);
    const { showSelectDepartment } = this.state;
    const deptRange = dealUserRange(this.props, formData, masterData);

    return (
      <div className="customFormControlBox customFormControlUser">
        <SortableList
          items={value.map(l => ({ ...l, canDrag: !!l.departmentId }))}
          canDrag={!disabled && enumDefault !== 0}
          itemKey="departmentId"
          itemClassName="inlineFlex grab"
          direction="vertical"
          renderBody
          renderItem={item => this.renderItem(item)}
          onSortEnd={this.handleSort}
        />

        {!disabled && (
          <div
            className="TxtCenter Gray_75 ThemeHoverBorderColor3 ThemeHoverColor3 pointer addBtn"
            onClick={this.pickDepartment}
          >
            <i className={enumDefault === 0 && value.length ? 'icon-swap_horiz Font16' : 'icon-plus Font14'} />
          </div>
        )}

        {showSelectDepartment && (
          <SelectUser
            projectId={projectId}
            visible={true}
            type="department"
            onlyOne={enumDefault === 0}
            onClose={() => this.setState({ showSelectDepartment: false })}
            onSave={this.onSave}
            appId={appId}
            userType={getTabTypeBySelectUser(this.props)}
            selectRangeOptions={!!advancedSetting.chooserange}
            departrangetype={advancedSetting.departrangetype}
            appointedDepartmentIds={_.get(deptRange, 'appointedDepartmentIds') || []}
            allPath={advancedSetting.allpath === '1'}
            appointedUserIds={_.get(deptRange, 'appointedAccountIds') || []}
          />
        )}
      </div>
    );
  }
}
