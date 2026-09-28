import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { DeptSelectPopover } from 'ming-ui/functions/quickSelectDept';
import DepartmentTooltip from 'src/components/Form/DesktopForm/widgets/DepartmentSelect/DepartmentTooltip';
import { formatDepartmentDisplayValue } from 'src/utils/domain/control/department';
import { dealUserRange } from 'src/utils/domain/control/selectionRange';
import EditableCellCon from '../EditableCellCon';

// enumDefault 单选 0 多选 1
export default class Text extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    singleLine: PropTypes.bool,
    style: PropTypes.shape({}),
    editable: PropTypes.bool,
    isediting: PropTypes.bool,
    cell: PropTypes.shape({ value: PropTypes.string }),
    projectId: PropTypes.string,
    updateCell: PropTypes.func,
    updateEditingStatus: PropTypes.func,
    onValidate: PropTypes.func,
    onClick: PropTypes.func,
    isMobileTable: PropTypes.bool,
  };
  constructor(props) {
    super(props);
    this.state = {
      value: safeParse(props.cell.value, 'array'),
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.cell.value !== prevProps.cell.value) {
      this.setState({
        value: safeParse(this.props.cell.value, 'array'),
      });
    }

    if (!prevProps.isediting && this.props.isediting) {
      this.ensureCanSelectDepartment();
    }
  }

  handleTableKeyDown = e => {
    if (e.key === 'Escape') {
      this.props.updateEditingStatus(false);
    }
  };

  handleChange = () => {
    const { updateCell, onValidate } = this.props;
    const { value } = this.state;
    const newValue = JSON.stringify(value);
    updateCell({
      value: newValue,
    });
    // 部门通过浮层选择即时提交，不走输入/失焦校验流程；必填报错后重新选择需主动重新校验，
    // 以清掉持久化在 cellErrors 中的旧错误，否则错误状态不会重置。
    if (_.isFunction(onValidate)) {
      onValidate(newValue);
    }
  };

  isProjectMember = () => {
    const { projectId } = this.props;
    return _.some(md.global.Account.projects, item => item.projectId === projectId);
  };

  ensureCanSelectDepartment = () => {
    if (!this.isProjectMember()) {
      alert(_l('您不是该组织成员，无法获取其部门列表，请联系组织管理员'), 3);
      this.props.updateEditingStatus(false);
      return false;
    }

    return true;
  };

  getDepartmentRange = () => {
    const { cell, rowFormData, masterData = () => {} } = this.props;
    const deptRange = dealUserRange(cell, _.isFunction(rowFormData) ? rowFormData() : rowFormData, masterData());
    return deptRange || {};
  };

  handleDepartmentOpenChange = visible => {
    if (visible) return false;

    this.props.updateEditingStatus(false);
  };

  handleDepartmentSelect = (data, isCancel = false) => {
    const { cell, updateEditingStatus } = this.props;
    const { value } = this.state;
    const lastIds = _.sortedUniq(value.map(l => l.departmentId));
    const newIds = _.sortedUniq(data.map(l => l.departmentId));

    if ((_.isEmpty(data) || _.isEqual(lastIds, newIds)) && !isCancel) return;
    if (cell.enumDefault === 0) {
      // 单选
      this.setState(
        {
          value: data,
        },
        () => {
          this.handleChange();
          updateEditingStatus(false);
        },
      );
    } else {
      let newData = [];

      try {
        newData = isCancel
          ? value.filter(l => l.departmentId !== data[0].departmentId)
          : _.uniqBy(value.concat(data), 'departmentId');
      } catch (err) {
        console.log(err);
      }

      this.setState(
        {
          value: newData,
        },
        this.handleChange,
      );
    }
  };

  handleEdit = () => {
    if (this.ensureCanSelectDepartment()) {
      this.props.updateEditingStatus(true);
    }
  };

  deleteDepartment = departmentId => {
    this.setState(
      ({ value }) => ({
        value: departmentId
          ? value.filter(department => department.departmentId !== departmentId)
          : value.filter(department => !department.isDelete),
      }),
      this.handleChange,
    );
  };

  renderDepartmentTag(department, allowDelete) {
    const { style, cell = {}, isediting } = this.props;
    const needRTL = _.get(cell, 'advancedSetting.allpath') === '1' && !department.isDelete;
    const renderName = needRTL ? <bdi dir="ltr">{department.departmentName}</bdi> : department.departmentName;

    return (
      <span
        className={cx('cellDepartment', {
          isDelete: department.isDelete,
          disabledDepartmentOrRole: department.disabled,
        })}
        style={{ maxWidth: style.width - 20 }}
      >
        <div className="flexRow">
          <div className="departmentName flex ellipsis" style={needRTL ? { direction: 'rtl' } : {}}>
            {renderName}
            {department.deleteCount > 1 && <span className="textPrimary mLeft5">{department.deleteCount}</span>}
          </div>
          {isediting && allowDelete && (
            <i
              className="Font14 textTertiary icon-close Hand mLeft4"
              onMouseDown={e => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={e => {
                e.stopPropagation();
                this.deleteDepartment(department.departmentId);
              }}
            />
          )}
        </div>
      </span>
    );
  }

  render() {
    const { className, singleLine, style, cell, editable, isediting, onClick, projectId, isMobileTable } = this.props;
    const { value: selectedDepartment } = this.state;
    const value = formatDepartmentDisplayValue(this.state.value, cell.advancedSetting);
    const single = cell.enumDefault === 0;
    const isProjectMember = this.isProjectMember();
    const deptRange = isediting && isProjectMember ? this.getDepartmentRange() : {};

    return (
      <EditableCellCon
        onClick={onClick}
        className={cx(className, { canedit: editable })}
        style={style}
        iconName="department"
        isediting={isediting}
        onIconClick={this.handleEdit}
      >
        <DeptSelectPopover
          projectId={projectId}
          unique={single}
          showCreateBtn={false}
          departrangetype={_.get(cell, 'advancedSetting.departrangetype')}
          selectedDepartment={selectedDepartment}
          appointedDepartmentIds={_.get(deptRange, 'appointedDepartmentIds') || []}
          appointedUserIds={_.get(deptRange, 'appointedAccountIds') || []}
          allPath={_.get(cell, 'advancedSetting.allpath') === '1'}
          isDynamic={!single}
          open={isediting && isProjectMember}
          onOpenChange={this.handleDepartmentOpenChange}
          selectFn={this.handleDepartmentSelect}
        >
          {!_.isEmpty(value) ? (
            <div className={cx('cellDepartments cellControl', { singleLine })}>
              {value.map(department => (
                <DepartmentTooltip
                  key={department.departmentId}
                  item={department}
                  advancedSetting={cell?.advancedSetting}
                  projectId={projectId}
                  disabled={isMobileTable}
                >
                  {this.renderDepartmentTag(department, !(cell.required && value.length === 1))}
                </DepartmentTooltip>
              ))}
            </div>
          ) : (
            <div className="w100 h100"></div>
          )}
        </DeptSelectPopover>
      </EditableCellCon>
    );
  }
}
