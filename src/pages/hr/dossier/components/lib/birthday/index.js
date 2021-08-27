const SignList = [
  {
    start: 121,
    end: 220,
    name: _l('水瓶座'),
  },
  {
    start: 220,
    end: 321,
    name: _l('双鱼座'),
  },
  {
    start: 321,
    end: 420,
    name: _l('白羊座'),
  },
  {
    start: 420,
    end: 521,
    name: _l('金牛座'),
  },
  {
    start: 521,
    end: 622,
    name: _l('双子座'),
  },
  {
    start: 622,
    end: 723,
    name: _l('巨蟹座'),
  },
  {
    start: 723,
    end: 823,
    name: _l('狮子座'),
  },
  {
    start: 823,
    end: 923,
    name: _l('处女座'),
  },
  {
    start: 923,
    end: 1024,
    name: _l('天秤座'),
  },
  {
    start: 1024,
    end: 1122,
    name: _l('天蝎座'),
  },
  {
    start: 1122,
    end: 1221,
    name: _l('射手座'),
  },
];

// 1221 ~ 0120
const DefaultSign = _l('摩羯座');

const toString = (value) => {
  return value < 10 ? '0' + value : '' + value;
};

const Birthday = {
  /**
   * 计算年龄
   */
  getAge: (value) => {
    if (!value) {
      return 0;
    }

    const today = new Date();
    const birthDay = new Date(value);
    // 年龄
    const years = today.getFullYear() - birthDay.getFullYear();
    if (years <= 0) {
      return 0;
    } else {
      const birthDayOfThisYear = new Date(value);
      birthDayOfThisYear.setFullYear(today.getFullYear());

      if (
        today.getMonth() < birthDayOfThisYear.getMonth() ||
        (today.getMonth() === birthDayOfThisYear.getMonth() && today.getDate() < birthDayOfThisYear.getDate())
      ) {
        return years - 1;
      }
    }

    return years;
  },
  /**
   * 计算星座
   */
  getSign: (value) => {
    if (!value) {
      return '';
    }

    const birthDay = new Date(value);
    const monthDate = parseInt(toString(birthDay.getMonth() + 1) + toString(birthDay.getDate()), 10);

    let matchItem = null;
    SignList.map((item, i, list) => {
      if (monthDate >= item.start && monthDate < item.end) {
        matchItem = item;
      }

      return null;
    });

    return matchItem ? matchItem.name : DefaultSign;
  },
};

export default Birthday;
