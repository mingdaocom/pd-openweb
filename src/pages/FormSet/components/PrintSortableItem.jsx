import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { Icon, Tooltip } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import { printQrBarCode } from 'worksheet/common/PrintQrBarCode';
import { formatValuesOfCondition, redefineComplexControl } from 'worksheet/common/WorkSheetFilter/util';
import { selectRecords } from 'src/components/SelectRecords';
import { filterData } from 'src/pages/FormSet/components/columnRules/config.js';
import { PRINT_TYPE, PRINT_TYPE_STYLE } from 'src/pages/Print/config';
import ShowBtnFilterDialog from 'src/pages/worksheet/common/CreateCustomBtn/components/ShowBtnFilterDialog.jsx';
import { getPrintCardInfoOfTemplate } from 'src/pages/worksheet/common/PrintQrBarCode/enum';
import MoreOption from './MoreOption';
import RangeDrop from './RangeDrop';

export default function PrintSortableItem(props) {
  const { item, worksheetInfo = {}, worksheetControls = [], updatePrint, changeState, loadPrint, DragHandle } = props;
  const { views = [], worksheetId } = worksheetInfo;
  const printInfo = getPrintCardInfoOfTemplate(item);
  const isCustom = [PRINT_TYPE.WORD_PRINT, PRINT_TYPE.EXCEL_PRINT].includes(item.type);
  const inputRef = useRef();

  const [inputName, setInputName] = useState(item.name);
  const [isRename, setIsRename] = useState(false);
  const [showMoreOption, setShowMoreOption] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDropOption, setShowDropOption] = useState(false);
  const [isChangeDrop, setIsChangeDrop] = useState(false);

  const onPreview = (isEdit = false, options) => {
    if ($('.printTemplatesList-tr .name input')[0] && isEdit) return;

    !isEdit && setIsRename(false);

    if (_.includes([PRINT_TYPE.QR_CODE_PRINT, PRINT_TYPE.BAR_CODE_PRINT], item.type)) {
      printQrBarCode({
        isCharge: isEdit,
        mode: isEdit ? 'editTemplate' : 'preview',
        id: item.id,
        printType: item.printType,
        projectId: worksheetInfo.projectId,
        worksheetId,
        controls: _.get(worksheetInfo, 'template.controls'),
        onClose: () => {
          isEdit && loadPrint({ worksheetId });
        },
      });
    } else {
      let params = {};

      if (!isEdit) {
        params = { name: item.name, fileTypeNum: item.type, isDefault: item.type === PRINT_TYPE.SYS_PRINT };
      } else if (isCustom) {
        params = { fileType: item.type === 5 ? 'Excel' : 'Word' };
      } else {
        params = { isDefault: item.type === PRINT_TYPE.SYS_PRINT };
      }

      changeState({
        templateId: item.id,
        type: isEdit ? 'edit' : 'preview',
        [isEdit && isCustom ? 'showEditPrint' : 'showPrintTemDialog']: true,
        ...params,
        ...options,
      });
    }
  };

  const getViewText = () => {
    let viewText = '';

    if (item.range === 1) {
      viewText = _l('所有记录');
    } else if (item.views.length <= 0) {
      viewText = _l('未指定视图');
    } else if (item.range === 3 && item.views.length > 0) {
      viewText = item.views.map(item => item.name || item.viewName).join('、');
    }

    return viewText;
  };

  const getFiltersLength = () => {
    const filters = filterData(
      worksheetControls.filter(item => {
        return item.viewDisplay || !('viewDisplay' in item);
      }) || [],
      item.filters || [],
    );
    const filtersLength = _.flatMap(filters, l => l.groupFilters).length;

    return filtersLength === 0 ? '' : `(${filtersLength})`;
  };

  const editPrintName = e => {
    e.stopPropagation();

    if (!_.trim(inputName)) {
      alert(_l('请输入模板名称'), 3);
      $(inputRef).focus();
      return;
    }

    sheetAjax
      .editPrintName({
        id: item.id,
        name: inputName,
      })
      .then(res => {
        if (res) {
          setIsRename(false);
          updatePrint(item.id, { name: inputName });
        } else {
          alert(_l('修改失败'), 2);
        }
      });
  };

  const editPrintFilters = ({ filters, isShowBtnFilterDialog, isOk }) => {
    setShowFilters(isShowBtnFilterDialog);

    if (isOk) {
      const isEmptyFilter =
        filterData(
          worksheetControls.filter(item => {
            return item.viewDisplay || !('viewDisplay' in item);
          }) || [],
          filters || [],
        ).length === 0;
      const _filters = isEmptyFilter ? [] : filters || [];

      sheetAjax.editPrintFilter({ id: item.id, filters: _filters.map(formatValuesOfCondition) }).then(res => {
        if (!res) {
          alert(_l('修改失败'), 2);
        } else {
          loadPrint({ worksheetId });
        }
      });
    }
  };

  const deletePrint = () => {
    sheetAjax.deletePrint({ id: item.id }).then(res => {
      res && loadPrint({ worksheetId });
    });
  };

  const editPrintRange = showDropOption => {
    setShowDropOption(showDropOption);

    if (isChangeDrop) {
      sheetAjax
        .editPrintRange({
          id: item.id,
          range: item.range,
          viewsIds: item.views.map(o => o.viewId),
          worksheetId,
        })
        .then(res => {
          if (!res) {
            alert(_l('修改失败'), 2);
            loadPrint({ worksheetId });
          }
        });
    }
  };

  const onRename = ({ isRename, showMoreOption }) => {
    if (isRename) {
      setInputName(item.name);
      $(inputRef).focus();
    }

    setIsRename(isRename);
    setShowMoreOption(showMoreOption);
  };

  const onClickPreview = () => {
    selectRecords({
      canSelectAll: false,
      pageSize: 25,
      multiple: false,
      singleConfirm: true,
      onText: _l('开始预览'),
      allowNewRecord: true,
      allowAdd: true,
      worksheetId,
      onOk: selectedRecords => {
        const rowId = _.get(selectedRecords, '[0].rowid');
        onPreview(false, { previewRowId: rowId });
      },
    });
  };

  const renderMoreOption = () => {
    return (
      <Trigger
        popupVisible={showMoreOption}
        action={['click']}
        popupAlign={{
          points: ['tl', 'bl'],
          overflow: { adjustX: true, adjustY: true },
        }}
        getPopupContainer={() => document.body}
        onPopupVisibleChange={value => setShowMoreOption(value)}
        popup={
          <MoreOption
            isRename={isRename}
            templateId={item.id}
            showMoreOption={showMoreOption}
            onClickAwayExceptions={[]}
            onClickAway={() => setShowMoreOption(false)}
            setFn={onRename}
            deleteFn={deletePrint}
          />
        }
      >
        <Icon
          icon="task-point-more"
          className="moreActive Hand Font18 Gray_9e Hover_21"
          onClick={e => {
            e.stopPropagation();
            setIsRename(false);
            setShowMoreOption(true);
          }}
        />
      </Trigger>
    );
  };

  const renderDropOption = () => {
    return (
      <Trigger
        popupVisible={showDropOption}
        action={['click']}
        popupAlign={{
          points: ['tl', 'bl'],
          overflow: { adjustX: true, adjustY: true },
        }}
        getPopupContainer={() => document.body}
        onPopupVisibleChange={editPrintRange}
        popup={
          <RangeDrop
            className="printRangeDrop"
            printData={item}
            views={views}
            onClose={() => setShowDropOption(false)}
            setData={data => {
              updatePrint(data.printData.id, { ...data.printData });
              setIsChangeDrop(true);
            }}
          />
        }
      >
        <span
          className="Hand Bold"
          onClick={e => {
            setIsRename(false);
            setShowDropOption(true);
          }}
        >
          {_l('使用范围')}
        </span>
      </Trigger>
    );
  };

  const renderFilter = () => {
    return (
      <React.Fragment>
        <span
          className="Hand Bold"
          onClick={e => {
            setIsRename(false);
            setShowFilters(true);
          }}
        >
          {_l('筛选条件')}
          {getFiltersLength()}
        </span>
        {showFilters && (
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
            filters={item.filters}
            isShowBtnFilterDialog={showFilters}
            setValue={editPrintFilters}
          />
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="printTemplatesList-tr" onClick={() => onPreview(true)}>
      <DragHandle>
        <Icon className="Font14 Hand Gray_9e Hover_21 dragIcon" icon="drag" />
      </DragHandle>
      <div className="name flex mRight20 valignWrapper overflowHidden">
        <Icon
          icon={PRINT_TYPE_STYLE[item.type] ? PRINT_TYPE_STYLE[item.type].icon : printInfo.icon}
          className={`iconTitle mRight8 ${
            [PRINT_TYPE.WORD_PRINT, PRINT_TYPE.EXCEL_PRINT].includes(item.type) || printInfo.icon !== 'doc'
              ? 'Font24'
              : 'Font22'
          }`}
        />
        <div className="flex overflow_ellipsis">
          {isRename ? (
            <input
              type="text"
              className="Font13 renameInput"
              ref={inputRef}
              value={inputName}
              onChange={e => {
                e.stopPropagation();
                setInputName(e.target.value);
              }}
              onBlur={editPrintName}
            />
          ) : (
            <Tooltip text={item.name}>
              <span className="overflow_ellipsis printName Font13">{item.name}</span>
            </Tooltip>
          )}
          {[PRINT_TYPE.QR_CODE_PRINT, PRINT_TYPE.BAR_CODE_PRINT].includes(item.type) && (
            <div className="printSize">{printInfo.text}</div>
          )}
        </div>
      </div>
      <div className="views flex mRight20">
        <span className="viewText printName WordBreak">{getViewText()}</span>
      </div>
      <div className="activeCon mRight8 w180px flexRow " onClick={e => e.stopPropagation()}>
        {renderDropOption()}
        {renderFilter()}
        <span className="Hand Bold" onClick={() => onPreview(true)}>
          {_l('编辑')}
        </span>
        <span className="Hand Bold" onClick={onClickPreview}>
          {_l('预览')}
        </span>
      </div>
      <div className="more w80px TxtCenter">{renderMoreOption()}</div>
    </div>
  );
}
