import React, { Fragment } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Input, Select } from 'ming-ui/antd-components';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { APP_TYPE, APP_TYPE_TEXT, FIELD_TYPE_LIST } from '../../enum';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

const List = styled.div`
  .w120 {
    width: 120px;
  }
  .w160 {
    width: 160px;
  }
  .w30 {
    width: 30px;
  }
`;

export default ({ data, updateSource }) => {
  const updateItem = (controlId, key, value) => {
    updateSource({
      controls: data.controls.map(o => {
        if (o.controlId === controlId) {
          o[key] = value;
        }

        return o;
      }),
    });
  };

  return (
    <Fragment>
      <div className="flowDetailStartHeader flexColumn BGBlueAsh">
        <div className="flowDetailStartIcon flexRow">
          <i className="icon-subprocess Font40 gray" />
        </div>
        <div className="Font16 mTop10">{_l('子流程')}</div>
      </div>
      <div className="workflowDetailBox mTop20">
        <div className="Font13 bold">{_l('数据源')}</div>
        <div className="Font13 mTop10">
          {data.appType === APP_TYPE.SHEET
            ? _l('工作表：%0', data.appName)
            : _l('其他：%0', APP_TYPE_TEXT[data.appType])}
        </div>

        {!!data.controls.length && (
          <Fragment>
            <div className="Font13 bold mTop20">{_l('数组对象元素')}</div>
            <List className="mTop15">
              <div className="flexRow">
                <div className="w120">{_l('类型')}</div>
                <div className="w160 mLeft10">{_l('字段名')}</div>
                <div className="flex mLeft10">{_l('说明')}</div>
                <div className="w30 mLeft10">{_l('标题')}</div>
              </div>
              {data.controls.map((item, index) => {
                return (
                  <div key={index} className="flexRow mTop4 relative">
                    <Select
                      className="w120 mTop8"
                      options={FIELD_TYPE_LIST}
                      fieldNames={SELECT_FIELD_NAMES}
                      value={item.type}
                      disabled={true}
                    />
                    <Input className="mLeft10 w160 mTop8 minWidth0" disabled={true} value={item.controlName} />
                    <Input
                      className="mLeft10 flex mTop8"
                      placeholder={_l('请输入说明')}
                      value={item.desc}
                      maxLength={64}
                      onChange={e => updateItem(item.controlId, 'desc', e.target.value)}
                      onBlur={e => updateItem(item.controlId, 'desc', e.target.value.trim())}
                    />

                    <div className="mLeft10 w30 flexRow mTop8 Font16 alignItemsCenter">
                      <Icon
                        icon={item.attribute === 1 ? 'ic_title' : 'title'}
                        className={cx('textSecondary hoverColorPrimary pointer', {
                          colorPrimary: item.attribute === 1,
                        })}
                        onClick={() => {
                          updateSource({
                            controls: data.controls.map(o => {
                              o.attribute = o.controlId === item.controlId ? 1 : 0;
                              return o;
                            }),
                          });
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </List>
          </Fragment>
        )}

        <div className="Font13 bold mTop20">{_l('被以下工作流触发')}</div>
        {!data.processList.length && (
          <div className="Font12 textSecondary workflowDetailDesc mTop10 subProcessDesc">{_l('未被任何流程触发')}</div>
        )}

        {data.processList.map((item, i) => {
          return (
            <div className="workflowDetailDesc mTop10 subProcessDesc" key={i}>
              <div className="Font13">
                <span
                  className="colorPrimary hoverColorPrimaryDark pointerEventsAuto"
                  onClick={() => window.open(pathCompletion(`/workflowedit/${item.processId}`))}
                >
                  {item.processName}
                </span>
              </div>
              <div className="Font12">
                <span className="textSecondary mRight5">{_l('节点')}</span>
                <span>{item.flowNodes.map(obj => `“${obj.name}”`).join('、')}</span>
                <span className="textSecondary mLeft5">{_l('触发')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Fragment>
  );
};
