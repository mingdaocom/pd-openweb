import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { initBoardViewData } from 'src/pages/worksheet/redux/actions/boardView';
import { updateFilters } from 'worksheet/redux/actions';
import ViewErrorPage from '../components/ViewErrorPage';
import _ from 'lodash';
import styled from 'styled-components';

const Container = styled.div`
  height: 100%;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
`;

class MobileBoardView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keyWords: '',
      Component: null,
    };
  }
  componentDidMount() {
    import('src/pages/worksheet/views/BoardView').then(component => {
      this.setState({ Component: component.default });
    });
  }
  render() {
    const { view = {}, controls = [] } = this.props;
    const { viewControl } = view;
    const isHaveSelectControl = viewControl && _.find(controls, item => item.controlId === viewControl);
    const { Component } = this.state;

    // 视图配置错误
    if (!isHaveSelectControl) {
      return <ViewErrorPage icon={'kanban'} viewName={_l('看板视图')} color="#4CAF50" />;
    }

    if (!Component) return null;

    return (
      <Container>
        <div className="flex Relative">
          <Component {...this.props} />
        </div>
      </Container>
    );
  }
}

export default connect(
  state => ({
    controls: state.sheet.controls,
    boardData: state.sheet.boardView.boardData,
    currentSheetRows: state.mobile.currentSheetRows,
  }),
  dispatch => bindActionCreators({ initBoardViewData, updateFilters }, dispatch),
)(MobileBoardView);
