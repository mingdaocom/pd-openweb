import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import { TagTextarea } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import config from '../../../config';
import ColumnListDropdown from '../../common/ColumnListDropdown';
import { getControlTextValue, getAvailableColumn, getConcatedValue, createWorksheetColumnTag } from '../../../utils/util';
import _ from 'lodash';

export default class Concatenate extends React.Component {
  static propTypes = {
    widget: PropTypes.shape({}),
    editWidgets: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.shape({}))),
    onChange: PropTypes.func,
  }
  constructor(props) {
    super(props);
    this.state = {
      textTpl: props.widget.data.dataSource || '',
      worksheetData: {},
      selectColumnVisible: false,
    };
  }

  componentDidMount() {
    sheetAjax.getFilterRows({
      worksheetId: config.global.sourceId,
      searchType: 1,
      pageSize: 1,
      pageIndex: 1,
      status: 1,
    }).then((res) => {
      if (res.data && res.data[0]) {
        this.setState({
          worksheetData: res.data[0],
        }, () => {
          if (_.isFunction(this.tagtextarea.updateTextareaView)) {
            this.tagtextarea.updateTextareaView();
          }
        });
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const { widget } = nextProps;
    if (widget.id !== this.props.widget.id) {
      this.setState({
        textTpl: widget.data.dataSource || '',
        selectColumnVisible: false,
      });
      this.tagtextarea.setValue(widget.data.dataSource || '');
    }
  }

  @autobind
  hideSelectColumn() {
    this.setState({ selectColumnVisible: false });
  }

  @autobind
  getEditWidgetsWithOriginInfo() {
    const { editWidgets } = this.props;
    return editWidgets.concat([
      {
        id: 'ownerid',
        data: {
          type: 'ownerid',
          controlId: 'ownerid',
          controlName: _l('拥有者'),
        },
      },
      {
        id: 'caid',
        data: {
          type: 'caid',
          controlId: 'caid',
          controlName: _l('创建者'),
        },
      },
      {
        id: 'ctime',
        data: {
          type: 'ctime',
          controlId: 'ctime',
          controlName: _l('创建时间'),
        },
      },
      {
        id: 'utime',
        data: {
          type: 'utime',
          controlId: 'utime',
          controlName: _l('最近修改时间'),
        },
      },
    ]);
  }

  render() {
    let { widget, onChange } = this.props;
    const { worksheetData, selectColumnVisible, textTpl } = this.state;
    const editWidgets = this.getEditWidgetsWithOriginInfo();
    return (
      <div className="selectColumnToConcat">
        <TagTextarea
          defaultValue={widget.data.dataSource}
          maxHeight={140}
          getRef={(tagtextarea) => { this.tagtextarea = tagtextarea; }}
          renderTag={(id, options) => createWorksheetColumnTag(id, _.assign({}, options, {
            isConcatenate: true,
            editWidgets,
            worksheetData,
          }))}
          onChange={(err, value) => {
            if (!err) {
              this.setState({ textTpl: value });
              onChange(value);
            }
          }}
          onFocus={() => {
            this.setState({ selectColumnVisible: true });
          }}
        />
        <ColumnListDropdown
          visible={selectColumnVisible}
          showSearch
          onClickAway={this.hideSelectColumn}
          list={getAvailableColumn(editWidgets, widget).map(widget => ({
            value: widget.id,
            filterValue: widget.data.controlName,
            element: _.isEmpty(worksheetData) ? <span>{ widget.data.controlName }</span> : <div>
              <span className="controlName">{ widget.data.controlName }</span>
              <span className="controlTextValue">{ getControlTextValue(widget.id, editWidgets, worksheetData) }</span>
            </div>,
            onClick: (id, i) => {
              this.tagtextarea.insertColumnTag(id);
            },
          }))}
        />
        { !_.isEmpty(worksheetData) && <pre className="previewConcatValue">
          { getConcatedValue(textTpl, editWidgets, worksheetData) }
        </pre> }
      </div>
    );
  }
}
