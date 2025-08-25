import React, { Fragment } from 'react';
import { InputNumber, Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { LoadDiv, ScrollView, SvgIcon } from 'ming-ui';
import { getTranslateInfo } from 'src/utils/app';
import './index.less';

const operationTypeData = [
  { label: _l('不导出'), exampleType: 0 },
  { label: _l('每张表最多导出10000条记录'), exampleType: 1 },
  { label: _l('自定义导出的记录数量'), exampleType: 2 },
];

const sheetTypeData = [
  { label: _l('不导出'), count: 0 },
  { label: 50, count: 50 },
  { label: 100, count: 100 },
  { label: _l('全部'), count: 'all', isAll: true },
  { label: _l('自定义'), count: -1, isCustom: true },
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
        list: nextProps.list.map(item => ({ ...item, isCustom: false, isAll: false })),
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
                  <div className="Font12 Gray_9e">{`（${entity.totalRecordNum}）`}</div>
                </div>
                <div className="singleItemRight pLeft4">
                  {sheetTypeData.map(sheet => {
                    let active = sheet.isCustom
                      ? sheet.isCustom === entity.isCustom
                      : sheet.isAll
                        ? sheet.isAll === entity.isAll
                        : sheet.count === entity.count;
                    return (
                      <div
                        className={cx('sheetItemOption', { active })}
                        key={sheet.count}
                        onClick={() => {
                          const copyEntities = [...entities];
                          copyEntities[index].count =
                            sheet.count === 'all'
                              ? copyEntities[index].totalRecordNum <= 10000
                                ? copyEntities[index].totalRecordNum
                                : 10000
                              : sheet.count;
                          copyEntities[index].isCustom =
                            sheet.isCustom || (sheet.isAll && copyEntities[index].totalRecordNum > 10000)
                              ? true
                              : false;
                          copyEntities[index].isAll =
                            sheet.isAll && copyEntities[index].totalRecordNum <= 10000 ? true : false;
                          let selectedCount = _.reduce(
                            copyEntities || [],
                            (total, current) => {
                              let count =
                                current.count === -1
                                  ? 0
                                  : current.count === 'all'
                                    ? current.totalRecordNum
                                    : current.count;
                              return total + count;
                            },
                            0,
                          );
                          const disabledExportBtn = this.state.list
                            .map(child =>
                              child.appId === item.appId ? { ...child, entities: copyEntities, selectedCount } : child,
                            )
                            .some(it => it.selectedCount > 50000);
                          this.props.getIsDisabledExportBtn(disabledExportBtn);
                          this.setState({
                            list: this.state.list.map(child =>
                              child.appId === item.appId ? { ...child, entities: copyEntities, selectedCount } : child,
                            ),
                          });
                        }}
                      >
                        {sheet.label}
                      </div>
                    );
                  })}
                  {entity.isCustom && (
                    <InputNumber
                      placeholder={_l('请输入')}
                      className="customInput"
                      controls={false}
                      value={entity.count === -1 ? undefined : entity.count}
                      min={0}
                      max={10000}
                      onChange={val => {
                        const copyEntities = [...entities];
                        copyEntities[index].count = val;
                        let selectedCount = _.reduce(
                          copyEntities || [],
                          (total, current) => {
                            let count =
                              current.count === -1
                                ? 0
                                : current.count === 'all'
                                  ? current.totalRecordNum
                                  : current.count;
                            return total + count;
                          },
                          0,
                        );
                        let disabledExportBtn = this.state.list
                          .map(child =>
                            child.appId === item.appId ? { ...child, entities: copyEntities, selectedCount } : child,
                          )
                          .some(it => it.selectedCount > 50000);
                        this.props.getIsDisabledExportBtn(disabledExportBtn);
                        this.setState({
                          list: this.state.list.map(child =>
                            child.appId === item.appId ? { ...child, entities: copyEntities, selectedCount } : child,
                          ),
                        });
                      }}
                    />
                  )}
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
                  <div className="flex ellipsis pRight10">
                    {getTranslateInfo(item.appId, null, item.appId).name || item.appName}
                  </div>
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
                  <span
                    className={cx('mLeft10', {
                      Gray_75: item.selectedCount && item.selectedCount <= 50000,
                      overMax: item.selectedCount && item.selectedCount > 50000,
                    })}
                  >
                    {item.exampleType === 2 && _l('已选 %0 行（最大5万行）', item.selectedCount || 0)}
                  </span>
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
