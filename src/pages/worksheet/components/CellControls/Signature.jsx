import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import SignatureComp from 'src/components/newCustomFields/widgets/Signature';
import { WORKSHEETTABLE_FROM_MODULE } from 'worksheet/constants/enum';
import EditableCellCon from '../EditableCellCon';
import { FROM } from './enum';
export default class Date extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.shape({}),
    rowHeight: PropTypes.number,
    editable: PropTypes.bool,
    isediting: PropTypes.bool,
    updateCell: PropTypes.func,
    popupContainer: PropTypes.any,
    cell: PropTypes.shape({ value: PropTypes.string }),
    value: PropTypes.string,
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

  editIcon = React.createRef();

  @autobind
  handleChange(value) {
    const { updateCell, updateEditingStatus } = this.props;
    const data = JSON.parse(value);
    updateCell({
      value,
    });
    this.setState({
      value: md.global.FileStoreConfig[data.bucket === 4 ? 'pictureHost' : 'pubHost'] + data.key,
    });
    updateEditingStatus(false);
  }

  previewAttachment(value) {
    const {
      cell: { controlName },
    } = this.props;
    require(['previewAttachments'], previewAttachments => {
      previewAttachments({
        index: 0,
        attachments: [
          {
            name: controlName + '.png',
            path: value,
            previewAttachmentType: 'QINIU',
          },
        ],
        showThumbnail: true,
        hideFunctions: ['editFileName'],
      });
    });
  }

  renderCommon() {
    const { rowHeight } = this.props;
    let { value } = this.state;
    if (value[0] === '{') {
      try {
        value = `${md.global.FileStoreConfig.pictureHost + JSON.parse(value).key}`;
      } catch (err) {
        value = '';
      }
    }
    return (
      <div
        onClick={e => {
          this.previewAttachment(value);
          e.stopPropagation();
        }}
        className="cellAttachment cellAttachmentSignature ellipsis Hand"
        style={{ height: rowHeight - 10 }}
      >
        <img
          style={{ height: rowHeight - 10 }}
          crossOrigin="anonymous"
          className="thumbnail"
          role="presentation"
          src={value}
        />
      </div>
    );
  }

  render() {
    const { from, tableFromModule, className, style, popupContainer, editable, isediting, updateEditingStatus } =
      this.props;
    const { value } = this.state;
    if (from === FROM.CARD) {
      return value ? <div className="cellAttachments cellControl"> {this.renderCommon()} </div> : <span />;
    }
    return (
      <SignatureComp
        onlySignature
        isEdit
        destroyPopupOnHide={!(navigator.userAgent.match(/[Ss]afari/) && !navigator.userAgent.match(/[Cc]hrome/))} // 不是 Safari
        popupAlign={{
          offset: [0, 2],
          points: ['tl', 'bl'],
          overflow: { adjustX: true, adjustY: true },
        }}
        visible={isediting}
        popupContainer={tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST ? document.body : popupContainer()}
        onClose={() => {
          updateEditingStatus(false);
        }}
        onChange={this.handleChange}
      >
        <EditableCellCon
          onClick={this.props.onClick}
          className={cx(className, { canedit: editable })}
          style={style}
          iconRef={this.editIcon}
          iconName="hr_edit"
          iconClassName="dateEditIcon"
          isediting={isediting}
          onIconClick={() => {
            updateEditingStatus(true);
          }}
        >
          {!!value && <div className="cellAttachments cellControl"> {this.renderCommon()} </div>}
        </EditableCellCon>
      </SignatureComp>
    );
  }
}
