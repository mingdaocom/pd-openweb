import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _, { isEmpty } from 'lodash';
import { LoadDiv, ScrollView } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import worksheetAjax from 'src/api/worksheet';
import addRecord from 'worksheet/common/newRecord/addRecord';
import * as actions from 'worksheet/redux/actions/galleryview';
import { getEmbedValue } from 'src/components/Form/core/formUtils';
import { transferValue } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import { getCoverStyle } from 'src/pages/worksheet/common/ViewConfig/utils';
import GroupByControl, { getDefaultValue } from 'src/pages/worksheet/components/GroupByControl.jsx';
import NoRecords from 'src/pages/worksheet/components/WorksheetTable/components/NoRecords';
import { emitter } from 'src/utils/common';
import { getAdvanceSetting } from 'src/utils/control';
import { addBehaviorLog, handlePushState, handleReplaceState } from 'src/utils/project';
import { handleRecordClick } from 'src/utils/record';
import { getRecordColorConfig } from 'src/utils/record';
import ViewEmpty from '../components/ViewEmpty';
import { getRecordAttachments } from '../util';
import GalleryItem from './GalleryItem';
import ViewMore from './More';
import RecordInfoForGallery from './RecordInfoForGallery';
import { canEditForGroupControl, getDataWithFormat, getWidth } from './util';
import './index.less';

const notFetchAttr = [
  'name',
  'worksheetName',
  'showControlName',
  'advancedSetting.rowcolumns',
  'advancedSetting.checkradioid',
  'advancedSetting.maxlinenum',
  'advancedSetting.showcount',
  'advancedSetting.coverstyle',
  'advancedSetting.opencover',
  'advancedSetting.cardwidth',
  'advancedSetting.refreshtime',
];

// 提取的加载状态组件
const LoadingIndicator = ({ loading }) =>
  loading && (
    <div className="w100">
      <LoadDiv size="big" className="mTop32" />
    </div>
  );

// 提取的空状态组件
const EmptyState = ({ filters, isFiltered }) => {
  if (filters.keyWords || !isEmpty(filters.filterControls)) {
    return <ViewEmpty filters={filters} />;
  }
  return <NoRecords sheetIsFiltered={isFiltered} />;
};

@autoSize
@connect(
  state => ({
    ...state.sheet,
    chatVisible: state.chat.visible,
    sheetListVisible: state.sheetList.isUnfold,
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class RecordGallery extends Component {
  state = {
    recordInfoVisible: false,
    recordId: '',
    clicksearch: '',
    opKeys: [], //展开的分组
    rowKey: '',
  };

  componentDidMount() {
    this.getFetch(this.props);
    window.addEventListener('resize', this.resizeBind);
    emitter.addListener('RELOAD_RECORD_INFO', this.updateRecordEvent);
    window.addEventListener('popstate', this.onQueryChange);
    setTimeout(() => {
      this.updateOpenSkeys(this.props);
    }, 500);
  }

  componentWillReceiveProps(nextProps) {
    const {
      base = {},
      chatVisible,
      sheetListVisible, // 左侧打开或关闭
      views,
      groupFilterWidth,
      navGroupFilters,
      quickFilter,
    } = nextProps;
    const { viewId } = base;
    const currentView = views.find(o => o.viewId === viewId) || {};
    const preView = this.props.views.find(o => o.viewId === this.props.base.viewId) || {};
    const { clicksearch } = getAdvanceSetting(currentView);
    if (clicksearch === '1' && quickFilter.length <= 0) return;
    const isNoAs =
      !_.isEqual(_.omit(currentView, notFetchAttr), _.omit(preView, notFetchAttr)) ||
      clicksearch !== this.state.clicksearch ||
      !_.isEqual(navGroupFilters, this.props.navGroupFilters);

    if (
      sheetListVisible !== this.props.sheetListVisible ||
      isNoAs ||
      viewId !== this.props.base.viewId ||
      chatVisible !== this.props.chatVisible ||
      groupFilterWidth !== this.props.groupFilterWidth
    ) {
      setTimeout(
        () => {
          this.getFetch(nextProps);
          this.resizeBind(nextProps);
        },
        // 修改颜色字段时晚一点取, 不然返回的数据还是不包括新改的字段的值
        _.get(preView, 'advancedSetting.colorid') !== _.get(currentView, 'advancedSetting.colorid') ? 200 : 0,
      );
      this.props.updateGalleryViewCard({ needUpdate: true });
    }
    this.setState({ clicksearch });
    if (
      !_.isEqual(
        _.get(nextProps, 'galleryview.gallery').map(o => o.key),
        _.get(this.props, 'galleryview.gallery').map(o => o.key),
      ) ||
      _.get(currentView, 'advancedSetting.groupopen') !== _.get(preView, 'advancedSetting.groupopen')
    ) {
      this.updateOpenSkeys(nextProps);
    }
  }

  componentWillUnmount() {
    emitter.removeListener('RELOAD_RECORD_INFO', this.updateRecordEvent);
    window.removeEventListener('resize', this.resizeBind);
    window.removeEventListener('popstate', this.onQueryChange);
  }

  updateOpenSkeys = nextProps => {
    const { base = {}, views, galleryview = {} } = nextProps;
    const { viewId } = base;
    const { gallery = [] } = galleryview;
    const currentView = views.find(o => o.viewId === viewId) || {};
    if (!_.get(currentView, 'advancedSetting.groupsetting')) return;
    const groupopen = _.get(currentView, 'advancedSetting.groupopen') || '2';
    this.setState({
      opKeys: !['3', '2'].includes(groupopen)
        ? [_.get(gallery, '[0].key')]
        : groupopen === '2'
          ? gallery.map(o => o.key)
          : [],
    });
  };

  onQueryChange = () => {
    handleReplaceState('page', 'recordDetail', () => this.setState({ recordInfoVisible: false, rowKey: '' }));
  };

  updateRecordEvent = ({ worksheetId, recordId, rowKey }) => {
    const { base = {}, galleryview } = this.props;
    const { gallery = [] } = galleryview;
    if (worksheetId === this.props.worksheetId && _.find(gallery, r => r.rowid === recordId)) {
      worksheetAjax
        .getRowDetail({
          checkView: true,
          getType: 1,
          rowId: recordId,
          viewId: base.viewId,
          worksheetId,
        })
        .then(res => {
          const row = JSON.parse(res.rowData);
          if (res.resultCode === 1 && res.isViewData) {
            this.props.updateRow(row, rowKey);
          } else {
            this.props.deleteRow(row.rowid, rowKey);
          }
        });
    }
  };

  getFetch = nextProps => {
    const { base = {}, views } = nextProps;
    const currentView = views.find(o => o.viewId === base.viewId) || {};
    const { clicksearch } = getAdvanceSetting(currentView);

    if (clicksearch === '1') {
      this.setState({ clicksearch });
      this.props.changeIndex(0);
    } else {
      this.props.fetch(1);
    }
  };

  scrollLoad = _.throttle(() => {
    const { base, views, galleryview } = this.props;
    const currentView = views.find(o => o.viewId === base.viewId) || {};

    if (!base.maxCount && !_.get(currentView, 'advancedSetting.groupsetting')) {
      const { galleryViewRecordCount, gallery, galleryLoading, galleryIndex } = galleryview;
      if (gallery.length < galleryViewRecordCount && !galleryLoading) {
        this.props.fetch(galleryIndex + 1);
      }
    }
  }, 400);

  resizeBind = nextProps => {
    $(this.view)
      .find('.galleryItem')
      .css({ width: getWidth(nextProps) });
  };

  noFilter = () => {
    const { searchType, filterControls, isUnRead, sortControls = [] } = this.props.filters;
    return (
      searchType === 1 &&
      !isUnRead &&
      !filterControls.length &&
      !sortControls.filter(item => item.controlId === 'ctime' || item.controlId === 'utime').length
    );
  };

  handleRecordClick = (currentView, item, rowKey) => {
    const {
      base: { appId, worksheetId, viewId },
    } = this.props;

    handleRecordClick(currentView, item, () => {
      if (window.isMingDaoApp && window.APP_OPEN_NEW_PAGE) {
        window.location.href = `/mobile/record/${appId}/${worksheetId}/${viewId}/${item.rowid}`;
        return;
      }
      handlePushState('page', 'recordDetail');
      this.setState({ recordId: item.rowid, recordInfoVisible: true, rowKey: rowKey });
      addBehaviorLog('worksheetRecord', worksheetId, { rowId: item.rowid });
    });
  };

  renderGalleryItem = (item, rowKey) => {
    const { worksheetInfo, base = {}, views = [], controls = [], galleryview } = this.props;
    const currentView = views.find(o => o.viewId === base.viewId) || {};
    const { gallery = [], galleryViewCard } = galleryview;
    const { coverCid } = currentView;
    const { abstract = '' } = getAdvanceSetting(currentView);

    const formData = controls.map(o => ({ ...o, value: item[o.controlId] }));
    const { coverImage, allAttachments } = getRecordAttachments(item[coverCid]);
    let coverData = { ...(controls.find(it => it.controlId === coverCid) || {}), value: item[coverCid] };

    if (coverData.type === 45) {
      const dataSource = transferValue(coverData.value);
      const urlList = dataSource.map(
        o =>
          o.staticValue ||
          getEmbedValue(
            {
              projectId: worksheetInfo.projectId,
              appId: base.appId,
              groupId: base.groupId,
              worksheetId: base.worksheetId,
              viewId: base.viewId,
              recordId: item.rowid,
            },
            o.cid,
          ),
      );
      coverData = { ...coverData, value: urlList.join('') };
    }

    const abstractData = controls.find(it => it.controlId === abstract) || {};

    const data = {
      coverData,
      coverImage,
      allAttachments,
      allowEdit: item.allowedit,
      allowDelete: item.allowdelete,
      rawRow: item,
      recordColorConfig: getRecordColorConfig(currentView),
      fields: getDataWithFormat(item, this.props),
      formData,
      rowId: item.rowid,
      abstractControl: abstract ? { ...abstractData, value: item[abstract] } : '',
    };

    let groupInfo = {};

    const { groupsetting } = getAdvanceSetting(currentView);
    if (groupsetting && item.allowedit) {
      const groupControl = controls.find(o => o.controlId === _.get(safeParse(groupsetting, 'array'), '[0].controlId'));
      if (groupControl)
        groupInfo = {
          allowEditForGroup: true,
          groups: gallery.filter(o => o.key !== rowKey).map(o => _.omit(o, ['rows'])),
          groupControl,
        };
    }

    return (
      <div
        key={item.rowid}
        className={cx('galleryItem')}
        style={{ width: getWidth(this.props) }}
        onClick={() => this.handleRecordClick(currentView, item, rowKey)}
      >
        <GalleryItem
          key={`galleryItem-${item.rowid}`}
          {...this.props}
          data={data}
          onUpdateFn={(updated, item) => {
            if (
              !!item?.group?.key &&
              _.get(safeParse(groupsetting, 'array'), '[0].controlId') &&
              item?.group?.key !== rowKey
            ) {
              this.props.updateRow(item, item?.group?.key);
              this.props.deleteRow(item.rowid, rowKey);
              return;
            }
            this.props.updateRow(item, rowKey);
          }}
          onDeleteFn={id => this.props.deleteRow(id, rowKey)}
          onCopySuccess={it => this.props.updateRow(it, rowKey)}
          onAdd={data => this.props.updateRow(data, rowKey)}
          {...groupInfo}
          galleryViewCard={galleryViewCard}
          updateGalleryViewCard={this.props.updateGalleryViewCard}
        />
      </div>
    );
  };

  renderAddCard = rowKey => {
    const {
      base = {},
      views = [],
      worksheetInfo,
      isCharge,
      updateRow,
      controls = [],
      galleryview = {},
      allowAddNewRecord = true,
    } = this.props;
    const currentView = views.find(o => o.viewId === base.viewId) || {};
    const { gallery = [] } = galleryview;
    const { groupsetting } = getAdvanceSetting(currentView);

    const control = controls.find(o => o.controlId === _.get(safeParse(groupsetting, 'array'), '[0].controlId'));

    const addRecordInfo = () => {
      const { worksheetId } = base;
      const dataRow = gallery.find(o => o.key === rowKey);
      addRecord({
        worksheetId: worksheetId,
        defaultFormData: getDefaultValue({
          control,
          groupKey: rowKey,
          name: dataRow?.name,
        }),
        defaultFormDataEditable: false,
        directAdd: true,
        isCharge: isCharge,
        onAdd: data => {
          updateRow(data, rowKey);
        },
      });
    };
    const allowAdd =
      canEditForGroupControl({
        allowAdd: worksheetInfo?.allowAdd,
        control,
      }) && allowAddNewRecord;
    if (!allowAdd) {
      return <div className="Gray_75 Font16 pTop20 pBottom20 TxtCenter">{_l('该分组下无记录')}</div>;
    }

    return (
      <div className="galleryItem addNewGallery" style={{ width: getWidth(this.props) }}>
        <span
          className="addRow overflow_ellipsis WordBreak flexRow alignItemsCenter TxtCenter Gray_75 hoverText"
          onClick={() => addRecordInfo()}
        >
          <span className="Icon icon icon-plus Font13 mRight5" />
          <span className="bold">
            {worksheetInfo?.advancedSetting?.btnname || worksheetInfo?.entityName || _l('记录')}
          </span>
        </span>
      </div>
    );
  };

  renderGroupedItems = (data = []) => {
    const { base = {}, views = [], controls = [], galleryview, fetchMoreByGroup, worksheetInfo } = this.props;
    const { viewId, appId, worksheetId } = base;
    const currentView = views.find(o => o.viewId === base.viewId) || {};
    const { groupsetting } = getAdvanceSetting(currentView);
    const { galleryGroupLoading, gallery } = galleryview;
    const { opKeys = [] } = this.state;
    return data.map((row = { totalNum: 0 }) => {
      const control =
        controls.find(o => o.controlId === _.get(safeParse(groupsetting, 'array'), '[0].controlId')) || {};
      const allowAdd = canEditForGroupControl({
        allowAdd: worksheetInfo?.allowAdd,
        control,
      });
      return (
        <React.Fragment key={row.key}>
          <GroupByControl
            className="groupByControlForGallery"
            appId={appId}
            projectId={worksheetInfo.projectId}
            allowAdd={allowAdd}
            worksheetId={worksheetId}
            viewId={viewId}
            view={currentView}
            folded={!opKeys.includes(row.key)}
            allFolded={opKeys.length >= gallery.length}
            count={row.totalNum}
            control={control}
            groupKey={row.key}
            name={row.name}
            onFold={() => {
              this.setState({
                opKeys: !opKeys.includes(row.key) ? [...opKeys, row.key] : opKeys.filter(o => o !== row.key),
              });
            }}
            onAllFold={value => {
              this.setState({
                opKeys: value ? [] : gallery.map(o => o.key),
              });
            }}
            onAdd={data => this.props.updateRow(data, row.key)}
          />
          {opKeys.includes(row.key) && (
            <React.Fragment>
              {(row.rows || []).length <= 0 && this.renderAddCard(row.key)}
              {(row.rows || []).map(it => this.renderGalleryItem(safeParse(it), row.key))}
              {row.totalNum > (row.rows || []).length && (
                <ViewMore
                  disabled={galleryGroupLoading}
                  onClick={() => {
                    if (galleryGroupLoading) return;
                    fetchMoreByGroup(Math.floor((row.rows || []).length / 20 + 1), row.key);
                  }}
                />
              )}
            </React.Fragment>
          )}
        </React.Fragment>
      );
    });
  };

  renderContent = () => {
    const { base, galleryview, views } = this.props;
    const { gallery = [] } = galleryview;
    const currentView = views.find(o => o.viewId === base.viewId) || {};

    return _.get(currentView, 'advancedSetting.groupsetting')
      ? this.renderGroupedItems(gallery)
      : gallery.map(item => this.renderGalleryItem(item));
  };

  render() {
    const { base, galleryview, filters, views } = this.props;
    const { gallery = [], galleryViewLoading, galleryLoading } = galleryview;
    const { recordInfoVisible } = this.state;
    const currentView = views.find(o => o.viewId === base.viewId) || {};
    const { coverPosition = '2' } = getCoverStyle(currentView);
    const isTopCover = coverPosition === '2';

    if (galleryViewLoading) return <LoadDiv size="big" className="mTop32" />;
    if (gallery.length <= 0) return <EmptyState filters={filters} isFiltered={!this.noFilter()} />;

    return (
      <ScrollView className="galleryScrollWrap" onScrollEnd={this.scrollLoad}>
        <div
          className={cx('galleryViewContentWrap', { coverTop: isTopCover })}
          ref={el => {
            this.view = el;
          }}
        >
          {this.renderContent()}
          {recordInfoVisible && (
            <RecordInfoForGallery
              {...this.props}
              state={this.state}
              onChangeState={info => this.setState({ ...info })}
              updateRecordEvent={this.updateRecordEvent}
            />
          )}
        </div>
        <LoadingIndicator loading={galleryLoading} />
      </ScrollView>
    );
  }
}
