import PropTypes from 'prop-types';
import React from 'react';
import ScrollView from 'ming-ui/components/ScrollView';
import FileList from 'src/components/comment/FileList';
import Commenter from 'commenter';

export default class WorkSheetFileList extends React.Component {
  static propTypes = {
    worksheetId: PropTypes.string,
    rowId: PropTypes.string,
    projectId: PropTypes.string,
    disableScroll: PropTypes.bool,
  };
  handleScroll(event, values) {
    const { direction, maximum, position } = values;
    // filelist ignore event
    if (direction === 'down' && maximum - position < 20 && this.commentList) {
      // method of child component
      const { updatePageIndex } = this.commentList;
      updatePageIndex();
    }
  }
  render() {
    const { worksheetId, rowId } = this.props;
    const children = (
      <FileList
        sourceId={rowId ? worksheetId + '|' + rowId : worksheetId}
        appId={rowId ? md.global.APPInfo.worksheetRowAppID : md.global.APPInfo.worksheetAppID}
        sourceType={rowId ? Commenter.TYPES.WORKSHEETROW : Commenter.TYPES.WORKSHEET}
      />
    );
    return this.props.disableScroll ? (
      <div className="fileContentBox">{children}</div>
    ) : (
      <ScrollView className="fileContentBox">{children}</ScrollView>
    );
  }
}
