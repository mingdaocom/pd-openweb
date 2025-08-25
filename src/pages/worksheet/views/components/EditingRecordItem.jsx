import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import worksheetAjax from 'src/api/worksheet';
import { FORM_ERROR_TYPE_TEXT } from 'src/components/newCustomFields/tools/config';
import { getAdvanceSetting } from 'src/pages/widgetConfig/util/setting';
import BaseCard from './BaseCard';
import EditText from './EditText';

const EditingCardWrap = styled.div`
  position: absolute;
  width: ${porps => `${porps.width ? porps.width : 280}px`};
  border-radius: 3px;
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 3px;
  .editTitleTextInput {
    border: none;
    width: 100%;
    padding: 10px 14px;
    resize: none;
    font-weight: 700;
  }
`;

export default function EditingRecord(props) {
  const { stateData = {}, data, type, style, currentView, updateTitleData, closeEdit } = props;
  const rowId = data.rowId;
  let { childType, viewControls } = currentView;

  const updateRow = (controlItem, value, needUpdate) => {
    if (!needUpdate) {
      closeEdit();
      return;
    }
    if (type === 'board') {
      updateTitleData({ ...controlItem, value });
      closeEdit();
      return;
    }
    let worksheetId = currentView.worksheetId;
    if (String(childType) === '2') {
      const currentIndex = stateData.path.length - 1;
      worksheetId = _.get(viewControls[currentIndex], 'worksheetId');
    }
    worksheetAjax.updateWorksheetRow({ rowId, worksheetId, newOldControl: [{ ...controlItem, value }] }).then(res => {
      if (res.data && res.resultCode === 1) {
        const nextControl = { [controlItem.controlId]: value };
        updateTitleData({ data: nextControl, rowId });
      }
    });
    closeEdit();
  };

  const renderTitleControl = ({ content, titleField }) => {
    if (titleField.type === 2) {
      const { checkrange, min, max } = getAdvanceSetting(titleField);
      return (
        <EditText
          content={content}
          onBlur={(value, needUpdate) => {
            if (checkrange === '1') {
              if (value.length > +max || value.length < +min) {
                const errorText = FORM_ERROR_TYPE_TEXT.TEXT_RANGE({ value, advancedSetting: { min, max } });
                alert(errorText);
                return;
              }
            }
            updateRow(titleField, value, needUpdate);
          }}
        />
      );
    }
    return (
      <div className="overflow_ellipsis fieldTitle" title={content}>
        {content}
      </div>
    );
  };

  return (
    <EditingCardWrap style={style} width={props.width}>
      <BaseCard {...props} isQuickEditing renderTitle={renderTitleControl} />
    </EditingCardWrap>
  );
}
