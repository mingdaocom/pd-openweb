import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Dialog, Icon, Support } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget.js';
import { VIEW_DISPLAY_TYPE, VIEW_TYPE_ICON } from 'src/pages/worksheet/constants/enum';
import './index.less';

const CONFIG = {
  control: {
    title: _l('设置字段别名'),
    desc: _l('字段别名仅允许使用字母（不区分大小写）、数字和下划线组合，且必须以字母开头，不可重复。'),
    helpLink: 'https://help.mingdao.com/worksheet/field-property/#syestem-field-alias',
  },
  view: {
    title: _l('设置视图别名'),
    desc: _l('视图别名仅允许使用字母（不区分大小写）、数字和下划线组合，且必须以字母开头，不可重复。'),
    helpLink: 'https://help.mingdao.com/worksheet/field-property/#syestem-field-alias',
  },
};

export default class AliasDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      focusId: '',
      aliasData: [],
      isChange: false,
      originalData: [],
      loading: false,
      isUpdate: false,
    };
  }

  componentWillMount() {
    const { data = [], worksheetId, appId, controlTypeList = [], type = 'control' } = this.props;

    if (type === 'control') {
      if (data.length <= 0) {
        //控件列表
        sheetAjax.getWorksheetInfo({ worksheetId: worksheetId, getTemplate: true, getViews: true }).then(res => {
          const { template = [] } = res;
          const { controls = [] } = template;
          let controlsList = controls.filter(item => !_.includes(ALL_SYS, item.controlId));
          this.setState({ aliasData: controlsList, originalData: controlsList });
        });
      } else {
        let controlsList = data.filter(item => !_.includes(ALL_SYS, item.controlId));
        this.setState({ aliasData: controlsList, originalData: controlsList });
      }

      if (controlTypeList.length <= 0) {
        //获取类型
        sheetAjax.getWorksheetApiInfo({ worksheetId, appId }).then(res => {
          this.setState({ controlTypeList: res[0].data });
        });
      } else {
        this.setState({ controlTypeList });
      }
    } else {
      this.setState({ aliasData: data, originalData: data, controlTypeList: controlTypeList });
    }
  }

  onBatchGenerate = () => {
    const { worksheetId, appId, type = 'control' } = this.props;
    const isEditControl = type === 'control';

    if (this.state.loading) return;

    Dialog.confirm({
      title: _l('确定批量生成别名？'),
      description: isEditControl
        ? _l('根据字段名的拼音自动生成别名，若字段名为英文则直接取字段名作为别名，此操作不会影响已设置的别名。')
        : _l('根据视图名的拼音自动生成别名，若视图名为英文则直接取视图名作为别名，此操作不会影响已设置的别名。'),
      onOk: () => {
        this.setState({ loading: true });
        sheetAjax[isEditControl ? 'editGenerateControlsDefaultAlias' : 'editGenerateViewDefaultAlias'](
          isEditControl ? { worksheetId, appId } : { worksheetId },
        ).then(res => {
          this.setState({ aliasData: res.data.controls || res.data, loading: false, isUpdate: true });
        });
      },
    });
  };

  onChangeAlias = (value, item) => {
    const { type = 'control' } = this.props;
    const { aliasData } = this.state;
    const isEditControl = type === 'control';

    const newAliasData = aliasData.map(o =>
      (isEditControl ? item.controlId === o.controlId : item.viewId === o.viewId) ? { ...o, alias: value } : o,
    );
    const isError =
      value && (newAliasData.filter(o => value === o.alias).length > 1 || !/^[a-zA-Z]{1}\w*$/.test(value));

    this.setState({ isChange: true, aliasData: newAliasData, isError });
  };

  onSaveAlias = item => {
    const { worksheetId, appId, type = 'control' } = this.props;
    const { isChange, originalData, aliasData, isError } = this.state;
    const isEditControl = type === 'control';

    this.setState({ focusId: '' });

    if (!isChange) return;

    if (item.alias && (aliasData.filter(o => item.alias === o.alias).length > 1 || ALL_SYS.includes(item.alias))) {
      this.setState({ isChange: false, aliasData: originalData, isError: false });
      alert(ALL_SYS.includes(item.alias) ? _l('该别名与系统字段的别名相同，请重新输入') : _l('该别名已存在'), 2);
      return;
    }

    if ((item.alias && !/^[a-zA-Z]{1}\w*$/.test(item.alias)) || isError) {
      this.setState({ isChange: false, aliasData: originalData, isError: false });
      return;
    }

    this.setState({ isChange: false });
    const params = isEditControl
      ? { worksheetId, appId, controls: [_.pick(item, ['controlId', 'alias'])] }
      : { worksheetId, views: [_.pick(item, ['viewId', 'alias'])] };

    sheetAjax[isEditControl ? 'editControlsAlias' : 'editViewAlias'](params)
      .then(res => {
        if (res.code === 15) {
          this.setState({ aliasData: originalData });
          alert(_l('该别名与系统字段的别名相同，请重新输入'), 2);
        } else {
          this.setState({ originalData: aliasData, isUpdate: true });
        }
      })
      .catch(() => alert(_l('修改失败'), 2));
  };

  render() {
    const { onClose, type = 'control' } = this.props;
    const { focusId, aliasData = [], controlTypeList = [], isError, isUpdate } = this.state;
    const isEditControl = type === 'control';

    return (
      <Dialog
        visible={true}
        className="aliasDialog"
        width={720}
        onCancel={() => onClose(isUpdate, aliasData)}
        footer={null}
        title={CONFIG[type].title}
      >
        <p className="text">
          {CONFIG[type].desc}
          <Support type={3} href={CONFIG[type].helpLink} text={_l('了解更多')} />
        </p>
        <div className="tableAlias">
          <div className="topDiv">
            <span>{isEditControl ? _l('字段名称') : _l('视图名称')}</span>
            <span>{_l('类型')}</span>
            <span>
              {isEditControl ? _l('字段别名') : _l('视图别名')}
              <i className="batchAlias mLeft10 InlineBlock Hand" onClick={this.onBatchGenerate}>
                {_l('批量生成')}
              </i>
            </span>
          </div>
          {aliasData.map((item, i) => {
            const type = _.get(controlTypeList, `${i}.type`) || '';
            const displayType = isEditControl
              ? type
              : _.find(VIEW_TYPE_ICON, { id: VIEW_DISPLAY_TYPE[controlTypeList[i].type] }).text;

            return (
              <div className="listDiv">
                <span className="breakAll">{isEditControl ? item.controlName : item.name}</span>
                <span>{displayType}</span>
                <span
                  className={cx('aliasBox', {
                    onFocusSpan: focusId === (isEditControl ? item.controlId : item.viewId),
                    isError,
                  })}
                >
                  {focusId !== (isEditControl ? item.controlId : item.viewId) ? (
                    <span
                      className="aliasTxt"
                      onClick={() => {
                        this.setState({ focusId: isEditControl ? item.controlId : item.viewId }, () =>
                          $(this.input).focus(),
                        );
                      }}
                    >
                      <span className={cx('txt', { noData: !item.alias })}>{item.alias || _l('请输入别名')}</span>
                      <Icon icon="edit_17" />
                    </span>
                  ) : (
                    <input
                      ref={el => (this.input = el)}
                      type="text"
                      value={item.alias}
                      onChange={e => this.onChangeAlias(e.target.value, item)}
                      onBlur={() => this.onSaveAlias(item)}
                    />
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </Dialog>
    );
  }
}
