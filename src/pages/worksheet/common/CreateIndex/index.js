import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import worksheetAjax from 'src/api/worksheet';
import { Icon, Checkbox } from 'ming-ui';
import { Input, Tooltip, Select } from 'antd';
import cx from 'classnames';
import './index.less';
import _ from 'lodash';

const { Option } = Select;

const RULES = {
  0: [
    { value: 1, txt: _l('A → Z%02058') },
    { value: -1, txt: _l('Z → A%02059') },
    { value: 'text', txt: _l('文本索引') },
  ],
  1: [
    { value: 1, txt: '1 → 9' },
    { value: -1, txt: '9 → 1' },
  ],
  2: [
    { value: -1, txt: _l('最新的在前面') },
    { value: 1, txt: _l('最旧的在前面') },
  ],
  3: [
    { value: 1, txt: _l('升序') },
    { value: -1, txt: _l('降序') },
  ],
};

const QA_TEXT = [
  {
    qa: 1,
    title: _l('哪些工作表需要创建索引？'),
    content: _l(
      '如果工作表的数据量比较大（通常为数万或数十万以上），而且在查询工作表时已经出现明显的加载延迟，那就可以在该工作表上创建索引以尝试加快检索速度。',
    ),
  },
  {
    qa: 2,
    title: _l('创建索引时如何选择索引字段？'),
    content: (
      <Fragment>
        <div>
          {_l('在视图、筛选、快速筛选等查询场景中被检索的字段或者在视图、子表、关联记录中被排序的字段才需要创建索引。')}
        </div>
        <div>
          {_l(
            '选择索引字段时请记住一个原则：记录中重复值越少的字段，越适合建立索引。例如一个不允许重复的「商品编号」字段，就非常适合创建索引；反之，一个用于记录男、女的「性别」字段，则不适合创建索引。',
          )}
        </div>
        <div>
          {_l(
            '如果一些字段总是需要一起参与检索，它们组合起来之后的重复率更低，例如「First Name」和「Last Name」，那么你可以同时选择这两个字段创建一个复合索引，比为这两个字段分别创建索引效果更好。',
          )}
        </div>
      </Fragment>
    ),
  },
  {
    qa: 3,
    title: _l('索引字段排序有什么用？'),
    content: _l(
      '索引字段的排序和你在视图中使用此字段参与排序的规则有关。当索引只有一个字段时，视图中排序的方向不会影响检索的加速；除此之外，请尽量保证在视图中的字段排序方式与索引中设置的一致，否则检索可能不会被加速。',
    ),
  },
  {
    qa: 4,
    title: _l('为什么索引会创建失败？'),
    content: (
      <Fragment>
        <div>{_l('创建索引时，会有下列限制，不遵循限制可能会出现索引创建失败的情况：')}</div>
        <div>{_l('○ 创建「唯一索引」时，选择的索引字段在已有记录里不能存在重复值；')}</div>
        <div>{_l('○ 创建索引时选择的字段不能和之前已创建的某个索引的字段完全一样；')}</div>
        <div>{_l('○ 一张工作表只能创建一个「文本索引」或「所有文本字段全文索引」；')}</div>
        <div>{_l('○ 一个索引只能包含一个「选项」类型的字段，如单选/多选/人员/部门等；')}</div>
      </Fragment>
    ),
  },
  {
    qa: 5,
    title: _l('索引越多越好吗？'),
    content: _l(
      '并非如此。索引只会加速检索，而在新增、更新、删除记录时系统会花费更多的时间用于更新索引，过多的索引会很明显的降低这些操作的速度，甚至影响到查询的速度。',
    ),
  },
  {
    qa: 6,
    title: _l('系统会自动为我建立索引吗？'),
    content: _l(
      '是的，我们会根据公有云平台每天的访问日志，自动学习和智能分析被频繁使用的查询语句，并自动创建合适的索引。所以，请不要随意修改和删除不是由你自己创建的索引。私有部署环境暂不支持自动创建索引。',
    ),
  },
];
const MAX_COUNT = md.global.Config.IsLocal ? 10 : 5;

class CreateIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndexList: props.selectedIndexList || [{}],
      selectIndexFileds: [],
      uniqueIndex: props.currentIndexInfo.uniqueIndex || false,
      wildcardIndex: props.currentIndexInfo.wildcardIndex || false,
      customeIndexName: props.currentIndexInfo.customeIndexName || undefined,
      showQAList: [],
    };
  }
  componentDidMount() {}
  renderTitle = () => {
    const { isEdit } = this.props;
    return (
      <div className="title Gray">
        <span>{isEdit ? _l('编辑索引') : _l('创建索引')}</span>
        <Icon icon="close" className="Gray_9d Font20 pointer" onClick={this.props.onClose} />
      </div>
    );
  };
  // 创建唯一索引
  changeIndexOnly = checked => {
    this.setState({ uniqueIndex: !checked });
  };
  // 添加通配符文本索引
  addUsualTxt = checked => {
    this.setState({ wildcardIndex: !checked });
  };

  saveIndex = () => {
    let { uniqueIndex, selectedIndexList = [], customeIndexName = '', wildcardIndex } = this.state;
    const { worksheetId, isEdit, currentIndexInfo = {}, appId, getIndexesInfo = () => {}, indexList = [] } = this.props;
    let hasDeleteFields = selectedIndexList.some(item => item.isDelete);
    if (hasDeleteFields) return alert(_l('请移除索引中已删除的字段'), 3);
    if (currentIndexInfo.indexStateId === 0) return;
    let isExistTestIndexFileds = selectedIndexList.some(item => item.indexType === 'text') || wildcardIndex;
    // 每张工作表只能创建一个文本索引
    let hasTestIndex = false;
    indexList.forEach(item => {
      if (
        item.indexConfigId !== currentIndexInfo.indexConfigId &&
        (item.wildcardIndex || item.indexFields.some(it => it.indexType === 'text'))
      ) {
        hasTestIndex = true;
      }
    });
    if (isExistTestIndexFileds && hasTestIndex) {
      return alert(_l('每张工作表只能创建一个文本索引'), 3);
    }
    // 如果同时包含多个数组型字段，保存时 Toast 提示「索引只能包含一个多选类型字段」
    let arrTypeNum = selectedIndexList.filter(item => item.type === 3).length;
    if (arrTypeNum > 1) return alert(_l('索引只能包含一个多选类型字段'), 3);
    // 如果同时包含「文本索引」类型和「数组型字段」，保存时 Toast 提示「索引不能同时包含文本索引与多选类型字段」
    if (isExistTestIndexFileds && selectedIndexList.some(item => item.type === 3)) {
      return alert(_l('索引不能同时包含文本索引与多选类型字段'), 3);
    }
    let params = {
      appId,
      worksheetId, // 工作表Id
      customeIndexName, // 自定义索引名称
      indexFields: selectedIndexList.map(item => ({
        fieldId: item.fieldId,
        indexType: item.indexType,
        isSystem: item.isSystem || false,
      })),
      uniqueIndex: uniqueIndex || false, //  是否 唯一索引
      wildcardIndex: wildcardIndex || false, // 是否通配符文本索引
      sparseIndex: false, // 是否 稀疏索引
      backgroundIndex: isExistTestIndexFileds ? false : true, // 是否 后台索引
    };
    if (isEdit) {
      params.indexConfigId = currentIndexInfo.indexConfigId || '';
      params.isSystemIndex = currentIndexInfo.isSystem;
      params.systemIndexName = currentIndexInfo.systemIndexName;
    }
    if (!isEdit) {
      worksheetAjax.addRowIndex(params).then(res => {
        if (res.responseEnum === 0) {
          alert(_l('操作成功'));
        } else if (res.responseEnum == -1) {
          alert(_l('操作失败'), 2);
        } else if (res.responseEnum == 1) {
          alert(_l('参数错误'), 3);
        } else if (res.responseEnum == 2) {
          alert(_l('排队中'), 3);
        } else if (res.responseEnum === 3) {
          alert(_l('超出索引最多显示'), 3);
        } else if (res.responseEnum === 4) {
          alert(_l('索引已存在'), 3);
        }
        getIndexesInfo();
      });
    } else {
      worksheetAjax.updateRowIndex(params).then(res => {
        if (res.responseEnum === 0) {
          let indexStateId =
            (res.rowIndexConfigs || []).filter(item => item.indexConfigId === currentIndexInfo.indexConfigId).length &&
            (res.rowIndexConfigs || []).filter(item => item.indexConfigId === currentIndexInfo.indexConfigId)[0]
              .indexStateId;
          if (indexStateId === -1) return alert(_l('操作失败'), 2);
          alert(_l('操作成功'));
        } else if (res.responseEnum == -1) {
          alert(_l('操作失败'), 2);
        } else if (res.responseEnum == 1) {
          alert(_l('参数错误'), 3);
        } else if (res.responseEnum == 2) {
          alert(_l('排队中'), 3);
        } else if (res.responseEnum === 3) {
          alert(_l('超出索引最多显示'), 3);
        } else if (res.responseEnum === 4) {
          alert(_l('索引已存在'), 3);
        }
        getIndexesInfo();
      });
    }
    this.props.onClose();
  };
  changeIndexField = (value, index) => {
    let { selectedIndexList = [] } = this.state;
    const { worksheetAvailableFields = [] } = this.props;
    if (value === selectedIndexList[index].fieldId) return;
    let type = _.get(worksheetAvailableFields.filter(item => item.id === value)[0], 'type');
    let temp = selectedIndexList.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          fieldId: value,
          type,
          indexType: 1,
        };
      }
      return item;
    });
    let selectFiledsList = _.differenceWith(
      worksheetAvailableFields,
      temp,
      (item1, item2) => item1.id === item2.fieldId,
    );

    let copySelectedIndexList = temp.map(item => {
      let currentAvailableFileds = worksheetAvailableFields.filter(t => t.id === item.fieldId) || [];
      return { ...item, selectFiledsList: currentAvailableFileds.concat(selectFiledsList) };
    });
    this.setState({
      selectedIndexList: copySelectedIndexList,
    });
  };
  changeFieldValue = (value, index) => {
    let { selectedIndexList = [] } = this.state;
    let copySelectedIndexList = [...selectedIndexList];
    copySelectedIndexList[index] = {
      ...copySelectedIndexList[index],
      indexType: value,
    };
    this.setState({ selectedIndexList: copySelectedIndexList });
  };
  addField = () => {
    let { selectedIndexList = [] } = this.state;
    const { worksheetAvailableFields } = this.props;
    let maxWorksheetAvailableFields = selectedIndexList.length > worksheetAvailableFields.length - 1;
    if (selectedIndexList.length >= MAX_COUNT || maxWorksheetAvailableFields) return;
    let copySelectedIndexList = [...selectedIndexList];
    let temp =
      _.differenceWith(worksheetAvailableFields, selectedIndexList, (item1, item2) => item1.id === item2.fieldId) || [];
    copySelectedIndexList.push({
      fieldId: temp.length ? temp[0].id : '',
      name: temp.length ? temp[0].name : '',
      type: temp.length ? temp[0].type : '',
      indexType: '1',
      selectFiledsList: temp,
    });
    this.setState({ selectedIndexList: copySelectedIndexList });
  };
  removeCurrentField = index => {
    let { selectedIndexList = [] } = this.state;
    if (selectedIndexList.length <= 1) return;
    let copySelectedIndexList = [...selectedIndexList];
    copySelectedIndexList.splice(index, 1);
    this.setState({ selectedIndexList: copySelectedIndexList });
  };

  openAndClose = num => {
    let temp = [...this.state.showQAList];
    if (_.includes(temp, num)) {
      temp = temp.filter(v => v !== num);
    } else {
      temp.push(num);
    }
    this.setState({ showQAList: temp });
  };
  render() {
    const { isEdit, currentIndexInfo, worksheetAvailableFields, getFieldObjById = () => {} } = this.props;
    let { selectedIndexList = [], wildcardIndex, uniqueIndex, customeIndexName, showQAList = [] } = this.state;
    let maxWorksheetAvailableFields = selectedIndexList.length > worksheetAvailableFields.length - 1;
    return (
      <div className="createIndexContainer">
        {this.renderTitle()}
        <div className="createIndexBody">
          <div className="minBold sunTitle">
            <span>{_l('选择索引字段')}</span>
            <Tooltip
              title={_l(
                '每张工作表只能创建一个「文本索引」或者「文本字段全文索引」；创建「文本索引」时，不能包含「选项字段」；每个索引只能包含一个「选项字段」',
              )}
              placement="bottom"
            >
              <Icon icon="help" className="mLeft8 Gray_9d" />
            </Tooltip>
          </div>
          <div className="selectedInfo">
            {selectedIndexList.map((item, index) => {
              return (
                <div className="selectedRow" key={item.fieldId}>
                  {item.isSystem || item.isDelete ? (
                    <Tooltip title={(item.isDelete && `ID：${item.fieldId}`) || ''} placement="top" trigger={['hover']}>
                      <span>
                        <Input
                          value={
                            item.isDelete
                              ? _l('字段已删除')
                              : _.get(getFieldObjById(item.fieldId), 'name')
                              ? _.get(getFieldObjById(item.fieldId), 'name')
                              : item.fieldId
                          }
                          disabled
                          className={cx('col1 mRight8', { Red: item.isDelete })}
                        />
                      </span>
                    </Tooltip>
                  ) : (
                    <Select
                      placeholder={_l('请选择')}
                      className="col1 mRight8"
                      value={item.fieldId}
                      onChange={value => this.changeIndexField(value, index)}
                      showSearch={true}
                      filterOption={(val, option) => option.children.toLowerCase().includes(val.toLowerCase())}
                    >
                      {(item.selectFiledsList || []).map(f => (
                        <Option value={f.id} key={f.id}>
                          {f.name}
                        </Option>
                      ))}
                    </Select>
                  )}
                  <Select
                    className="col2"
                    onChange={value => this.changeFieldValue(value, index)}
                    placeholder={_l('请选择')}
                    value={
                      item.indexType && item.indexType !== 'text'
                        ? Number(item.indexType)
                        : item.indexType === 'text'
                        ? item.indexType
                        : ''
                    }
                  >
                    {(RULES[item.type || 0] || []).map((v, i) => (
                      <Option
                        key={`${index}-${i}`}
                        value={v.value}
                        disabled={(wildcardIndex || uniqueIndex) && v.value === 'text'}
                      >
                        {v.txt}
                      </Option>
                    ))}
                  </Select>
                  <Icon
                    icon="remove_circle_outline"
                    className={cx('Font16 remove Hand Gray_9d', {
                      disabledAct: selectedIndexList.length <= 1,
                    })}
                    onClick={() => this.removeCurrentField(index)}
                  />
                  <Icon
                    icon="create-network"
                    className={cx('Font16 Hand Gray_9d', {
                      disabledAct: selectedIndexList.length >= MAX_COUNT || maxWorksheetAvailableFields,
                    })}
                    onClick={this.addField}
                  />
                </div>
              );
            })}
          </div>
          <div className="minBold sunTitle">{_l('索引类型')}</div>
          <div className="flexRow">
            <Checkbox
              onClick={this.changeIndexOnly}
              checked={uniqueIndex}
              disabled={selectedIndexList.some(item => item.indexType == 'text')}
            >
              {_l('唯一索引')}
            </Checkbox>
            <Tooltip
              title={_l(
                '建立唯一索引后，字段的值不允许重复。如果字段为非必填，则整个工作表只能有一条为空的数据，以保证数据的唯一性',
              )}
              placement="bottom"
            >
              <Icon icon="help" className="mLeft8 lineHeight20 mRight24 Gray_9d" />
            </Tooltip>
            <Checkbox
              checked={wildcardIndex}
              disabled={selectedIndexList.some(item => item.indexType == 'text')}
              onClick={this.addUsualTxt}
            >
              {_l('所有文本字段全文索引')}
            </Checkbox>
            <Tooltip
              title={_l('支持所有文本字段全文检索。工作表创建文本索引后不可再创建此类型索引')}
              placement="bottom"
            >
              <Icon icon="help" className="mLeft8 lineHeight20 Gray_9d" />
            </Tooltip>
          </div>
          <div className="minBold sunTitle">{_l('索引名称')}</div>
          <Input
            disabled={currentIndexInfo.isSystem ? true : false}
            placeholder={_l('不输入名称将按字段名称自动创建')}
            className="w100"
            value={customeIndexName}
            onChange={e => {
              this.setState({ customeIndexName: e.target.value });
            }}
          />
          <div className="descriptionInfos">
            <div className="minBold mBottom16">{_l('如何利用索引加速检索？')}</div>
            <div className="desContent">
              {_l(
                '为工作表建立索引，就像是为一本字典建立一个可以用拼音检索的目录。创建适合的索引可以非常有效的加快特定查询条件下的记录检索速度。在创建索引之前，你需要了解创建索引的一些基本原则。',
              )}
            </div>

            {QA_TEXT.map(v => {
              return (
                <Fragment>
                  <div className="desTitle  mTop16" onClick={() => this.openAndClose(v.qa)}>
                    <span className="Hand"> {v.title}</span>
                  </div>
                  {_.includes(showQAList, v.qa) && <div className="desContent mTop10">{v.content}</div>}
                </Fragment>
              );
            })}
          </div>
        </div>
        <div className="createIndexFooter">
          {currentIndexInfo.indexStateId !== 0 && (
            <span className="confirmBtn Hand" onClick={this.saveIndex}>
              {isEdit ? _l('修改保存') : _l('创建索引')}
            </span>
          )}
          {currentIndexInfo.indexStateId == 0 && (
            <Tooltip title={_l('不能修改排队中的索引')} placement="top">
              <span className="confirmBtn disabled">{_l('修改保存')}</span>
            </Tooltip>
          )}
          <span className="cancelBtn Hand" onClick={this.props.onClose}>
            {_l('取消')}
          </span>
        </div>
      </div>
    );
  }
}

export default connect(
  state => {
    const { worksheetId, worksheetInfo = {} } = state.formSet;
    const { appId } = worksheetInfo;
    return {
      worksheetId,
      appId,
    };
  },
  dispatch => bindActionCreators({}, dispatch),
)(CreateIndex);
