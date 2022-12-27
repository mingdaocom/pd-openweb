import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import CityPickerPanel from 'ming-ui/components/CityPicker/Panel';
import { WORKSHEETTABLE_FROM_MODULE } from 'worksheet/constants/enum';
import EditableCellCon from '../EditableCellCon';
import renderText from './renderText';
import withClickAway from 'ming-ui/decorators/withClickAway';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';

const ClickAwayable = createDecoratedComponent(withClickAway);

const abroad = '910000';
const particularlyCity = ['110000', '120000', '310000', '500000', '810000', '820000'];

export default class Date extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.shape({}),
    editable: PropTypes.bool,
    isediting: PropTypes.bool,
    updateCell: PropTypes.func,
    popupContainer: PropTypes.any,
    cell: PropTypes.shape({ value: PropTypes.string }),
    value: PropTypes.string,
    needLineLimit: PropTypes.bool,
    updateEditingStatus: PropTypes.func,
    onClick: PropTypes.func,
  };
  constructor(props) {
    super(props);
    const value = _.isObject(props.cell.value) ? props.cell.value.text : props.cell.value;
    this.state = {
      value,
      tempValue: value,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.cell.value !== this.props.cell.value) {
      const value = _.isObject(nextProps.cell.value) ? nextProps.cell.value.text : nextProps.cell.value;
      this.setState({ value, ...(value === '{"code":"","name":""}' ? { tempValue: undefined } : {}) });
    }
  }

  editIcon = React.createRef();

  @autobind
  handleTableKeyDown(e) {
    const { updateEditingStatus } = this.props;
    switch (e.key) {
      case 'Escape':
        updateEditingStatus(false);
        break;
      default:
        break;
    }
  }

  @autobind
  handleChange(array) {
    const { tableFromModule, cell, updateCell, updateEditingStatus } = this.props;
    let level = this.getAreaLevel(cell.type);
    if (_.includes(particularlyCity, array[0].id) && level > 1) {
      level = level - 1;
    }
    if (array[0].id === abroad) {
      level = 1;
    }
    const name = array.map(a => a.name).join('/');
    const code = _.last(array).id;
    const newValue = JSON.stringify({ code, name });
    if (!array.length || array.length < level) {
      this.setState({ tempValue: newValue });
      return;
    }
    updateCell({
      value: tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST ? newValue : code,
    });
    this.setState({
      value: newValue,
      tempValue: newValue,
    });
    updateEditingStatus(false);
  }

  @autobind
  handleExit() {
    const { tableFromModule, updateCell, updateEditingStatus } = this.props;
    const { value, tempValue } = this.state;
    if (value !== tempValue) {
      updateCell({
        value: tableFromModule === WORKSHEETTABLE_FROM_MODULE.SUBLIST ? tempValue : safeParse(tempValue).code,
      });
      this.setState({
        value: tempValue,
      });
    }
    updateEditingStatus(false);
  }

  getAreaLevel(type) {
    if (type === 19) {
      return 1; // 省
    }
    if (type === 23) {
      return 2; // 省-市
    }
    if (type === 24) {
      return 3; // 省-市-县
    }
    return 3;
  }

  render() {
    const { className, style, needLineLimit, cell, popupContainer, editable, isediting, updateEditingStatus, onClick } =
      this.props;
    const { value, tempValue } = this.state;
    const isMobile = browserIsMobile();
    const level = this.getAreaLevel(cell.type);
    const editcontent = isediting ? (
      <ClickAwayable onClickAwayExceptions={[this.editIcon && this.editIcon.current]} onClickAway={this.handleExit}>
        <CityPickerPanel
          defaultValue={[]}
          level={level}
          callback={this.handleChange}
          handleOpen={() => {}}
          handleClose={() => updateEditingStatus(false)}
          onHide={() => updateEditingStatus(false)}
        />
      </ClickAwayable>
    ) : (
      <span />
    );
    return (
      <Trigger
        action={['click']}
        popup={editcontent}
        getPopupContainer={() => document.body}
        popupClassName="filterTrigger cellControlAreaPopup cellNeedFocus"
        popupVisible={isediting}
        destroyPopupOnHide={!(navigator.userAgent.match(/[Ss]afari/) && !navigator.userAgent.match(/[Cc]hrome/))} // 不是 Safari
        popupAlign={{
          points: ['bl', 'tl'],
          offset: [-1, -2],
          overflow: {
            adjustY: true,
          },
        }}
      >
        <EditableCellCon
          onClick={onClick}
          className={cx(className, { canedit: editable })}
          style={style}
          iconRef={this.editIcon}
          iconName="text_map"
          iconClassName="dateEditIcon"
          isediting={isediting}
          onIconClick={() => updateEditingStatus(true)}
        >
          {!!tempValue && (
            <div className={cx('worksheetCellPureString', { linelimit: needLineLimit, ellipsis: isMobile })}>
              {renderText({ ...cell, value: tempValue })}
            </div>
          )}
        </EditableCellCon>
      </Trigger>
    );
  }
}
