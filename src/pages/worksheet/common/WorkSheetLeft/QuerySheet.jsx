import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LoadDiv from 'ming-ui/components/LoadDiv';
import ScrollView from 'ming-ui/components/ScrollView';
import { Input, Icon } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import sheetAjax from 'src/api/worksheet';
import WorkSheetItem from './WorkSheetItem';
import { groupSheetList } from '../../util';
const ClickAwayable = createDecoratedComponent(withClickAway);

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
    return workSheetList.map((project, i) => (
      project.worksheets.length > 0 &&
      <div className="projectSheetList" key={i}>
        <div className="title Gray_bd"> {project.projectId ? project.name : _l('个人')} </div>
        {project.worksheets.map((sheet, index) => (
          <WorkSheetItem
            className="ThemeHoverBGColor3"
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
    ));
  }
  getSearchData = function () {
    this.setState({ listVisible: !!this.state.keyWords, isLoading: true });
    sheetAjax.getWorksheets({ keyWords: this.state.keyWords }).then((data) => {
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
        <div className="search ThemeBorderColor8">
          <i
            className="icon icon-search pointer ThemeColor9"
            onClick={() => {
              this.setState({ isLoading: true });
              sheetAjax.getWorksheets({ keyWords: this.state.keyWords }).then((data) => {
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
            className="ming Input ThemeColor10 flex"
            placeholder={_l('搜索工作表')}
            value={this.state.keyWords}
            onChange={(event) => {
              this.setState({
                keyWords: event.target.value,
                isLoading: true,
              });
            }}
            onFocus={() => {
              $('.worksheet .workSheetLeft .querySheet .search').removeClass('ThemeBorderColor8').addClass('ThemeBorderColor3');
            }}
            onBlur={() => {
              $('.worksheet .workSheetLeft .querySheet .search').removeClass('ThemeBorderColor3').addClass('ThemeBorderColor8');
            }}
            onKeyUp={() => {
              this.setState({ isLoading: true });
              this.searchSheet();
            }}
          />
          {this.state.keyWords && (
            <span className="clean Right LineHeight36 pointer" onClick={() => { this.setState({ listVisible: false, keyWords: '' }); }}>
              <Icon icon="closeelement-bg-circle ThemeColor8 Font14" />
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
            {isLoading && <LoadDiv className='mTop12 mBottom12' />}
            {!isLoading &&
              (workSheetList.filter(item => item.worksheets.length > 0).length > 0 ? (
                <div className="sheetList">{this.renderSheetList()}</div>
              ) : (
                <div className="empty Gray_bd">{_l('无匹配的工作表')}</div>
              ))}
          </ClickAwayable>
        )}
      </div>
    );
  }
}
