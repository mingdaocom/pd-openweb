import React, { Fragment } from 'react';
import ajaxRequest from 'src/api/appManagement';
import Config from '../../config';
import Search from 'src/pages/workflow/components/Search';
import './index.less';
import { LoadDiv, ScrollView, Checkbox, Tooltip } from 'ming-ui';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import SvgIcon from 'src/components/SvgIcon';
import cx from 'classnames';

export default class SelectApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      keyword: '',
      pageIndex: 1,
      selectList: [],
      loading: false,
      isMore: true,
      selectListSheetCount: 0,
    };
  }

  componentDidMount() {
    this.getList();
  }

  getList() {
    const { keyword, pageIndex, list, loading, isMore } = this.state;

    // 加载更多
    if (pageIndex > 1 && ((loading && isMore) || !isMore)) {
      return;
    }

    this.setState({ loading: true });

    if (this.postList) {
      this.postList.abort();
    }

    this.postList = ajaxRequest.getAppsForProject({
      projectId: Config.projectId,
      status: '',
      order: 3,
      pageIndex,
      pageSize: 30,
      keyword,
      sourceType: 2,
    });
    this.postList.then(({ apps }) => {
      this.setState({
        list: pageIndex === 1 ? apps : list.concat(apps),
        isMore: apps.length === 30,
        pageIndex: pageIndex + 1,
        loading: false,
      });
    });
  }

  //渲染左侧列表
  renderList() {
    const { list, loading, selectList = [], keyword } = this.state;

    if (list === null) return;

    if (keyword && !list.length) {
      return (
        <div className="manageListNull Gray_bd mBottom20">{_l('未找到 "%0" 相关应用，请更换关键词试试', keyword)}</div>
      );
    }

    return (
      <ScrollView className="flex mBottom12" onScrollEnd={this.searchDataList}>
        {list.map(item => {
          const isSelect = _.findIndex(selectList, app => app.appId === item.appId) > -1;
          return (
            <Checkbox
              className="TxtMiddle selectAppSortableItem"
              checked={isSelect}
              onClick={() => this.updateSelectList(isSelect, item)}
            >
              <div className="mRight10 svgBox" style={{ backgroundColor: item.iconColor }}>
                <SvgIcon url={item.iconUrl} fill="#fff" size={14} />
              </div>
              {item.appName}
            </Checkbox>
          );
        })}
        {loading && <LoadDiv className="mTop15" size="small" />}
      </ScrollView>
    );
  }

  //渲染右侧列表
  renderSelectList() {
    const { selectList } = this.state;
    const _this = this;
    if (!selectList.length) {
      return (
        <div className="selectBox scrollBox">
          <div className="manageListNull">
            <div className="Gray_bd TxtCenter">
              <div>{_l('请从左侧列表选择应用,')}</div>
              <div>
                {_l('选择的应用工作表总数不能超过')}
                <span className="Gray">200</span>
                {_l('个')}
              </div>
            </div>
          </div>
        </div>
      );
    }
    const SortableItem = SortableElement(({ value }) => {
      return (
        <div>
          <div className="selectAppSortableItem pLeft6 Hand">
            <span className="icon-drag_indicator grabIcon Gray_9e"></span>
            <div className="mRight10 svgBox mLeft5" style={{ backgroundColor: value.iconColor }}>
              <SvgIcon url={value.iconUrl} fill="#fff" size={14} />
            </div>
            <span className="overflow_ellipsis WordBreak">{value.appName}</span>
            <div className="marginLeftAuto">
              <span className="Gray_9e">{value.sheetCount}</span>
              <span
                className="Hover_49 icon-clear mLeft32 Gray_9e"
                onClick={() => _this.updateSelectList(true, value)}
              ></span>
            </div>
          </div>
        </div>
      );
    });

    const SortableList = SortableContainer(({ list }) => {
      return (
        <div className="selectBox scrollBox">
          {list.map((item, index) => (
            <SortableItem value={item} key={`item-${index}`} index={index} />
          ))}
        </div>
      );
    });

    return (
      <SortableList
        list={selectList}
        distance={5}
        helperClass="selectAppSortableList"
        onSortEnd={({ oldIndex, newIndex }) => this.setState({ selectList: arrayMove(selectList, oldIndex, newIndex) })}
      />
    );
  }

  //选中列表变化
  updateSelectList(isSelect, item) {
    this.setState({
      selectList: isSelect
        ? this.state.selectList.filter(app => app.appId !== item.appId)
        : this.state.selectList.concat([item]),
      selectListSheetCount: isSelect
        ? this.state.selectListSheetCount - item.sheetCount
        : this.state.selectListSheetCount + item.sheetCount,
    });
  }

  searchDataList = _.throttle(() => {
    this.getList();
  }, 200);

  render() {
    const { selectListSheetCount, selectList } = this.state;
    return (
      <Fragment>
        <div className="selectAppContainer mTop10">
          <div className="selectAppLeftContent">
            <span className="Font15">{_l('选择')}</span>
            <div className="selectBox">
              <Search
                placeholder={_l('搜索应用名称')}
                handleChange={keyword => this.setState({ list: null, pageIndex: 1, keyword }, this.searchDataList)}
              />
              {this.renderList()}
            </div>
          </div>
          <div className="selectAppCenterContent">
            <span className="icon-navigate_next Font28"></span>
          </div>
          <div className="selectAppRightContent">
            <div className="clearfix">
              <span className="Left Font15">{_l('已选')}</span>
              <Tooltip popupPlacement="top" text={<span>{_l('导出的应用工作表总数上限200个')}</span>}>
                <span className="icon-info1 mLeft8 Gray_bd Right LineHeight20"></span>
              </Tooltip>
              <span className={cx('Right', { errorMag: selectListSheetCount > 200 })}>
                <span>{selectListSheetCount}</span>
                <span className="Gray_bd">/200</span>
              </span>
            </div>
            {this.renderSelectList()}
          </div>
        </div>
        <div className="mTop32 mBottom20 clearfix selectAppOptionBtns">
          <button
            type="button"
            disabled={!selectList.length}
            className={cx('ming Button Right nextBtn Button--primary Bold', { disabled: !selectList.length })}
            onClick={() => {
              if (selectListSheetCount > 200) {
                alert(_l('导出的应用共%0张表，已超过上限200张，请重新选择', selectListSheetCount), 3);
              } else {
                this.props.handleNext(selectList);
              }
            }}
          >
            {_l('下一步')}
          </button>
          <div className="Right mRight40 Gray_9e Hover_49 Hand LineHeight36" onClick={() => this.props.closeDialog()}>
            {_l('取消')}
          </div>
        </div>
      </Fragment>
    );
  }
}
