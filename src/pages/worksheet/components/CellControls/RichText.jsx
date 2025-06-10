import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import filterXss from 'xss';
import { Dialog, RichText } from 'ming-ui';
import { renderText } from 'src/utils/control';
import EditableCellCon from '../EditableCellCon';

/**
 * regexFilter 正则方式过滤 html标签
 * 优点：快
 * 缺点：转义后的字符没有处理 (可以用 https://github.com/mathiasbynens/he 处理)
 */
export function regexFilterHtmlScript(str) {
  return filterXss(str).replace(/(<([^>]+)>)/gi, '');
}
export default class Text extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.shape({}),
    editable: PropTypes.bool,
    isediting: PropTypes.bool,
    updateCell: PropTypes.func,
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
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.cell.value !== this.props.cell.value) {
      this.setState({ value: nextProps.cell.value });
    }
  }

  handleTableKeyDown = e => {
    const { updateEditingStatus } = this.props;
    switch (e.key) {
      case 'Escape':
        this.handleChange();
        updateEditingStatus(false);
        break;
      default:
        break;
    }
  };

  handleChange = () => {
    const { cell, updateCell } = this.props;
    if ((cell.value || '') === this.state.value) {
      return;
    }
    if (cell.required && !this.state.value) {
      alert(_l('保存失败，%0为必填字段', cell.controlName), 2);
      return;
    }
    updateCell({
      value: this.state.value,
    });
  };

  renderEditDialog() {
    const { cell, updateEditingStatus } = this.props;
    return (
      <Dialog
        visible
        title={cell.controlName}
        width={800}
        footer={null}
        anim={false}
        onCancel={() => {
          this.handleChange();
          updateEditingStatus(false);
        }}
      >
        <RichText
          autoFocus
          data={this.state.value || ''}
          minHeight={document.documentElement.clientHeight - 180}
          onSave={value => {
            this.setState({
              value,
            });
          }}
          className={cx('cellControlRichTextDialog')}
        />
      </Dialog>
    );
  }

  render() {
    const { className, style, needLineLimit, cell, editable, isediting, updateEditingStatus } = this.props;
    const { value } = this.state;
    return (
      <EditableCellCon
        onClick={this.props.onClick}
        className={cx(className, { canedit: editable })}
        style={style}
        iconName="hr_edit"
        isediting={isediting}
        onIconClick={() => {
          updateEditingStatus(true);
        }}
      >
        {isediting && this.renderEditDialog()}
        {!!value && (
          <div
            className={cx('worksheetCellPureString', { linelimit: needLineLimit })}
            title={regexFilterHtmlScript(value)}
          >
            {renderText({ ...cell, value })}
          </div>
        )}
      </EditableCellCon>
    );
  }
}
