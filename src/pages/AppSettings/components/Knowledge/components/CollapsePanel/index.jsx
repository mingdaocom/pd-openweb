import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import { Icon, SvgIcon, Switch } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import worksheetAjax from 'src/api/worksheet';
import { replaceControlsTranslateInfo } from 'src/utils/translate';
import { SUPPORT_FIELD_TYPES, SYSTEM_FIELD_IDS } from '../../core/config';
import { externalSupportField, getControlIcon, isCustomField, isSupportFilterField } from '../../core/utils';
import FieldConditions from './components/FieldConditions';
import SelectFieldDropdown from './components/SelectFieldDropdown';
import './index.less';

const CollapsePanel = props => {
  const {
    appId,
    projectId,
    expanded = false,
    attachmentEnhancedTip,
    selectedWorksheetItem,
    onToggle,
    onAddSelectedField,
    onRemoveSelectedWorksheet,
    onRemoveSelectedField,
    onSetWorksheetDiscuss,
    // onSetWorksheetEnhance,
    onSetAttachmentParseEnhanced,
    onSaveFilterConditions,
    isSingle = false,
  } = props;
  const {
    worksheetId,
    worksheetName,
    worksheet,
    fields = [],
    filterConditions = [],
    // parseEnhanced = false,
    attachmentParseEnhanced = false,
    discussionEnabled = false,
  } = selectedWorksheetItem;
  const showAttachmentParseEnhanced = !!attachmentEnhancedTip;

  const isLockRef = useRef(false);

  const [worksheetInfo, setWorksheetInfo] = useState({});
  const [controls, setControls] = useState([]);
  const [dataFilterFields, setDataFilterFields] = useState([]);
  const [visible, setVisible] = useState(false);
  const [delayOpenFilter, setDelayOpenFilter] = useState(false);

  const handleToggle = () => {
    if (visible) return;
    onToggle?.();
  };

  const handleAddSelectedField = control => {
    onAddSelectedField({ worksheetId, control });
  };

  useEffect(() => {
    if (isLockRef.current) return;

    if (expanded || delayOpenFilter) {
      worksheetAjax
        .getWorksheetInfo({ worksheetId, getViews: false })
        .then(data => {
          setWorksheetInfo(data);

          const allControls = replaceControlsTranslateInfo(appId, worksheetId, data.template?.controls);
          setControls(
            allControls.filter(
              item =>
                !SYSTEM_FIELD_IDS.includes(item.controlId) &&
                !isCustomField(item) &&
                (item.attribute === 1 || SUPPORT_FIELD_TYPES.includes(item.type) || externalSupportField(item)),
            ),
          );
          setDataFilterFields(allControls.filter(isSupportFilterField));
          if (delayOpenFilter) {
            setVisible(true);
            setDelayOpenFilter(false);
          }

          isLockRef.current = true;
        })
        .catch(err => {
          console.error(err);
        });
    }
  }, [expanded, delayOpenFilter]);

  return (
    <div className="collapsePanel">
      <div className={cx('panelHeader', { expanded, isSingle })} onClick={handleToggle}>
        <div className="left">
          {!isSingle && <Icon icon={expanded ? 'arrow-down-border' : 'arrow-right-border'} className="panelIcon" />}
          <div className="worksheetIcon">
            <SvgIcon url={worksheet.iconUrl} fill="var(--color-text-tertiary)" size={20} />
          </div>
          <span className="worksheetName ellipsis">{worksheetName}</span>
          {fields.length === 0 && <span className="noFields">{_l('未配置字段')}</span>}
        </div>
        <div className="right">
          {showAttachmentParseEnhanced && (
            <React.Fragment>
              <Switch
                size="small"
                checked={attachmentParseEnhanced}
                onClick={() => onSetAttachmentParseEnhanced({ worksheetId })}
              />
              <Tooltip title={attachmentEnhancedTip}>
                <span className="switchText">{_l('附件解析增强')}</span>
              </Tooltip>
              <div className="freeText">{_l('限时免费')}</div>
            </React.Fragment>
          )}
          <FieldConditions
            appId={appId}
            projectId={projectId}
            visible={visible}
            setVisible={setVisible}
            setDelayOpenFilter={setDelayOpenFilter}
            worksheetInfo={worksheetInfo}
            dataFilterFields={dataFilterFields}
            filterConditions={filterConditions}
            onSave={onSaveFilterConditions}
          />
          {/* <Switch checked={parseEnhanced} onClick={() => onSetWorksheetEnhance({ worksheetId })} />
          <span className="switchText">{_l('解析增强')}</span> */}
          {!isSingle && (
            <Icon
              icon="delete1"
              className="deleteWorksheetIcon"
              onClick={e => {
                e.stopPropagation();
                onRemoveSelectedWorksheet({ worksheetId });
              }}
            />
          )}
        </div>
      </div>
      <div className={cx('panelContentWrapper', { expanded })}>
        <div className={cx('panelContent', { single: isSingle })}>
          <div className="fieldBox">
            {fields?.length > 0 ? (
              fields?.map((control, index) => (
                <div className={cx('fieldItem', { single: isSingle })} key={index}>
                  <div className="left">
                    <Icon icon={getControlIcon(control)} className="controlIcon" />
                    <span className="controlName ellipsis">{control.controlName}</span>
                    {control.attribute === 1 && <Icon icon="ic_title" className="controlSubIcon" />}
                  </div>
                  <div className="right">
                    <Icon
                      icon="delete1"
                      className="deleteFieldIcon"
                      onClick={() => onRemoveSelectedField({ worksheetId, control })}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className={cx('emptyField', { single: isSingle })}>{_l('未配置字段')}</div>
            )}
          </div>
          <div className={cx('addFieldButton', { single: isSingle })}>
            <SelectFieldDropdown
              controls={controls}
              selectedFields={fields}
              addSelectedField={handleAddSelectedField}
            />
          </div>
        </div>
        <div className={cx('panelFooter', { single: isSingle })}>
          <div className="left">
            <Icon icon="chat-full" className="discussIcon" />
            {_l('记录讨论')}
          </div>
          <div className="right">
            <Switch checked={discussionEnabled} onClick={() => onSetWorksheetDiscuss({ worksheetId })} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollapsePanel;
