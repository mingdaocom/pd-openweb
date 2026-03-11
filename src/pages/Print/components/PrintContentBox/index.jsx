import React, { Fragment, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import { LoadDiv, ScrollView } from 'ming-ui';
import { isRelationControl } from '../../core/util';
import ContentEnhancer from './ContentEnhancer';
import { findLastVisibleByBinary, getAllRelationRows } from './utils';
import './index.less';

const PrintContentBox = props => {
  const {
    rowValues,
    shareShortUrls,
    updatePagesInfo,
    updateShowPrintAndSaveButtons,
    controls,
    flagUpdate = 0,
    updateFlagType,
    printData,
    signature,
    ...rest
  } = props;

  const scrollViewRef = useRef(null);
  const lastPageRef = useRef(0);
  const rowsValuesMapRef = useRef({});
  const allControlsMapRef = useRef({});
  const [loading, setLoading] = useState(true);
  const [controlProcessedMap, setControlProcessedMap] = useState({});
  const [signatureProcessedMap, setSignatureProcessedMap] = useState([]);

  const calculateLastVisiblePage = () => {
    const scrollView = scrollViewRef.current;
    if (!scrollView?.getScrollInfo) return;

    const { scrollTop = 0, clientHeight = 0, viewport } = scrollView.getScrollInfo() || {};
    if (!viewport) return;

    const viewBottom = scrollTop + clientHeight;
    const pageElements = viewport.querySelectorAll('.printItemPageNumber');
    if (!pageElements.length) return;
    const page = findLastVisibleByBinary(pageElements, viewBottom);

    if (page !== lastPageRef.current) {
      lastPageRef.current = page;
      updatePagesInfo?.(`${page}/${rowValues.length}`);
    }
  };

  const handleScroll = _.throttle(() => {
    requestAnimationFrame(calculateLastVisiblePage);
  }, 300);

  useEffect(() => {
    // 初始化 rowId → (controlId → value) 的缓存 Map
    rowValues.forEach(row => {
      if (!rowsValuesMapRef.current[row.rowId]) {
        rowsValuesMapRef.current[row.rowId] = new Map();
      }

      row.controlValues.forEach(item => {
        rowsValuesMapRef.current[row.rowId].set(item.id, item.value);
      });
    });

    // 生成基础打印数据
    const nextControlMap = {};
    const nextSignatureMap = {};
    const allControls = printData?.allControls || [];

    rowValues.forEach(({ rowId }) => {
      const rowValueMap = rowsValuesMapRef.current[rowId];

      const fillValue = control => ({
        ...control,
        value: rowValueMap?.get(control.controlId) ?? '',
      });

      nextControlMap[rowId] = controls.map(fillValue);
      allControlsMapRef.current[rowId] = allControls.map(fillValue);
      nextSignatureMap[rowId] = signature.map(fillValue);
    });

    const relationControls = controls.filter(({ type, checked }) => isRelationControl(type) && checked);

    setSignatureProcessedMap(nextSignatureMap);
    // 没有关联记录
    if (!relationControls.length) {
      setControlProcessedMap(nextControlMap);
      setLoading(false);
      updateShowPrintAndSaveButtons(true);
      return;
    }

    // 统一获取并合并关联记录
    getAllRelationRows({ params: props.params, relationControls, controlProcessedMap: nextControlMap })
      .then(res => {
        // 遍历所有记录
        Object.entries(res).forEach(([rowId, rowData]) => {
          nextControlMap[rowId] = nextControlMap[rowId]?.map(control => {
            const data = rowData?.[control.controlId];
            if (!data) return control;

            const value = data.data?.length ? JSON.stringify(data.data) : '';

            // 同步缓存
            rowsValuesMapRef.current[rowId]?.set(control.controlId, value);

            return {
              ...control,
              value,
              relationsData: data,
            };
          });
        });
        setControlProcessedMap(nextControlMap);
      })
      .finally(() => {
        setLoading(false);
        updateShowPrintAndSaveButtons(true);
      });
  }, []);

  useEffect(() => {
    // 只有收到控件的 checked 状态变化时，才需要同步
    if (flagUpdate <= 0 || updateFlagType !== 'receiveControls') return;

    const signatureControlCheckedMap = {};
    signature.forEach(control => {
      signatureControlCheckedMap[control.controlId] = control.checked;
    });

    setSignatureProcessedMap(prev => {
      const next = {};
      for (const rowId in prev) {
        next[rowId] = prev[rowId].map(control => {
          return { ...control, checked: signatureControlCheckedMap[control.controlId] };
        });
      }
      return next;
    });

    const checkedMap = {};
    controls.forEach(control => {
      checkedMap[control.controlId] = {
        checked: control.checked,
        relationControlsCheckedMap: Object.fromEntries(
          (control.relationControls || []).map(rc => [rc.controlId, rc.checked]),
        ),
      };
    });
    setControlProcessedMap(prev => {
      const next = {};

      for (const rowId in prev) {
        next[rowId] = prev[rowId].map(control => {
          const checkedInfo = checkedMap[control.controlId];
          if (!checkedInfo) return control;

          if (!isRelationControl(control.type)) {
            return { ...control, checked: checkedInfo.checked };
          }

          return {
            ...control,
            checked: checkedInfo.checked,
            relationControls: control.relationControls.map(rc => ({
              ...rc,
              checked: checkedInfo.relationControlsCheckedMap?.[rc.controlId],
            })),
          };
        });
      }

      return next;
    });
  }, [flagUpdate]);

  if (loading) {
    return <LoadDiv className="mTop50" size="big" />;
  }

  return (
    <div className="flex">
      <ScrollView ref={scrollViewRef} onScroll={rowValues.length ? handleScroll : undefined}>
        <div className="printItemsBox" id="printItemsBox">
          {rowValues.map((rowValue, index) => (
            <Fragment key={`enhancer-${rowValue.rowId}`}>
              <ContentEnhancer
                rowValue={rowValue}
                rowIndex={index}
                shareUrl={shareShortUrls[rowValue.rowId]}
                printData={{
                  ...printData,
                  allControls: allControlsMapRef.current[rowValue.rowId],
                }}
                receiveControls={controlProcessedMap[rowValue.rowId]}
                controls={controls}
                flagUpdate={flagUpdate}
                updateFlagType={updateFlagType}
                signature={signatureProcessedMap[rowValue.rowId]}
                {...rest}
              />
              {index < rowValues.length - 1 && <div className="printItemSeparator" />}
            </Fragment>
          ))}
        </div>
      </ScrollView>
    </div>
  );
};

export default PrintContentBox;
