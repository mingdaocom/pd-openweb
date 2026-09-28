import React, { Fragment } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Divider, Input, Menu, Select } from 'ming-ui/antd-components';
import homeAppAjax from 'src/api/homeApp';
import worksheetAjax from 'src/api/worksheet';
import DeletedSourceMessage from 'src/components/AppSandbox/environment/DeletedSourceMessage';
import { getTranslateInfo } from 'src/utils/services/app';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import SelectOtherWorksheetDialog from './SelectOtherWorksheetDialog';

const CUSTOM_TRIGGER_VALUE = '__select_worksheet_custom_trigger__';

export default class SelectWroksheet extends React.Component {
  static propTypes = {
    projectId: PropTypes.string, // 当前网络 id
    worksheetType: PropTypes.number, // 工作表类型 0: 工作表 1: 自定义页面
    appId: PropTypes.string, // 当前应用 id
    currentWorksheetId: PropTypes.string, // 当前工作表 用来添加（本表）标识
    hint: PropTypes.string, // 空提示
    value: PropTypes.string, // 选中的工作表 id
    searchable: PropTypes.bool,
    filterIds: PropTypes.arrayOf(PropTypes.string),
    disabled: PropTypes.bool,
    dropdownElement: PropTypes.element,
    onChange: PropTypes.func, // 回掉 (newappId, worksheetId)
  };

  static defaultProps = {
    onChange: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      popupVisible: false,
      searchValue: '',
      worksheets: [],
      selectOtherVisible: false,
    };
  }

  componentDidMount() {
    const { appId, value, worksheetType } = this.props;
    this.loadWorksheets(appId, value, worksheetType);
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.appId !== prevProps.appId || this.props.worksheetType !== prevProps.worksheetType) {
        this.loadWorksheets(this.props.appId, this.props.value, this.props.worksheetType);
        return;
      }

      if (this.props.value !== prevProps.value) {
        this.loadSelectedWorksheet(this.props.value, this.props.worksheetType);
      }
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
      .catch(_requestError => {
        alertIfNotUnauthorized(_requestError, _l('程序发生错误'), 3);
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
    this.setState({ popupVisible: false, searchValue: '' });
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

  handleOpenChange = popupVisible => {
    if (this.props.dropdownElement && popupVisible) {
      return;
    }

    this.setState({
      popupVisible,
      ...(!popupVisible ? { searchValue: '' } : {}),
    });
  };

  renderSelectLabel = () => {
    const { value, currentWorksheetId, hint, from, worksheetType } = this.props;
    const { loading, selectedWorksheet } = this.state;

    if (loading) {
      return _l('加载中...');
    }

    if (selectedWorksheet) {
      return (
        <span>
          {selectedWorksheet.name}
          {from !== 'customPage' &&
            selectedWorksheet.id === currentWorksheetId &&
            worksheetType !== 1 &&
            _l('（本表）')}
        </span>
      );
    }

    if (value) {
      return (
        <span onMouseDown={event => event.target.closest?.('a') && event.stopPropagation()}>
          <DeletedSourceMessage deletedText={_l('应用项无权限或者已删除')} worksheetId={value} />
        </span>
      );
    }

    return (
      <span className="textTertiary">
        {hint || (worksheetType === 1 ? _l('选择您管理的自定义页面') : _l('选择您管理的工作表'))}
      </span>
    );
  };

  handleSelectOtherChange = (newappId, worksheetId, worksheet) => {
    const { currentWorksheetId } = this.props;
    this.props.onChange(newappId, worksheetId, worksheet);
    if (!worksheet || worksheet.workSheetId === currentWorksheetId) {
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
      value,
      dialogClassName,
      projectId,
      appId,
      currentWorksheetId,
      from,
      worksheetType,
      dropdownElement,
      searchable = true,
      filterIds = [],
      disabled,
    } = this.props;
    const { loading, popupVisible, searchValue, worksheets, selectOtherVisible, selectedWorksheet } = this.state;
    const selectLabel = this.renderSelectLabel();
    const options = worksheets
      .filter(worksheet => worksheet.workSheetName.includes(searchValue))
      .map(worksheet => ({
        value: worksheet.workSheetId,
        label: (
          <span>
            {worksheet.workSheetName}
            {worksheet.workSheetId === currentWorksheetId && from !== 'customPage' && _l('（本表）')}
          </span>
        ),
        disabled: filterIds.includes(worksheet.workSheetId),
        worksheet,
      }));

    return (
      <div className="selectWorksheetCommon w100">
        <Select
          className="w100"
          disabled={disabled}
          open={popupVisible}
          onOpenChange={this.handleOpenChange}
          onClick={dropdownElement ? () => this.setState({ popupVisible: true }) : undefined}
          components={dropdownElement ? { root: dropdownElement } : undefined}
          value={dropdownElement ? CUSTOM_TRIGGER_VALUE : selectedWorksheet?.id || value || undefined}
          placeholder={selectLabel}
          labelRender={() => selectLabel}
          loading={loading}
          showSearch={false}
          listHeight={200}
          options={options}
          notFoundContent={<span className="textTertiary">{loading ? _l('加载中...') : _l('暂无搜索结果')}</span>}
          onChange={(_, option) => this.handleSelect(option.worksheet)}
          popupRender={menu => (
            <Fragment>
              {searchable && (
                <Input
                  autoFocus
                  variant="borderless"
                  placeholder={_l('搜索工作表')}
                  prefix={<i className="icon-search textTertiary Font20" />}
                  value={searchValue}
                  onChange={event => this.setState({ searchValue: event.target.value })}
                  onKeyDown={event => event.stopPropagation()}
                />
              )}
              {searchable && <Divider className="mTop2 mBottom5" />}
              {menu}
              {!loading && (
                <Fragment>
                  <Divider className="mTop5 mBottom5" />
                  <Menu
                    selectable={false}
                    items={[
                      {
                        key: 'selectOtherWorksheet',
                        label: _l('选择其他应用下的%0', worksheetType === 1 ? _l('自定义页面') : _l('工作表')),
                      },
                    ]}
                    onClick={() => {
                      this.setState({ popupVisible: false, searchValue: '', selectOtherVisible: true });
                    }}
                  />
                </Fragment>
              )}
            </Fragment>
          )}
        />
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
