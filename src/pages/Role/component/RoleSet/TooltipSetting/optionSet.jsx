import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, Icon, LoadDiv } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import worksheetAjax from 'src/api/worksheet';
import { recordActionList, sheetActionList } from 'src/pages/Role/config.js';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import RecordLoggingSettingDialog, { getRecordLoggingRangeText, LOGGING_RANGE } from '../RecordLoggingSettingDialog';
import lookPng from './img/e.png';

const Wrap = styled.div`
  text-align: left;
  .title {
    font-weight: 400;
  }
  .subCheckbox {
    width: 190px;
    align-items: center;
  }
  /* 操作权限：多选项同一行时，勾选框 / 文案 / 齿轮垂直居中 */
  .rolePermissionInlineRow {
    display: inline-flex;
    align-items: center;
    margin-top: 20px;
    margin-right: 16px;
    vertical-align: middle;
    :global(.ming.Checkbox) {
      display: inline-flex !important;
      align-items: center;
      line-height: 1;
    }
    :global(.ming.Checkbox .Checkbox-box) {
      flex-shrink: 0;
      align-self: center;
    }
    :global(.ming.Icon) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
  }
  .line {
    width: 100%;
    border-bottom: 1px solid var(--color-border-secondary);
    margin: 30px 0;
  }
  .OptionInfo .ming.Checkbox {
    width: 100%;
  }
  .optionTxt {
    font-size: 12px;
    color: var(--color-text-tertiary);
  }
  .recordLoggingRangeText {
    color: var(--color-text-secondary);
  }
  .recordLoggingSettingIcon:hover {
    color: var(--color-primary) !important;
  }
`;

export default function Set(props) {
  const { changeSheetOptionInfo, projectId } = props;
  const [sheet, setState] = useState(props.sheet);
  const [loading, setLoading] = useState(true);
  const [componentData, setComponentData] = useState({});
  const [showRecordLoggingDialog, setShowRecordLoggingDialog] = useState(false);
  useEffect(() => {
    setState(props.sheet);
    getComponent(props.sheet);
  }, [props]);

  const getComponent = data => {
    worksheetAjax
      .getFormComponent({
        worksheetId: data.sheetId,
      })
      .then(res => {
        setLoading(false);
        setComponentData(res);
      });
  };

  const renderList = (title, actionList) => {
    let isNotAll = actionList.filter(o => !(sheet[o.key] || {}).enable).length > 0;
    return (
      <React.Fragment>
        <div className="">
          <span className="Bold">{title}</span>
          <span
            className="mLeft5 Hand hoverColorPrimary optionTxt"
            onClick={() => {
              let data = {};
              actionList.map(o => {
                const prev = sheet[o.key] || {};
                const nextEnable = isNotAll;
                data[o.key] =
                  o.key === 'recordLogging' && nextEnable
                    ? {
                        ...prev,
                        enable: true,
                        Range: prev.Range || LOGGING_RANGE.ALL,
                        AllowExport: _.isBoolean(prev.AllowExport) ? prev.AllowExport : false,
                      }
                    : {
                        ...prev,
                        enable: nextEnable,
                      };
              });
              changeSheetOptionInfo(data);
            }}
          >
            {isNotAll ? _l('全选') : _l('取消全选')}
          </span>
        </div>
        <div className="">
          {actionList.length > 0 &&
            actionList.map(o => {
              return (
                <div className="rolePermissionInlineRow">
                  <Checkbox
                    className="TxtMiddle"
                    checked={(sheet[o.key] || {}).enable}
                    size="small"
                    onClick={() => {
                      const prev = sheet[o.key] || {};
                      const nextEnable = !prev.enable;
                      changeSheetOptionInfo({
                        [o.key]:
                          o.key === 'recordLogging' && nextEnable
                            ? {
                                ...prev,
                                enable: true,
                                Range: prev.Range || LOGGING_RANGE.ALL,
                                AllowExport: _.isBoolean(prev.AllowExport) ? prev.AllowExport : false,
                              }
                            : {
                                ...prev,
                                enable: nextEnable,
                              },
                      });
                    }}
                  >
                    {o.txt}
                  </Checkbox>
                  {o.tips && (
                    <Tooltip title={o.tips}>
                      <i className="icon-info_outline Font16 textTertiary mLeft3 TxtMiddle" />
                    </Tooltip>
                  )}
                  {o.key === 'recordLogging' && (sheet[o.key] || {}).enable && (
                    <React.Fragment>
                      <span className="recordLoggingRangeText mLeft5">{getRecordLoggingRangeText(sheet[o.key])}</span>
                      <Icon
                        icon="settings"
                        className="recordLoggingSettingIcon Font16 Hand textTertiary mLeft8 TxtMiddle InlineBlock"
                        onClick={e => {
                          e.stopPropagation();
                          setShowRecordLoggingDialog(true);
                        }}
                      />
                    </React.Fragment>
                  )}
                </div>
              );
            })}
        </div>
        <div className="line"></div>
      </React.Fragment>
    );
  };

  const renderAcitionList = (title, actionList = [], list = [], key, noline) => {
    let isAll = list.length <= 0;
    let s = 'unableCustomButtons' === key ? 'buttonId' : 'templateId';
    let unableList = list.map(o => o[s]);
    return (
      <React.Fragment>
        <div className="">
          <span className="Bold">{title}</span>
          <span
            className="mLeft5 Hand hoverColorPrimary optionTxt"
            onClick={() => {
              changeSheetOptionInfo({
                [key]: isAll
                  ? actionList.map(o => {
                      return { [s]: o.id };
                    })
                  : [],
              });
            }}
          >
            {!isAll ? _l('全选') : _l('取消全选')}
          </span>
        </div>
        <div className="OptionInfo">
          {actionList.length > 0 &&
            actionList.map(o => {
              if (md.global.SysSettings.hideAIBasicFun && o.btnType === 1 && 'unableCustomButtons' === key) {
                //过滤掉 Ai 动作
                return null;
              }

              return (
                <div className="subCheckbox InlineBlock flexRow alignItemsCenter">
                  <Checkbox
                    className={'mTop20 InlineBlock TxtMiddle'}
                    checked={!unableList.includes(o.id)}
                    size="small"
                    onClick={() => {
                      changeSheetOptionInfo({
                        [key]: (unableList.includes(o.id)
                          ? unableList.filter(it => o.id !== it)
                          : [...unableList, o.id]
                        ).map(o => {
                          return {
                            [s]: o,
                          };
                        }),
                      });
                    }}
                  >
                    {o.description ? (
                      <Tooltip title={o.description}>
                        <span>{o.name}</span>
                      </Tooltip>
                    ) : (
                      o.name
                    )}
                    {o.btnType === 1 && 'unableCustomButtons' === key && (
                      <Icon
                        icon="auto_awesome"
                        className="mLeft3 TxtMiddle"
                        style={{ color: 'var(--color-mingo-light)' }}
                      />
                    )}
                  </Checkbox>
                  {o.tips && (
                    <Tooltip title={o.tips}>
                      <i className="icon-info_outline Font16 textTertiary mLeft3" />
                    </Tooltip>
                  )}
                </div>
              );
            })}
        </div>
        {!noline && <div className="line"></div>}
      </React.Fragment>
    );
  };

  const rednerPay = () => {
    return (
      <React.Fragment>
        <div className="">
          <span className="Bold">{_l('支付')}</span>
        </div>
        <div className="">
          <div className="subCheckbox mTop20 InlineBlock flexRow alignItemsCenter">
            <Checkbox
              className={'InlineBlock TxtMiddle'}
              checked={_.get(sheet, 'payment.enable')}
              size="small"
              onClick={() => {
                changeSheetOptionInfo({
                  payment: {
                    enable: !_.get(sheet, 'payment.enable'),
                  },
                });
              }}
            >
              {_l('付款')}
            </Checkbox>
          </div>
        </div>
      </React.Fragment>
    );
  };

  if (loading) {
    return <LoadDiv className="mTop80" />;
  }

  const featureType = getFeatureStatus(projectId, VersionProductType.PAY);
  return (
    <Wrap className="TxtLeft">
      <div className="mTop30 Font16 title LineHeight26">
        <img src={lookPng} className="mRight5 TxtMiddle" height={26} />
        {_l('可执行哪些操作？')}
      </div>
      <div className="mTop30 pLeft15 pRight15">
        {renderList(
          _l('工作表'),
          sheetActionList.filter(o =>
            props.isForPortal ? !['worksheetShareView', 'worksheetLogging', 'worksheetDiscuss'].includes(o.key) : true,
          ),
        )}
        {renderList(
          _l('记录'),
          recordActionList.filter(o => (props.isForPortal ? !['recordShare'].includes(o.key) : true)),
        )}
        {(componentData.customeButtons || []).length > 0 &&
          renderAcitionList(_l('动作'), componentData.customeButtons, sheet.unableCustomButtons, 'unableCustomButtons')}
        {(componentData.printTempletes || []).length > 0 &&
          renderAcitionList(
            _l('打印模版'),
            componentData.printTempletes,
            sheet.unablePrintTemplates,
            'unablePrintTemplates',
          )}
        {featureType && rednerPay()}
      </div>
      <RecordLoggingSettingDialog
        visible={showRecordLoggingDialog}
        value={sheet.recordLogging}
        onChange={next => changeSheetOptionInfo({ recordLogging: next })}
        onClose={() => setShowRecordLoggingDialog(false)}
      />
    </Wrap>
  );
}
