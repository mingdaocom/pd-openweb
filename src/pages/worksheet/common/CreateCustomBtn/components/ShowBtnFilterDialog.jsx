import React from 'react';
import { Modal } from 'ming-ui/antd-components';
import FilterConfig from 'src/pages/worksheet/common/WorkSheetFilter/common/FilterConfig';
import { SYS } from 'src/utils/domain/control/widget';

const segmentation = columns => {
  for (let i = 0; i < columns.length; i++) {
    if (SYS.includes(columns[i].controlId)) {
      columns[i].segmentation = true;
      break;
    }
  }

  return columns;
};

class ShowBtnFilterDialog extends React.Component {
  state = {
    filters: this.props.filters || [],
  };

  render() {
    const {
      setValue,
      isShowBtnFilterDialog,
      projectId,
      columns,
      sheetSwitchPermit,
      appId,
      description = null,
      title,
    } = this.props;
    return (
      <Modal
        title={
          <React.Fragment>
            <div>{title || _l('筛选')}</div>
            {description && <div className="Font13 Normal textSecondary mTop8">{description}</div>}
          </React.Fragment>
        }
        okText={_l('确定')}
        cancelText={_l('取消')}
        rootClassName="showBtnFilterDialog"
        mask={{ closable: true }}
        keyboard
        onCancel={() => {
          setValue({
            ...this.state,
            filters: this.props.filters || [],
            isShowBtnFilterDialog: false,
            showType: this.state.filters.length <= 0 ? 1 : this.props.showType,
            isOk: false,
          });
        }}
        onOk={() => {
          setValue({
            ...this.state,
            filters: this.state.filters,
            isShowBtnFilterDialog: false,
            showType: this.state.filters.length <= 0 ? 1 : this.props.showType,
            isOk: true,
          });
        }}
        open={isShowBtnFilterDialog}
      >
        <FilterConfig
          sheetSwitchPermit={sheetSwitchPermit}
          from="custombutton"
          canEdit
          feOnly
          supportGroup
          filterColumnClassName="showBtnFilter"
          projectId={projectId}
          appId={appId}
          offset={[0, 0]}
          filterResigned={false}
          columns={segmentation(columns)}
          conditions={this.state.filters}
          onConditionsChange={conditions => {
            this.setState({
              filters: conditions,
            });
          }}
        />
      </Modal>
    );
  }
}

export default ShowBtnFilterDialog;
