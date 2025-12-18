import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { quickSelectDept } from 'ming-ui/functions';
import { dealRenderValue, dealUserRange } from 'src/components/Form/core/utils';
import DepartmentTooltip from 'src/components/Form/DesktopForm/widgets/DepartmentSelect/DepartmentTooltip';
import EditableCellCon from '../EditableCellCon';

const ClickAwayable = createDecoratedComponent(withClickAway);

// 反转文本用于 RTL 显示（实现从头省略）
const reverseTextForRTL = text => {
  if (!text) return text;
  return text.split('').reverse().join('');
};

// enumDefault 单选 0 多选 1
export default class Text extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    singleLine: PropTypes.bool,
    style: PropTypes.shape({}),
    rowHeight: PropTypes.number,
    editable: PropTypes.bool,
    isediting: PropTypes.bool,
    popupContainer: PropTypes.any,
    cell: PropTypes.shape({ value: PropTypes.string }),
    projectId: PropTypes.string,
    updateCell: PropTypes.func,
    updateEditingStatus: PropTypes.func,
    onClick: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      value: safeParse(props.cell.value, 'array'),
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.cell.value !== this.props.cell.value) {
      this.setState({ value: safeParse(nextProps.cell.value, 'array') });
    }
    const single = nextProps.cell.enumDefault === 0;
    if (this.cell.current && single && !this.props.isediting && nextProps.isediting) {
      this.handleSelect();
    }
    if (!single && !this.props.isediting && nextProps.isediting && _.isEmpty(this.props.cell.value)) {
      setTimeout(() => {
        this.handleSelect();
      }, 200);
    }
  }
  cell = React.createRef();

  handleTableKeyDown = e => {
    const { updateEditingStatus } = this.props;
    switch (e.key) {
      case 'Escape':
        updateEditingStatus(false);
        break;
      case 'Enter':
        if (!this.isSelecting) {
          this.handleSelect();
        }
        break;
      default:
        break;
    }
  };

  handleChange = () => {
    const { updateCell } = this.props;
    const { value } = this.state;
    updateCell({
      value: JSON.stringify(value),
    });
  };

  selectDepartments = (e, cb) => {
    const { cell, projectId, rowFormData, masterData = () => {} } = this.props;
    const target = (this.cell && this.cell.current) || (e || {}).target;
    if (!target) {
      this.isSelecting = false;
      return;
    }
    if (!_.find(md.global.Account.projects, item => item.projectId === projectId)) {
      this.isSelecting = false;
      alert(_l('您不是该组织成员，无法获取其部门列表，请联系组织管理员'), 3);
      return;
    }
    const deptRange = dealUserRange(cell, _.isFunction(rowFormData) ? rowFormData() : rowFormData, masterData());

    quickSelectDept(target, {
      projectId,
      isIncludeRoot: false,
      offset: {
        top: 0,
        left: 0,
      },
      selectedDepartment: this.state.value,
      unique: cell.enumDefault === 0,
      showCreateBtn: false,
      departrangetype: _.get(cell, 'advancedSetting.departrangetype'),
      data: this.state.value,
      appointedDepartmentIds: _.get(deptRange, 'appointedDepartmentIds') || [],
      appointedUserIds: _.get(deptRange, 'appointedAccountIds') || [],
      allPath: _.get(cell, 'advancedSetting.allpath') === '1',
      selectFn: cb,
      onClose: () => (this.isSelecting = false),
    });
  };

  handleSelect = e => {
    const { cell, updateEditingStatus } = this.props;

    this.isSelecting = true;
    this.selectDepartments(e, (data, isCancel = false) => {
      const { value } = this.state;
      this.isSelecting = false;
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
    });
  };

  handleMutipleEdit = () => {
    const { updateEditingStatus } = this.props;
    updateEditingStatus(true);
  };

  deleteDepartment = departmentId => {
    const { value } = this.state;
    this.setState(
      {
        value: departmentId
          ? value.filter(department => department.departmentId !== departmentId)
          : value.filter(i => !i.isDelete),
      },
      this.handleChange,
    );
  };

  renderDepartmentTag(department, allowDelete) {
    const { style, isediting, cell = {} } = this.props;
    const needRTL = _.get(cell, 'advancedSetting.allpath') === '1' && !department.isDelete;
    const displayName = needRTL ? reverseTextForRTL(department.departmentName) : department.departmentName;

    return (
      <span
        className={cx('cellDepartment', {
          isDelete: department.isDelete,
          disabledDepartmentOrRole: department.disabled,
        })}
        style={{ maxWidth: style.width - 20 }}
      >
        <div className="flexRow">
          <div
            className="departmentName flex ellipsis"
            style={needRTL ? { direction: 'rtl', unicodeBidi: 'bidi-override' } : {}}
          >
            {displayName}
            {department.deleteCount > 1 && <span className="Gray mLeft5">{department.deleteCount}</span>}
          </div>
          {isediting && allowDelete && (
            <i
              className="Font14 Gray_9e icon-close Hand mLeft4"
              onClick={() => this.deleteDepartment(department.departmentId)}
            ></i>
          )}
        </div>
      </span>
    );
  }

  render() {
    const {
      className,
      style,
      rowHeight,
      singleLine,
      popupContainer,
      cell,
      editable,
      isediting,
      updateEditingStatus,
      onClick,
      projectId,
    } = this.props;
    const value = dealRenderValue(this.state.value, cell.advancedSetting);
    const single = cell.enumDefault === 0;
    const editcontent = (
      <ClickAwayable
        onClickAwayExceptions={['#dialogSelectDept', '#quickSelectDept']}
        onClickAway={() => {
          updateEditingStatus(false);
        }}
      >
        <div
          className="cellDepartments cellControl cellControlDepartmentPopup cellControlEdittingStatus"
          style={{
            width: style.width,
            minHeight: rowHeight,
          }}
          ref={isediting && !single ? this.cell : () => {}}
        >
          {value.map(department => this.renderDepartmentTag(department, !(cell.required && value.length === 1)))}
          {!single && (
            <span className="addUserBtn" onClick={this.handleSelect}>
              <i className="icon icon-add Gray_75 Font14"></i>
            </span>
          )}
        </div>
      </ClickAwayable>
    );
    return (
      <Trigger
        action={['click']}
        popup={editcontent}
        getPopupContainer={popupContainer}
        popupClassName="filterTrigger LineHeight0"
        popupVisible={isediting}
        popupAlign={{
          points: ['tl', 'tl'],
          overflow: {
            adjustX: true,
            adjustY: true,
          },
        }}
      >
        <EditableCellCon
          conRef={single ? this.cell : () => {}}
          hideOutline={!single}
          onClick={onClick}
          className={cx(className, { canedit: editable })}
          style={style}
          iconName="department"
          isediting={isediting}
          onIconClick={this.handleMutipleEdit}
        >
          {!!value && (
            <div className={cx('cellDepartments cellControl', { singleLine })}>
              {value.map(department => (
                <DepartmentTooltip
                  key={department.departmentId}
                  item={department}
                  advancedSetting={cell?.advancedSetting}
                  projectId={projectId}
                >
                  {this.renderDepartmentTag(department)}
                </DepartmentTooltip>
              ))}
            </div>
          )}
        </EditableCellCon>
      </Trigger>
    );
  }
}
