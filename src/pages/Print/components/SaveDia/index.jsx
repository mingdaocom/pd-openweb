import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Modal, Popover } from 'ming-ui/antd-components';
import sheetAjax from 'src/api/worksheet';
import RangeDrop from 'src/pages/FormSet/components/RangeDrop';
import { getShowViews } from 'src/utils/services/worksheet/view';
import { typeForCon } from '../../core/config';
import './index.less';

const RANGE_POPOVER_AUTO_ADJUST_OVERFLOW = { adjustX: true, adjustY: true, shiftY: true };

export default class SaveDia extends React.Component {
  constructor(props) {
    super(props);
    const { printData } = props;
    this.state = {
      printData: printData,
      showList: false,
      views: [],
    };
  }
  componentDidMount() {
    const { printData, type, viewId, worksheetId } = this.props;
    sheetAjax
      .getWorksheetInfo({
        getTemplate: true,
        getViews: true,
        worksheetId,
      })
      .then(res => {
        const viewIds = printData.views.filter(l => l !== worksheetId);
        this.setState({
          views: getShowViews(res.views),
          printData: {
            ...this.state.printData,
            views:
              viewIds.length <= 0 && type === typeForCon.NEW
                ? res.views.filter(it => it.viewId === viewId && viewId !== worksheetId)
                : res.views.filter(it => this.state.printData.views.includes(it.viewId)),
            range: viewIds.length <= 0 && type === typeForCon.NEW ? 3 : printData.range,
          },
        });
      });
    if (this.name) {
      this.name.focus();
    }
  }

  render() {
    const { printData, showList, views } = this.state;
    return (
      <Modal
        title={_l('保存模板')}
        okText={_l('确定')}
        cancelText={_l('取消')}
        className={cx('saveDiaCon', this.props.className)}
        width="480px"
        onCancel={this.props.onCancel}
        onOk={() => {
          if (!_.trim(printData.name)) {
            alert(_l('请输入模板名称'), 3);
            return;
          }

          this.props.setValue(this.state.printData);
          this.props.onCancel();
        }}
        open={this.props.showSaveDia}
        mask={{ closable: true }}
        keyboard
        styles={{ body: { overflow: 'initial' } }}
      >
        <div className="list">
          <span className="title">{_l('模板名称')}</span>
          <input
            type="text"
            ref={el => {
              this.name = el;
            }}
            placeholder={_l('请输入模板名称')}
            className="tepName"
            value={printData.name}
            onChange={e => {
              this.setState({
                printData: {
                  ...printData,
                  name: e.target.value,
                },
              });
            }}
          />
        </div>
        <div className="list mTop16">
          <span className="title">{_l('使用范围')}</span>
          <Popover
            open={showList}
            onOpenChange={visible => this.setState({ showList: visible })}
            trigger="click"
            placement="bottomLeft"
            autoAdjustOverflow={RANGE_POPOVER_AUTO_ADJUST_OVERFLOW}
            noPadding
            content={
              <RangeDrop
                printData={printData}
                views={views}
                onClose={() => this.setState({ showList: false })}
                setData={data => {
                  this.setState({
                    ...this.state,
                    ...data,
                  });
                }}
              />
            }
          >
            <div className="viewBox">
              {printData.range === 1 && <span>{_l('所有记录')}</span>}
              {printData.range !== 1 && printData.views.length <= 0 && (
                <span className="textDisabled">{_l('请选择视图')}</span>
              )}
              {printData.range === 3 && (
                <div className="itemList">
                  {printData.views.map(it => {
                    return (
                      <div className="item" key={it.viewId}>
                        {it.name}
                        <a
                          href="javascript:void(0)"
                          className="remove"
                          tabIndex="-1"
                          title={_l('删除')}
                          onClick={e => {
                            this.setState({
                              printData: {
                                ...printData,
                                views: printData.views.filter(o => o.viewId !== it.viewId),
                              },
                            });
                            e.stopPropagation();
                          }}
                        >
                          ×
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
              <Icon icon="expand_more" className="mRight15 Font16 moreList" />
            </div>
          </Popover>
        </div>
      </Modal>
    );
  }
}
