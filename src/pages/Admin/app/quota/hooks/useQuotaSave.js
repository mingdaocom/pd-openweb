import { useRef } from 'react';
import _ from 'lodash';
import dataLimitAjax from 'src/api/dataLimit';
import workflowDataLimitAjax from 'src/pages/workflow/api/DataLimit';
import { getLimitParams, getSaveSuccessPatch } from '../utils';

/**
 * 管理额度保存流程：校验组织上限、计算增删改参数、提交接口并刷新保存快照。
 */
export default function useQuotaSave({ projectId, businessType, updateData, state, setState, loadLimits }) {
  const savePromise = useRef(null);

  /** 保存全局额度及额外配置；重复点击时终止上一条未完成请求。 */
  const onSave = () => {
    const { limits, size, initialLimits, initialSize, loading, total, limitRowTotal } = state;
    const limitSize =
      businessType === 1
        ? md.global.SysSettings.fileUploadLimitSize || 4 * 1024
        : businessType === 2
          ? window.platformENV.isLocal || window.platformENV.isOverseas
            ? limitRowTotal * 10
            : 1000
          : 0;

    if (loading || (_.isEqual(initialLimits, limits) && _.isEqual(size, initialSize))) return;
    if (limitSize && (size > limitSize || limits.some(item => item.size > limitSize))) {
      setState({ clickSubmit: true });
      return alert(_l('保存失败，超出上限'), 2);
    }

    setState({ clickSubmit: false, saveLoading: true });
    const limitParams = getLimitParams({ initialLimits, limits });
    const params = { projectId, size, ...limitParams };
    if (_.includes([1, 2, 3], businessType)) params.businessType = businessType;

    if (savePromise.current) savePromise.current.abort();
    savePromise.current =
      businessType === 4 ? workflowDataLimitAjax.EditUageLimit(params) : dataLimitAjax.editUageLimit(params);

    savePromise.current
      .then(res => {
        if (res) {
          alert(_l('保存成功'));
          setState(getSaveSuccessPatch({ limits, size, total: total + limitParams.adds.length }));
          if (!_.isEmpty(limitParams.adds) || !_.isEmpty(limitParams.dels)) loadLimits({ pageIndex: 1 });

          updateData();
        } else {
          alert(_l('保存失败'), 2);
        }

        setState({ saveLoading: false });
      })
      .catch(() => setState({ saveLoading: false }));
  };

  return onSave;
}
