import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import CascaderDropdown from 'src/components/Form/DesktopForm/widgets/Cascader';
import { renderText } from 'src/utils/domain/control/display';
import { checkCellIsEmpty } from 'src/utils/domain/control/value';
import { WORKSHEETTABLE_FROM_MODULE } from 'src/utils/domain/worksheet/constants';
import { isKeyBoardInputChar } from 'src/utils/platform/browser/dom';
import EditableCellCon from '../EditableCellCon';

// 表格主体是 react-window 的 Grid（overflow: hidden + 固定高宽），级联面板挂进去会被裁剪，
// 子表、关联记录表格及嵌入场景与日期、选项单元格保持一致挂到 body
const getBodyPopupContainer = () => document.body;

export default class Cascader extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.shape({}),
    editable: PropTypes.bool,
    isediting: PropTypes.bool,
    cell: PropTypes.shape({ value: PropTypes.string }),
    updateCell: PropTypes.func,
    updateEditingStatus: PropTypes.func,
    onClick: PropTypes.func,
    popupContainer: PropTypes.any,
  };
  constructor(props) {
    super(props);
    this.state = {
      value: props.cell.value,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.cell.value !== prevProps.cell.value) {
        this.setState({
          value: this.props.cell.value,
        });
      }
    }
  }

  con = React.createRef();

  handleTableKeyDown = e => {
    const { isediting, updateEditingStatus } = this.props;

    switch (e.key) {
      default: {
        if (!e.isInputValue && (isediting || !e.key || !isKeyBoardInputChar(e.key))) {
          break;
        }

        updateEditingStatus(true, () => {});
        e.stopPropagation();
        e.preventDefault();
        break;
      }
    }
  };

  handleChange = value => {
    this.value = value;
    this.setState({
      value,
    });
  };

  render() {
    const {
      from,
      className,
      style,
      cell,
      editable,
      isediting,
      updateEditingStatus,
      updateCell,
      onValidate,
      onClick,
      worksheetId,
      recordId,
      rowFormData = () => {},
      popupContainer,
      tableFromModule,
      fromEmbed,
    } = this.props;
    const { value } = this.state;
    let cellPopupContainer = popupContainer;

    if (
      tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST ||
      tableFromModule === WORKSHEETTABLE_FROM_MODULE.RELATE_RECORD ||
      fromEmbed
    ) {
      cellPopupContainer = getBodyPopupContainer;
    }

    const editcontent = (
      <div className="cellControlCascaderPopup cellControlEdittingStatus bgPrimary" onClick={e => e.stopPropagation()}>
        <CascaderDropdown
          value={value}
          from={from}
          {...cell}
          recordId={recordId}
          visible={isediting}
          disabled={!editable}
          onChange={this.handleChange}
          worksheetId={worksheetId}
          formData={_.isFunction(rowFormData) ? rowFormData() : rowFormData}
          getPopupContainer={cellPopupContainer}
          onPopupVisibleChange={visible => {
            if (!visible) {
              if (!_.isUndefined(this.value)) {
                updateCell({
                  value: this.value,
                });
                // 级联通过浮层选择即时提交，不走输入/失焦校验流程；必填报错后重新选择需主动重新校验，
                // 以清掉持久化在 cellErrors 中的旧错误，否则错误状态不会重置。
                if (_.isFunction(onValidate)) {
                  onValidate(this.value);
                }
              }

              updateEditingStatus(false);
            }
          }}
        />
      </div>
    );
    return (
      <EditableCellCon
        conRef={this.con}
        onClick={onClick}
        className={cx(className, 'cellControlCascader', { canedit: editable, focusInput: editable })}
        style={style}
        isediting={isediting}
        hideOutline
        iconName={'arrow-down-border'}
        onIconClick={() => updateEditingStatus(true)}
      >
        {isediting ? (
          editcontent
        ) : (
          <div
            className="cellread linelimit"
            title={checkCellIsEmpty(value) ? '' : renderText({ ...cell, value }) || _l('未命名')}
          >
            {checkCellIsEmpty(value) ? '' : renderText({ ...cell, value }) || _l('未命名')}
          </div>
        )}
      </EditableCellCon>
    );
  }
}
