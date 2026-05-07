import React, { Fragment, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Dropdown, Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import selectKnowledge from 'src/pages/workflow/components/selectVectorKnowledgeDialog';
import { SEARCH_MODE_MAP } from '../../../enum';
import CustomTextarea from '../CustomTextarea';
import SingleControlValue from '../SingleControlValue';

/**
 * 生成controls
 */
const generateControls = (showAuto = false) => {
  const controls = [
    {
      controlId: 'types',
      options: [
        { key: '1', value: _l('记录') },
        { key: '2', value: _l('记录讨论') },
        { key: '3', value: _l('记录附件') },
        { key: '4', value: _l('讨论附件') },
      ],
    },
    {
      controlId: 'searchMode',
      options: (showAuto ? [{ key: 'auto', value: SEARCH_MODE_MAP['auto'] }] : []).concat([
        { key: 'vector', value: SEARCH_MODE_MAP['vector'] },
        { key: 'keyword', value: SEARCH_MODE_MAP['keyword'] },
        { key: 'hybrid', value: SEARCH_MODE_MAP['hybrid'] },
      ]),
      advancedSetting: { showtype: '1' },
    },
  ];

  return controls;
};

/**
 * 生成fields
 */
const generateFields = data => {
  const fields = [
    {
      fieldId: 'types',
      type: 10,
      fieldName: _l('内容类型'),
      fieldValue: data.types.join(','),
      placeholder: _l('未设置时，检索所有类型'),
    },
    {
      fieldId: 'searchMode',
      type: 9,
      fieldName: _l('检索策略'),
      fieldValue: data.searchMode,
    },
  ];
  const topK = {
    fieldId: 'topK',
    type: 6,
    fieldName: _l('最大召回数 (Top K)'),
    fieldValue: data.topK,
  };
  const rrfK = {
    fieldId: 'rrfK',
    type: 6,
    fieldName: _l('融合排序参数'),
    desc: _l('用于融合“向量+全文”的排序。数值越大排序波动越小，越小越强调最靠前结果；建议默认 60。'),
    fieldValue: data.rrfK,
  };
  const minRelevance = {
    fieldId: 'minRelevance',
    type: 6,
    fieldName: _l('相关度阈值'),
    desc: _l('低于该值的结果将被过滤；调高更严格（结果更少更准），调低更宽松（结果更多）。'),
    fieldValue: data.minRelevance,
  };

  return {
    auto: fields,
    vector: [...fields, topK],
    keyword: [...fields, topK, minRelevance],
    hybrid: [...fields, topK],
  }[data.searchMode];
};

export default props => {
  const { data, showAuto, updateSource } = props;
  const [key, setKey] = useState(+new Date());
  const fields = generateFields(data);

  // 渲染知识库
  const renderVectorKnowledge = () => {
    const otherAppVector = [{ text: _l('其他应用下的知识库'), value: 'other', className: 'textSecondary' }];
    const isError = data.knowledgeIds.length !== data.appList.filter(o => _.includes(data.knowledgeIds, o.id)).length;
    const vectorList = data.appList
      .filter(item => !item.otherApkId)
      .map(({ name, id }) => ({ text: name, value: id, disabled: _.includes(data.knowledgeIds, id) }));

    return (
      <Dropdown
        className={cx('flowDropdown mTop10 flowDropdownMoreSelect', { 'errorBorder errorBG': isError })}
        data={[vectorList, otherAppVector]}
        value={data.knowledgeIds || undefined}
        renderTitle={() =>
          !!data.knowledgeIds.length && (
            <ul className="tagWrap">
              {data.knowledgeIds.map(id => {
                const item = _.find(data.appList, item => item.id === id);

                return (
                  <li key={id} className={cx('tagItem flexRow', { error: !item })}>
                    <span className="tag">
                      {!item && _l('知识库已删除')}
                      {item && item.name}
                      {item && item.otherApkName && <span className="textSecondary">{`(${item.otherApkName})`}</span>}
                    </span>
                    <span
                      className="delTag"
                      onClick={e => {
                        const ids = [].concat(data.knowledgeIds);

                        e.stopPropagation();
                        _.remove(ids, item => item === id);
                        updateSource({ knowledgeIds: ids });
                      }}
                    >
                      <Icon icon="close" className="pointer" />
                    </span>
                  </li>
                );
              })}
            </ul>
          )
        }
        border
        openSearch
        onChange={id => {
          if (id === 'other') {
            selectKnowledge({
              companyId: props.companyId,
              appId: props.relationId,
              onOk: ({ appId, appName, knowledgeList }) => {
                const appList = _.cloneDeep(data.appList);

                if (appId !== props.relationId) {
                  knowledgeList.forEach(item => {
                    if (!_.find(appList, { id: item.id })) {
                      appList.push({ id: item.id, name: item.name, otherApkId: appId, otherApkName: appName });
                    }
                  });
                }

                updateSource({
                  appList,
                  knowledgeIds: _.uniq(data.knowledgeIds.concat(knowledgeList.map(item => item.id))),
                });
              },
            });
          } else {
            updateSource({ knowledgeIds: data.knowledgeIds.concat(id) });
          }
        }}
      />
    );
  };

  return (
    <Fragment>
      <div className="Font13 bold">{_l('选择知识库')}</div>
      {renderVectorKnowledge()}

      {!showAuto && (
        <Fragment>
          <div className="Font13 bold mTop20">{_l('检索内容')}</div>
          <div className="mTop10">
            <CustomTextarea
              projectId={props.companyId}
              processId={props.processId}
              relationId={props.relationId}
              selectNodeId={props.selectNodeId}
              type={2}
              height={0}
              content={data.query}
              formulaMap={data.formulaMap}
              onChange={(err, value) => updateSource({ query: value })}
              updateSource={updateSource}
            />
          </div>
        </Fragment>
      )}

      {fields.map((item, index) => (
        <Fragment key={index}>
          <div className="Font13 bold mTop20">
            {item.fieldName}
            {item.fieldId === 'searchMode' && (
              <Tooltip
                title={
                  <div>
                    {showAuto && (
                      <div>{_l('AI 智能选择：由系统智能判断最合适的检索方式，无需手动选择，适合大多数场景。')}</div>
                    )}
                    <div>{_l('混合检索：同时使用语义理解和关键词匹配，兼顾精准度和全面性，效果最均衡。')}</div>
                    <div>
                      {_l('语义检索：根据问题的含义去理解和匹配，即使用词不同也能找到相关内容，适合自然语言提问。')}
                    </div>
                    <div>{_l('关键词检索：根据关键词进行匹配查找，适合搜索包含特定词汇、名称或编号的内容。')}</div>
                  </div>
                }
              >
                <Icon className="Font16 textTertiary mLeft5" icon="info" />
              </Tooltip>
            )}
          </div>
          {item.desc && <div className="Font12 textSecondary mTop5">{item.desc}</div>}

          <SingleControlValue
            key={key}
            selectNodeType={props.selectNodeType}
            controls={generateControls(showAuto)}
            formulaMap={data.formulaMap}
            fields={fields}
            hideOtherField
            updateSource={obj => {
              const types = _.find(obj.fields, { fieldId: 'types' })?.fieldValue;
              const searchMode = _.find(obj.fields, { fieldId: 'searchMode' })?.fieldValue;
              const topK = _.find(obj.fields, { fieldId: 'topK' })?.fieldValue;
              const rrfK = _.find(obj.fields, { fieldId: 'rrfK' })?.fieldValue;
              const minRelevance = _.find(obj.fields, { fieldId: 'minRelevance' })?.fieldValue;

              updateSource(
                {
                  types: types ? types.split(',') : [],
                  searchMode,
                  topK: _.clamp(_.toNumber(topK) || 10, 1, 20),
                  rrfK: _.clamp(_.toNumber(rrfK) || 60, 1, 100),
                  minRelevance: _.clamp(_.toNumber(minRelevance) || 0.5, 0.1, 1),
                },
                () => {
                  if (types === _.find(fields, { fieldId: 'types' })?.fieldValue) {
                    setKey(+new Date());
                  }
                },
              );
            }}
            item={item}
            i={index}
          />
        </Fragment>
      ))}
    </Fragment>
  );
};
