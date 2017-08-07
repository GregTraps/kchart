/**
 * 公共常量
 * */
var global = {
    siteFlag : site_flag,
    symbol: +document.getElementById("symbol").value,
    merge: Number(getCookieValue("deptMerge_stock")), // 0, 1, 2
    depthInit: false,
    currencyWord: site_flag == 1? "cny" : "usd",
    currencySymbol: site_flag == 1? "￥" : "$",
    btc: 0,
    ltc: 1,
    eth: 2,
    btcSymbol: '฿',
    ltcSymbol: 'Ł',
    ethSymbol: 'E'
};
//多语言获取币种符号
function getCurrencySymbol(){
    return site_flag==2?"$":"￥";
}
var cnyOrUsdSymbol = getCurrencySymbol();
var cnyOrUsdStr = cnyOrUsdSymbol == "$"?"USD":"CNY";
function symbolSubPaltPoint(symbol){
    return SYMBOLS_UTIL.priceRate[Number(symbol)];
}
function symbolAmountSubPoint(symbol){
    return SYMBOLS_UTIL.amountRate[Number(symbol)];
}
/****
 * 小数点截位
 */
//newCoinLabel
var SYMBOLS_UTIL=new function(){
    this.symbol=[0,1,2];//币种
    switch(Number(site_flag)){
        case 1:
            this.priceRate=[2,2,2];
            break;
        case 2:
            this.priceRate=[2,3,2];
            break;
        default:
            this.priceRate=[2,2,2];
            break;
    }//价格截位
    this.amountRate=[3,2,3];//下单量截位
    this.marketFrom=[0,3,36];//币种对应marketFrom
    this.dealAmountRate=[2,1,3];//成交量截位
    this.amountOrderRate=[3,3,3];//下单量截位
    this.buyPriceLimt=[0.01,0.1,0.01];//下单最小单位限制
    this.symbolStr=['฿','Ł','E'];//币种符号
    this.symbolStr1=['btc','ltc','eth'];
    this.symbolStr2=['BTC','LTC','ETH'];//币种符号全写
    // this.futurePriceRateCNY=[FutureSymbolPoint.BTC_CNY_POINT,FutureSymbolPoint.LTC_CNY_POINT];//期货人民币截位
    // this.futurePriceRateUSD=[FutureSymbolPoint.BTC_USD_POINT,FutureSymbolPoint.LTC_USD_POINT];//期货美元截位
    this.buyMin=[0.01,0.1,0.01];//最小购买量
    this.sellMin=[0.01,0.1,0.01];//最小卖出量
}