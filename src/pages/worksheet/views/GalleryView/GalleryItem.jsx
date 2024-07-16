import React, { createRef } from 'react';
import worksheetAjax from 'src/api/worksheet';
import EditableCard from '../components/EditableCard';
import EditingRecordItem from '../components/EditingRecordItem';
import RecordPortal from '../components/RecordPortal';
import sheetAjax from 'src/api/worksheet';
import _ from 'lodash';

export default class GalleryItem extends React.Component {
  static propTypes = {};
  static defaultProps = {};
  constructor(props) {
    super(props);
    this.$ref = createRef(null);
    this.state = { isEditTitle: false };
  }

  updateTitleData = control => {
    const { data, onUpdateFn, base, views } = this.props;
    const { viewId } = base;
    const view = views.find(o => o.viewId === viewId) || {};
    const newControl = control.controlId
      ? control
      : { ...(fields.find(o => o.controlId === Object.keys(control)[0]) || {}), value: Object.values(control)[0] };
    worksheetAjax
      .updateWorksheetRow({
        rowId: data.rowId,
        ..._.pick(view, ['worksheetId', 'viewId']),
        newOldControl: [newControl],
      })
      .then(({ data, resultCode }) => {
        if (data && resultCode === 1) {
          onUpdateFn([data.rowid], _.omit(data, ['allowedit', 'allowdelete']));
        }
      });
  };
  getStyle = () => {
    const $dom = this.$ref.current;
    if (!$dom) return {};
    const { top, left, width } = $dom.getBoundingClientRect();
    return { top, left, width };
  };
  onCloseEdit = () => {
    this.setState({ isEditTitle: false });
    $('.galleryScrollWrap .nano-content').css({ overflowY: 'auto' });
  };
  render() {
    const { sheetSwitchPermit, data, worksheetInfo, base, views, isCharge, fieldShowCount } = this.props;
    const { viewId, appId } = base;
    const view = views.find(o => o.viewId === viewId) || {};
    const { isEditTitle } = this.state;
    const { projectId } = worksheetInfo;
    return (
      <React.Fragment>
        <EditableCard
          ref={this.$ref}
          data={data}
          currentView={{
            ...view,
            projectId: projectId,
            appId,
          }}
          fieldShowCount={fieldShowCount}
          isCharge={isCharge}
          allowCopy={worksheetInfo.allowAdd && data.allowEdit}
          allowRecreate={worksheetInfo.allowAdd}
          sheetSwitchPermit={sheetSwitchPermit}
          editTitle={() => {
            this.setState({ isEditTitle: true });
            $('.galleryScrollWrap .nano-content').css({ overflowY: 'hidden' });
          }}
          onUpdate={(updated, item) => {
            this.props.onUpdateFn(updated, item);
          }}
          onDelete={() => {
            sheetAjax
              .deleteWorksheetRows({ rowIds: [data.rowId], ..._.pick(view, ['worksheetId', 'viewId']) })
              .then(res => {
                if (res.isSuccess) {
                  this.props.onDeleteFn(data.rowId);
                } else {
                  alert(_l('删除失败请稍后再试'), 2);
                }
              });
          }}
          onCopySuccess={this.props.onCopySuccess}
          updateTitleData={this.updateTitleData}
          onAdd={({ item }) => {
            this.props.onAdd(item);
          }}
        />
        {isEditTitle && (
          <RecordPortal closeEdit={this.onCloseEdit}>
            <EditingRecordItem
              type="board"
              currentView={view}
              data={data}
              fieldShowCount={fieldShowCount}
              style={{
                ...this.getStyle(),
              }}
              isCharge={isCharge}
              closeEdit={this.onCloseEdit}
              updateTitleData={this.updateTitleData}
            />
          </RecordPortal>
        )}
      </React.Fragment>
    );
  }
}
