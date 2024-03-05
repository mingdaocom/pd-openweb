import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Checkbox, Tooltip, LoadDiv } from 'ming-ui';
import cx from 'classnames';
import lookPng from './img/e.png';
import { sheetActionList, recordActionList } from 'src/pages/Role/config.js';
import worksheetAjax from 'src/api/worksheet';

const Wrap = styled.div`
  text-align: left;
  .title {
    font-weight: 400;
  }
  .subCheckbox {
    width: 190px;
  }
  .line {
    width: 100%;
    border-bottom: 1px solid #eaeaea;
    margin: 30px 0;
  }
  .OptionInfo .ming.Checkbox {
    width: 100%;
  }
  .optionTxt {
    font-size: 12px;
    color: #919191;
  }
`;

export default function Set(props) {
  const { changeSheetOptionInfo } = props;
  const [sheet, setState] = useState(props.sheet);
  const [loading, setLoading] = useState(true);
  const [componentData, setComponentData] = useState({});
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
            className="mLeft5 Hand ThemeHoverColor3 optionTxt"
            onClick={() => {
              let data = {};
              actionList.map(o => {
                data[o.key] = {
                  enable: isNotAll,
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
            actionList.map((o, i) => {
              return (
                <div className="subCheckbox mTop20 InlineBlock flexRow alignItemsCenter">
                  <Checkbox
                    className={'InlineBlock TxtMiddle'}
                    checked={(sheet[o.key] || {}).enable}
                    size="small"
                    onClick={checked => {
                      changeSheetOptionInfo({
                        [o.key]: {
                          enable: !(sheet[o.key] || {}).enable,
                        },
                      });
                    }}
                  >
                    {o.txt}
                  </Checkbox>
                  {o.tips && (
                    <Tooltip text={<span>{o.tips} </span>} popupPlacement="top">
                      <i className="icon-info_outline Font16 Gray_9e mLeft3 TxtMiddle" />
                    </Tooltip>
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
            className="mLeft5 Hand ThemeHoverColor3 optionTxt"
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
            actionList.map((o, i) => {
              return (
                <div className="subCheckbox InlineBlock flexRow alignItemsCenter">
                  <Checkbox
                    className={'mTop20 InlineBlock TxtMiddle'}
                    checked={!unableList.includes(o.id)}
                    size="small"
                    onClick={checked => {
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
                      <Tooltip text={<span>{o.description}</span>} popupPlacement="top">
                        <span>{o.name}</span>
                      </Tooltip>
                    ) : (
                      o.name
                    )}
                  </Checkbox>
                  {o.tips && (
                    <Tooltip text={<span>{o.tips} </span>} popupPlacement="top">
                      <i className="icon-info_outline Font16 Gray_9e mLeft3" />
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
  if (loading) {
    return <LoadDiv className="mTop80" />;
  }
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
          recordActionList.filter(o => (props.isForPortal ? !['recordShare', 'recordLogging'].includes(o.key) : true)),
        )}
        {(componentData.customeButtons || []).length > 0 &&
          renderAcitionList(
            _l('自定义动作'),
            componentData.customeButtons,
            sheet.unableCustomButtons,
            'unableCustomButtons',
          )}
        {(componentData.printTempletes || []).length > 0 &&
          renderAcitionList(
            _l('打印模版'),
            componentData.printTempletes,
            sheet.unablePrintTemplates,
            'unablePrintTemplates',
            true,
          )}
      </div>
    </Wrap>
  );
}
