import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon, ScrollView } from 'ming-ui';
import { Collapse, Dropdown } from 'antd';
import ControlItem from './components/ControlItem';
import CalculateControlItem from './components/CalculateControlItem';
import SheetModal from './components/SheetModal';
import TimeModal from './components/TimeModal';
import CalculateControlModal from './components/CalculateControlModal';
import { formatrChartTimeText, isTimeControl, getAlreadySelectControlId } from 'statistics/common';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'statistics/redux/actions';
import './index.less';

@connect(
  state => ({
    ..._.pick(state.statistics, ['currentReport', 'axisControls', 'worksheetInfo'])
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class DataSource extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
      timeModalVisible: false,
      sheetModalVisible: false,
      calculateControlModalVisible: false,
      currentAxisControls: this.formatAxisControls(props.axisControls),
      editCalculateControl: null,
    }
  }
  componentWillReceiveProps(nextProps) {
    const newViewId = _.get(nextProps, ['currentReport', 'filter', 'viewId']);
    const newFormulasLength = _.get(nextProps, ['currentReport', 'formulas', 'length']);
    if (
      !_.isEqual(nextProps.axisControls, this.props.axisControls) ||
      newViewId !== _.get(this.props, ['currentReport', 'filter', 'viewId'])
    ) {
      this.setState({
        currentAxisControls: this.formatAxisControls(nextProps.axisControls, newViewId),
      });
    }
    if (newFormulasLength > _.get(this.props, ['currentReport', 'formulas', 'length'])) {
      var el = document.querySelector('.chartDataSource .scrollWrapper');
      setTimeout(() => {
        el.nanoscroller.scrollTop(el.nanoscroller.maxScrollTop);
      }, 0);
    }
  }
  formatAxisControls = (axisControls, newViewId) => {
    const { worksheetInfo, ownerId, currentReport } = this.props;
    if (!ownerId) {
      return axisControls;
    } else {
      const { filter = {} } = currentReport;
      const view = _.find(worksheetInfo.views, { viewId: newViewId || filter.viewId });
      return axisControls.filter(item => {
        if (view && view.controls.includes(item.controlId)) {
          return false;
        }
        const control = _.find(worksheetInfo.columns, { controlId: item.controlId });
        if (control) {
          return controlState(control, 3).visible;
        }
        return true;
      });
    }
  }
  handleSearch = () => {
    const { axisControls } = this.props;
    const { searchValue } = this.state;
    if (searchValue) {
      const result = axisControls.filter(item => item.controlName.includes(searchValue));
      this.setState({
        currentAxisControls: this.formatAxisControls(result),
      });
    } else {
      const { axisControls } = this.props;
      this.setState({
        currentAxisControls: this.formatAxisControls(axisControls),
      });
    }
  }
  handleChangeCheckbox = (event, item) => {
    this.props.changeControlCheckbox(event, item);
  }
  renderHeader() {
    const { dataIsUnfold, onChangeDataIsUnfold } = this.props;
    if (dataIsUnfold) {
      return (
        <div className="flexRow valignWrapper horizontalPaddingWrapper">
          <div className="Bold Font18 Gray flex">{_l('数据源')}</div>
          <Icon className="Gray_9e Font18 pointer" icon="arrow-right-border" onClick={onChangeDataIsUnfold} />
        </div>
      );
    } else {
      return (
        <div className="flexColumn valignWrapper horizontalPaddingWrapper">
          <Icon className="Gray_9e Font18 pointer mTop5" icon="arrow-left-border" onClick={onChangeDataIsUnfold} />
          <div className="Bold Font18 Gray flex mTop15 AllBreak">{_l('数据源')}</div>
        </div>
      );
    }
  }
  renderSheet() {
    const { worksheetInfo, currentReport, sourceType, axisControls, appId, projectId, ownerId } = this.props;
    const { filter = {} } = currentReport;
    const view = _.find(worksheetInfo.views, { viewId: filter.viewId });
    const { sheetModalVisible } = this.state;
    return (
      <Fragment>
        <div className="mTop20 horizontalPaddingWrapper">
          <div
            className="sheetInfoWrapper flexRow valignWrapper pointer"
            onClick={() => {
              this.setState({ sheetModalVisible: true });
            }}
          >
            <span className="flex Font13 Bold">
              {worksheetInfo.name} {view ? `(${view.name})` : filter.viewId ? <span className="removeViewId">({_l('视图已被删除')})</span> : `(${_l('所有记录')})`}
            </span>
            <Icon className="Gray_9e Font18" icon="swap_horiz" />
          </div>
        </div>
        <SheetModal
          sourceType={sourceType}
          dialogVisible={sheetModalVisible}
          ownerId={ownerId}
          appId={appId}
          projectId={projectId}
          viewId={filter.viewId}
          worksheetInfo={worksheetInfo}
          onChange={(worksheetId, viewId) => {
            if (worksheetId) {
              this.props.onChangeSheetId(worksheetId);
            } else {
              this.props.changeCurrentReport(
                {
                  filter: {
                    ...filter,
                    viewId,
                  },
                },
                true,
              );
            }
            this.setState({ sheetModalVisible: false });
          }}
          onChangeDialogVisible={visible => {
            this.setState({ sheetModalVisible: visible });
          }}
        />
      </Fragment>
    );
  }
  renderTime() {
    const { worksheetInfo, currentReport, axisControls } = this.props;
    const { filter = {}, displaySetup } = currentReport;
    const { timeModalVisible } = this.state;
    return (
      <Fragment>
        <div className="mTop15 horizontalPaddingWrapper">
          <div className="Bold Font13 Gray mBottom10">{_l('时间')}</div>
          <Dropdown
            visible={timeModalVisible}
            onVisibleChange={visible => {
              this.setState({ timeModalVisible: visible });
            }}
            trigger={['click']}
            overlay={
              <TimeModal
                filter={filter}
                controls={axisControls.filter(item => isTimeControl(item.type))}
                onChangeFilter={data => {
                  this.props.changeCurrentReport(
                    {
                      displaySetup: {
                        ...displaySetup,
                        contrastType: 0,
                      },
                      filter: {
                        ...filter,
                        ...data,
                      },
                    },
                    true,
                  );
                }}
              />
            }
          >
            <div className="timeWrapper flexRow valignWrapper pointer">
              <div className={cx('flex Font13 Bold', filter.rangeType === 20 ? 'flexColumn' : 'flexRow')}>
                <span>{filter.filterRangeName}</span>
                <span className={cx({ mLeft5: filter.rangeType !== 20 })}>({formatrChartTimeText(filter)})</span>
              </div>
              <Icon className="Gray_9e Font14" icon="arrow-down-border" />
            </div>
          </Dropdown>
        </div>
      </Fragment>
    );
  }
  renderSearch() {
    const { searchValue } = this.state;
    return (
      <div className="searchControlWrapper flexRow valignWrapper Gray_9e">
        <Icon className="Font18 mRight3" icon="search" />
        <input
          className="flex"
          value={searchValue}
          placeholder={_l('搜索')}
          onChange={e => {
            this.setState({ searchValue: e.target.value }, this.handleSearch);
          }}
          onKeyDown={event => {
            event.which === 13 && this.handleSearch();
          }}
        />
        {searchValue && <Icon className="Font18 pointer" icon="close" onClick={() => { this.setState({ searchValue: '' }, this.handleSearch); }} />}
      </div>
    );
  }
  renderAddCalculateControl() {
    return (
      <div className="tip-top-left mRight5 addCalculateControl" data-tip={_l('添加计算字段')}>
        <Icon
          icon="add"
          className="Font18 Gray_9e pointer"
          onClick={event => {
            event.stopPropagation();
            this.setState({
              calculateControlModalVisible: true
            });
          }}
        />
      </div>
    );
  }
  renderCalculateControl(alreadySelectControlId) {
    const { axisControls, currentReport, changeCurrentReport } = this.props;
    const { calculateControlModalVisible, editCalculateControl } = this.state;
    const { formulas = [] } = currentReport;
    return (
      <Collapse.Panel
        className={cx({hide: _.isEmpty(formulas)})}
        key="calculateControl"
        header={
          <Fragment>
            {this.renderAddCalculateControl()}
            <div className="flex Gray_9e">{_l('计算值')}</div>
          </Fragment>
        }
      >
        <div>
          <div className="chartCollapse">
            {
              formulas.map(item => (
                <CalculateControlItem
                  key={item.controlId}
                  item={item}
                  isActive={alreadySelectControlId.includes(item.controlId)}
                  onChangeCheckbox={(event) => {
                    this.handleChangeCheckbox(event, item);
                  }}
                  onOpenEdit={() => {
                    this.setState({
                      calculateControlModalVisible: true,
                      editCalculateControl: item
                    });
                  }}
                  onDelete={(id) => {
                    changeCurrentReport({
                      formulas: formulas.filter(item => item.controlId !== id)
                    });
                  }}
                />
              ))
            }
          </div>
          <CalculateControlModal
            editCalculateControl={editCalculateControl}
            axisControls={axisControls}
            currentReport={currentReport}
            onChangeCurrentReport={changeCurrentReport}
            dialogVisible={calculateControlModalVisible}
            onChangeDialogVisible={visible => {
              this.setState({
                calculateControlModalVisible: visible,
                editCalculateControl: null
              });
            }}
          />
        </div>
      </Collapse.Panel>
    );
  }
  renderExpandIcon(panelProps) {
    return (
      <Icon
        className={cx('Font18 Gray_9e', { 'icon-arrow-active': panelProps.isActive })}
        icon="arrow-down-border"
      />
    );
  }
  renderControls() {
    const { currentReport } = this.props;
    const alreadySelectControlId = getAlreadySelectControlId(currentReport);
    const { currentAxisControls } = this.state;
    return (
      <Fragment>
        <Collapse
          ghost
          className="dataSourceCollapse"
          defaultActiveKey={['sheetControl', 'calculateControl']}
          expandIcon={this.renderExpandIcon}
        >
          <Collapse.Panel header={<div className="flex Gray_9e">{_l('工作表')}</div>} key="sheetControl">
            <div>
              {currentAxisControls.map(item => (
                <ControlItem
                  key={item.controlId}
                  item={item}
                  isActive={alreadySelectControlId.includes(item.controlId)}
                  onChangeCheckbox={(event) => {
                    this.handleChangeCheckbox(event, item);
                  }}
                />
              ))}
              {_.isEmpty(currentAxisControls) && <div className="centerAlign pTop30">{_l('无搜索结果')}</div>}
            </div>
          </Collapse.Panel>
          {this.renderCalculateControl(alreadySelectControlId)}
        </Collapse>
      </Fragment>
    );
  }
  renderField() {
    return (
      <div className="mTop20 flex flexColumn">
        <div className="horizontalPaddingWrapper">
          <div className="flexRow valignWrapper mBottom5">
            <span className="flex Font13 Gray Bold">{_l('字段')}</span>
            {this.renderAddCalculateControl()}
          </div>
          {this.renderSearch()}
        </div>
        {this.renderControls()}
      </div>
    );
  }
  render() {
    const { dataIsUnfold } = this.props;
    return (
      <div className={cx('chartDataSource flexColumn', { small: !dataIsUnfold })}>
        {dataIsUnfold ? (
          <Fragment>
            {this.renderHeader()}
            <ScrollView className="flex scrollWrapper">
              {this.renderSheet()}
              {this.renderTime()}
              {this.renderField()}
            </ScrollView>
          </Fragment>
        ) : (
          <Fragment>{this.renderHeader()}</Fragment>
        )}
      </div>
    );
  }
}
