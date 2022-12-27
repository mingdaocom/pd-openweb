import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import _ from 'lodash';
import SignatureComp from 'src/components/newCustomFields/widgets/Signature';
import { WORKSHEETTABLE_FROM_MODULE } from 'worksheet/constants/enum';
import EditableCellCon from '../EditableCellCon';
import { FROM } from './enum';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { browserIsMobile } from 'src/util';

export default class Signature extends React.Component {
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
  editRef = React.createRef();

  @autobind
  handleTableKeyDown(e) {
    const { updateEditingStatus } = this.props;
    switch (e.key) {
      case 'Escape':
        updateEditingStatus(false);
        break;
      case 'Enter':
        if (_.get(this, 'editRef.current.state.isEdit') && _.isFunction(_.get(this, 'editRef.current.saveSignature'))) {
          _.get(this, 'editRef.current.saveSignature')();
        }
        break;
      default:
        break;
    }
  }

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
  }

  renderCommon() {
    const { rowHeight = 34 } = this.props;
    let { value } = this.state;
    if (value[0] === '{') {
      try {
        value = `${md.global.FileStoreConfig.pictureHost + JSON.parse(value).key}`;
      } catch (err) {
        value = '';
      }
    }
    return (
      <div className="cellAttachment cellAttachmentSignature ellipsis Hand" style={{ height: rowHeight - 10 }}>
        <img
          style={{ height: rowHeight - 10 }}
          crossOrigin="anonymous"
          className="thumbnail"
          role="presentation"
          src={value}
          onClick={e => {
            this.previewAttachment(value);
            e.stopPropagation();
          }}
        />
      </div>
    );
  }

  render() {
    const { from, cell, tableFromModule, className, style, popupContainer, editable, isediting, updateEditingStatus } =
      this.props;
    const { value } = this.state;
    if (from === FROM.CARD || (from === FROM.DRAFT && browserIsMobile())) {
      return value ? <div className="cellAttachments cellControl"> {this.renderCommon()} </div> : <span />;
    }
    return (
      <SignatureComp
        ref={this.editRef}
        onlySignature
        isEdit
        advancedSetting={cell.advancedSetting}
        destroyPopupOnHide={!(navigator.userAgent.match(/[Ss]afari/) && !navigator.userAgent.match(/[Cc]hrome/))} // 不是 Safari
        popupAlign={{
          offset: [1, 2],
          points: ['tl', 'bl'],
          overflow: { adjustX: true, adjustY: true },
        }}
        visible={isediting}
        popupContainer={
          tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST ||
          tableFromModule === WORKSHEETTABLE_FROM_MODULE.RELATE_RECORD
            ? document.body
            : popupContainer()
        }
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
