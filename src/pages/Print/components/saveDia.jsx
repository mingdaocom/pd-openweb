import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Dialog, Icon } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import RangeDrop from 'src/pages/FormSet/components/RangeDrop';
import { typeForCon } from '../config';
import './saveDia.less';

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
    const { printData, type, viewId } = this.props;
    sheetAjax
      .getWorksheetInfo({
        getTemplate: true,
        getViews: true,
        worksheetId: this.props.worksheetId,
      })
      .then(res => {
        this.setState({
          views: res.views,
          printData: {
            ...this.state.printData,
            views:
              printData.views.length <= 0 && type === typeForCon.NEW
                ? res.views.filter(it => it.viewId === viewId)
                : res.views.filter(it => this.state.printData.views.includes(it.viewId)),
            range: printData.views.length <= 0 && type === typeForCon.NEW ? 3 : printData.range,
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
      <Dialog
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
        visible={this.props.showSaveDia}
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
          <div className="viewBox">
            {printData.range === 1 && (
              <span
                onClick={() => {
                  this.setState({
                    showList: !showList,
                  });
                }}
              >
                {_l('所有记录')}
              </span>
            )}
            {printData.range !== 1 && printData.views.length <= 0 && (
              <span
                className="Gray_bd"
                onClick={() => {
                  this.setState({
                    showList: !showList,
                  });
                }}
              >
                {_l('请选择视图')}
              </span>
            )}
            {printData.range === 3 && (
              <div
                onClick={() => {
                  this.setState({
                    showList: !showList,
                  });
                }}
                className="itemList"
              >
                {printData.views.map(it => {
                  return (
                    <div class="item">
                      {it.name}
                      <a
                        href="javascript:void(0)"
                        class="remove"
                        tabIndex="-1"
                        title="删除"
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
            {showList && (
              <RangeDrop
                printData={printData}
                views={views}
                onClickAwayExceptions={[]}
                onClickAway={() => this.setState({ showList: false })}
                onClose={() => this.setState({ showList: false })}
                setData={data => {
                  this.setState({
                    ...this.state,
                    ...data,
                  });
                }}
              />
            )}
            <Icon
              icon={'expand_more'}
              className="mRight15 Font16 moreList"
              onClick={() => {
                this.setState({
                  showList: !showList,
                });
              }}
            />
          </div>
        </div>
      </Dialog>
    );
  }
}
