import { generate } from '@ant-design/colors';

export const defaultTitleStyles = {
  color: '#333',
  fontSize: 15,
  fontBold: true,
  fontItalic: false,
  textAlign: 'left',
  index: 0,
};

export const replaceTitleColor = (data, themeColor) => {
  data = { ...data };
  if (data.color === 'DARK_COLOR' && themeColor) {
    data.color = themeColor;
  }
  if (data.color === 'LIGHT_COLOR' && themeColor) {
    data.color = generate(themeColor)[0];
  }
  return data;
};

export const replaceTitleStyle = (data, themeColor) => {
  const { color } = replaceTitleColor(data, themeColor);
  const style = {
    fontSize: data.fontSize,
    fontWeight: data.fontBold ? 'bold' : undefined,
    fontStyle: data.fontItalic ? 'italic' : undefined,
    color,
  };
  return style;
};
