import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import MobilePhoneEdit from 'src/components/newCustomFields/widgets/MobilePhone';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import CellErrorTips from './comps/CellErrorTip';
const ClickAwayable = createDecoratedComponent(withClickAway);
import EditableCellCon from '../EditableCellCon';
import renderText from './renderText';

export default class MobilePhone extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.shape({}),
    editable: PropTypes.bool,
    isediting: PropTypes.bool,
    updateCell: PropTypes.func,
    popupContainer: PropTypes.any,
    cell: PropTypes.shape({ value: PropTypes.string }),
    value: PropTypes.string,
    needLineLimit: PropTypes.bool,
    updateEditingStatus: PropTypes.func,
    onClick: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      value: props.cell.value,
      tempValue: props.cell.value,
    };
  }

  editRef = React.createRef();

  get editPhoneObj() {
    try {
      return this.editRef.current.iti;
    } catch (err) {
      return undefined;
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.cell.value !== this.props.cell.value) {
      this.setState({ value: nextProps.cell.value });
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isediting && this.props.isediting) {
      this.focus();
    }
  }

  con = React.createRef();
  input = React.createRef();

  @autobind
  handleExit() {
    const { cell, updateEditingStatus } = this.props;
    updateEditingStatus(false);
    this.setState({
      value: cell.value,
      tempValue: cell.value,
    });
  }

  @autobind
  handleEdit(e) {
    const { updateEditingStatus } = this.props;
    e.stopPropagation();
    updateEditingStatus(true);
    if (this.listened) {
      return;
    }
  }

  @autobind
  handleBlur(target) {
    const { error, updateCell, updateEditingStatus } = this.props;
    const { tempValue, value } = this.state;
    if (error) {
      this.handleExit();
      return;
    }
    if (tempValue === value) {
      updateEditingStatus(false);
      return;
    }
    updateCell({
      value: tempValue,
    });
    this.setState({
      value: tempValue,
    });
    updateEditingStatus(false);
    this.lastBlurTime = null;
  }

  focus(time) {
    setTimeout(() => {
      if (this.editPhoneObj) {
        this.editPhoneObj.telInput.focus();
      }
    }, time || 100);
  }

  @autobind
  async handleChange(value) {
    const { cell, onValidate } = this.props;
    onValidate(value);
    this.setState({
      tempValue: value,
    });
  }

  @autobind
  handleKeydown(e) {
    const { cell, updateEditingStatus } = this.props;
    if (e.keyCode === 27) {
      updateEditingStatus(false);
      this.setState({
        value: cell.value,
      });
      e.preventDefault();
    }
  }

  render() {
    const { className, style, error, rowIndex, needLineLimit, cell, popupContainer, editable, isediting, onClick } =
      this.props;
    const { value } = this.state;
    const isSafari = /^((?!chrome).)*safari.*$/.test(navigator.userAgent.toLowerCase());
    const editProps = {
      ref: this.input,
      value,
      style: {
        width: style.width,
        height: style.height,
        padding: '7px 0px',
      },
      onClick: e => e.stopPropagation(),
    };
    const editcontent = (
      <ClickAwayable
        {...editProps}
        onClickAwayExceptions={[this.editIcon && this.editIcon.current]}
        onClickAway={this.handleBlur}
      >
        <MobilePhoneEdit
          inputClassName="cellMobileInput"
          enumDefault={cell.enumDefault}
          advancedSetting={cell.advancedSetting}
          value={value}
          ref={this.editRef}
          onChange={this.handleChange}
          onInputKeydown={this.handleKeydown}
        />
        {error && (
          <CellErrorTips
            error={typeof error === 'string' ? error : _l('不是有效的电话号码')}
            pos={rowIndex === 1 ? 'bottom' : 'top'}
          />
        )}
      </ClickAwayable>
    );
    return (
      <Trigger
        destroyPopupOnHide={!(navigator.userAgent.match(/[Ss]afari/) && !navigator.userAgent.match(/[Cc]hrome/))} // 不是 Safari
        action={['click']}
        popup={editcontent}
        getPopupContainer={isSafari ? undefined : cell.enumDefault === 0 ? () => document.body : popupContainer}
        popupClassName={cx('filterTrigger cellControlMobilePhoneEdit scrollInTable cellControlEdittingStatus', {
          cellControlErrorStatus: error,
        })}
        popupVisible={isediting}
        popupAlign={{
          points: ['tl', 'tl'],
          overflow: {
            adjustY: true,
          },
        }}
      >
        <EditableCellCon
          hideOutline
          onClick={onClick}
          className={cx(className, { canedit: editable })}
          style={style}
          iconName="hr_edit"
          isediting={isediting}
          onIconClick={this.handleEdit}
        >
          {!isediting && !!value && (
            <div className={cx('worksheetCellPureString ellipsis', { linelimit: needLineLimit })}>
              {renderText({ ...cell, value })}
            </div>
          )}
        </EditableCellCon>
      </Trigger>
    );
  }
}
