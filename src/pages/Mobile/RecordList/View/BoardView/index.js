import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Icon } from 'ming-ui';
import BoardView from 'src/pages/worksheet/views/BoardView';
import { initBoardViewData } from 'src/pages/worksheet/redux/actions/boardView';
import { updateFilters } from 'worksheet/redux/actions';
import ViewErrorPage from '../components/ViewErrorPage';
import _ from 'lodash';
import styled from 'styled-components';

const Container = styled.div`
  height: 100%;
  background-color: #f5f5f5f;
  display: flex;
  flex-direction: column;
`;
const SearchWraper = styled.div`
  margin: 15px 12px 0px;
  background-color: #fff;
  border-radius: 24px;
  padding: 7px 10px;
  display: flex;
  align-items: center;
`;

class MobileBoardView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keyWords: '',
    };
  }
  componentDidMount() {}
  render() {
    const { view = {}, controls = [], boardData = [] } = this.props;
    const { viewControl } = view;
    const isHaveSelectControl = viewControl && _.find(controls, item => item.controlId === viewControl);
    const { keyWords } = this.state;
    const totalRows = _.reduce(
      boardData,
      (total, item) => total + item.rows && _.isArray(item.rows) && item.rows.length,
      0,
    );
    // 视图配置错误
    if (!isHaveSelectControl) {
      return <ViewErrorPage icon={'kanban'} viewName={_l('看板视图')} color="#4CAF50" />;
    }
    return (
      <Container>
        <SearchWraper>
          <Icon icon="h5_search" className="Gray_9e Font17" />
          <input
            className="pAll0 Border0 w100 mLeft5 mRight5"
            placeholder={_l('搜索共%0条', totalRows)}
            value={keyWords}
            onChange={e => {
              let val = e.target.value;
              this.setState({ keyWords: val });
              if (!val.trim()) {
                this.props.updateFilters({ keyWords: '' }, view);
              }
            }}
            onKeyDown={e => {
              if (e.which === 13) {
                let val = e.target.value;
                this.props.updateFilters({ keyWords: (val || '').trim() }, view);
              }
            }}
          />
          {!!keyWords && (
            <Icon
              className="Gray_bd"
              icon="workflow_cancel"
              onClick={() => {
                this.setState({ keyWords: '' });
                this.props.updateFilters({ keyWords: '' }, view);
              }}
            />
          )}
        </SearchWraper>
        <div className="flex Relative">
          <BoardView {...this.props} />
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
