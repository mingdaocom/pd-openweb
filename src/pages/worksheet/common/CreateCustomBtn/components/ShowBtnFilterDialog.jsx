import React from 'react';
import { Dialog } from 'ming-ui';
import FilterConfig from 'src/pages/worksheet/common/WorkSheetFilter/common/FilterConfig';
import { SYS } from 'src/pages/widgetConfig/config/widget.js';

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
    const { setValue, isShowBtnFilterDialog, projectId, columns, sheetSwitchPermit, appId } = this.props;
    return (
      <Dialog
        title={_l('筛选')}
        okText={_l('确定')}
        cancelText={_l('取消')}
        className="showBtnFilterDialog"
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
        visible={isShowBtnFilterDialog}
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
      </Dialog>
    );
  }
}

export default ShowBtnFilterDialog;
