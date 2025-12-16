import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { WORKSHEETTABLE_FROM_MODULE } from 'worksheet/constants/enum';
import SignatureComp from 'src/components/Form/DesktopForm/widgets/Signature';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { browserIsMobile } from 'src/utils/common';
import { compatibleMDJS } from 'src/utils/project';
import EditableCellCon from '../EditableCellCon';
import { FROM } from './enum';

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

  handleTableKeyDown = e => {
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
  };

  handleChange = value => {
    const { updateCell, updateEditingStatus } = this.props;

    updateCell({ value });
    this.setState({ value });
    updateEditingStatus(false);
  };

  previewAttachment(value) {
    const {
      cell: { controlName },
    } = this.props;

    compatibleMDJS('previewSignature', { url: value }, () => {
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
    const { rowHeight = 34 } = this.props;
    const { value } = this.state;

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
    const {
      projectId,
      appId,
      worksheetId,
      from,
      cell,
      tableFromModule,
      className,
      style,
      popupContainer,
      editable,
      isediting,
      updateEditingStatus,
      fromEmbed,
    } = this.props;
    const { value } = this.state;
    if (from === FROM.CARD || (from === FROM.DRAFT && browserIsMobile())) {
      return value ? <div className="cellAttachments cellControl"> {this.renderCommon()} </div> : <span />;
    }
    return (
      <SignatureComp
        projectId={projectId}
        appId={appId}
        worksheetId={worksheetId}
        controlId={cell.controlId}
        ref={this.editRef}
        onlySignature
        isEdit
        advancedSetting={cell.advancedSetting}
        destroyPopupOnHide={!window.isSafari} // 不是 Safari
        popupAlign={{
          offset: [1, 2],
          points: ['tl', 'bl'],
          overflow: { adjustX: true, adjustY: true },
        }}
        visible={isediting}
        popupContainer={
          tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST ||
          tableFromModule === WORKSHEETTABLE_FROM_MODULE.RELATE_RECORD ||
          fromEmbed
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
