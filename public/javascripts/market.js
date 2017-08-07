/**
 * Created by cuican on 17/6/25.
 */
/**
 * 全局变量
 * @type {{siteFlag, symbol: number, merge: number, symbolStr: *, currentSymbolStr: string, languageType: number, symbolPricePoint: *, symbolDepthAmountPoint: *, symbolOrderAmountPoint: *, isLogin, showSize: number}}
 */
var Globle = {
    siteFlag:site_flag,
    symbol:Number(jQuery("#symbol").val()),
    merge:Number(jQuery("#merge").attr("val")),
    symbolStr:SYMBOLS_UTIL.symbolStr[Number(jQuery("#symbol").val())],
    currentSymbolStr:Number(site_flag)==2?"$":"￥",
    languageType:Number(jQuery("#languageType").val()),
    symbolPricePoint:SYMBOLS_UTIL.priceRate[Number(jQuery("#symbol").val())],
    symbolDepthAmountPoint:SYMBOLS_UTIL.amountRate[Number(jQuery("#symbol").val())],
    symbolOrderAmountPoint:SYMBOLS_UTIL.amountOrderRate[Number(jQuery("#symbol").val())],
    isLogin:islogin,
    showSize:60,
};

/**
 * 变量定义
 */
var pushUtil = window.pushUtil;
var marketDepthCache=new DepthCache();
var dept=Number(jQuery("#dept").val());
var symbol = Globle.symbol;
var symbolName = SYMBOLS_UTIL.symbolStr1[symbol];
var webSocket = new WebSocketUtil({
    site_flag: +site_flag,
    symbol: +symbol
});

/**
 * market-行情图表推送
 */
(function() {

    var rendering=new Rendering();//初始化页面

    /**
     * 更新深度信息
     * @param depthData
     */
    function updateDepth(depthData) {

        var asks;//卖
        var bids;//买

        if(dept===0) {//深度关
            if(!depthData.asks){
                asks = [];//卖
            }else{
                asks = pushUtil.getSellDepthListReverse(depthData.asks).reverse();//卖
            }
            bids = pushUtil.getBuyDepthList(depthData.bids);//买
        }else{//深度开
            asks = depthData.asks;//卖
            bids = depthData.bids;//买
        }

        var depth = {
            sellDepthList: asks,
            buyDepthList: bids
        };

        // 转换并刷新深度列表数据
        rendering.refreshDepthData(depth, true);

        if (dept == 0) {
            depth = {
                sellDepthList: asks.reverse(),
                buyDepthList: bids
            };
            rendering.refreshKlineDepthData(rendering.getKlineJsonDepth(depth));
        }else{
            depth={
                asks:[],
                bids:[]
            };
            rendering.refreshKlineDepthData(depth);
        }

    }

    /**
     * 轮询合并深度
     */
    function deptMergeLunxun(value,arg){
        var deptMerge=getCookieValue("deptMerge_stock");
        if(deptMerge==0||deptMerge==null||deptMerge==""){
            setCookieValue("deptMerge_stock", 1);
            deptMerge_m = 1;
            cacheDepth.clean();//清除浏览器缓存
        }else  if(deptMerge==1 || deptMerge == 2){
            setCookieValue("deptMerge_stock", 0);
            deptMerge_m = 0;
        }
        marketEntrustRefresh();
    }
    function deptMergeLunxunBtc(value,arg){
        var value = 0;
        // 三选一
        jQuery("#deptMerge_burst_btn a").each(function(i, val){
            if (jQuery(val).hasClass('cur')) {
                value = jQuery(val).attr('code');
            }
        });
        cacheDepth.clean();//清除浏览器缓存
        setCookieValue("deptMerge_stock", value);
        deptMerge_m = value;
        marketEntrustRefresh();
    }

    /**
     * 推送合并深度
     */

    function deptMergeSocket() {
        var cookieName = "deptMerge_stock";
        var deptMerge=getCookieValue(cookieName);
        var preUrl=jQuery("#coinPreUrl").val();
        if(deptMerge==0||deptMerge==null||deptMerge==""){
            dept=1;
            jQuery("#deptMerge_stock_btn").html('<img width="45" height="18" src="'+preUrl+'/image/future/on_min.png" alt="">');
            setCookieValue(cookieName,1,-1);
            marketDepthCache.clean();//清除浏览器缓存
        }else{
            dept=0;
            jQuery("#deptMerge_stock_btn").html('<img width="45" height="18" src="'+preUrl+'/image/future/off_min.png" alt="">');
            setCookieValue(cookieName,0,-1);
        }

        var symbolName = SYMBOLS_UTIL.symbolStr1[symbol];

        var depth = 'ok_sub_spot_'+symbolName+'_depth';
        var depthOnCn = 'ok_sub_spot_'+symbolName+'_depth_merge_0.1';

        var depthOnCom;

        if(symbol==0){
            depthOnCom = 'ok_sub_spot_'+symbolName+'_depth_merge_0.2';
        }else{
            depthOnCom = 'ok_sub_spot_'+symbolName+'_depth_merge_0.1';
        }

        var depthOnComLtc = 'ok_sub_spot_'+symbolName+'_depth_merge_0.01';

        var depthOn = site_flag == 1 ? depthOnCn : depthOnCom;

        var stopKey = dept == 1 ? depth : depthOn;
        var sendKey = dept == 1 ? depthOn : depth;

        // 国际站
        if (site_flag == 2) {
            // LTC
            if (symbol == 1) {
                if (dept == 1) {
                    stopKey = depth;
                    sendKey = depthOnComLtc;
                } else {
                    stopKey = depthOnComLtc;
                    sendKey = depth;
                }
            }
        }

        webSocket.stop(stopKey);

        pushUtil.clearBuySell();

        webSocket.send(sendKey, updateDepth);
    }

    /**
     * btc合并深度（三档）
     * @param arg
     * @另写方法
     */
    function deptMergeSocketBtc(){
        var cookieName = "deptMerge_stock";
        var deptMerge=getCookieValue(cookieName);
        var value = 0;

        // 三选一
        jQuery("#deptMerge_burst_btn a").each(function(i, val){
            if (jQuery(val).hasClass('cur')) {
                value = jQuery(val).attr('code');
            }
        });

        dept=Number(value);
        setCookieValue(cookieName,value,-1);
        marketDepthCache.clean();//清除浏览器缓存

        var depth = 'ok_sub_spot_'+symbolName+'_depth';
        var depthOnCn = 'ok_sub_spot_'+symbolName+'_depth_merge_0.1';
        var depthOnCom = 'ok_sub_spot_'+symbolName+'_depth_merge_0.2';
        var depthOnLarge = 'ok_sub_spot_'+symbolName+'_depth_merge_1.0';
        var depthOnComLtc = 'ok_sub_spot_'+symbolName+'_depth_merge_0.01';

        var depthOn = site_flag == 1 ? depthOnCn : depthOnCom;

        var stopKey = depthOn;
        var stopKey2 = depthOnLarge;
        var sendKey = depth;

        if(dept == 1){
            stopKey = depth;
            stopKey2 = depthOn;
            sendKey = depthOnLarge;
        }else if(dept == 2){
            stopKey = depth;
            stopKey2 = depthOnLarge;
            sendKey = depthOn;
        }else{
            stopKey = depthOn;
            stopKey2 = depthOnLarge;
            sendKey = depth;
        }

        // 国际站
        if (site_flag == 2) {
            if (dept == 1) {
                stopKey = depth;
                sendKey = depthOnCom;
            } else {
                stopKey = depthOnCom;
                sendKey = depth;
            }
        }

        webSocket.stop(stopKey);
        webSocket.stop(stopKey2);

        pushUtil.clearBuySell();

        webSocket.send(sendKey, updateDepth);

    }

    /**
     * 推送连接成功
     */
    webSocket.addSuccCallBackFun(function() {

        var tradeListDataSource = [];

        var userId = getCookieValue("coin_session_user_id");

        /**
         * 切换深度
         */
        jQuery("#deptMerge_stock_btn").unbind('click').click(function(){
            deptMergeSocket();
        });
        jQuery("#deptMerge_burst_btn a").unbind('click').click(function () {
            jQuery("#deptMerge_burst_btn").find(".cur").removeClass("cur");
            jQuery(this).addClass("cur");
            deptMergeSocketBtc();
        });
        //用户登录
        if (userId) {
            webSocket.login(userId);
        }

        // 个人信息（交易中心+行情图表都使用）
        webSocket.addCallBack(webSocket.Utils.getUserInfo(), function(data){
            CommonTrade.wsRefreshUserInfo(data);
        });

        //10笔未成交挂单
        webSocket.addCallBack(webSocket.Utils.getUserSpotTrades(),function(data){
            //console.log("data:",data);
            // 过滤其他币种的交易 不在当前币种页面显示
            if (data.symbol.indexOf(symbolName) == -1) return;

            rendering.renderingUndealTradeOrders(data,symbol);
        });

        // -------------------------------- 行情订阅 send ------------------------------
        // 最新行情 btc, ltc, eth
        webSocket.send(webSocket.Utils.getSpotTicker('btc'), function (data) {
            data = formatTickerData(data, 0);
            CommonTrade.wsRefreshTicker.dealSpotBtcTicker(data);
        });
        webSocket.send(webSocket.Utils.getSpotTicker('ltc'), function (data) {
            data = formatTickerData(data, 1);
            CommonTrade.wsRefreshTicker.dealSpotLtcTicker(data);
        });
        webSocket.send(webSocket.Utils.getSpotTicker('eth'), function (data) {
            data = formatTickerData(data, 2);
            CommonTrade.wsRefreshTicker.dealSpotEthTicker(data);
        });

        // 深度
        var isMerge = getCookieValue('deptMerge_stock');
        var depth = 'ok_sub_spot_' + symbolName + '_depth';

        var sendKey = depth;

        if (isMerge == 1) {
            if (symbol == 0) {
                sendKey = site_flag == 1 ? 'ok_sub_spot_' + symbolName + '_depth_merge_1.0' : 'ok_sub_spot_' + symbolName + '_depth_merge_0.2';
            } else {
                sendKey = site_flag == 1 ? 'ok_sub_spot_' + symbolName + '_depth_merge_0.1' : 'ok_sub_spot_' + symbolName + '_depth_merge_0.1';
            }
        } else if (isMerge == 2) {
            sendKey = site_flag == 1 ? 'ok_sub_spot_' + symbolName + '_depth_merge_0.1' : 'ok_sub_spot_' + symbolName + '_depth_merge_0.1';
        }

        // 国际站
        if (site_flag == 2) {
            // BTC 0.2
            if (symbol == 0) {
                if (isMerge == 1) {
                    sendKey = 'ok_sub_spot_' + symbolName + '_depth_merge_0.2';
                } else {
                    sendKey = depth;
                }
            }
            // LTC 0.01
            if (symbol == 1) {
                if (isMerge == 1) {
                    sendKey = 'ok_sub_spot_' + symbolName + '_depth_merge_0.01';
                } else {
                    sendKey = depth;
                }
            }
        }

        webSocket.send(sendKey,updateDepth);

        // 交易记录
        webSocket.send(webSocket.Utils.getSpotTrades(),function (tradeListData) {

            var isInit = tradeListDataSource.length < 1;

            tradeListData = pushUtil.convertTradeForRefresh(tradeListData);

            tradeListDataSource = tradeListData.concat(tradeListDataSource);

            if (!isInit) {
                // 移除末尾数据
                for (var i = 0; i < tradeListData.length; i++) {
                    tradeListDataSource.pop();
                }
            }

            rendering.refreshTradeData({
                recentDealList: tradeListDataSource
            }, true);
        });

        webSocket.addKlineCallBack(function (data) {
            jQuery("#kline_iframe")[0].contentWindow.onPushingResponse(marketFrom, type, coinVol, pushUtil.getKlineData(data));
        });

    });


    /**
     * 推送失败，执行轮询
     */

    webSocket.addErrCallBackFun(function() {
        if(isNewKline()){
            jQuery("#kline_iframe")[0].contentWindow.onPushingStop();//停止kline推送 开启轮训
        }
        CommonTrade.ajaxRefreshTicker();// 更新ticker
        marketEntrustRefresh();//深度交易记录
        jQuery("#deptMerge_stock_btn").unbind('click').click(function(){
            deptMergeLunxun(this,1);//切换深度
        });
        jQuery("#deptMerge_burst_btn a").unbind('click').click(function () {
            jQuery("#deptMerge_burst_btn").find(".cur").removeClass("cur");
            jQuery(this).addClass("cur");
            deptMergeLunxunBtc(this,1);//btc切换深度(三档)
        });
        if(islogin){
            refreshOrders();//刷新挂单
            CommonTrade.ajaxRefreshUserInfo(); // 个人信息（交易中心+行情图表都使用）
        }
    });

    /**
     * 推送链接
     */
    webSocket.connection();


    /**
     * 渲染页面类
     * @param data
     */
    function Rendering(){
        if (typeof this.renderingTicker != 'function') {
            var sortDepth=new function(){
                this.sort=function (depth) {
                    depth.sort(function (a, b) {
                        return a[1] - b[1];
                    });
                    return depth;
                };
                this.median=function(depth){
                    var i=floor((depth.length/3)*2,0);
                    return depth[i][1]<1?1:depth[i][1];;
                }
                this.medianUnit=function(buydepth,sellDepth,colorWidth){
                    var tmpBuy=new Array(buydepth);
                    tmpBuy=tmpBuy[0];
                    var tmpSell=new Array(sellDepth);
                    tmpSell=tmpSell[0];
                    tmpBuy=tmpBuy.concat(tmpSell);
                    var result=this.median(this.sort(tmpBuy))/colorWidth;
                    tmpBuy=null;
                    tmpSell=null;
                    return result;
                }
                this.width=function(amount,medianUnit){
                    if(medianUnit==0){
                        return 1;
                    }else{
                        var result=round(Number(amount)/medianUnit,0);
                        if(result<=0){
                            return 1;
                        }else if(result>160){
                            return 160;
                        }else{
                            return result/160*100;
                        }
                    }
                }
            }
            var Ele=function(id){
                var element=document.getElementById(id);
                if(!!element){
                    return jQuery(element);
                }else{
                    return jQuery("#"+id);
                }
            }
            var dEle=function(id){
                var element=document.getElementById(id);
                if(!!element){
                    return element;
                }
            }

            /**
             * 刷新K线深度
             * @param data
             */
            this.refreshKlineDepthData=function(data){
                if(!!jQuery("#kline_iframe")[0].contentWindow&&!!jQuery("#kline_iframe")[0].contentWindow._set_current_depth){
                    jQuery("#kline_iframe")[0].contentWindow._set_current_depth(data);//深度信息
                }
            }

            this.getKlineJsonDepth=function(data){
                var sell = data.sellDepthList;
                var json_sell_result=new Array();
                if(!!sell){
                    for(var i=0;i<sell.length;i++){
                        var json_sell=new Array();
                        json_sell.push(Number(sell[i][0]));
                        json_sell.push(Number(sell[i][1]));
                        json_sell_result.push(json_sell);
                    }
                }
                var buy = data.buyDepthList;
                var json_buy_result=new Array();
                if(!!buy){
                    for(var i=0;i<buy.length;i++){
                        var json_buy=new Array();
                        json_buy.push(Number(buy[i][0]));
                        json_buy.push(Number(buy[i][1]));
                        json_buy_result.push(json_buy);
                    }
                }
                return {"asks":json_sell_result,"bids":json_buy_result};
            }
            /**
             * 刷新深度和交易记录
             * @param data
             * @param partialUpdate 局部更新
             */
            var sellStr=get$("depth_sell");
            var buyStr=get$("depth_buy")
            var depth_size=200;
            //深度
            this.refreshDepthData=function(data, partialUpdate){
                if(!data){
                    return;
                }
                jQuery("#depthHidding").hide();
                var medianUnit = sortDepth.medianUnit(data.buyDepthList,data.sellDepthList,70);
                if (!!data.sellDepthList) {
                    //深度交易信息获取
                    var depths_resul = "";
                    var sell_depths = data.sellDepthList;
                    if(!this.getDetphsHtml.sellDepthLength || this.getDetphsHtml.sellDepthLength<200 || sell_depths.length<200) {
                        for (var i = 0; i < sell_depths.length; i++) {
                            if (i >= depth_size) {
                                break;
                            }
                            depths_resul += this.getDetphsHtml(i, sell_depths[i][0], sell_depths[i][1], medianUnit, 1);
                        }
                        this.getDetphsHtml.sellDepthLength = sell_depths.length;
                        jQuery("#depth_sell_context").html(depths_resul);
                    }else {
                        for(var i = 0; i < sell_depths.length; i++) {
                            if(i >= depth_size){
                                break;
                            }
                            this.getDepthHtml200(i, sell_depths[i][0], sell_depths[i][1], medianUnit, 1);
                        }
                    }
                }else if(!partialUpdate){
                    jQuery("#depth_sell_context").empty();
                }
                if (!!data.buyDepthList) {
                    var depths_resul_buy = "";
                    var buy_depths = data.buyDepthList;
                    if(!this.getDetphsHtml.buyDepthLength || this.getDetphsHtml.buyDepthLength<200 || buy_depths.length<200) {
                        for (var i = 0; i < buy_depths.length; i++) {
                            if (i >= depth_size) {
                                break;
                            }
                            depths_resul_buy += this.getDetphsHtml(i, buy_depths[i][0], buy_depths[i][1], medianUnit, 0);
                        }
                        this.getDetphsHtml.buyDepthLength = buy_depths.length;
                        jQuery("#depth_buy_context").html(depths_resul_buy);
                    }else{
                        for(var i = 0; i < buy_depths.length; i++) {
                            if(i >= depth_size){
                                break;
                            }
                            this.getDepthHtml200(i, buy_depths[i][0], buy_depths[i][1], medianUnit, 0);
                        }
                    }
                }else if(!partialUpdate){
                    jQuery("#depth_buy_context").empty();
                }
            }
            //交易信息记录
            this.refreshTradeData=function(data, partialUpdate){
                if(!data){
                    return;
                }
                if (!!data.recentDealList) {
                    var trade_result = "";
                    var trade_depths = data.recentDealList;
                    for (var i = 0; i < trade_depths.length; i++) {
                        trade_result += this.getTradeHtml(trade_depths[i][0], trade_depths[i][1], trade_depths[i][3], trade_depths[i][2])
                    }
                    jQuery("#marketRecentTbody").html(trade_result);
                }else if(!partialUpdate){
                    jQuery("#marketRecentTbody").empty();
                }
            }

            /**
             * 获取深度dom操作
             * @param price
             * @param amount
             * @param type
             * @param date_str
             */
            this.getDetphsHtml=function(order,price,amount,medianUnit,type){
                var result='';
                var order=order+1;
                if(type==0){
                    result = '<li class="li-ct-transcation"  onclick="buyautoTrade(' + order + ')">';
                    result += '<div class="part-ct-transcation buy" style="width:55px;" id="order'+type+order+'">'+buyStr+order+'</div>';
                    result += '<div class="part-ct-transcation_right"  style="padding: 0px 5px 0px 0px;width:70px;">';
                    result += '<span id="buyPriceSpan'+order+'" class="price">'+Calculate.CommaFormattedLittle(price, symbolSubPaltPoint(Globle.symbol))+'</span>';
                    result += '<input type="hidden" id="buyPrice'+ order +'" value="'+price+'" />';
                    result += '</div>';
                    result += '<div class="part-ct-transcation_right" style="padding-left: 0px">'
                    result += '<span id="buyAmountSpan'+order+'" class="number">'+Calculate.CommaFormattedLittle(amount, symbolAmountSubPoint(Globle.symbol))+'</span>';
                    result += '<input type="hidden" id="buyAmount'+ order +'" value="'+amount+'" />';
                    result += '</div>';
                    result += '<div class="part-ct-transcation"  style="padding-left:5px">';
                    result += '<span style="width: '+sortDepth.width(amount,medianUnit)+'px" class="buyspan" id="buySpanColor'+ order +'"></span>';
                    result += '</div>';
                }else {
                    result = '<li class="li-ct-transcation"  onclick="sellautoTrade(' + order + ')">';
                    result += '<div class="part-ct-transcation sell" style="width:55px;" id="order'+type+order+'" class="order">'+sellStr+order+'</div>';
                    result += '<div class="part-ct-transcation_right"  style="padding: 0px 5px 0px 0px;width:70px;">';
                    result += '<span id="sellPriceSpan'+order+'" class="price">'+Calculate.CommaFormattedLittle(price, symbolSubPaltPoint(Globle.symbol))+'</span>';
                    result += '<input type="hidden" id="sellPrice'+ order +'" value="'+price+'" />';
                    result += '</div>';
                    result += '<div class="part-ct-transcation_right" style="padding-left: 0px">';
                    result += '<span id="sellAmountSpan'+order+'"  class="number">'+Calculate.CommaFormattedLittle(amount, symbolAmountSubPoint(Globle.symbol))+'</span>';
                    result += '<input type="hidden" id="sellAmount'+ order +'" value="'+amount+'" />';
                    result += '</div>';
                    result += '<div class="part-ct-transcation"  style="padding-left:5px">';
                    result += '<span style="width: '+sortDepth.width(amount,medianUnit)+'px" class="sellspan" id="sellSpanColor'+ order +'"></span>';
                    result += '</div>';
                }
                result+='</li>';
                return result;
            }

            this.getDepthHtml200 = function (order,price,amount,medianUnit,type) {
                var order=order+1;
                if(type==0){
                    document.getElementById("buyPriceSpan"+order).innerHTML = Calculate.CommaFormattedLittle(price, symbolSubPaltPoint(Globle.symbol));
                    document.getElementById("buyPrice"+order).value = price;
                    document.getElementById("buyAmountSpan"+order).innerHTML = Calculate.CommaFormattedLittle(amount, symbolAmountSubPoint(Globle.symbol));
                    document.getElementById("buyAmount"+order).value = amount;
                    document.getElementById("buySpanColor"+order).style.width = sortDepth.width(amount,medianUnit)+"px";
                }else{
                    document.getElementById("sellPriceSpan"+order).innerHTML =  Calculate.CommaFormattedLittle(price, symbolSubPaltPoint(Globle.symbol));
                    document.getElementById("sellPrice"+order).value=price;
                    document.getElementById("sellAmountSpan"+order).innerHTML = Calculate.CommaFormattedLittle(amount, symbolAmountSubPoint(Globle.symbol));
                    document.getElementById("sellAmount"+order).value = amount;
                    document.getElementById("sellSpanColor"+order).style.width = sortDepth.width(amount,medianUnit)+"px";
                }
            }


            /**
             * 交易记录dom操作
             * @param data
             * @returns {string}
             */
            this.getTradeHtml=function(price,amount,type,date_str){
                var result="<tr>";
                result+='<td><span id="createdDateTd">'+date_str+'</span></td>';
                result+='<td style="text-align: right;padding-right: 20px"><span id="fontPriceSpan" class="'+(type==2?"red":"green")+'">'+Calculate.CommaFormattedByOriginal(Calculate.CommaFormattedCommon(price,symbolSubPaltPoint(symbol)))+'</span></td>';
                result+='<td style="text-align: right;padding-right: 30px"><span id="colorAmount">'+Calculate.CommaFormattedByOriginal(Calculate.CommaFormattedCommon(amount,symbolAmountSubPoint(symbol)))+'</span></td>';
                result+='</tr>';
                return result
            }

            /**
             * 刷新最近10笔未成交
             * @param order
             */
            this.renderingUndealTradeOrders=function(order,currentSymbol){

                var status = order.status;
                var initLength = jQuery("#tradeTableBody tr").length;
                var id = order.id;
                var orderLi = jQuery("#undeal_"+id);

                if(status == 2){
                    NotifyMsg.showMsg(getShowTite(order),getshowMsg(order),function(){});
                }

                if (orderLi.length > 0) {//列表中存在数据，进行删除，修改等操作
                    if (status == 2 || status == -1||Number(order.unTrade)<=0||(Number(order.tradeAmount)-Number(order.completedTradeAmount))<=0) {//已成交、撤单  需删除列表内的数据
                        jQuery(orderLi).remove();
                    }
                    if (status == 1) {//部分成交  需修改行内数据
                        var rate =Calculate.round(Calculate.accDiv_z((order.tradeAmount - order.unTrade),order.tradeAmount)*100,2);
                        if (order.tradeCnyPrice == 1000000 && order.tradeType == 1) {
                            jQuery(orderLi).find(".number").html(Globle.currentSymbolStr+" "+order.unTrade);
                        } else {
                            jQuery(orderLi).find(".number").html(Globle.symbolStr+" "+order.unTrade);
                        }
                        // jQuery(orderLi).find("i").css("width",rate+"%");
                        // 更新状态文字为<部分成交>
                        jQuery(orderLi).find('.state').html(get$("trade_entrust_ten_partfulfilled"));
                    }
                } else { //列表中不存在该数据，进行新增操作

                    if (status == 2 || status == -1 || status == 1) {//已成交、撤单、部分成交，不进行新增操作
                        return;
                    }

                    var html = this.getUndealOrderHtml(order);
                    jQuery("#tradeTableBody").prepend(html);

                }

                //操作结束后，看列表中的条数，若大于10条，则循环删除最后一个，直到剩余3条
                var rowLength = jQuery("#tradeTableBody tr").length;
                if (rowLength > 10) {
                    for (var i=0 ;i<rowLength-10;i++) {//循环删除最后一个
                        jQuery("#tradeTableBody tr").last().remove();
                    }
                }
                //操作前列表为3条数据，删除操作结束后，页面小于1-条，则进行一次轮训操作清空数据重新加载
                rowLength = jQuery("#tradeTableBody tr").length;
                if(initLength == 10 && rowLength == 9) {
                    refreshOrders();
                }
                if (rowLength <= 1) {
                    jQuery("#tradeTableBody").find("#noTenOrder").show();
                } else {
                    jQuery("#tradeTableBody").find("#noTenOrder").hide();
                }

            }
            /**
             * 最近10笔未成交
             * @param order
             * @returns {string}
             */
            this.getUndealOrderHtml=function(order){
                var html = "";
                var styleStr = "";
                var styleTitle = "";
                var priceStr = Calculate.formatNumber(order.tradeUnitPrice,Globle.symbolPricePoint);
                if (order.tradeType == "buy") {
                    styleStr = "lightgreen5";
                    styleTitle = get$("immediatelybuy");
                } else {
                    styleStr = "red";
                    styleTitle = get$("immediatelysell");
                }
                var rate = Calculate.round(Calculate.accDiv_z(order.dealAmount,order.tradeAmount)*100,2);
                var isMarket = false;
                if (order.tradeUnitPrice == 1000000 || order.tradeUnitPrice == 0) {
                    priceStr = get$("trade_entrust_ten_instant");
                    isMarket = true;
                }

                html+='<tr id="undeal_'+order.id+'">'
                html+='<td class="'+styleStr+'">'+styleTitle+'</td>';
                html+='<td><em>'+(isMarket ? "" : Globle.currentSymbolStr)+'</em>'+priceStr+'</td>'
                html+='<td><em class="number">'+Globle.symbolStr+" "+Calculate.formatNumber(order.tradeAmount-order.completedTradeAmount,Globle.symbolOrderAmountPoint)+'</em></td>'
                html+='<td id="entrustStatus'+order.id+'" class="blue">(<em class="state">'+(order.status ==0 ?get$("trade_entrust_ten_unfilled"):get$("trade_entrust_ten_partfulfilled"))+'</em>)<a onclick="javascript:cancelEntrust('+order.id+')">'+get$("trade_entrust_ten_cancel")+'</a></td>'
                html+='</tr>'
                return html;
            }
        }
    }

    /**
     * 处理ticker数据
     * @param data
     * @param symbol
     * @returns {*}
     */
    function formatTickerData(data,symbol) {
        data.vol = Calculate.CommaFormattedByOriginal(data.vol + "");
        data.last = Number(data.last).toFixed(symbolSubPaltPoint(symbol));
        return data;
    }

    /**
     * KLine
     * @type {string}
     */
    var cmd = '';
    var marketFrom = '0';
    var type = '2';
    var coinVol = '1';

    function PushFromEth(contractType, marketFrom_, type_, coinVol_, time) {
        console.log('PushFromEth worked type :'+type_);
        marketFrom = marketFrom_;
        type = type_;
        coinVol = coinVol_;
        if (cmd != '') {
            sendKline(cmd.replace("addChannel", "removeChannel"));
        }
        cmd = '{"event" : "addChannel", channel : "ok_sub_';
        cmd += 'spot_'+symbolName+'_kline_';
        switch (type) {
            case '0':
                cmd += '1min';
                break;
            case '1':
                cmd += '5min';
                break;
            case '2':
                cmd += '15min';
                break;
            case '3':
                cmd += 'day';
                break;
            case '4':
                cmd += 'week';
                break;
            case '7':
                cmd += '3min';
                break;
            case '9':
                cmd += '30min';
                break;
            case '10':
                cmd += '1hour';
                break;
            case '11':
                cmd += '2hour';
                break;
            case '12':
                cmd += '4hour';
                break;
            case '13':
                cmd += '6hour';
                break;
            case '14':
                cmd += '12hour';
                break;
            case '15':
                cmd += '3day';
                break;
            default :
                cmd += '15min';
                break;
        }
        cmd += '", binary : ' + webSocket.isBinary + ', since :';
        cmd += time + '}';
        sendKline(cmd);
    }

    function sendKline(cmd) {
        if (!webSocket.isConnection()) {
            console.log('ws.isConnection false 发送cmd失败，cmd:'+cmd);
            setTimeout(function () {
                sendKline(cmd);
            }, 200);
            return;
        }
        console.log('ws请求:'+cmd);
        webSocket.socket().send(cmd);
    }

    window.PushFromEth=PushFromEth;

})();



