import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { v4 as uuidv4, validate } from 'uuid';
import { Dropdown, Icon } from 'ming-ui';
import { FIELD_TYPE_LIST } from '../../../enum';

const OutputListItem = styled.div(
  ({ isHeader }) => `
  height: 36px;
  display: flex;
  align-items: center;
  ${isHeader ? 'color: #757575;' : 'margin-bottom: 10px;'}
  .width150 {
    width: 150px;
  }
  .width120 {
    width: 120px;
  }
  .width100 {
    width: 100px;
  }
  .width50 {
    width: 50px;
  }
  input {
    width: 100%;
    height: 36px;
    line-height: 36px;
    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
    border-color: #ddd;
    padding: 0 10px;
    &:focus {
      border-color: #1677ff;
    }
  }
`,
);

const getDefaultParameters = () => {
  return {
    controlId: uuidv4(),
    type: 2,
    controlName: '',
    dataSource: '',
    value: '',
  };
};

const OUTPUT_TYPE = {
  JSON_PARSE: 1,
  AI: 2,
};

export default class OutputList extends Component {
  /**
   * 渲染参数列表
   */
  renderOutputList() {
    const { outputType, data } = this.props;

    return (
      <Fragment>
        <OutputListItem isHeader className="mTop5">
          <div className="width150 mRight10">{_l('参数名称')}</div>
          <div className="width120 mRight10">{_l('类型')}</div>
          <div className="flex mRight10">{outputType === OUTPUT_TYPE.JSON_PARSE ? 'JSON Path' : _l('参数说明')} </div>
          <div className="width50" />
        </OutputListItem>

        {this.renderJSONList(data.outputs.filter(item => !item.dataSource))}
      </Fragment>
    );
  }

  /**
   * 递归渲染列表
   */
  renderJSONList(source) {
    const { outputType, data, isIntegration } = this.props;

    return source.map(item => {
      let subItem;

      if (item.dataSource && _.find(data.outputs, o => o.controlId === item.dataSource).type === 10000007) {
        return null;
      }

      if (item.type === 10000007) {
        subItem = _.find(data.outputs, o => o.dataSource === item.controlId) || {};
      }

      return (
        <Fragment key={item.controlId}>
          <OutputListItem>
            <div className={cx('width150 mRight10', { pLeft20: item.dataSource })}>
              <input
                type="text"
                value={item.controlName}
                placeholder={_l('请填写参数名称')}
                onChange={e => this.updateOutputParameters('controlName', e.target.value, item)}
                onBlur={e =>
                  this.updateOutputParameters(
                    'controlName',
                    e.target.value.replace(/[^\u4e00-\u9fa5a-zA-Z\d_]/g, ''),
                    item,
                    true,
                  )
                }
              />
            </div>
            <div className="width120 mRight10">
              <Dropdown
                className="flowDropdown"
                style={{ width: 120 }}
                data={FIELD_TYPE_LIST.filter(
                  o =>
                    _.includes([2, 6, 16, 26, 27, 48, 10000007, 10000008], o.value) &&
                    (!item.dataSource || (item.dataSource && o.value !== 10000008)) &&
                    (outputType === OUTPUT_TYPE.JSON_PARSE || !_.includes([16, 26, 27, 48], o.value)),
                )}
                value={item.type}
                border
                disabled={!validate(item.controlId)}
                onChange={type => {
                  this.updateOutputParameters('type', type, item);
                }}
              />
            </div>
            {item.type === 10000007 && (
              <div className="width100 mRight10">
                <Dropdown
                  className="flowDropdown"
                  style={{ width: 100 }}
                  data={FIELD_TYPE_LIST.filter(o =>
                    outputType === OUTPUT_TYPE.JSON_PARSE
                      ? _.includes([2, 6, 16, 26, 27], o.value)
                      : _.includes([2, 6], o.value),
                  )}
                  value={subItem.type}
                  border
                  disabled={!validate(subItem.controlId)}
                  onChange={type => {
                    this.updateOutputParameters('type', type, subItem);
                    this.updateOutputParameters(
                      'controlName',
                      _.find(FIELD_TYPE_LIST, o => o.value === type).en,
                      subItem,
                    );
                  }}
                />
              </div>
            )}
            <div className="flex mRight10">
              {outputType === OUTPUT_TYPE.JSON_PARSE ? (
                <input
                  type="text"
                  value={item.jsonPath}
                  placeholder={_l('请填写 JSON Path 值')}
                  onChange={e => this.updateOutputParameters('jsonPath', e.target.value, item)}
                  onBlur={e => this.updateOutputParameters('jsonPath', e.target.value.trim(), item)}
                />
              ) : (
                <input
                  type="text"
                  placeholder={_l('说明')}
                  value={item.desc}
                  onChange={evt => this.updateOutputParameters('desc', evt.target.value, item)}
                  onBlur={evt => this.updateOutputParameters('desc', evt.target.value.trim(), item)}
                />
              )}
            </div>
            <div className="width50">
              <Icon
                type="trash"
                className="Font16 mRight10 pointer Gray_75 ThemeHoverColor3"
                onClick={() => this.removeParameters(item.controlId)}
              />
              <Icon
                type="add"
                className="Font16 pointer Gray_75 ThemeHoverColor3"
                onClick={() => this.addParameters(item)}
              />
            </div>
          </OutputListItem>

          {isIntegration && (
            <div className={cx('mBottom10 flexRow alignItemsCenter', { pLeft20: item.dataSource })}>
              <input
                type="text"
                className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 flex"
                placeholder={_l('说明')}
                value={item.desc}
                onChange={evt => this.updateOutputParameters('desc', evt.target.value, item)}
                onBlur={evt => this.updateOutputParameters('desc', evt.target.value.trim(), item)}
              />
            </div>
          )}

          {this.renderJSONList(data.outputs.filter(o => o.dataSource === item.controlId))}
        </Fragment>
      );
    });
  }

  /**
   * 修改输出参数
   */
  updateOutputParameters(action, value, { controlId, type, dataSource }, isBlur) {
    const { outputType, data, updateSource } = this.props;
    const { outputs } = data;

    outputs.forEach(item => {
      if (item.controlId === controlId) {
        item[action] =
          isBlur &&
          action === 'controlName' &&
          !!outputs
            .filter(o => o.dataSource === dataSource)
            .find(o => o.controlName === value && o.controlId !== controlId)
            ? value +
              Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, '0')
            : value;

        // 更新jsonpath值
        if (outputType === OUTPUT_TYPE.AI && isBlur && action === 'controlName') {
          item.jsonPath = item.dataSource ? `@.${item.controlName}` : `$.${item.controlName}`;
        }
      }
    });

    // 数组调整类型
    if (action === 'type' && _.includes([10000007, 10000008], type)) {
      _.remove(outputs, o => o.dataSource === controlId);
    }

    // 普通数组
    if (action === 'type' && value === 10000007) {
      outputs.push(this.generationOrdinaryArrayObject(controlId));
    }

    updateSource({ outputs });
  }

  /**
   * 删除参数
   */
  removeParameters(controlId) {
    const { outputType, data, updateSource } = this.props;
    const { outputs, conditions } = data;

    _.remove(outputs, o => o.controlId === controlId || o.dataSource === controlId);

    if (outputType === OUTPUT_TYPE.JSON_PARSE) {
      conditions.forEach(item => {
        _.remove(item, o => o.filedId === controlId);
      });

      updateSource({ outputs, conditions: conditions.filter(item => item.length) });
    } else {
      updateSource({ outputs });
    }
  }

  /**
   * 添加参数
   */
  addParameters({ type, dataSource, controlId }) {
    const { data, updateSource } = this.props;
    const { outputs } = data;
    let index = 0;

    outputs.forEach((item, i) => {
      if (item.controlId === controlId) {
        index = i;
      }
    });

    if (type === 10000008 || dataSource) {
      outputs.splice(index + 1, 0, Object.assign({}, getDefaultParameters(), { dataSource: dataSource || controlId }));
    } else {
      outputs.splice(index + 1, 0, getDefaultParameters());
    }

    updateSource({ outputs });
  }

  /**
   * 生成普通数组的对象
   */
  generationOrdinaryArrayObject(dataSource) {
    return {
      controlId: uuidv4(),
      type: 2,
      controlName: 'string',
      dataSource,
      jsonPath: '@',
    };
  }

  render() {
    const { data, updateSource } = this.props;

    return (
      <Fragment>
        {data.outputs && !!data.outputs.length && this.renderOutputList()}
        <div className="mTop15">
          <div
            className="InlineBlock pointer ThemeColor3 ThemeHoverColor2"
            onClick={() =>
              updateSource({
                outputs: (data.outputs || []).concat([getDefaultParameters()]),
              })
            }
          >
            {_l('+ 输出参数')}
          </div>
        </div>
      </Fragment>
    );
  }
}
