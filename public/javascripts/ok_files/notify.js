/***
 * 桌面提示
 * @constructor
 */
var NotifyMsg = new function () {
    this.allowShow = function () {
        var support = false;
        if (this.isSupport() && Notification.permission == 'default') {
            Notification.requestPermission(function (result) {
                if ("granted" == Notification.permission) {
                    support = true;
                }
            });
        } else if ("granted" == Notification.permission) {
            support = true;
        }
        return support;
    };
    this.isSupport = function () {
        if (window.Notification) {
            return true;
        } else {
            return false;
        }
    };
    this.showMsg = function (title, msg, callBack) {

        if (!title || !msg) return;

        var isShow = getCookieValue("SHOW_NOTIFY");
        if (this.allowShow() && isShow == 0) {
            var options = {
                body: msg,
                icon: '../okcoin/image/index/logo_shows.jpg'
            }
            var n = new Notification(title, options);
            setTimeout(n.close.bind(n), 5000);
            n.onclick = function () {
                window.focus();
                if (!!callBack) {
                    callBack();
                }
            }
        }
    }

};

var getshowMsg = function (order) {
    // 当前币种
    var symbol = jQuery("#symbol").val();

    // 过滤币种
    if (String(order.symbol).indexOf(SYMBOLS_UTIL.symbolStr1[symbol]) == -1) return '';

    var msg = get$("turnover") + ":" + getCurrencySymbol() + formatValue(order.averagePrice, SYMBOLS_UTIL.priceRate[Number(symbol)]);
    msg += get$("kline1_volume1") + ":" + SYMBOLS_UTIL.symbolStr[Number(symbol)] + formatValue((!order.dealAmount ? order.completedTradeAmount : order.dealAmount), SYMBOLS_UTIL.amountRate[Number(symbol)]);

    return msg;
};

var getShowTite = function (order) {
    // 当前币种
    var symbol = jQuery("#symbol").val();

    // 过滤币种
    if (String(order.symbol).indexOf(SYMBOLS_UTIL.symbolStr1[symbol]) == -1) return '';

    var msg = SYMBOLS_UTIL.symbolStr2[symbol];

    var isBuy = order.tradeType == 1 || String(order.tradeType).indexOf('buy') > -1;
    var isSell = order.tradeType == 2 || String(order.tradeType).indexOf('sell') > -1;

    msg += isBuy ? get$("immediatelybuy") : get$("immediatelysell");

    var isBuyMarket = isBuy && order.tradeAmount == 0;
    var isSellMarket = isSell && order.tradeUnitPrice == 0;

    var isMarketOrder = isBuyMarket || isSellMarket;

    if (isMarketOrder) {
        // 市价单
        msg += get$("trade_entrust_ten_instant");
    } else {
        // 限价单
        msg += get$("futureplanentrust2");
    }

    msg += get$("alreadDeall");

    return msg;
};
