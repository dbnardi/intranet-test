

export const getBaseCss = ({ 
  defaultCountryFillColor, 
  countryStrokeColor, 
  legendHeaderBackgroundColor, 
  legendContentBackgroundColor, 
  legendFontColorHeader, 
  legendFontColorContent, 
  legendBorderRadius, 
  legendBorderColor, 
  legendBoxShadow }) => (

  `.vue-world-map .land{
    fill:${defaultCountryFillColor};
    stroke:${countryStrokeColor};
  }
  .vue-map-legend-header{
    background:${legendHeaderBackgroundColor}
  }
  .vue-map-legend .vue-map-legend-content{
    background:${legendContentBackgroundColor}
  }
  .vue-map-legend-content span{
    color:${legendFontColorContent}
  }
  .vue-map-legend-header span{
    color:${legendFontColorHeader}
  }
.vue-map-legend{
    border-color: ${legendBorderColor}!important;
    border-radius:${legendBorderRadius}px;
    box-shadow: ${legendBoxShadow ? '3px 4px #00000017' : 'none'};
  }
  `
);

export const getDynamicMapCss = (countryData) => {
  const css = [];
  Object.keys(countryData).forEach((key) => {
    css.push(`.vue-world-map #${key} { fill: #00966c; cursor:pointer; }`);
  });
  return css;
};

export const getCombinedCssString = (baseCss, dynamicCss) => {
  dynamicCss.push(baseCss);

  return dynamicCss.join(' ');
};