import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Input, ScrollView } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import homeAppAjax from 'src/api/homeApp';
import DropdownWrapper from '../DropdownWrapper';
import cx from 'classnames';
import SelectOtherWorksheetDialog from './SelectOtherWorksheetDialog';
import { getTranslateInfo } from 'src/util';
import './SelectWorksheet.less';
import _ from 'lodash';

const SearchWrap = styled.div`
  padding: 0 40px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 6px;
  margin-bottom: 6px;
  input.Input {
    width: 100%;
    border: none;
  }
  i {
    position: absolute;
    top: 12px;
    left: 20px;
    font-size: 24px;
  }
`;
function WorksheetList(props) {
  const {
    searchable = true,
    loading,
    worksheets,
    currentWorksheetId,
    handleSelect,
    showSelectOther,
    hide,
    from,
    worksheetType,
    filterIds = [],
  } = props;
  const [searchValue, setSearchValue] = useState('');
  const filterSheets = () => worksheets.filter(item => item.workSheetName.includes(searchValue));
  return (
    <div className="selectWorksheetCommonContent">
      {loading && <div className="loadingCon">loading</div>}
      {!loading && (
        <div className="worksheetList">
          {searchable && (
            <SearchWrap>
              <i className="icon-search Gray_9e"></i>
              <Input autoFocus placeholder={_l('搜索工作表')} value={searchValue} onChange={setSearchValue} />
            </SearchWrap>
          )}
          <ScrollView style={{ maxHeight: 200 }}>
            {filterSheets().map(worksheet => (
              <div
                className={cx(
                  'worksheetItem overflow_ellipsis ',
                  filterIds.includes(worksheet.workSheetId) ? 'disable' : 'Hand',
                )}
                onClick={() => {
                  if (filterIds.includes(worksheet.workSheetId)) {
                    return;
                  }
                  hide();
                  handleSelect(worksheet);
                }}
              >
                {worksheet.workSheetName}
                {worksheet.workSheetId === currentWorksheetId && from !== 'customPage' && _l('（本表）')}
              </div>
            ))}
          </ScrollView>
          <div className="selectOhterApp">
            <div
              className="worksheetItem Hand"
              onClick={() => {
                hide();
                showSelectOther();
              }}
            >
              {_l('选择其他应用下的%0', worksheetType === 1 ? _l('自定义页面') : _l('工作表'))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

WorksheetList.propTypes = {
  currentWorksheetId: PropTypes.string,
  loading: PropTypes.bool,
  worksheets: PropTypes.arrayOf(PropTypes.shape({})),
  handleSelect: PropTypes.func,
  showSelectOther: PropTypes.func,
  hide: PropTypes.func,
};

export default class SelectWroksheet extends React.Component {
  static propTypes = {
    projectId: PropTypes.string, // 当前网络 id
    worksheetType: PropTypes.number, // 工作表类型 0: 工作表 1: 自定义页面
    appId: PropTypes.string, // 当前应用 id
    currentWorksheetId: PropTypes.string, // 当前工作表 用来添加（本表）标识
    hint: PropTypes.string, // 空提示
    value: PropTypes.string, // 选中的工作表 id
    onChange: PropTypes.func, // 回掉 (newappId, worksheetId)
  };

  static defaultProps = {
    onChange: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      worksheets: [],
      selectOtherVisible: false,
    };
  }

  componentDidMount() {
    const { appId, value, worksheetType } = this.props;
    this.loadWorksheets(appId, value, worksheetType);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.appId !== this.props.appId || nextProps.worksheetType !== this.props.worksheetType) {
      this.loadWorksheets(nextProps.appId, nextProps.value, nextProps.worksheetType);
      return;
    }
    if (nextProps.value !== this.props.value) {
      this.loadSelectedWorksheet(nextProps.value, nextProps.worksheetType);
    }
  }

  loadWorksheets(appId, worksheetId, worksheetType) {
    homeAppAjax
      .getWorksheetsByAppId({ appId, type: worksheetType })
      .then(data => {
        this.setState(
          {
            loading: false,
            worksheets: data.map(sheet => {
              return {
                ...sheet,
                workSheetName: getTranslateInfo(appId, null, sheet.workSheetId).name || sheet.workSheetName,
              };
            }),
          },
          () => {
            this.loadSelectedWorksheet(worksheetId, worksheetType);
          },
        );
      })
      .catch(err => {
        alert(_l('程序发生错误'), 3);
      });
  }

  loadSelectedWorksheet(worksheetId, worksheetType) {
    if (!worksheetId) {
      this.setState({ selectedWorksheet: null });
      return;
    }
    const { worksheets, selectedWorksheet } = this.state;
    if (selectedWorksheet && selectedWorksheet.id === worksheetId) {
      return;
    }
    const newSelectedWorksheet = _.find(worksheets, worksheet => worksheet.workSheetId === worksheetId);
    if (newSelectedWorksheet) {
      this.setState({
        selectedWorksheet: {
          name: newSelectedWorksheet.workSheetName,
          id: newSelectedWorksheet.workSheetId,
        },
      });
    } else {
      (worksheetType === 1
        ? homeAppAjax.getPageInfo({ id: worksheetId })
        : worksheetAjax.getWorksheetInfo({ worksheetId })
      ).then(data => {
        if (data.name) {
          this.setState({
            selectedWorksheet: {
              name: data.name,
              id: data.worksheetId,
            },
          });
        }
      });
    }
  }

  handleSelect = worksheet => {
    const { appId, currentWorksheetId } = this.props;
    this.props.onChange(appId, worksheet.workSheetId, worksheet);
    if (worksheet.workSheetId === currentWorksheetId) {
      return;
    }
    this.setState({
      selectedWorksheet: {
        name: worksheet.workSheetName,
        id: worksheet.workSheetId,
      },
    });
  };

  handleSelectOtherChange = (newappId, worksheetId, worksheet) => {
    const { currentWorksheetId } = this.props;
    this.props.onChange(newappId, worksheetId, worksheet);
    if (worksheet.workSheetId === currentWorksheetId) {
      return;
    }
    this.setState({
      selectedWorksheet: {
        name: worksheet.workSheetName,
        id: worksheet.workSheetId,
      },
    });
  };

  render() {
    const {
      className,
      dialogClassName,
      projectId,
      appId,
      currentWorksheetId,
      hint,
      from,
      worksheetType,
      dropdownElement,
    } = this.props;
    const { loading, worksheets, selectOtherVisible, selectedWorksheet } = this.state;
    return (
      <div className={cx('selectWorksheetCommon ming Dropdown w100')}>
        <DropdownWrapper
          className="w100"
          downElement={
            <WorksheetList
              {...{ loading, worksheets }}
              {..._.pick(this.props, ['currentWorksheetId', 'from', 'worksheetType', 'searchable', 'filterIds'])}
              handleSelect={this.handleSelect}
              showSelectOther={() => {
                this.setState({ selectOtherVisible: true });
              }}
            />
          }
        >
          {dropdownElement ? (
            dropdownElement
          ) : (
            <div className="Dropdown--input Dropdown--border">
              <React.Fragment>
                <span>
                  {!loading && !selectedWorksheet && (
                    <div className="Gray_a">
                      {hint || (worksheetType === 1 ? _l('选择您管理的自定义页面') : _l('选择您管理的工作表'))}
                    </div>
                  )}
                  {loading && _l('  加载中...')}
                  {!loading && selectedWorksheet && selectedWorksheet.name}
                  {!loading &&
                    from !== 'customPage' &&
                    selectedWorksheet &&
                    selectedWorksheet.id === currentWorksheetId &&
                    worksheetType !== 1 &&
                    _l('（本表）')}
                </span>
                <div className="ming Icon icon icon-arrow-down-border mLeft8 Gray_9e" />
              </React.Fragment>
            </div>
          )}
        </DropdownWrapper>
        {selectOtherVisible && (
          <SelectOtherWorksheetDialog
            worksheetType={worksheetType}
            className={dialogClassName}
            projectId={projectId}
            selectedAppId={appId}
            selectedWorksheetId={selectedWorksheet && selectedWorksheet.id}
            visible
            onHide={() => {
              this.setState({ selectOtherVisible: false });
            }}
            onOk={this.handleSelectOtherChange}
          />
        )}
      </div>
    );
  }
}
