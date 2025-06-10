import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _, { isEmpty } from 'lodash';
import { LoadDiv, ScrollView } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import worksheetAjax from 'src/api/worksheet';
import { RecordInfoModal } from 'mobile/Record';
import * as actions from 'worksheet/redux/actions/galleryview';
import { getEmbedValue } from 'src/components/newCustomFields/tools/formUtils';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { transferValue } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import RecordInfoWrapper from 'src/pages/worksheet/common/recordInfo/RecordInfoWrapper';
import { getCoverStyle } from 'src/pages/worksheet/common/ViewConfig/utils';
import NoRecords from 'src/pages/worksheet/components/WorksheetTable/components/NoRecords';
import { getTitleControlForCard } from 'src/pages/worksheet/views/util.js';
import { browserIsMobile, emitter } from 'src/utils/common';
import { getAdvanceSetting, renderText as renderCellText } from 'src/utils/control';
import { addBehaviorLog, handlePushState, handleReplaceState } from 'src/utils/project';
import { handleRecordClick } from 'src/utils/record';
import { getRecordColorConfig } from 'src/utils/record';
import { getCardWidth } from 'src/utils/worksheet';
import ViewEmpty from '../components/ViewEmpty';
import { getRecordAttachments, RENDER_RECORD_NECESSARY_ATTR } from '../util';
import GalleryItem from './GalleryItem';
import './index.less';

const isMobile = browserIsMobile();

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

@autoSize
@connect(
  state => ({ ...state.sheet, chatVisible: state.chat.visible, sheetListVisible: state.sheetList.isUnfold }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class RecordGallery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recordInfoVisible: false,
      recordId: '',
      clicksearch: '',
    };
  }

  componentDidMount() {
    this.getFetch(this.props);
    window.addEventListener('resize', this.resizeBind);
    emitter.addListener('RELOAD_RECORD_INFO', this.updateRecordEvent);
    window.addEventListener('popstate', this.onQueryChange);
  }

  componentWillReceiveProps(nextProps) {
    const {
      base,
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
    if (clicksearch === '1' && quickFilter.length <= 0) {
      return;
    }
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
    }
    this.setState({ clicksearch });
  }

  componentWillUnmount() {
    emitter.removeListener('RELOAD_RECORD_INFO', this.updateRecordEvent);
    window.removeEventListener('resize', this.resizeBind);
    window.removeEventListener('popstate', this.onQueryChange);
  }

  onQueryChange = () => {
    handleReplaceState('page', 'recordDetail', () => this.setState({ recordInfoVisible: false }));
  };

  updateRecordEvent = ({ worksheetId, recordId }) => {
    const { base, galleryview } = this.props;
    const { gallery = [] } = galleryview;
    const { viewId } = base;
    if (worksheetId === this.props.worksheetId && _.find(gallery, r => r.rowid === recordId)) {
      worksheetAjax
        .getRowDetail({
          checkView: true,
          getType: 1,
          rowId: recordId,
          viewId,
          worksheetId,
        })
        .then(res => {
          const row = JSON.parse(res.rowData);
          if (res.resultCode === 1 && res.isViewData) {
            this.props.updateRow(row);
          } else {
            this.props.deleteRow(row.rowid);
          }
        });
    }
  };

  getFetch = nextProps => {
    const { base, views } = nextProps;
    const { viewId } = base;
    const currentView = views.find(o => o.viewId === viewId) || {};
    const { clicksearch } = getAdvanceSetting(currentView);
    if (clicksearch === '1') {
      //执行查询后显示数据
      this.setState({
        clicksearch,
      });
      this.props.changeIndex(0);
    } else {
      this.props.fetch(1);
    }
  };

  scrollLoad = (e, o) => {
    const { maxCount } = this.props.base;
    if (maxCount) {
      return;
    }
    const { galleryViewRecordCount, gallery, galleryLoading, galleryIndex } = this.props.galleryview;
    if (o.maximum - o.position <= 30 && gallery.length < galleryViewRecordCount && !galleryLoading) {
      const nextPageIndex = galleryIndex + 1;
      this.props.fetch(nextPageIndex);
    }
  };

  resizeBind = nextProps => {
    $(this.view)
      .find('.galleryItem')
      .css({
        width: this.getWidth(nextProps),
      });
  };

  getWidth = (props = this.props) => {
    let { base = {}, views = [], width } = props;
    const { viewId = '' } = base;
    const view = views.find(o => o.viewId === viewId) || {};
    const { coverPosition = '2' } = getCoverStyle(view);
    const cardWidth = getCardWidth(view);
    const isTopCover = coverPosition === '2'; // 封面上
    width = width - 8 * 2; //padding:8px;
    const minW = !!cardWidth ? Number(cardWidth) + 16 : !isTopCover ? 336 : 246;
    let W = minW > width ? minW : Math.floor(Math.floor(width) / Math.floor(Math.floor(width) / minW));
    return W;
  };

  formData = row => {
    const { base, controls, views, sheetSwitchPermit } = this.props;
    const { viewId } = base;
    const view = views.find(o => o.viewId === viewId) || {};
    const { displayControls = [] } = view;
    const parsedRow = row;
    const arr = [];

    const titleControl = getTitleControlForCard(view, controls);
    if (titleControl) {
      // 标题字段
      arr.push({ ..._.pick(titleControl, RENDER_RECORD_NECESSARY_ATTR), value: parsedRow[titleControl.controlId] });
    }
    const isShowWorkflowSys = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit);
    let displayControlsCopy = !isShowWorkflowSys
      ? displayControls.filter(
          it =>
            !_.includes(
              ['wfname', 'wfstatus', 'wfcuaids', 'wfrtime', 'wfftime', 'wfdtime', 'wfcaid', 'wfctime', 'wfcotime'],
              it,
            ),
        )
      : displayControls;
    // 配置的显示字段
    displayControlsCopy.forEach(id => {
      const currentControl = _.find(controls, ({ controlId }) => controlId === id);
      if (currentControl) {
        const value = parsedRow[id];
        arr.push({ ..._.pick(currentControl, RENDER_RECORD_NECESSARY_ATTR), value });
      }
    });
    return arr;
  };

  noFilter = function () {
    const { searchType, filterControls, isUnRead, sortControls = [] } = this.props.filters;
    return (
      searchType === 1 &&
      !isUnRead &&
      !filterControls.length &&
      !sortControls.filter(item => item.controlId === 'ctime' || item.controlId === 'utime').length
    );
  };

  render() {
    const { base, views, sheetSwitchPermit, galleryview, filters, worksheetInfo, controls, quickFilter } = this.props;
    const { viewId, appId, worksheetId, groupId } = base;
    const currentView = views.find(o => o.viewId === viewId) || {};
    const { gallery = [], galleryViewLoading, galleryLoading, galleryIndex, galleryViewRecordCount } = galleryview;
    const coverCid = currentView.coverCid || _.get(worksheetInfo, ['advancedSetting', 'coverid']);
    const { abstract = '' } = getAdvanceSetting(currentView);
    const { coverPosition = '2' } = getCoverStyle(currentView);
    const isTopCover = coverPosition === '2';
    const { recordInfoVisible, recordId } = this.state;

    if (galleryViewLoading) {
      return <LoadDiv size="big" className="mTop32" />;
    }

    if (gallery.length <= 0) {
      if (filters.keyWords || !isEmpty(filters.filterControls) || isMobile) {
        return <ViewEmpty filters={filters} />;
      }

      return <NoRecords sheetIsFiltered={!this.noFilter()} />;
    }

    return (
      <ScrollView className="galleryScrollWrap" updateEvent={_.throttle(this.scrollLoad, 400)}>
        <div
          className={cx('galleryViewContentWrap', { coverTop: isTopCover })}
          ref={el => {
            this.view = el;
          }}
        >
          {gallery.map((item, index) => {
            let formData = controls.map(o => {
              return { ...o, value: item[o.controlId] };
            });
            const { coverImage, allAttachments } = getRecordAttachments(item[coverCid]);
            let coverData = { ...(controls.find(it => it.controlId === coverCid) || {}), value: item[coverCid] };
            if (coverData.type === 45) {
              //嵌入字段 dataSource需要转换
              let dataSource = transferValue(coverData.value);
              let urlList = [];
              dataSource.map(o => {
                if (!!o.staticValue) {
                  urlList.push(o.staticValue);
                } else {
                  urlList.push(
                    getEmbedValue(
                      {
                        projectId: worksheetInfo.projectId,
                        appId,
                        groupId,
                        worksheetId,
                        viewId,
                        recordId,
                      },
                      o.cid,
                    ),
                  );
                }
              });
              coverData = { ...coverData, value: urlList.join('') };
            }
            let abstractData = controls.find(it => it.controlId === abstract) || {};
            let data = {
              coverData,
              coverImage,
              allAttachments,
              allowEdit: item.allowedit,
              allowDelete: item.allowdelete,
              rawRow: item,
              recordColorConfig: getRecordColorConfig(currentView),
              fields: this.formData(item),
              formData,
              rowId: item.rowid,
              abstractValue: abstract
                ? renderCellText({
                    ...abstractData,
                    value: item[abstract],
                  })
                : '',
            };
            const getMStyle = () => {
              const wWidth = window.innerWidth;
              if (wWidth > 480 && _.get(currentView, 'advancedSetting.rowcolumns') === '2') {
                return { width: '50%', padding: '5px' };
              }
              return { width: '100%', padding: '5px 0px' };
            };
            return (
              <div
                className={cx('galleryItem', { mobile: isMobile })}
                style={isMobile ? getMStyle() : { width: this.getWidth() }}
                onClick={() => {
                  handleRecordClick(currentView, item, () => {
                    if (window.isMingDaoApp && window.APP_OPEN_NEW_PAGE) {
                      window.location.href = `/mobile/record/${appId}/${worksheetId}/${viewId}/${item.rowid}`;
                      return;
                    }
                    handlePushState('page', 'recordDetail');
                    this.setState({ recordId: item.rowid, recordInfoVisible: true });
                    addBehaviorLog('worksheetRecord', worksheetId, { rowId: item.rowid }); // 埋点
                  });
                }}
              >
                <GalleryItem
                  {...this.props}
                  data={data}
                  onUpdateFn={(updated, item) => {
                    this.props.updateRow(item);
                  }}
                  onDeleteFn={id => {
                    this.props.deleteRow(id);
                  }}
                  onCopySuccess={data => {
                    this.props.updateRow(data);
                  }}
                  onAdd={data => {
                    this.props.updateRow(data);
                  }}
                />
              </div>
            );
          })}
          {/* 表单信息 */}
          {recordInfoVisible &&
            (isMobile ? (
              <RecordInfoModal
                className="full"
                visible
                appId={appId}
                worksheetId={worksheetId}
                enablePayment={worksheetInfo.enablePayment}
                viewId={viewId}
                rowId={recordId}
                canLoadSwitchRecord={true}
                currentSheetRows={gallery}
                loadNextPageRecords={() => this.props.fetch(galleryIndex + 1)}
                loadedRecordsOver={!(gallery.length < galleryViewRecordCount && !galleryLoading)}
                onClose={() => {
                  this.setState({ recordInfoVisible: false });
                }}
                updateRow={(recordId, data, isViewData) => {
                  if (isViewData) this.props.updateRow(data);
                  else this.props.deleteRow(recordId);
                }}
                deleteRow={this.props.deleteRow}
              />
            ) : (
              <RecordInfoWrapper
                enablePayment={worksheetInfo.enablePayment}
                sheetSwitchPermit={sheetSwitchPermit} // 表单权限
                allowAdd={worksheetInfo.allowAdd}
                visible
                projectId={worksheetInfo.projectId}
                currentSheetRows={gallery}
                showPrevNext={true}
                appId={appId}
                viewId={viewId}
                from={1}
                hideRecordInfo={() => {
                  this.setState({ recordInfoVisible: false });
                  emitter.emit('ROWS_UPDATE');
                }}
                view={currentView}
                recordId={recordId}
                worksheetId={worksheetId}
                rules={worksheetInfo.rules}
                updateSuccess={(ids, updated, data) => {
                  this.props.updateRow(data);
                }}
                onDeleteSuccess={() => {
                  // 删除行数据后重新加载页面
                  this.props.deleteRow(recordId);
                  this.setState({ recordInfoVisible: false });
                }}
                handleAddSheetRow={data => {
                  this.props.updateRow(data);
                  this.setState({ recordInfoVisible: false });
                }}
                hideRows={recordIds => {
                  setTimeout(() => {
                    recordIds.forEach(this.props.deleteRow);
                  }, 100);
                }}
              />
            ))}
        </div>
        {galleryLoading && (
          <div className="w100">
            <LoadDiv size="big" className="mTop32" />
          </div>
        )}
      </ScrollView>
    );
  }
}
