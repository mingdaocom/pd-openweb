import React, { useEffect, useRef, useState } from 'react';
import { Icon, LoadDiv, Support, UpgradeIcon, Tooltip } from 'ming-ui';
import { Drawer } from 'antd';
import Trigger from 'rc-trigger';
import './print.less';
import EditPrint from '../components/EditPrint';
import MoreOption from '../components/MoreOption';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import PrintTemDialog from '../components/PrintTemDialog';
import RangeDrop from 'src/pages/FormSet/components/RangeDrop';
import { PRINT_TYPE, PRINT_TYPE_STYLE } from 'src/pages/Print/config';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import { getPrintCardInfoOfTemplate } from 'src/pages/worksheet/common/PrintQrBarCode/enum';
import { printQrBarCode } from 'worksheet/common/PrintQrBarCode';
import _ from 'lodash';
import sheetAjax from 'src/api/worksheet';
import ShowBtnFilterDialog from 'src/pages/worksheet/common/CreateCustomBtn/components/ShowBtnFilterDialog.jsx';
import { redefineComplexControl } from 'worksheet/common/WorkSheetFilter/util';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import { handleCondition } from 'src/pages/widgetConfig/util/data';
import { filterData } from 'src/pages/FormSet/components/columnRules/config.js';

const SortHandle = SortableHandle(() => <Icon className="Font14 Hand Gray_9e Hover_21 dragIcon" icon="drag" />);
const SortableItem = SortableElement(props => {
  const {
    it,
    showDropOption,
    isRename,
    templateId,
    showMoreOption,
    isChangeDrop,
    showFilters,
    worksheetInfo = {},
    worksheetControls = [],
    printInfo,
    isCustom,
    updatePrint,
    changeState,
    editPrintName,
    deletePrint,
    editPrintRange,
    editPrintFilters,
    loadPrint,
  } = props;
  const { views = [] } = worksheetInfo;
  const inputRef = useRef();
  const [inputName, setInputName] = useState(it.name);

  useEffect(() => {
    if (isRename) {
      setInputName(it.name);
      setTimeout(() => {
        $(inputRef).focus();
      }, 200);
    }
  }, [isRename]);

  const onPreview = () => {
    if ($('.printTemplatesList-tr .name input')[0]) return;
    if (_.includes([PRINT_TYPE.QR_CODE_PRINT, PRINT_TYPE.BAR_CODE_PRINT], it.type)) {
      printQrBarCode({
        mode: 'preview',
        id: it.id,
        printType: it.printType,
        projectId: worksheetInfo.projectId,
        worksheetId: worksheetInfo.worksheetId,
        controls: _.get(worksheetInfo, 'template.controls'),
      });
    } else {
      changeState({
        templateId: it.id,
        name: it.name,
        type: 'preview',
        showPrintTemDialog: true,
        isDefault: it.type === PRINT_TYPE.SYS_PRINT,
        fileTypeNum: it.type,
      });
    }
  };

  const getViewText = () => {
    let viewText = '';
    if (it.range === 1) {
      viewText = _l('所有记录');
    } else if (it.range !== 1 && it.views.length <= 0) {
      viewText = _l('未指定视图');
    } else if (it.range === 3 && it.views.length > 0) {
      viewText = it.views.map(item => item.name || item.viewName).join('、');
    }
    return viewText;
  };

  const getFiltersLength = () => {
    const filters = filterData(
      worksheetControls.filter(item => {
        return item.viewDisplay || !('viewDisplay' in item);
      }) || [],
      it.filters || [],
    );
    const filtersLength = _.flatMap(filters, l => l.groupFilters).length;
    return filtersLength === 0 ? '' : `(${filtersLength})`;
  };

  return (
    <div className="printTemplatesList-tr" onClick={onPreview}>
      <SortHandle />
      <div className="name flex mRight20 valignWrapper overflowHidden">
        <Icon
          icon={PRINT_TYPE_STYLE[it.type] ? PRINT_TYPE_STYLE[it.type].icon : printInfo.icon}
          className={`iconTitle mRight13 ${
            [PRINT_TYPE.WORD_PRINT, PRINT_TYPE.EXCEL_PRINT].includes(it.type) || printInfo.icon !== 'doc'
              ? 'Font24'
              : 'Font22'
          }`}
        />
        <div className="flex overflow_ellipsis">
          {isRename && templateId === it.id ? (
            <input
              type="text"
              className="Font13"
              ref={inputRef}
              value={inputName}
              onChange={e => {
                e.stopPropagation();
                setInputName(e.target.value);
              }}
              onBlur={e => {
                e.stopPropagation();
                if (!_.trim(inputName)) {
                  alert(_l('请输入模板名称'), 3);
                  $(inputRef).focus();
                  return;
                }
                updatePrint(it.id, { name: inputName });
                editPrintName({ id: it.id, name: inputName });
                changeState({
                  templateId: '',
                  isRename: false,
                });
              }}
            />
          ) : (
            <Tooltip text={it.name}>
              <span className="overflow_ellipsis printName Font13">{it.name}</span>
            </Tooltip>
          )}
          {[PRINT_TYPE.QR_CODE_PRINT, PRINT_TYPE.BAR_CODE_PRINT].includes(it.type) && (
            <div className="printSize">{printInfo.text}</div>
          )}
        </div>
      </div>
      <div className="views flex mRight20">
        <span className="viewText printName WordBreak">{getViewText()}</span>
      </div>
      <div className="activeCon mRight8 w180px flexRow " onClick={e => e.stopPropagation()}>
        <Trigger
          popupVisible={showDropOption && templateId === it.id}
          action={['click']}
          popupAlign={{
            points: ['tl', 'bl'],
            overflow: { adjustX: true, adjustY: true },
          }}
          getPopupContainer={() => document.body}
          onPopupVisibleChange={showDropOption => {
            changeState({ showDropOption: showDropOption });
            if (isChangeDrop) {
              editPrintRange({
                id: it.id,
                range: it.range,
                viewsIds: it.views.map(o => o.viewId),
              });
            }
          }}
          popup={
            <RangeDrop
              className="printRangeDrop"
              printData={it}
              views={views}
              onClose={() => {
                changeState({ showDropOption: false });
              }}
              setData={data => {
                updatePrint(data.printData.id, { ...data.printData });
                changeState({ isChangeDrop: true });
              }}
            />
          }
        >
          <span
            className="Hand Bold"
            onClick={e => {
              changeState({
                templateId: it.id,
                showDropOption: true,
                isRename: false,
              });
            }}
          >
            {_l('使用范围')}
          </span>
        </Trigger>
        <span
          className="Hand Bold"
          onClick={e => {
            changeState({
              templateId: it.id,
              showFilters: true,
              isRename: false,
            });
          }}
        >
          {_l('筛选条件')}
          {getFiltersLength()}
        </span>
        {showFilters && templateId === it.id && (
          <ShowBtnFilterDialog
            title={_l('筛选条件')}
            description={_l('设置筛选条件，当满足条件时才显示打印模板。未设置条件始终显示')}
            sheetSwitchPermit={worksheetInfo.switches}
            projectId={worksheetInfo.projectId}
            appId={worksheetInfo.appId}
            columns={worksheetControls
              .filter(item => {
                return item.viewDisplay || !('viewDisplay' in item);
              })
              .map(control => redefineComplexControl(control))}
            filters={it.filters}
            isShowBtnFilterDialog={showFilters}
            setValue={({ filters, isShowBtnFilterDialog, isOk }) => {
              if (isOk) {
                const isEmptyFilter =
                  filterData(
                    worksheetControls.filter(item => {
                      return item.viewDisplay || !('viewDisplay' in item);
                    }) || [],
                    filters || [],
                  ).length === 0;
                editPrintFilters({
                  id: it.id,
                  filters: isEmptyFilter ? [] : filters,
                });
              }
              changeState({
                showFilters: isShowBtnFilterDialog,
              });
            }}
          />
        )}
        <span
          className="Hand Bold"
          onClick={e => {
            changeState({ isRename: false });
            if (_.includes([PRINT_TYPE.QR_CODE_PRINT, PRINT_TYPE.BAR_CODE_PRINT], it.type)) {
              printQrBarCode({
                isCharge: true,
                mode: 'editTemplate',
                id: it.id,
                printType: it.printType,
                projectId: worksheetInfo.projectId,
                worksheetId: worksheetInfo.worksheetId,
                controls: _.get(worksheetInfo, 'template.controls'),
                onClose: () => {
                  loadPrint({ worksheetId: worksheetInfo.worksheetId });
                },
              });
            } else if (isCustom) {
              // 上传的模板
              changeState({
                templateId: it.id,
                showEditPrint: true,
                type: 'edit',
                fileType: it.type === 5 ? 'Excel' : 'Word',
              });
            } else {
              // 系统模板
              changeState({
                templateId: it.id,
                type: 'edit',
                showPrintTemDialog: true,
                isDefault: it.type === PRINT_TYPE.SYS_PRINT,
              });
            }
          }}
        >
          {_l('编辑')}
        </span>
      </div>
      <div className="more w80px TxtCenter">
        <Icon
          icon="task-point-more"
          className="moreActive Hand Font18 Gray_9e Hover_21"
          onClick={e => {
            e.stopPropagation();
            changeState({
              templateId: it.id,
              showMoreOption: true,
              isRename: false,
            });
          }}
        />
        {showMoreOption && templateId === it.id && (
          <MoreOption
            isRename={isRename}
            templateId={it.id}
            showMoreOption={showMoreOption}
            onClickAwayExceptions={[]}
            onClickAway={() => changeState({ showMoreOption: false })}
            setFn={data => {
              changeState({
                ...data,
              });
            }}
            deleteFn={data => {
              deletePrint(it.id);
              changeState({
                ...data,
              });
            }}
          />
        )}
      </div>
    </div>
  );
});

const SortableList = SortableContainer(props => {
  const { items } = props;

  return (
    <div className="sortablePrintItemList">
      {items.map((it, index) => {
        let printInfo = getPrintCardInfoOfTemplate(it);
        let isCustom = [PRINT_TYPE.WORD_PRINT, PRINT_TYPE.EXCEL_PRINT].includes(it.type);
        let style = {};
        if (isCustom) style.background = PRINT_TYPE_STYLE[it.type].background;

        return (
          <SortableItem
            key={it.id || index}
            index={index}
            printInfo={printInfo}
            isCustom={isCustom}
            style={style}
            it={it}
            {...props}
          />
        );
      })}
    </div>
  );
});

class CreatePrintDrawer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      worksheetProjectId,
      onCloseDrawer,
      visible,
      addNewRecordPrintTemp,
      addWordPrintTemp,
      addCodePrintTemp,
      addExcelPrintTemp,
    } = this.props;

    const currentProjectId = worksheetProjectId || (md.global.Account.projects[0] || {}).projectId;
    const featureType = getFeatureStatus(currentProjectId, VersionProductType.wordPrintTemplate);

    return (
      <Drawer
        width={400}
        className="printTempDrawer"
        title={_l('创建打印模板')}
        placement="right"
        mask={false}
        onClose={onCloseDrawer}
        visible={visible}
      >
        <p className="printTempDrawerListTitle">{_l('通过系统默认打印创建')}</p>
        <div className="printTempDrawerListItem" onClick={addNewRecordPrintTemp}>
          <span className="iconbox">
            <Icon icon="doc" className="printTempDrawerListItemIcon" />
          </span>
          {_l('记录打印')}
        </div>
        <div
          className="printTempDrawerListItem"
          onClick={() => {
            addCodePrintTemp(PRINT_TYPE.BAR_CODE_PRINT);
            onCloseDrawer();
          }}
        >
          <span className="iconbox">
            <Icon icon="a-barcode" className="printTempDrawerListItemIcon" />
          </span>
          {_l('条形码打印')}
        </div>
        <div
          className="printTempDrawerListItem"
          onClick={() => {
            addCodePrintTemp(PRINT_TYPE.QR_CODE_PRINT);
            onCloseDrawer();
          }}
        >
          <span className="iconbox">
            <Icon icon="qr_code" className="printTempDrawerListItemIcon" />
          </span>
          {_l('二维码打印')}
        </div>
        {featureType && (
          <React.Fragment>
            <p className="printTempDrawerListTitle" style={{ marginTop: '35px' }}>
              {_l('自定义')}
            </p>
            <div className="printTempDrawerListItem" onClick={addWordPrintTemp}>
              <span className="iconbox">
                <Icon icon="new_word" className="printTempDrawerListItemIcon" />
              </span>
              {_l('上传 Word 模板')}
              {featureType === '2' && <UpgradeIcon />}
            </div>
            <div className="printTempDrawerListItem" onClick={addExcelPrintTemp}>
              <span className="iconbox">
                <Icon icon="new_excel" className="printTempDrawerListItemIcon" />
              </span>
              {_l('上传 Excel 模板')}
              {featureType === '2' && <UpgradeIcon />}
            </div>
          </React.Fragment>
        )}
      </Drawer>
    );
  }
}
class Print extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showEditPrint: false,
      isRename: false,
      templateId: '', // 当前正在编辑的模板ID
      showDeletePrint: false, // 删除模板确认层
      showMoreOption: false, // 更多操作
      showDropOption: false,
      showPrintTemDialog: false,
      type: '',
      isDefault: false,
      isChangeDrop: false,
      showCreatePrintTemp: false,
      fileType: undefined, // 自定义模版 word/excel
      fileTypeNum: null,
      printData: [],
      defaulteTemData: [],
      codeTemData: [],
      loading: false,
      showFilters: false,
      sortIds: [],
    };
  }
  componentDidMount() {
    const { worksheetId } = this.props;
    this.loadPrint({ worksheetId: worksheetId }); // 获取当前模板
  }

  loadPrint = ({ worksheetId }) => {
    this.setState({ loading: true });
    sheetAjax
      .getPrintList({
        worksheetId,
      })
      .then(data => {
        this.setState({
          loading: false,
          printData: data,
        });
      });
  };

  addDrawerPrintTemp = fileType => {
    const { worksheetInfo } = this.props;
    if (getFeatureStatus(worksheetInfo.projectId, VersionProductType.wordPrintTemplate) === '2') {
      buriedUpgradeVersionDialog(worksheetInfo.projectId, VersionProductType.wordPrintTemplate);
    } else {
      this.setState({
        ...this.state,
        showEditPrint: true,
        templateId: '',
        type: 'new',
        showCreatePrintTemp: false,
        fileType: fileType,
      });
    }
  };

  editPrintFilters = ({ id, filters }) => {
    const { worksheetId } = this.props;
    sheetAjax.editPrintFilter({ id, filters: (filters || []).map(handleCondition) }).then(res => {
      if (!res) {
        alert(_l('修改失败'), 2);
      } else {
        this.loadPrint({ worksheetId });
      }
    });
  };

  editPrintName = ({ id, name }) => {
    const { worksheetId } = this.props;
    sheetAjax
      .editPrintName({
        id,
        name,
      })
      .then(res => {
        if (!res) {
          alert(_l('修改失败'), 2);
          this.loadPrint({ worksheetId });
        }
      });
  };

  updatePrint = (id, data) => {
    const { printData } = this.state;
    let dataP = printData.filter(item => item.id === id);
    let da = [];
    printData.map(o => {
      if (o.id !== id) {
        da.push(o);
      } else {
        da.push({
          ...dataP[0],
          ...data,
        });
      }
    });
    this.setState({
      printData: da,
    });
  };

  deletePrint = id => {
    sheetAjax
      .deletePrint({
        id,
      })
      .then(res => {
        this.loadPrint({ worksheetId: this.props.worksheetId });
      });
  };

  editPrintRange = ({ id, range, viewsIds }) => {
    sheetAjax
      .editPrintRange({
        range,
        id,
        viewsIds,
      })
      .then(res => {
        if (!res) {
          alert(_l('修改失败'), 2);
          this.loadPrint({ worksheetId: this.props.worksheetId });
        }
      });
  };

  onSortEnd = ({ oldIndex, newIndex }, type) => {
    const { printData } = this.state;
    const { worksheetInfo = {}, worksheetId } = this.props;

    let defaulteTemIds = printData
      .filter(it => [PRINT_TYPE.SYS_PRINT, PRINT_TYPE.WORD_PRINT, PRINT_TYPE.EXCEL_PRINT].includes(it.type))
      .map(l => {
        return {
          printId: l.id,
        };
      }); //记录打印
    let codeTemIds = printData
      .filter(it => it.type === PRINT_TYPE.QR_CODE_PRINT || it.type === PRINT_TYPE.BAR_CODE_PRINT)
      .map(l => {
        return {
          printId: l.id,
        };
      }); //条码打印

    if (type === 0) {
      defaulteTemIds = arrayMove(defaulteTemIds, oldIndex, newIndex);
    } else {
      codeTemIds = arrayMove(codeTemIds, oldIndex, newIndex);
    }

    const sortItems = defaulteTemIds.concat(codeTemIds).map((l, i) => {
      return {
        ...l,
        sort: i,
      };
    });

    sheetAjax
      .editPrintTemplateSort({
        projectId: worksheetInfo.projectId,
        worksheetId: worksheetId,
        sortItems: sortItems,
      })
      .then(res => {
        if (res) {
          const sorData = [];
          sortItems.forEach(l => {
            let it = printData.find(m => l.printId === m.id);
            sorData.push(it);
          });
          this.setState({
            printData: sorData,
          });
        }
      });
  };

  changeState = value => {
    this.setState({
      ...value,
    });
  };

  renderPrintItem = (data, type) => {
    const { showDropOption, isRename, templateId, showMoreOption, isChangeDrop, showFilters } = this.state;
    const { worksheetInfo = {}, worksheetControls } = this.props;
    const { views = [] } = worksheetInfo;

    return (
      <SortableList
        useDragHandle
        axis={'xy'}
        worksheetInfo={worksheetInfo}
        worksheetControls={worksheetControls}
        showDropOption={showDropOption}
        isRename={isRename}
        isChangeDrop={isChangeDrop}
        showFilters={showFilters}
        showMoreOption={showMoreOption}
        templateId={templateId}
        hideSortableGhost
        transitionDuration={0}
        helperClass="sortablePrintTempItemHelperClass"
        distance={3}
        items={data}
        onSortEnd={param => this.onSortEnd(param, type)}
        updatePrint={this.updatePrint}
        changeState={this.changeState}
        editPrintName={this.editPrintName}
        deletePrint={this.deletePrint}
        editPrintRange={this.editPrintRange}
        editPrintFilters={this.editPrintFilters}
        loadPrint={this.loadPrint}
      />
    );
  };

  renderCon = () => {
    const { worksheetId, worksheetInfo = {} } = this.props;
    const {
      showEditPrint,
      list,
      isRename,
      templateId,
      showMoreOption,
      showCreatePrintTemp,
      fileType,
      printData = [],
    } = this.state;
    let defaulteTemData = printData.filter(it =>
      [PRINT_TYPE.SYS_PRINT, PRINT_TYPE.WORD_PRINT, PRINT_TYPE.EXCEL_PRINT].includes(it.type),
    ); //记录打印
    let codeTemData = printData.filter(
      it => it.type === PRINT_TYPE.QR_CODE_PRINT || it.type === PRINT_TYPE.BAR_CODE_PRINT,
    ); //条码打印
    return (
      <div className="printBox Relative">
        <div className="printBoxList">
          <div className="h100 overflowHidden">
            <div className="topBoxText">
              <div className="textCon">
                <h5 className="formName Gray Font17 Bold">{_l('打印模板')}</h5>
                <p className="desc mTop8">
                  <span className="Font13 Gray_9e">
                    {_l('保存系统打印的配置为模板，或上传 Word、Excel 模板自由定义记录打印的样式。')}
                  </span>
                  <Support type={3} text={_l('帮助')} href="https://help.mingdao.com/worksheet/print-template" />
                </p>
              </div>
              <span
                className="add Relative bold"
                onClick={() => {
                  this.setState({
                    showCreatePrintTemp: true,
                  });
                }}
              >
                <Icon icon="plus" className="mRight8" />
                {_l('新建模板')}
              </span>
            </div>
            {printData.length <= 0 ? (
              <p className="noData">
                <Icon icon="print" className="icon" />
                <br />
                {_l('暂无打印模板')}
              </p>
            ) : (
              <React.Fragment>
                <div className="printTemplatesList withPrintTemp flex overflowHidden flexColumn">
                  <div className="printTemplatesList-header">
                    <div className="name flex mRight20 valignWrapper overflow_ellipsis">{_l('名称')}</div>
                    <div className="views flex mRight20">{_l('使用范围')}</div>
                    <div className="action mRight8 w180px">{_l('操作')}</div>
                    <div className="more w80px"></div>
                  </div>
                  <div className="printTemplatesList-box flex">
                    {defaulteTemData.length > 0 && <p className="printTemTi">{_l('记录打印')}</p>}
                    {defaulteTemData.length > 0 && this.renderPrintItem(defaulteTemData || [], 0)}
                    {codeTemData.length > 0 && <p className="printTemTi">{_l('条码打印')}</p>}
                    {codeTemData.length > 0 && this.renderPrintItem(codeTemData || [], 1)}
                  </div>
                </div>
              </React.Fragment>
            )}
          </div>
          <CSSTransitionGroup transitionName="EditPrint" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
            {showEditPrint && (
              <EditPrint
                onClickAwayExceptions={[]}
                downLoadUrl={worksheetInfo.downLoadUrl}
                onClickAway={() => this.setState({ showEditPrint: false, type: '' })}
                onClose={() => {
                  this.setState({ showEditPrint: false, type: '' });
                }}
                printData={printData}
                templateId={templateId}
                worksheetId={worksheetId}
                fileType={fileType}
                updatePrint={this.updatePrint}
                refreshFn={() => {
                  this.setState({ showEditPrint: false, type: '' });
                  this.loadPrint({ worksheetId: worksheetId }); // 获取当前模板
                }}
              />
            )}
          </CSSTransitionGroup>
          <CreatePrintDrawer
            worksheetProjectId={worksheetInfo.projectId}
            onCloseDrawer={() => {
              this.setState({ showCreatePrintTemp: false });
            }}
            visible={showCreatePrintTemp}
            addNewRecordPrintTemp={() => {
              this.setState({
                ...this.state,
                showPrintTemDialog: true,
                templateId: '',
                type: 'new',
                isDefault: true,
                showCreatePrintTemp: false,
              });
            }}
            addWordPrintTemp={() => this.addDrawerPrintTemp('Word')}
            addExcelPrintTemp={() => this.addDrawerPrintTemp('Excel')}
            addCodePrintTemp={type => {
              printQrBarCode({
                isCharge: true,
                mode: 'newTemplate',
                printType: type === PRINT_TYPE.QR_CODE_PRINT ? 1 : 3,
                projectId: worksheetInfo.projectId,
                worksheetId: worksheetInfo.worksheetId,
                controls: _.get(worksheetInfo, 'template.controls'),
                onClose: () => {
                  this.loadPrint({ worksheetId: worksheetInfo.worksheetId });
                },
              });
            }}
          />
        </div>
      </div>
    );
  };

  render() {
    const { loading } = this.state;
    const { worksheetInfo = {}, worksheetId } = this.props;
    const { views = [] } = worksheetInfo;
    let viewId = '';
    return (
      <React.Fragment>
        {loading ? <LoadDiv /> : this.renderCon()}
        {this.state.showPrintTemDialog && (
          <PrintTemDialog
            printId={this.state.templateId}
            name={this.state.name}
            type={this.state.type} // 预览编辑新建
            isDefault={this.state.isDefault}
            worksheetId={worksheetId}
            projectId={worksheetInfo.projectId}
            rowId={''}
            viewId={viewId}
            appId={worksheetInfo.appId}
            getType={1}
            workId={''}
            from="formSet" // 表单设置
            fileTypeNum={this.state.fileTypeNum}
            onBack={value => {
              this.loadPrint({ worksheetId: worksheetId }); // 获取当前模板
              this.setState({
                showPrintTemDialog: false,
                type: '',
                templateId: '',
                name: '',
              });
            }}
          />
        )}
      </React.Fragment>
    );
  }
}

export default Print;
