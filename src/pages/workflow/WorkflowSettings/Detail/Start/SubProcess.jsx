import React, { Fragment } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Dropdown, Icon } from 'ming-ui';
import { APP_TYPE, APP_TYPE_TEXT, FIELD_TYPE_LIST } from '../../enum';

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
  .fieldName {
    padding: 5px 12px;
    border-radius: 4px;
    border: 1px solid #ccc;
    height: 36px;
    line-height: 36px;
    font-size: 13px;
    &:focus {
      border-color: #1677ff;
    }
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
                    <Dropdown
                      className="w120 mTop8"
                      menuStyle={{ width: '100%' }}
                      data={FIELD_TYPE_LIST}
                      value={item.type}
                      disabled={true}
                      border
                    />
                    <input
                      type="text"
                      className="mLeft10 fieldName w160 mTop8 minWidth0"
                      disabled={true}
                      value={item.controlName}
                    />
                    <input
                      type="text"
                      className="mLeft10 fieldName flex mTop8"
                      placeholder={_l('请输入说明')}
                      value={item.desc}
                      maxLength={64}
                      onChange={e => updateItem(item.controlId, 'desc', e.target.value)}
                      onBlur={e => updateItem(item.controlId, 'desc', e.target.value.trim())}
                    />

                    <div className="mLeft10 w30 flexRow mTop8 Font16 alignItemsCenter">
                      <Icon
                        icon={item.attribute === 1 ? 'ic_title' : 'title'}
                        className={cx('Gray_75 ThemeHoverColor3 pointer', { ThemeColor3: item.attribute === 1 })}
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
          <div className="Font12 Gray_75 workflowDetailDesc mTop10 subProcessDesc">{_l('未被任何流程触发')}</div>
        )}

        {data.processList.map((item, i) => {
          return (
            <div className="workflowDetailDesc mTop10 subProcessDesc" key={i}>
              <div className="Font13">
                <span
                  className="ThemeColor3 ThemeHoverColor2"
                  onClick={() => window.open(`/workflowedit/${item.processId}`)}
                >
                  {item.processName}
                </span>
              </div>
              <div className="Font12">
                <span className="Gray_75 mRight5">{_l('节点')}</span>
                <span>{item.flowNodes.map(obj => `“${obj.name}”`).join('、')}</span>
                <span className="Gray_75 mLeft5">{_l('触发')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Fragment>
  );
};
