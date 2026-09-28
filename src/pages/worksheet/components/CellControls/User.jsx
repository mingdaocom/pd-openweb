import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { UserHead } from 'ming-ui';
import { UserSelectPopover } from 'ming-ui/functions/quickSelectUser';
import { getTabTypeBySelectUser } from 'src/utils/domain/control/controlSelection';
import { dealUserRange } from 'src/utils/domain/control/selectionRange';
import { isKeyBoardInputChar } from 'src/utils/platform/browser/dom';
import EditableCellCon from '../EditableCellCon';
import CellErrorTip from './comps/CellErrorTip';

// enumDefault 单选 0 多选 1
export default class User extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    singleLine: PropTypes.bool,
    style: PropTypes.shape({}),
    editable: PropTypes.bool,
    disabled: PropTypes.bool,
    isediting: PropTypes.bool,
    updateCell: PropTypes.func,
    cell: PropTypes.shape({ value: PropTypes.string }),
    projectId: PropTypes.string,
    updateEditingStatus: PropTypes.func,
    onValidate: PropTypes.func,
    onClick: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      value: safeParse(props.cell.value, 'array'),
    };
  }

  hasInvalidSelection = false;

  componentDidUpdate(prevProps) {
    if (this.props.cell.value !== prevProps.cell.value) {
      this.hasInvalidSelection = false;
      this.setState({
        value: safeParse(this.props.cell.value, 'array'),
      });
    }

    if (!prevProps.isediting && this.props.isediting) {
      this.ensureCanSelectUser();
    }
  }

  renderCellUser(user) {
    const { projectId, appId, cell, disabled, chatButton, isediting } = this.props;
    const { value } = this.state;
    return (
      <div className="cellUser" key={user.accountId}>
        <div className="flexRow">
          <UserHead
            className="cellUserHead"
            projectId={projectId}
            user={{
              userHead: user.avatarSmall || user.avatar,
              accountId: user.accountId,
            }}
            size={21}
            appId={cell.dataSource ? undefined : appId}
            disabled={disabled}
            chatButton={chatButton}
          />
          <span className="userName flex ellipsis">{user.fullname || user.name}</span>
          {isediting && !(cell.required && value.length === 1) && (
            <i
              className="Font14 textTertiary icon-close Hand mLeft4"
              onClick={e => {
                e.stopPropagation();
                this.deleteUser(user.accountId);
              }}
            />
          )}
        </div>
      </div>
    );
  }

  handleExitEditing = ({ exit = true } = {}) => {
    const { updateEditingStatus, cell } = this.props;
    const { isError } = this.state;
    const shouldResetValue = this.hasInvalidSelection || isError;

    this.hasInvalidSelection = false;

    if (shouldResetValue) {
      this.setState({
        value: safeParse(cell.value, 'array'),
        isError: false,
        valueChanged: false,
      });
    } else {
      this.setState({ isError: false, valueChanged: false });
    }

    if (exit) {
      updateEditingStatus(false);
    }
  };

  handleTableKeyDown = e => {
    const { editable, updateEditingStatus } = this.props;

    if (!editable) {
      return;
    }

    switch (e.key) {
      case 'Escape':
        this.handleExitEditing();
        break;
      case 'Backspace':
        this.deleteLastUser();
        break;
      default:
        if (!e.key || !isKeyBoardInputChar(e.key)) {
          return;
        }

        updateEditingStatus(true);
        if (!(e.target.tagName.toLowerCase() === 'input' && e.target.className === 'searchInput')) {
          e.stopPropagation();
          e.preventDefault();
        }

        break;
    }
  };

  handleChange = forceUpdate => {
    const { error, ignoreErrorMessage, isSubList, cell, updateCell } = this.props;
    const { value } = this.state;

    if (isSubList && !forceUpdate) {
      return;
    }

    if (cell.controlId === 'ownerid') {
      updateCell({
        value: value[0] && value[0].accountId,
      });
      return;
    }

    if (this.state.isError) {
      this.setState({ isError: false });
    }

    if (error && !ignoreErrorMessage) {
      return;
    }

    updateCell({
      value: JSON.stringify(value),
    });
  };

  canSelectUser = () => {
    const { cell, projectId } = this.props;
    const tabType = getTabTypeBySelectUser(cell);
    return !(
      tabType === 1 &&
      md.global.Account.isPortal &&
      !_.find(md.global.Account.projects, item => item.projectId === projectId)
    );
  };

  ensureCanSelectUser = () => {
    if (!this.canSelectUser()) {
      alert(_l('您不是该组织成员，无法获取其成员列表，请联系组织管理员'), 3);
      this.props.updateEditingStatus(false);
      return false;
    }

    return true;
  };

  getUserRange = () => {
    const { cell, rowFormData, masterData = () => {} } = this.props;
    return dealUserRange(cell, _.isFunction(rowFormData) ? rowFormData() : rowFormData, masterData());
  };

  handleUserSelect = (data, forceUpdate) => {
    const { cell, onValidate } = this.props;
    const validateResult = onValidate(JSON.stringify(data));

    if (validateResult.errorType && !validateResult.ignoreErrorMessage) {
      this.hasInvalidSelection = true;
      this.setState({
        value: data,
        isError: true,
        validateResult,
      });
      return;
    }

    this.hasInvalidSelection = false;

    if (validateResult.errorMessage) {
      alert(validateResult.errorMessage, 3);
    }

    if (cell.enumDefault === 0) {
      this.setState(
        {
          value: data,
          valueChanged: true,
        },
        () => this.handleChange(true),
      );
    } else {
      let newData = [];

      try {
        newData = _.uniqBy(this.state.value.concat(data), 'accountId');
      } catch (err) {
        console.log(err);
      }

      this.setState(
        {
          value: newData,
          valueChanged: true,
        },
        () => this.handleChange(forceUpdate),
      );
    }
  };

  handleQuickUserSelect = (data, isCancel = false) => {
    if (isCancel) {
      data[0] && this.deleteUser(data[0].accountId);
      return;
    }

    this.handleUserSelect(data);
  };

  handleUserSelectOpenChange = visible => {
    if (visible) return false;

    const { isSubList } = this.props;

    if (isSubList && this.state.valueChanged) {
      this.handleChange(true);
    }

    this.handleExitEditing();
  };

  handleEdit = () => {
    if (this.ensureCanSelectUser()) {
      this.props.updateEditingStatus(true);
    }
  };

  deleteUser = accountId => {
    const { value } = this.state;
    this.setState(
      {
        value: value.filter(account => account.accountId !== accountId),
        valueChanged: true,
      },
      () => this.handleChange(true),
    );
  };

  deleteLastUser = () => {
    const { value } = this.state;

    if (value.length) {
      this.setState(
        {
          value: value.slice(0, -1),
          valueChanged: true,
        },
        this.handleChange,
      );
    }
  };

  render() {
    const {
      appId,
      cell,
      className,
      disabled,
      error,
      editable,
      ignoreErrorMessage,
      isediting,
      onClick,
      projectId,
      rowIndex,
      singleLine,
      style,
    } = this.props;
    const { value, validateResult } = this.state;
    const single = cell.enumDefault === 0;

    if (disabled) {
      return (
        <div>
          {!_.isEmpty(value) && (
            <div className={cx('cellUsers cellControl', { singleLine })}>
              {value.map(user => this.renderCellUser(user))}
            </div>
          )}
        </div>
      );
    }

    const canSelectUser = this.canSelectUser();
    const userRange = isediting && canSelectUser ? this.getUserRange() : undefined;
    const selectedAccountIds = value.map(item => item.accountId);
    const hasUserRange = Object.values(userRange || {}).some(item => !_.isEmpty(item));
    const prefixAccounts =
      !_.includes(selectedAccountIds, md.global.Account.accountId) && !hasUserRange
        ? [
            {
              accountId: md.global.Account.accountId,
              fullname: md.global.Account.fullname,
              avatar: md.global.Account.avatar,
            },
          ]
        : [];

    return (
      <EditableCellCon
        onClick={onClick}
        className={cx(className, { canedit: editable })}
        style={style}
        iconName="people_5"
        isediting={isediting}
        onIconClick={this.handleEdit}
      >
        <UserSelectPopover
          open={isediting && canSelectUser}
          onOpenChange={this.handleUserSelectOpenChange}
          selectRangeOptions={userRange}
          tabType={getTabTypeBySelectUser(cell)}
          appId={appId}
          prefixAccounts={prefixAccounts}
          selectedAccountIds={selectedAccountIds}
          isDynamic={!single}
          filterOtherProject={cell.enumDefault2 === 2}
          SelectUserSettings={{
            unique: single,
            projectId,
            selectedAccountIds,
            callback: selected => this.handleUserSelect(selected, true),
          }}
          onSelect={this.handleQuickUserSelect}
        >
          {!_.isEmpty(value) ? (
            <div className={cx('cellUsers cellControl', { singleLine })}>
              {value.map(user => this.renderCellUser(user))}
            </div>
          ) : (
            <div className="w100 h100"></div>
          )}
        </UserSelectPopover>
        {isediting && error && single && (
          <CellErrorTip
            color={ignoreErrorMessage || validateResult?.ignoreErrorMessage ? 'var(--color-warning)' : undefined}
            pos={rowIndex === 0 ? 'bottom' : 'top'}
            error={error}
          />
        )}
      </EditableCellCon>
    );
  }
}
