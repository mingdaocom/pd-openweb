import React, { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import { Dialog, Icon, LoadDiv, Radio, ScrollView } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import DynamicRender from 'src/components/DynamicRender';
import DrawerFooter from '../DrawerFooter';
import './index.less';

const supportedControlTypes = [2, 3, 4, 5, 6, 7, 8, 15, 16, 17, 18, 25, 26, 27, 32, 33, 46, 48, 53];

const getAnalysisResult = (renderData, templateType) => {
  let data;

  try {
    data = JSON.parse(renderData);
  } catch (error) {
    console.error(error);
    return false;
  }

  let container;

  // 根据类型确定数据类型
  if (templateType === '2') {
    // 标签
    // 必须是数组 & 非空 & 取第一个元素
    if (!_.isArray(data) || _.isEmpty(data) || !_.isPlainObject(data[0])) {
      return false;
    }

    container = _.reduce(data, (res, item) => Object.assign(res, item), {});
  } else if (templateType === '1') {
    // 小票
    // 必须是普通对象
    if (!_.isPlainObject(data)) {
      return false;
    }

    container = data;
  }

  const result = Object.keys(container).map((item, index) => ({
    sheetName: item,
    sheetIndex: index,
    mappedFields: _.flatMap(container[item], obj =>
      _.map(obj, (value, key) => ({
        text: key,
        desc: value,
        sheetIndex: index,
        sheetName: item,
      })),
    ),
  }));

  return result;
};

const getControls = (controls, isMaster) => {
  let result = [];

  if (isMaster) {
    result = _.filter(
      controls,
      item =>
        supportedControlTypes.includes(item.type) ||
        (item.type === 30 && supportedControlTypes.includes(item.sourceControl.type)),
    );
  } else {
    const relationControls = _.filter(controls, item => [29, 34].includes(item.type));

    result = _.reduce(
      relationControls,
      (res, item) => {
        const relations = _.filter(item.relationControls, item => supportedControlTypes.includes(item.type));
        return res.concat(item).concat(relations);
      },
      [],
    );
  }

  return result.map(item => ({
    value: item.controlId,
    label: item.controlName,
    disabled: _.includes([29, 34], item.type),
  }));
};

const currentFieldValue = (data, fieldKey) => {
  const value = _.find(data, { fieldKey })?.value;

  if (fieldKey === 'renderData') {
    return value.map(({ fromKey, isDetail, toControlId, fromTableName }) => ({
      fromKey,
      isDetail,
      toControlId,
      fromTableName,
    }));
  }

  return value;
};

const CloudPrint = props => {
  const { worksheetInfo, onClose, templateData, type, getPrintData } = props;
  const { worksheetId, projectId } = worksheetInfo;
  const { controls = [] } = worksheetInfo?.template || {};
  const masterControls = getControls(controls, true); // 主表字段
  let relationControls = getControls(controls, false); // 关联表字段

  const isEdit = type === 'edit';
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [renderData, setRenderData] = useState([]);
  const templateName = _.find(renderData, { fieldKey: 'name' })?.value;
  const templateType = _.find(renderData, { fieldKey: 'cloudPrintType' })?.value;
  const [fieldsAnalysisVisible, setFieldsAnalysisVisible] = useState(false);
  const [originalData, setOriginalData] = useState();
  const [parsedFields, setParsedFields] = useState([]);
  const [masterTableIndex, setMasterTableIndex] = useState(0); // 快麦云主表序号
  const [checkMainTableVisible, setCheckMainTableVisible] = useState(false); // 选择快麦云主表弹窗是否显示

  const disabledOkBtn = useMemo(() => {
    if (isEdit) {
      return (
        _.some(
          renderData.filter(item => _.includes(['name', 'cloudPrintType', 'sn', 'templateId'], item.fieldKey)),
          item => !item.value,
        ) ||
        (currentFieldValue(templateData.cloudExtraParams, 'name') === currentFieldValue(renderData, 'name') &&
          currentFieldValue(templateData.cloudExtraParams, 'cloudPrintType') ===
            currentFieldValue(renderData, 'cloudPrintType') &&
          currentFieldValue(templateData.cloudExtraParams, 'sn') === currentFieldValue(renderData, 'sn') &&
          currentFieldValue(templateData.cloudExtraParams, 'templateId') ===
            currentFieldValue(renderData, 'templateId') &&
          _.isEqual(
            currentFieldValue(templateData.cloudExtraParams, 'renderData'),
            currentFieldValue(renderData, 'renderData'),
          ))
      );
    }

    return _.some(
      renderData.filter(item => _.includes(['name', 'cloudPrintType', 'sn', 'templateId'], item.fieldKey)),
      item => !item.value,
    );
  }, [templateData?.cloudExtraParams, renderData]);

  const initRenderData = data => {
    data.forEach(item => {
      switch (item.fieldKey) {
        case 'name':
          item.value = item.value || worksheetInfo?.name;
          break;
        case 'functionFields':
          item.onClick = () => setFieldsAnalysisVisible(true);
          break;
        case 'renderData':
          item.masterDesc = _l('主表');
          item.subDesc = _l('动态表格');
          item.value = item.value.map(v => ({
            ...v,
            toControlOptions: v.isDetail ? relationControls : masterControls,
          }));

          if (!item.systemField?.fields) {
            if (!item.systemField) item.systemField = {};
            item.systemField.fields = [];
          }

          if (!item.fromField?.fields) {
            item.fromField.fields = [];
          }

          item.systemField.fields = item.systemField.fields.map(item => ({
            ...item,
            toControlOptions:
              _.findIndex(masterControls, v => v.value === item.controlId) > -1 ? masterControls : relationControls,
          }));
          break;
        default:
          break;
      }
    });

    return data;
  };

  const handleFieldsAnalysis = () => {
    const showError = () => {
      alert('字段解析格式错误，请检查模版类型', 3);

      return [];
    };

    const result = getAnalysisResult(originalData, templateType);

    if (!result) {
      return showError();
    }

    setParsedFields(result);
    if (result.length > 1 && templateType === '1') {
      setCheckMainTableVisible(true);
    } else {
      setFieldsAnalysisVisible(false);
      setOriginalData('');
      updateRenderData(result);
    }
  };

  const handleSave = () => {
    const cloneData = _.cloneDeep(renderData);
    const mapData = _.find(cloneData, { fieldKey: 'renderData' });
    mapData.value = mapData.value.map(item => ({
      fromKey: item.fromKey,
      isDetail: item.isDetail,
      toControlId: item.toControlId,
      fromTableName: item.fromTableName,
    }));
    if (mapData.systemField?.fields) {
      mapData.systemField.fields = mapData.systemField.fields.filter(Boolean).map(item => ({
        controlId: item.controlId,
        controlName: item.controlName,
      }));
    }

    if (!mapData.value || !mapData.value.length) {
      alert(_l('请解析并绑定模板字段'), 2);
      return;
    }

    if (_.some(mapData.value, item => !item.toControlId)) {
      alert(_l('请选择映射字段'), 2);
      return;
    }

    setSaveLoading(true);
    const promise = isEdit ? worksheetAjax.updateCloudPrint : worksheetAjax.createCloudPrint;
    promise({
      worksheetId,
      projectId,
      name: _.trim(templateName),
      id: isEdit ? templateData?.id : undefined,
      extraParams: cloneData,
    })
      .then(res => {
        if (res) {
          alert(_l('保存成功'));
          getPrintData();
          onClose();
          setSaveLoading(false);
        } else {
          alert(_l('保存失败'), 2);
          setSaveLoading(false);
        }
      })
      .catch(() => {
        setSaveLoading(false);
      });
  };

  const updateRenderData = analysisData => {
    setRenderData(prevData => {
      const newData = [...prevData];
      newData.forEach(item => {
        if (item.fieldKey === 'renderData') {
          item.fromField.fields = _.reduce(analysisData, (res, v) => res.concat(v.mappedFields), []);
          item.value = item.fromField.fields.map(v => ({
            fromKey: v.text,
            isDetail: templateType === '1' ? v.sheetIndex !== masterTableIndex : false, // 标签只能绑定当前表【主表中的内容】
            toControlId: '',
            fromTableName: v.sheetName,
            toControlOptions: v.sheetIndex === masterTableIndex ? masterControls : relationControls,
          }));
        }
      });
      return newData;
    });
  };

  useEffect(() => {
    // 数据初始化
    if (!isEdit) {
      setLoading(true);
      worksheetAjax
        .loadCloudPrintDatas({
          serviceType: 0, // 0:快麦,
        })
        .then(res => {
          setRenderData(initRenderData(res));
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      const cloneData = _.cloneDeep(templateData?.cloudExtraParams);
      setRenderData(initRenderData(cloneData));
    }
  }, [templateData]);

  const renderFieldsAnalysisDialog = () => {
    if (!fieldsAnalysisVisible) return null;

    return (
      <Dialog
        title={_l('字段解析')}
        width={680}
        visible={fieldsAnalysisVisible}
        okText={_l('解析')}
        onCancel={() => {
          setOriginalData('');
          setFieldsAnalysisVisible(false);
        }}
        onOk={handleFieldsAnalysis}
      >
        <div className="fieldsAnalysisContent">
          <div className="analysisDesc">{_l('解析快麦云打印接口返回的渲染数据，自动生成需要绑定的模板字段。')}</div>
          <div className="analysisLabel">{_l('快麦API示例数据')}</div>
          <textarea className="analysisTextarea" value={originalData} onChange={e => setOriginalData(e.target.value)} />
        </div>
      </Dialog>
    );
  };

  const renderCheckMainTableDialog = () => {
    if (!checkMainTableVisible) return null;

    return (
      <Dialog
        title={_l('选择主表')}
        description={_l('请选择打印数据的主表。系统将以该表作为主要数据来源，其余表将自动按动态表格（关联类型）处理。')}
        width={800}
        visible={checkMainTableVisible}
        onCancel={() => setCheckMainTableVisible(false)}
        onOk={() => {
          setOriginalData('');
          setFieldsAnalysisVisible(false);
          const sortedData = [...parsedFields].sort((a, b) =>
            a.sheetIndex === masterTableIndex ? -1 : b.sheetIndex === masterTableIndex ? 1 : 0,
          );
          setParsedFields(sortedData);
          updateRenderData(sortedData);
          setCheckMainTableVisible(false);
        }}
      >
        <div className="checkMainTableContent">
          <div className="checkMainTableList">
            {parsedFields.map((it, index) => (
              <div key={index} className="flexRow alignItemsCenter mBottom10">
                <Radio value={index} checked={masterTableIndex === index} onClick={() => setMasterTableIndex(index)} />
                <div className="checkMainTableItem">{it.sheetName}</div>
              </div>
            ))}
          </div>
        </div>
      </Dialog>
    );
  };

  if (loading) {
    return <LoadDiv className="mTop50" />;
  }

  return (
    <div className="cloudPrintContainer">
      <div className="header">
        <span className="flex overflow_ellipsis">{_l('快麦云打印')}</span>
        <Icon icon="close" onClick={onClose} />
      </div>
      <ScrollView className="content">
        <div className="templateContent">
          <DynamicRender data={renderData} onChange={newRenderData => setRenderData(newRenderData)} />
        </div>
      </ScrollView>
      {renderData && renderData.length > 0 && (
        <div className="footer">
          <DrawerFooter saveLoading={saveLoading} onCancel={onClose} disabled={disabledOkBtn} handleSave={handleSave} />
        </div>
      )}
      {renderFieldsAnalysisDialog()}
      {renderCheckMainTableDialog()}
    </div>
  );
};

export default CloudPrint;
