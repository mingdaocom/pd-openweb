import React from 'react';
import ClickAway from 'ming-ui/components/ClickAway';
import ErrorBoundary from 'ming-ui/components/ErrorBoundary';
import EditContent from './EditContent';
import { Wrap } from './style';

const EditContentWithErrorBoundary = ErrorBoundary.wrap(EditContent);

// 快速筛选右侧编辑弹层外壳，内容区单独包 ErrorBoundary 避免配置项异常影响整个视图设置。
function EditFastFilter(props) {
  const { showFastFilter, saveViewSetLoading, onClose } = props;

  if (!showFastFilter) {
    return '';
  }

  return (
    <Wrap>
      <div className="boxEditFastFilterCover" onClick={onClose} />
      <div className="boxEditFastFilter flexColumn">
        <div className="topHeader">
          <span className="">{_l('筛选设置')}</span>
          <i className="icon icon-close Hand Font20" onClick={onClose} />
        </div>
        <EditContentWithErrorBoundary {...props} />
        {saveViewSetLoading && <div className="loadingMask" />}
      </div>
    </Wrap>
  );
}

export default ClickAway.wrap(EditFastFilter);
