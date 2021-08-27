import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import LoadDiv from 'ming-ui/components/LoadDiv';
import { classSet } from '../../utils/util';
import './dropdown.less';

class Dropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showSelectList: false,
    };
    this.id = (new Date() - 0).toString();
  }

  dropdownId = Math.random();

  static propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.node, // 下拉选项的value
        name: PropTypes.string, // 下拉选项的name
        icon: PropTypes.string, // 下俩选项的icon
      })
    ).isRequired,
    value: PropTypes.node, // 默认被选中的下拉选项的value如不传则为提示语
    classname: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    width: PropTypes.string,
    hint: PropTypes.string,
    noneContent: PropTypes.string,
    loading: PropTypes.bool,
  };

  handleChoose(value) {
    this.toggleSelectList();
    this.props.onChange(value);
  }

  toggleSelectList() {
    this.setState({
      showSelectList: !this.state.showSelectList,
    });
  }

  componentDidMount() {
    $(document).on('click.dropdown' + this.id, event => {
      let $dropdown = $(event.target).closest('.dropdown');
      if (!$dropdown.length) {
        this.setState({
          showSelectList: false,
        });
      } else if ($dropdown.data('id') !== this.dropdownId) {
        this.setState({
          showSelectList: false,
        });
      }
    });
  }

  componentWillUnmount() {
    $(document).off('click.dropdown' + this.id);
  }

  render() {
    let selects = this.props.data;
    let { selectName } = this.props;
    this.props.data.forEach(item => {
      if (item.value === this.props.value) {
        selectName = item.name;
      }
    });
    let sc = classSet(
      {
        colorGray: selectName === undefined,
      },
      'dropdownValue',
      'overflow_ellipsis',
      'InlineBlock',
      this.props.classname
    );
    if (selectName === undefined) {
      selectName = this.props.hint;
    }
    return (
      <div className="dropdown pointer" data-id={this.dropdownId} style={{ width: this.props.width || '140px', background: '#fff' }}>
        <span className={sc} onClick={this.toggleSelectList.bind(this)}>
          {selectName}
        </span>
        <i className="icon-arrow-down-border iconArrow" onClick={this.toggleSelectList.bind(this)} />
        <ul className="selectList" style={{ display: this.state.showSelectList ? 'block' : 'none' }}>
          {this.props.loading ? <LoadDiv className='mTop20 mBottom20' /> :
            selects.length > 0 ? selects.map((item, index) => {
              return (
                <li
                  className="select ThemeBGColor3"
                  key={index}
                  title={item.name}
                  data-value={item.value}
                  onClick={() => { this.handleChoose(item.value); }}
                >
                  {item.icon && <i className={cx('Icon icon Font15 mRight5 TxtMiddle', item.icon)} />}
                  <span className='TxtMiddle'>{item.name}</span>
                </li>
              );
            })
            :
            <div className='select Gray_9e'>{this.props.noneContent || ''}</div>}
        </ul>
      </div>
    );
  }
}

export default Dropdown;
