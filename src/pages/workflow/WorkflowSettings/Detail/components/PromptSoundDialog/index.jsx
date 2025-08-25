import React, { Fragment, useEffect, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Icon, Tooltip } from 'ming-ui';
import { VOICE_FILE_LIST } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config';
import { LANGUAGE_BCP47 } from '../../../enum';
import PromptSound from '../PromptSound';

const MessageBox = styled.div`
  height: 36px;
  background: #f5f5f5;
  border-radius: 4px;
  align-items: center;
  padding: 0 12px;
  .icon-trash:hover {
    color: #f44336 !important;
  }
`;

export default ({ companyId, processId, relationId, selectNodeId, promptSound, formulaMap, updateSource }) => {
  const [visible, setVisible] = useState(false);
  const [cacheData, setCacheData] = useState({});
  const [func, setFunc] = useState(null);

  useEffect(() => {
    if (func && func.cb) {
      func.cb();
      setFunc(null);
    }
  }, [func]);

  return (
    <Fragment>
      <div className="Font13 bold mTop25">
        {_l('提示音')}
        <Tooltip
          popupPlacement="bottom"
          autoCloseDelay={0}
          text={_l('在 APP 运行期间方可进行语音播报，而 H5 则不具备此功能')}
        >
          <Icon className="Font16 Gray_9e mLeft5 tip-top-right" style={{ verticalAlign: 'text-bottom' }} icon="info" />
        </Tooltip>
      </div>

      <MessageBox className="mTop10 flexRow">
        <div className="flex mRight20 ellipsis Font12">
          {promptSound.type === 0 ? (
            <span>{_l('系统默认')}</span>
          ) : (
            <span className="bold">
              {promptSound.type === 1
                ? _l('声音：') +
                  (promptSound.file
                    ? _l('自定义')
                    : !promptSound.preset
                      ? _l('默认')
                      : VOICE_FILE_LIST.find(o => o.fileKey === promptSound.preset).fileName)
                : _l('语音播报：%0', LANGUAGE_BCP47.find(o => o.value === promptSound.language).text)}
            </span>
          )}
        </div>

        {promptSound.type !== 0 && (
          <span data-tip={_l('清空')} className="mRight15">
            <Icon
              type="trash"
              className="Gray_75 Font14 pointer"
              onClick={() =>
                updateSource({
                  promptSound: {
                    content: '',
                    file: '',
                    language: 'zh-CN',
                    pitch: '1',
                    preset: '',
                    speed: '1',
                    type: 0,
                  },
                })
              }
            />
          </span>
        )}

        <span data-tip={_l('编辑')}>
          <Icon
            type="edit"
            className="Gray_75 ThemeHoverColor3 Font14 pointer"
            onClick={() => {
              setCacheData({
                promptSound:
                  promptSound.type === 0 ? { ..._.cloneDeep(promptSound), type: 1 } : _.cloneDeep(promptSound),
                formulaMap: _.cloneDeep(formulaMap),
              });
              setVisible(true);
            }}
          />
        </span>
      </MessageBox>

      {visible && (
        <Dialog
          className="workflowDialogBox workflowSettings"
          style={{ overflow: 'initial' }}
          overlayClosable={false}
          type="scroll"
          visible
          title={_l('提示音')}
          onCancel={() => setVisible(false)}
          width={580}
          onOk={() => {
            if (cacheData.promptSound.type === 2 && !cacheData.promptSound.content) {
              alert('内容不允许为空', 2);
              return;
            }

            updateSource(cacheData);
            setVisible(false);
          }}
        >
          <PromptSound
            companyId={companyId}
            processId={processId}
            relationId={relationId}
            selectNodeId={selectNodeId}
            promptSound={cacheData.promptSound}
            formulaMap={cacheData.formulaMap}
            updateSource={(obj, callback = () => {}) => {
              setCacheData(cacheData => Object.assign({}, cacheData, obj));
              setFunc({ cb: callback });
            }}
          />
        </Dialog>
      )}
    </Fragment>
  );
};
