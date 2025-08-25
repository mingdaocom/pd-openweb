import React, { Fragment, useState } from 'react';
import { Drawer, Rate } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { Checkbox, Dropdown, ScrollView } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import { DEFAULT_DATA, WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget.js';
import { SettingItem } from 'src/pages/widgetConfig/styled';
import { handleAddWidgets } from 'src/pages/widgetConfig/util/data';
import { OPTION_COLORS_LIST } from '../config';
import { enumWidgetType } from '../util';
import AiLoading from './AiLoading';

const RECOMMEND_TYPES = [2, 3, 5, 6, 7, 8, 10, 11, 14, 15, 16, 26, 27, 33, 36];

const dropData = Object.keys(DEFAULT_DATA).map(i => {
  return {
    value: WIDGETS_TO_API_TYPE_ENUM[i],
    text: _.get(DEFAULT_DATA[i], 'controlName'),
  };
});

const enumLangType = {
  'zh-Hans': 0,
  en: 1,
  ja: 2,
  'zh-Hant': 3,
};

const AiWrap = styled.span`
  color: #9709f2;
  cursor: pointer;
  &:hover span {
    border-bottom: 1px dashed #9709f2;
  }
  i {
    background: linear-gradient(316deg, #c822eb, #6e00ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const DrawerWrap = styled(Drawer)`
  .ant-drawer-content-wrapper {
    box-shadow: none !important;
  }
  .ant-drawer-header {
    display: none;
  }
  .ant-drawer-body {
    padding: 0;
  }
  .ant-drawer-content {
    background: transparent;
  }
`;

const AiWidgetWrap = styled.div`
  width: 640px;
  min-height: 310px;
  ${props => (props.height ? `height: ${props.height}px` : '')}
  padding: 35px;
  padding: 24px 34px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #ffffff;
  box-shadow: 0px 4px 20px 1px rgba(0, 0, 0, 0.16);
  border-radius: 4px;
  position: relative;
  .btnStyle {
    width: 108px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    background: rgba(33, 150, 243, 0.12);
    border-radius: 32px;
    color: #1677ff;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
    &:hover {
      background: rgba(33, 150, 243, 0.08);
    }
  }
  .closeBtn {
    cursor: pointer;
    font-size: 20px;
    position: absolute;
    top: 12px;
    right: 19px;
    font-weight: bold;
  }
  .aiIconContent {
    height: 80px;
    position: relative;
    .titleIcon {
      font-size: 80px;
      &.error {
        color: #ff3d00;
      }
    }
  }
  .searchBox {
    position: relative;
    input {
      width: 464px;
      padding: 0 120px 0 50px;
      height: 48px;
      border-radius: 24px;
      border: 2px solid rgb(255, 255, 255);
      box-shadow: 0px 1px 4px hsl(0deg 0% 0% / 20%);
    }
    .searchIcon {
      font-size: 16px;
      position: absolute;
      top: 15px;
      left: 24px;
      color: #757575;
    }
    .searchBtn {
      position: absolute;
      top: 4px;
      right: 5px;
    }
  }
  .recommendControls {
    display: flex;
    flex: 1;
    .column192 {
      width: 192px;
    }
    .column137 {
      width: 137px;
    }
    .ant-dropdown-trigger {
      margin-top: 0px !important;
    }
    input {
      width: 100%;
      height: 36px;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 0 12px;
    }
    .controlsFooter {
      margin-top: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .btnPriStyle {
        padding: 0 24px;
        height: 36px;
        text-align: center;
        line-height: 36px;
        background: #1677ff;
        border-radius: 32px;
        color: #fff;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        &:hover {
          background: rgba(33, 150, 243, 0.8);
        }
        &.disabled {
          color: #bdbdbd;
          background: #f5f5f5 !important;
          cursor: not-allowed;
        }
      }
    }
  }
`;

const STATUS_TYPES = [
  {
    value: -1,
    text: _l('没有获取到合适的字段建议'),
    subText: _l('请换个关键词试试吧'),
  },
  {
    value: 0,
    text: _l('创建工作表字段需要专业建议？试试AI智能推荐吧。'),
    subText: _l('可尝试添加修饰词，如：智能家居行业的生产计划表'),
  },
  { value: 1, text: _l('字段建议准备中，请稍后…') },
  { value: 2, text: _l('您对本次推荐结果满意吗？') },
];

export default function WidgetAiRecommend(props) {
  const worksheetName = _.get(props, 'globalSheetInfo.name');
  const { widgetPanelFixed, setPanelVisible } = props;
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState(0); // -1报错，0默认，1搜索中，2搜索成功
  const [rate, setRate] = useState(0);
  const [keywords, setKeywords] = useState('');
  const [controlData, setControlData] = useState([]);
  const [selectIds, setSelectIds] = useState([]);
  const [resultData, setResultData] = useState('');

  const handleSearch = () => {
    setStatus(1);
    const lang = getCookie('i18n_langtag') || md.global.Config.DefaultLang;
    worksheetAjax
      .getAiFieldRecommendation({
        prompt: keywords,
        lang: enumLangType[lang],
      })
      .then(({ code, data = {} }) => {
        if (code === 1 && _.get(data, 'controls.length') > 0) {
          setStatus(2);
          setControlData(data.controls || []);
          setResultData('');
        } else {
          setStatus(-1);
          if (_.get(data, 'result')) {
            setResultData(data.result);
          }
        }
      });
  };

  const handleClear = () => {
    setStatus(0);
    setRate(0);
    setControlData([]);
    setSelectIds([]);
    setResultData('');
  };

  const getDefaultData = (curControl = {}) => {
    const type = enumWidgetType[curControl.type];

    let defaultDetail = {
      ...DEFAULT_DATA[type],
      ..._.pick(curControl, ['controlId', 'controlName', 'type']),
      hint: curControl.desc || '',
      alias: curControl.code || '',
    };
    // 选项
    if (_.includes([9, 10, 11], curControl.type)) {
      if (_.get(curControl, 'options.length')) {
        defaultDetail.options = (curControl.options || []).map((i, index) => ({
          key: uuidv4(),
          value: i,
          isDeleted: false,
          index,
          checked: index === 0,
          color: OPTION_COLORS_LIST[(index + 1) % OPTION_COLORS_LIST.length],
        }));
      }
    }
    // 公式
    if (curControl.type === 31) {
      defaultDetail.advancedSetting = { nullzero: '1' };
      defaultDetail.enumDefault = 1;
      defaultDetail.dataSource = curControl.formula;
    }

    // 子表
    if (curControl.type === 34) {
      defaultDetail.relationControls = (curControl.subform || []).map(i => getDefaultData(i));
      defaultDetail.showControls = (curControl.subform || []).map(i => i.controlId);
      defaultDetail.dataSource = uuidv4();
    }
    return defaultDetail;
  };

  const handleAdd = () => {
    const newData = selectIds
      .map(item => {
        const curControl = _.find(controlData, i => i.controlId === item);
        return curControl ? getDefaultData(curControl) : null;
      })
      .filter(_.identity);
    handleAddWidgets(newData, {}, props, () => {
      setVisible(false);
      handleClear();
    });
  };

  const setData = (controlId, obj) => {
    setControlData(controlData.map(i => (i.controlId === controlId ? Object.assign({}, i, obj) : i)));
  };

  const renderContent = () => {
    const detail = _.find(STATUS_TYPES, i => i.value === status) || {};
    const isSearching = status === 1;
    const windowHeight = window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;
    const height = (status === -1 && resultData) || status === 2 ? windowHeight - 24 : '';
    return (
      <AiWidgetWrap height={height}>
        <span
          className="icon-close closeBtn"
          onClick={() => {
            setVisible(false);
          }}
        ></span>
        <div className="aiIconContent">{isSearching ? <AiLoading /> : <span className="icon-ai titleIcon"></span>}</div>
        <span className="Font17 mTop20 Bold">{detail.text}</span>
        <div className="Height50 pTop12">
          {status === 2 ? (
            <Rate value={rate} onChange={value => setRate(value)} />
          ) : (
            <span className={cx('Gray_9e', { Hidden: !detail.subText })}>{detail.subText}</span>
          )}
        </div>

        {status === 2 ? (
          <div className="w100 recommendControls minHeight0">
            <SettingItem className="flexColumn flex minWidth0">
              <div className="Font17 settingItemTitle">{_l('推荐字段')}</div>
              <div className="flexCenter">
                <Checkbox
                  className="mRight10"
                  checked={_.isEqual(
                    selectIds,
                    controlData.map(i => i.controlId),
                  )}
                  onClick={checked => setSelectIds(checked ? [] : controlData.map(i => i.controlId))}
                />
                <div className="column192 mRight10">{_l('字段名称')}</div>
                <div className="column137 mRight20">{_l('类型')}</div>
                <div className="flex">{_l('说明')}</div>
              </div>
              <ScrollView className="flex">
                {controlData.map(control => {
                  return (
                    <div className="flexCenter recommendControls mTop15">
                      <Checkbox
                        className="mRight10"
                        checked={_.includes(selectIds, control.controlId)}
                        onClick={checked => {
                          if (checked) {
                            setSelectIds(selectIds.filter(i => i !== control.controlId));
                          } else {
                            setSelectIds(selectIds.concat([control.controlId]));
                          }
                        }}
                      />
                      <div className="column192 mRight10">
                        <input
                          defaultValue={control.controlName}
                          onBlur={e => setData(control.controlId, { controlName: e.target.value || _l('字段名称') })}
                        />
                      </div>
                      <div className="column137 mRight20">
                        <Dropdown
                          border
                          isAppendToBody
                          data={dropData.filter(i => _.includes(RECOMMEND_TYPES, i.value))}
                          value={control.type}
                          disabled={_.includes([31, 34], control.type)}
                          renderTitle={() =>
                            _.get(
                              _.find(dropData, i => i.value === control.type),
                              'text',
                            )
                          }
                          onChange={value => setData(control.controlId, { type: value })}
                        />
                      </div>
                      <div className="flex overflow_ellipsis">{control.desc}</div>
                    </div>
                  );
                })}
              </ScrollView>

              <div className="controlsFooter">
                <div className="btnStyle" onClick={() => handleClear()}>
                  {_l('返回修改')}
                </div>
                <div
                  className={cx('btnPriStyle', { disabled: !selectIds.length })}
                  onClick={() => {
                    if (!selectIds.length) return;
                    handleAdd();
                  }}
                >
                  {_l('添加 %0 字段到表单', selectIds.length)}
                </div>
              </div>
            </SettingItem>
          </div>
        ) : (
          <div className="searchBox">
            <span className="searchIcon icon-search"></span>
            <input value={keywords} disabled={isSearching} onChange={e => setKeywords(e.target.value)} />
            <div className={cx('searchBtn btnStyle', { Hidden: isSearching })} onClick={() => handleSearch()}>
              {_l('获取')}
            </div>
          </div>
        )}
      </AiWidgetWrap>
    );
  };

  return (
    <Fragment>
      <AiWrap
        onClick={() => {
          if (!widgetPanelFixed) {
            setPanelVisible({ widgetVisible: false });
            setTimeout(() => {
              setVisible(true);
            }, 300);
          } else {
            setVisible(true);
          }
          if (status === 0) {
            setKeywords(worksheetName);
          }
        }}
      >
        <span className="mLeft3 Bold">{_l('AI建议字段')}</span>
        <i className="icon-auto_awesome mLeft3"></i>
      </AiWrap>
      <DrawerWrap
        title={null}
        width={670}
        visible={visible}
        mask={false}
        closeIcon={null}
        footer={null}
        placement="left"
        onClose={() => setVisible(false)}
        getContainer={() => document.querySelector('.customWidgetContainer')}
      >
        {renderContent()}
      </DrawerWrap>
    </Fragment>
  );
}
