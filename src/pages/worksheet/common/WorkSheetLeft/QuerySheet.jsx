import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import ClickAway from 'ming-ui/components/ClickAway';
import LoadDiv from 'ming-ui/components/LoadDiv';
import sheetAjax from 'src/api/worksheet';
import WorkSheetItem from './WorkSheetItem';

const ClickAwayable = ClickAway;
export default class QuerySheet extends Component {
  static propTypes = {
    sheetActions: PropTypes.object,
  };
  constructor(props) {
    super(props);
    this.state = {
      keyWords: '',
      workSheetList: [],
      isLoading: false,
      listVisible: false,
    };
    this.searchSheet = _.debounce(this.getSearchData, 500);
  }
  hideSearchList = function () {
    this.setState({ listVisible: false });
  }.bind(this);
  renderSheetList() {
    const { workSheetList } = this.state;
    return workSheetList.map(
      (project, i) =>
        project.worksheets.length > 0 && (
          <div className="projectSheetList" key={i}>
            <div className="title textDisabled"> {project.projectId ? project.name : _l('个人')} </div>
            {project.worksheets.map((sheet, index) => (
              <WorkSheetItem
                className="hoverBgColorPrimaryDark"
                showRight={false}
                key={index}
                sheetInfo={sheet}
                name={sheet.name}
                count={sheet.count}
                sheetActions={this.props.sheetActions}
                hideSearchList={this.hideSearchList}
              />
            ))}
          </div>
        ),
    );
  }
  getSearchData = function () {
    this.setState({ listVisible: !!this.state.keyWords, isLoading: true });
    sheetAjax.getWorksheets({ keyWords: this.state.keyWords }).then(data => {
      this.setState({
        listVisible: !!this.state.keyWords,
        workSheetList: data,
        isLoading: false,
      });
    });
  }.bind(this);
  render() {
    const { workSheetList, isLoading, listVisible } = this.state;
    return (
      <div className="querySheet Relative">
        <div className="search borderSecondary">
          <i
            className="icon icon-search pointer textSecondary"
            onClick={() => {
              this.setState({ isLoading: true });
              sheetAjax.getWorksheets({ keyWords: this.state.keyWords }).then(data => {
                this.setState({
                  listVisible: !!this.state.keyWords,
                  keyWords: this.state.keyWords,
                  workSheetList: data,
                  isLoading: false,
                });
              });
            }}
          />
          <input
            className="ming Input textPrimary flex"
            placeholder={_l('搜索工作表')}
            value={this.state.keyWords}
            onChange={event => {
              this.setState({
                keyWords: event.target.value,
                isLoading: true,
              });
            }}
            onFocus={() => {
              $('.worksheet .workSheetLeft .querySheet .search')
                .removeClass('borderSecondary')
                .addClass('borderColorPrimary');
            }}
            onBlur={() => {
              $('.worksheet .workSheetLeft .querySheet .search')
                .removeClass('borderColorPrimary')
                .addClass('borderSecondary');
            }}
            onKeyUp={() => {
              this.setState({ isLoading: true });
              this.searchSheet();
            }}
          />
          {this.state.keyWords && (
            <span
              className="clean Right LineHeight36 pointer"
              onClick={() => {
                this.setState({ listVisible: false, keyWords: '' });
              }}
            >
              <Icon icon="cancel textTertiary Font14" />
            </span>
          )}
        </div>
        {listVisible && (
          <ClickAwayable
            className="searchList"
            onClickAwayExceptions={['.querySheet input']}
            onClickAway={() => {
              this.setState({
                listVisible: false,
              });
            }}
          >
            {isLoading && <LoadDiv className="mTop12 mBottom12" />}
            {!isLoading &&
              (workSheetList.filter(item => item.worksheets.length > 0).length > 0 ? (
                <div className="sheetList">{this.renderSheetList()}</div>
              ) : (
                <div className="empty textDisabled">{_l('无匹配的工作表')}</div>
              ))}
          </ClickAwayable>
        )}
      </div>
    );
  }
}
