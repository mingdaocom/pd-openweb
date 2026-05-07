import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Support } from 'ming-ui';
import { FIELD_RULE_TIP_URL, SELECT_FIELD_TIP } from '../../../../core/config';
import CollapsePanel from '../../../CollapsePanel';
import { useCreateKnowledgeStore } from '../../index';
import {
  addSelectedField,
  removeSelectedField,
  removeSelectedWorksheet,
  setAttachmentParseEnhanced,
  setFilterConditions,
  setWorksheetDiscuss,
  setWorksheetEnhance,
} from '../../store/actions';
import SelectSheetDropDown from '../SelectSheetDropdown';
import './index.less';

const FieldConfig = ({ attachmentEnhancedTip }) => {
  const { state, dispatch } = useCreateKnowledgeStore();
  const { appId, projectId, selectedWorksheetList } = state;
  const hasInitExpanded = useRef(false);

  const [expandedKey, setExpandedKey] = useState(null);

  useEffect(() => {
    if (hasInitExpanded.current) return;
    if (!selectedWorksheetList.length) return;

    setExpandedKey(selectedWorksheetList[0].worksheetId);
    hasInitExpanded.current = true;
  }, [selectedWorksheetList]);

  const handleAddSelectedField = ({ worksheetId, control }) => {
    addSelectedField(dispatch, { worksheetId, control });
  };

  const handleRemoveSelectedField = ({ worksheetId, control }) => {
    removeSelectedField(dispatch, { worksheetId, control });
  };

  const handleSetWorksheetDiscuss = ({ worksheetId }) => {
    setWorksheetDiscuss(dispatch, { worksheetId });
  };

  const handleSetWorksheetEnhance = ({ worksheetId }) => {
    setWorksheetEnhance(dispatch, { worksheetId });
  };

  const handleSetAttachmentParseEnhanced = ({ worksheetId }) => {
    setAttachmentParseEnhanced(dispatch, { worksheetId });
  };

  const handleSaveFilterConditions = ({ filter, worksheetId }) => {
    setFilterConditions(dispatch, { filterConditions: filter, worksheetId });
  };

  const handleRemoveSelectedWorksheet = ({ worksheetId }) => {
    removeSelectedWorksheet(dispatch, worksheetId);
  };

  return (
    <div className="fieldConfigContainer">
      <div className="subTitle">
        {SELECT_FIELD_TIP}
        <Support className="link" type={3} href={FIELD_RULE_TIP_URL} text={_l('查看具体规则')} />
      </div>
      <div className="collapsePanelList">
        <ScrollView>
          <div className="collapsePanelBox">
            {selectedWorksheetList.map(item => (
              <CollapsePanel
                key={item.worksheetId}
                appId={appId}
                projectId={projectId}
                expanded={expandedKey === item.worksheetId}
                attachmentEnhancedTip={attachmentEnhancedTip}
                selectedWorksheetItem={item}
                onToggle={() => setExpandedKey(expandedKey === item.worksheetId ? null : item.worksheetId)}
                onAddSelectedField={handleAddSelectedField}
                onRemoveSelectedWorksheet={handleRemoveSelectedWorksheet}
                onRemoveSelectedField={handleRemoveSelectedField}
                onSetWorksheetDiscuss={handleSetWorksheetDiscuss}
                onSetWorksheetEnhance={handleSetWorksheetEnhance}
                onSetAttachmentParseEnhanced={handleSetAttachmentParseEnhanced}
                onSaveFilterConditions={handleSaveFilterConditions}
              />
            ))}
          </div>
        </ScrollView>
      </div>
      <div className="addSheetButton">
        <SelectSheetDropDown />
      </div>
    </div>
  );
};

export default FieldConfig;
