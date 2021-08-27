import React, { Fragment } from 'react';
import SvgIcon from 'src/components/SvgIcon';
import { Select } from 'antd';
import { LoadDiv, ScrollView } from 'ming-ui';
import cx from 'classnames';
import './index.less';

const operationTypeData = [
  { label: _l('不导出'), exampleType: 0 },
  { label: _l('每张表最多导出100条记录'), exampleType: 1 },
  { label: _l('自定义导出的记录数量'), exampleType: 2 },
];

const sheetTypeData = [
  { label: _l('不导出'), count: 0 },
  { label: _l('20'), count: 20 },
  { label: _l('50'), count: 50 },
  { label: _l('100'), count: 100 },
];

export default class AppSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeId: null,
      list: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.list !== this.props.list) {
      this.setState({
        list: nextProps.list,
      });
    }
  }

  renderContent(item = {}) {
    const entities = item.entities || [];
    if (entities.length > 0) {
      return (
        <ScrollView className="singleItemAppContent">
          {entities.map((entity, index) => {
            return (
              <div className="singleItemHeader mBottom10">
                <div className="singleItemLeft">
                  <div className="mLeft35">{entity.worksheetName}</div>
                </div>
                <div className="singleItemRight pLeft4">
                  {sheetTypeData.map(sheet => {
                    return (
                      <div
                        className={cx('sheetItemOption', { active: sheet.count === entity.count })}
                        key={sheet.count}
                        onClick={() => {
                          const copyEntities = [...entities];
                          copyEntities[index].count = sheet.count;
                          this.setState({
                            list: this.state.list.map(child =>
                              child.appId === item.appId ? { ...child, entities: copyEntities } : child,
                            ),
                          });
                        }}
                      >
                        {sheet.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </ScrollView>
      );
    }
  }

  render() {
    const { activeId, list } = this.state;
    if (!list.length) {
      return <LoadDiv />;
    }
    return (
      <Fragment>
        {list.map(item => {
          return (
            <div className="singleItemOption">
              <div className="singleItemHeader">
                <div className="singleItemLeft">
                  <div className="mRight15 svgBox" style={{ backgroundColor: item.iconColor }}>
                    <SvgIcon url={item.iconUrl} fill="#fff" size={14} />
                  </div>
                  {item.appName}
                  <span className={cx('icon-info mLeft8', { Hidden: !item.relation })}></span>
                </div>
                <div className="singleItemRight">
                  <Select
                    value={item.entities && !item.entities.length ? _l('该应用下没有工作表') : item.exampleType}
                    className="selectWrapper"
                    disabled={item.entities && !item.entities.length}
                    onChange={exampleType => {
                      this.setState(
                        {
                          list: list.map(child => (child.appId === item.appId ? { ...child, exampleType } : child)),
                        },
                        () => {
                          if (exampleType === 2) {
                            this.setState({ activeId: item.appId });
                          }
                        },
                      );
                    }}
                  >
                    {operationTypeData.map(item => (
                      <Select.Option className="processOptionWrapper" key={item.exampleType} value={item.exampleType}>
                        {item.label}
                      </Select.Option>
                    ))}
                  </Select>
                  {activeId !== item.appId && item.exampleType === 2 ? (
                    <span
                      className="ThemeColor3 mLeft15 Hover_49 Hand"
                      onClick={() => this.setState({ activeId: item.appId })}
                    >
                      {_l('设置')}
                    </span>
                  ) : null}
                </div>
              </div>
              {activeId === item.appId && item.exampleType === 2 && this.renderContent(item)}
            </div>
          );
        })}
      </Fragment>
    );
  }
}
