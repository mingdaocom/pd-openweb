import React, { Fragment, useEffect, useState } from 'react';
import { any, func } from 'prop-types';
import cx from 'classnames';
import flowNode from '../../../../api/flowNode';
import { Dialog, ScrollView, LoadDiv } from 'ming-ui';
import JsonView from 'react-json-view';
import { NODE_TYPE } from '../../../enum';
import styled from 'styled-components';

const Footer = styled.div`
  background: #f4f4f4;
  padding: 0 24px;
  align-items: center;
  height: 60px;
  &.workflowDetailFooterWhile {
    background: #fff;
  }
  .footerSaveBtn,
  .footerCancelBtn {
    height: 36px;
    line-height: 36px;
    display: inline-block;
    padding: 0 32px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 14px;
    box-sizing: border-box;
  }
  .footerSaveBtn {
    color: #fff;
  }
  .footerCancelBtn {
    border-width: 1px;
    border-style: solid;
  }
`;

DetailFooter.propTypes = {
  isCorrect: any,
  onSave: func,
  closeDetail: func,
};

export default function DetailFooter({
  isCorrect,
  onSave,
  closeDetail,
  isIntegration,
  processId,
  selectNodeId,
  instanceId,
  selectNodeType,
  flowInfo,
  debugEvents,
}) {
  const [source, setSource] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const getSource = () => {
    setShowDialog(true);

    if (!source) {
      flowNode.getNodeDetailHistory({ processId, nodeId: selectNodeId, instanceId }).then(res => {
        if (_.includes([NODE_TYPE.SEARCH, NODE_TYPE.ACTION], selectNodeType)) {
          res = {
            worksheetId: res.appId,
            rowId: res.sureSourceId,
          };
        }

        if (selectNodeType === NODE_TYPE.FORMULA) {
          res = {
            result: res.sureSourceId,
          };
        }

        if (selectNodeType === NODE_TYPE.GET_MORE_RECORD) {
          res = {
            worksheetId: res.appId || '',
            rowIds: res.sourceIds || [],
          };
        }

        if (_.includes([NODE_TYPE.CODE, NODE_TYPE.JSON_PARSE, NODE_TYPE.PLUGIN], selectNodeType)) {
          res = safeParse(res);
        }

        setSource(res);
      });
    }
  };

  useEffect(() => {
    setSource(null);
  }, [selectNodeId]);

  // 执行数据
  if ((_.includes(debugEvents, -1) || _.includes(debugEvents, 0)) && instanceId) {
    const hideNodeType = [5, 10, 11, 12, 15, 17, 18, 19, 27];

    if (_.includes(hideNodeType, selectNodeType)) return null;

    return (
      <Fragment>
        <Footer className="flexRow">
          <span className="footerSaveBtn ThemeBGColor3 ThemeHoverBGColor2 mRight10" onClick={getSource}>
            {_l('查看输出数据')}
          </span>
        </Footer>
        {showDialog && (
          <Dialog
            className="workflowDetailExecDialog"
            visible
            type="fixed"
            title={_l('查看输出数据')}
            width={1080}
            footer={null}
            onCancel={() => setShowDialog(false)}
          >
            <div className="flexRow h100 breakAll">
              {source === null ? (
                <LoadDiv className="mTop10" />
              ) : (
                <ScrollView className="flex">
                  <JsonView
                    src={source}
                    theme="brewer"
                    displayDataTypes={false}
                    displayObjectSize={false}
                    name={null}
                  />
                </ScrollView>
              )}
            </div>
          </Dialog>
        )}
      </Fragment>
    );
  }

  if (flowInfo.parentId || instanceId) return null;

  return (
    <Footer className={cx('flexRow', { workflowDetailFooterWhile: isIntegration })}>
      <span
        className={cx('footerSaveBtn ThemeBGColor3 ThemeHoverBGColor2 mRight10', { Alpha5: !isCorrect })}
        onClick={onSave}
      >
        {_l('保存')}
      </span>

      <span
        className="footerCancelBtn ThemeBorderColor3 ThemeHoverBorderColor2 ThemeColor3 ThemeHoverColor2"
        onClick={closeDetail}
      >
        {_l('取消')}
      </span>
    </Footer>
  );
}
