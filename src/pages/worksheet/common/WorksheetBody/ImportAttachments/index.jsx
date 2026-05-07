import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { Button, Checkbox, Dialog, Dropdown, Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import functionWrap from 'ming-ui/components/FunctionWrap';
import worksheetApi from 'src/api/worksheet';
import { checkValueByFilterRegex } from 'src/components/Form/core/formUtils';
import UploadFiles from 'src/components/UploadFiles';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { NORMAL_SYSTEM_FIELDS_SORT, WORKFLOW_SYSTEM_FIELDS_SORT } from 'src/pages/worksheet/common/ViewConfig/enum';
import { generateRandomPassword } from 'src/utils/common';
import RegExpValidator from 'src/utils/expression';
import './index.less';

const SEPARATOR_OPTIONS = [
  { text: '_', value: '_' },
  { text: '-', value: '-' },
  { text: '.', value: '.' },
  { text: '+', value: '+' },
];

const WRITE_MODE_OPTIONS = [
  { text: _l('追加'), value: 1 },
  { text: _l('覆盖'), value: 2 },
];

const getFiledOptions = controls => {
  const controlOptions = controls
    .filter(({ controlId }) => ![...NORMAL_SYSTEM_FIELDS_SORT, ...WORKFLOW_SYSTEM_FIELDS_SORT].includes(controlId))
    .map(({ controlName, controlId, type, sourceControlType, advancedSetting }) => ({
      iconName: getIconByType(type),
      text: controlName,
      value: controlId,
      type,
      sourceControlType,
      advancedSetting: _.omit(advancedSetting, 'maxcount'), //不根据字段限制文件数量
    }));
  const matchFieldOptions = controlOptions.filter(
    control =>
      [2, 3, 4, 5, 7, 33].includes(control.type) ||
      (control.type === 30 && [2, 3, 4, 5, 7, 33].includes(control.sourceControlType)),
  );
  const writeFieldOptions = controlOptions.filter(control => control.type === 14);

  return { matchFieldOptions, writeFieldOptions };
};

function ImportAttachments(props) {
  const { onCancel, controls, projectId, appId, worksheetId, viewId, allowAdd } = props;
  const { matchFieldOptions, writeFieldOptions } = getFiledOptions(controls);

  const [step, setStep] = useState(1);
  const [setting, setSetting] = useSetState({
    matchControlId: null,
    separator: null,
    attachmentControlId: writeFieldOptions[0]?.value,
    writeMode: 1,
    createWhenNoMatch: false,
    triggerWorkflow: false,
  });
  const [attachments, setAttachments] = useState([]);
  const [isComplete, setIsComplete] = useState(true);
  const [isDrag, setIsDrag] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const textareaRef = useRef(null);
  const dropPasteId = `dropTextarea-${generateRandomPassword(16)}`;

  const dialogProps = {
    width: step === 1 ? 560 : 960,
    title:
      step === 1
        ? _l('导入设置')
        : _l(
            '上传文件（%0）',
            controls.find(control => control.controlId === setting.attachmentControlId)?.controlName,
          ),
    description:
      step === 1
        ? _l('使用文件名匹配工作表记录，匹配成功后将文件写入对应记录的附件字段')
        : _l('单次最多上传100个文件，总大小不超过2G'),
    footer: step === 2 ? null : undefined,
  };

  const handleFocus = () => {
    textareaRef.current && textareaRef.current.focus({ preventScroll: true });
  };

  useEffect(() => {
    step === 2 && handleFocus();
  }, [step]);

  const onImport = () => {
    setImportLoading(true);
    worksheetApi
      .importWorksheetAttachments({ projectId, worksheetId, viewId, ...setting, attachments })
      .then(res => {
        res?.resultCode === 1 && onCancel();
      })
      .finally(() => setImportLoading(false));
  };

  return (
    <Dialog
      visible
      className={cx('importAttachmentsDialog', { uploadFilesStep: step === 2 })}
      {...dialogProps}
      overlayClosable={false}
      onCancel={onCancel}
      showCancel={false}
      okText={_l('下一步')}
      okDisabled={!setting.matchControlId}
      onOk={() => setStep(2)}
    >
      {step === 1 && (
        <div className="settingWrapper">
          <div className="mBottom20">
            <div className="labelText">
              <span>{_l('文件名匹配字段')}</span>
              <span className="requiredStar">*</span>
            </div>
            <Dropdown
              border
              isAppendToBody
              className="w100"
              menuClass="fieldMenuWrap"
              data={matchFieldOptions}
              value={setting.matchControlId}
              placeholder={_l('选择匹配字段')}
              onChange={value => setSetting({ matchControlId: value })}
            />
          </div>
          <div className="mBottom20">
            <div className="labelText flexRow alignItemsCenter">
              <span>{_l('分隔符')}</span>
              <Tooltip
                title={_l(
                  '选择后，提取第一个分割符前的文本进行匹配。如：张三-简历.pdf，设置分割符-，则使用张三匹配工作表字段',
                )}
              >
                <Icon icon="help" className="tipsIcon" />
              </Tooltip>
            </div>
            <div className="flexRow alignItemsCenter">
              <Dropdown
                border
                isAppendToBody
                cancelAble
                className="Width120"
                data={SEPARATOR_OPTIONS}
                value={setting.separator}
                placeholder={_l('选择分隔符')}
                onChange={value => setSetting({ separator: value })}
              />
              <div className="mLeft8 textSecondary">{_l('未选择分割符时匹配全部文件名')}</div>
            </div>
          </div>
          <div className="mBottom20 flexRow">
            <div className="flex minWidth0">
              <div className="labelText">
                <span>{_l('文件写入字段')}</span>
              </div>
              <Dropdown
                border
                isAppendToBody
                className="w100"
                menuClass="fieldMenuWrap"
                disabled={!!attachments.length}
                data={writeFieldOptions}
                value={setting.attachmentControlId}
                placeholder={_l('选择附件类型字段')}
                onChange={value => setSetting({ attachmentControlId: value })}
              />
            </div>
            <div className="Width180 mLeft10">
              <div className="labelText flexRow alignItemsCenter">
                <span>{_l('写入方式')}</span>
                <Tooltip
                  title={
                    <Fragment>
                      <div>{_l('-追加：保留原附件，继续追加新附件')}</div>
                      <div>{_l('-覆盖：清空原附件，只写入新附件')}</div>
                    </Fragment>
                  }
                >
                  <Icon icon="help" className="tipsIcon" />
                </Tooltip>
              </div>
              <Dropdown
                border
                isAppendToBody
                className="w100"
                data={WRITE_MODE_OPTIONS}
                value={setting.writeMode}
                onChange={value => setSetting({ writeMode: value })}
              />
            </div>
          </div>

          {allowAdd && (
            <Checkbox
              className="mBottom12 flexRow alignItemsCenter"
              checked={setting.createWhenNoMatch}
              onClick={() => setSetting({ createWhenNoMatch: !setting.createWhenNoMatch })}
            >
              <span>{_l('匹配不到时新建记录')}</span>
              <Tooltip
                title={
                  <Fragment>
                    <div>{_l('未匹配成功的附件，将作为新记录创建。')}</div>
                    <div>{_l('相同文件名/文件名前缀的附件将被归入同一条记录中')}</div>
                  </Fragment>
                }
              >
                <Icon icon="help" className="Font16 mLeft6 textTertiary" />
              </Tooltip>
            </Checkbox>
          )}

          <Checkbox
            checked={setting.triggerWorkflow}
            onClick={() => setSetting({ triggerWorkflow: !setting.triggerWorkflow })}
          >
            {_l('触发工作流')}
          </Checkbox>
        </div>
      )}

      {step === 2 && (
        <div
          className={cx('uploadFilesWrapper', { isDrag })}
          onClick={handleFocus}
          onMouseEnter={handleFocus}
          onDragEnter={e => {
            e.preventDefault();
            setIsDrag(true);
          }}
          onDragOver={e => {
            e.preventDefault();
            setIsDrag(true);
          }}
          onDragLeave={e => {
            e.preventDefault();
            setIsDrag(false);
          }}
          onDrop={e => {
            e.preventDefault();
            setIsDrag(false);
          }}
        >
          <UploadFiles
            projectId={projectId}
            appId={appId}
            canAddKnowledge={false}
            temporaryData={attachments}
            onTemporaryDataUpdate={data => setAttachments(data)}
            onUploadComplete={isComplete => {
              setIsComplete(isComplete);
              // 强制更新，让UploadFiles内部state过滤掉仍然处于“上传中/未成功”的临时文件
              if (isComplete) {
                setAttachments(prev => prev.filter(item => !item.progress && !item.base));
              }
            }}
            dropPasteElement={dropPasteId}
            maxTotalSize={1024 * 2}
            advancedSetting={
              writeFieldOptions.find(control => control.value === setting.attachmentControlId)?.advancedSetting
            }
            checkValueByFilterRegex={name => {
              const control = writeFieldOptions.find(control => control.value === setting.attachmentControlId);
              return checkValueByFilterRegex(
                { advancedSetting: control?.advancedSetting },
                RegExpValidator.getNameOfFileName(name),
                controls,
              );
            }}
            headerRightElement={
              <div className="flexRow justifyContentRight alignItemsCenter">
                <div
                  className={cx('mRight40 colorPrimary', {
                    'pointer hoverTextPrimaryDark': isComplete,
                    cursorNotAllowed: !isComplete,
                  })}
                  onClick={() => isComplete && setStep(1)}
                >
                  {_l('导入设置')}
                </div>
                <Button
                  type="primary"
                  onClick={onImport}
                  loading={importLoading}
                  disabled={!attachments.length || !isComplete}
                >
                  {_l('开始导入')}
                </Button>
              </div>
            }
          />
          <div className={cx('panelContent', { hide: !!attachments.length || !isComplete })}>
            <div className="textTertiary flexRow alignItemsCenter">
              <Icon icon="view-upload" className="mRight10 Font24" />
              <span className="Font14">{_l('拖拽至此 或 粘贴剪贴板文件')}</span>
            </div>
          </div>
          <textarea readOnly id={dropPasteId} className="dropTextarea" ref={ref => (textareaRef.current = ref)} />
          {isDrag && <div className="dragPanel Font18 textSecondary">{_l('拖拽至此处上传文件')}</div>}
          {importLoading && <div className="importLoadingMask" />}
        </div>
      )}
    </Dialog>
  );
}

export const importAttachmentsDialog = props => functionWrap(ImportAttachments, { ...props });
