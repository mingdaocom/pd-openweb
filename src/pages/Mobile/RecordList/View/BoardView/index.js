import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import BoardView from 'src/pages/worksheet/views/BoardView';
import * as actions from 'src/pages/Mobile/RecordList/redux/actions';
import * as boardviewActions from 'src/pages/worksheet/redux/actions/boardView';
import ViewErrorPage from '../components/ViewErrorPage';

class MobileBoardView extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {}
  render() {
    const { view = {}, controls = [], currentSheetRows } = this.props;
    const { viewControl } = view;
    const isHaveSelectControl = viewControl && _.find(controls, item => item.controlId === viewControl);
    // 视图配置错误
    if (!isHaveSelectControl) {
      return (<ViewErrorPage
        icon={'kanban'} 
        viewName={_l('看板视图')} 
        color="#4CAF50" 
      />);
    }
    return (
      <BoardView {...this.props} />
    );
  }
}

export default connect(
  state => ({
    controls: state.sheet.controls,
    boardData: state.sheet.boardView.boardData,
    currentSheetRows: state.mobile.currentSheetRows,
  }),
  dispatch =>
    bindActionCreators(
      _.pick({...actions, ...boardviewActions}, ['initBoardViewData']),
      dispatch,
  ),
)(MobileBoardView);
