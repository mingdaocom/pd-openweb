import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { Modal } from 'ming-ui';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ControlSelect from 'worksheet/components/ControlSelect';
import worksheetApi from 'src/api/worksheet';
import useApi from 'worksheet/hooks/useApi';
import { find, get, isEmpty, some, omit, isFunction } from 'lodash';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils';
import { replaceControlsTranslateInfo, checkCellIsEmpty, controlBatchCanEdit } from 'worksheet/util';
import { handleBatchUpdateRecords, getEditType } from './controller';
import EditControlItem from './EditControlItem';

const Con = styled.div`
  padding: 16px 23px;
  .addFilterCondition {
    display: inline-block;
  }
  .location {
    margin-bottom: 30px;
  }
`;

const Title = styled.div`
  font-size: 17px;
  color: #151515;
  font-weight: bold;
`;

const Description = styled.div`
  margin-top: 4px;
  font-size: 13px;
  color: #9e9e9e;
`;

const SelectControlButton = styled.div`
  display: inline-block;
  font-weight: 500;
  margin-top: 16px;
  display: inline-flex;
  height: 36px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  background-color: #f8f8f8;
  padding: 0 16px;
  font-size: 13px;
  color: #2196f3;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const PlusIcon = styled.span`
  font-family: Arial;
  margin-right: 2px;
  font-size: 18px;
`;

const EditCon = styled.div`
  margin: 0px -23px;
  padding: 0px 23px;
  overflow-y: auto;
  max-height: ${props => (props.maxHeight ? `${props.maxHeight}px` : '400px')};
`;

export default function BatchEditRecord(props) {
  const {
    isCharge,
    appId,
    worksheetId,
    projectId,
    viewId,
    view = { controls: [] },
    recordId,
    selectedRows,
    allWorksheetIsSelected,
    searchArgs,
    quickFilter,
    navGroupFilters,
    filtersGroup,
    reloadWorksheet,
    activeControl,
    defaultWorksheetInfo,
    triggerBatchUpdateRecords,
    clearSelect = () => {},
    hideEditRecord = () => {},
    updateRows = () => {},
    onUpdate = () => {},
    getWorksheetSheetViewSummary = () => {},
    onClose,
  } = props;
  const editConRef = useRef(null);
  const addRef = useRef(null);
  const refCache = useRef({});
  const [loading, error, worksheetInfo] = useApi(
    worksheetApi.getWorksheetInfo,
    {
      appId,
      worksheetId,
      getTemplate: true,
    },
    defaultWorksheetInfo,
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedControls, setSelectedControls] = useState([]);
  const controlsForSelect = useMemo(() => {
    const formData = replaceControlsTranslateInfo(appId, worksheetId, get(worksheetInfo, 'template.controls', []));
    const result = formData.filter(c => controlBatchCanEdit(c, view));
    return result;
  }, [worksheetInfo]);
  const filteredSelectedControls = useMemo(() => {
    return controlsForSelect.filter(control => !find(selectedControls, c => c.control.controlId === control.controlId));
  }, [selectedControls.map(c => c.id).join(','), controlsForSelect]);
  const handleEdit = useCallback(() => {
    let hasError;
    hasError = some(
      selectedControls
        .filter(c => c.type === 'modify')
        .map(
          c =>
            get(refCache, `current.${c.id}.getSubmitData`).bind(get(refCache, `current.${c.id}`))({
              ignoreAlert: true,
            }).error,
        ),
    );
    const hasAuthRowIds = selectedRows.filter(row => row.allowedit || row.allowEdit).map(row => row.rowid);
    if (!allWorksheetIsSelected && hasAuthRowIds.length === 0) {
      alert(_l('无权限修改选择的%0', worksheetInfo.entityName), 2);
      return false;
    }
    if (hasError) {
      alert(_l('请正确填写%0', worksheetInfo.entityName), 3);
      return false;
    }
    let ownerIsEmpty = false;
    const needUpdateControls = selectedControls
      .map(item => {
        let newItem;
        if (item.type === 'modify') {
          if (item.id === 'ownerid') {
            const ownerValue = get(safeParse(item.value), '0.accountId', '');
            if (!ownerValue) {
              ownerIsEmpty = true;
            }
            newItem = {
              controlId: item.id,
              type: item.control.type,
              value: ownerValue,
            };
            newItem.sourceValue = item.value;
          } else {
            newItem = formatControlToServer(
              {
                ...item.control,
                value: item.value,
              },
              { needFullUpdate: !recordId },
            );
            newItem.sourceValue = item.value;
          }
        } else {
          newItem = {
            editType: item.type,
            controlId: item.id,
            type: item.control.type,
            value: '',
          };
        }
        return newItem;
      })
      .filter(item => item.editType === 'clear' || !checkCellIsEmpty(item.value));
    if (ownerIsEmpty) {
      alert(_l('拥有者不能为空'), 3);
      return;
    }
    if (!needUpdateControls.length) {
      alert(_l('请至少修改一个字段'), 3);
      return;
    }
    setIsUpdating(true);
    if (isFunction(triggerBatchUpdateRecords)) {
      triggerBatchUpdateRecords({ needUpdateControls, onClose });
      return;
    }
    handleBatchUpdateRecords({
      appId,
      viewId,
      worksheetId,
      needUpdateControls: needUpdateControls.map(c => omit(c, 'editType', 'sourceValue')),
      selectedRows,
      allWorksheetIsSelected,
      hasAuthRowIds,
      searchArgs,
      quickFilter,
      navGroupFilters,
      filtersGroup,
      reloadWorksheet,
      clearSelect,
      hideEditRecord,
      updateRows,
      getWorksheetSheetViewSummary,
      worksheetInfo,
      selectedControls,
      onClose,
      onUpdate: () => {
        onUpdate({ needUpdateControls });
      },
      setIsUpdating,
    });
  }, [selectedControls, refCache]);
  useEffect(() => {
    if (activeControl) {
      setSelectedControls(prev => [
        ...prev,
        { id: activeControl.controlId, control: activeControl, type: getEditType(activeControl) },
      ]);
    }
  }, [activeControl]);
  useEffect(() => {
    if (!loading && addRef.current && !activeControl) {
      addRef.current.click();
    }
  }, [loading]);
  return (
    <Modal
      visible
      keyboard
      width={680}
      bodyStyle={{ padding: 0, position: 'relative' }}
      okDisabled={isEmpty(selectedControls) || isUpdating}
      onOk={() => {
        handleEdit();
      }}
      onCancel={onClose}
    >
      <Con>
        <Title>{_l('批量编辑')}</Title>
        <Description>{_l('通过批量编辑，您可以快速统一修改相同字段的数据内容。')}</Description>
        <EditCon className="mTop12" ref={editConRef} maxHeight={window.innerHeight - 32 * 2 - 86 - 80 - 52}>
          {selectedControls.map(item => (
            <EditControlItem
              isCharge={isCharge}
              appId={appId}
              worksheetId={worksheetId}
              projectId={projectId}
              key={item.control.controlId}
              control={item.control}
              type={item.type}
              setRef={ref => {
                refCache.current[item.id] = ref;
              }}
              onChange={changes => {
                setSelectedControls(prev =>
                  prev.map(prevItem => (prevItem.id === item.id ? { ...prevItem, ...changes } : prevItem)),
                );
              }}
              onDelete={() => {
                setSelectedControls(prev => prev.filter(prevItem => prevItem.id !== item.id));
              }}
            />
          ))}
        </EditCon>
        {!!filteredSelectedControls.length && (
          <ControlSelect
            isAppendToBody
            doNotCloseMenuWhenAdd
            offset={[0, 4]}
            popupStyle={{ width: 220 }}
            controls={filteredSelectedControls}
            onChange={selected => {
              setSelectedControls(prev => [
                ...prev,
                {
                  id: selected.controlId,
                  control: selected,
                  type: getEditType(selected),
                },
              ]);
              setTimeout(() => {
                editConRef.current.scrollTop = editConRef.current.scrollHeight;
              }, 0);
            }}
          >
            <SelectControlButton ref={addRef}>
              <PlusIcon>+</PlusIcon>
              {_l('选择字段')}
            </SelectControlButton>
          </ControlSelect>
        )}
      </Con>
    </Modal>
  );
}
BatchEditRecord.propTypes = {
  isCharge: PropTypes.bool,
  appId: PropTypes.string,
  worksheetId: PropTypes.string,
  projectId: PropTypes.string,
  viewId: PropTypes.string,
  view: PropTypes.shape({}),
  recordId: PropTypes.string,
  onClose: PropTypes.func,
  activeControl: PropTypes.shape({}),
  selectedControl: PropTypes.shape({}),
  selectedRows: PropTypes.arrayOf(PropTypes.shape({})),
  allWorksheetIsSelected: PropTypes.bool,
  hasAuthRowIds: PropTypes.arrayOf(PropTypes.string),
  searchArgs: PropTypes.shape({}),
  quickFilter: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  navGroupFilters: PropTypes.shape({}),
  filtersGroup: PropTypes.shape({}),
  reloadWorksheet: PropTypes.func,
  clearSelect: PropTypes.func,
  hideEditRecord: PropTypes.func,
  updateRows: PropTypes.func,
  getWorksheetSheetViewSummary: PropTypes.func,
  triggerBatchUpdateRecords: PropTypes.func,
  defaultWorksheetInfo: PropTypes.shape({}),
};
