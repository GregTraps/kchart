(function() {

    var buyDepth;
    var sellDepth;

    var pushUtil = {};

    // 清空列表
    pushUtil.clearBuySell = function() {
        buyDepth = null;
        sellDepth = null;
    };

    // 计算买入积累量
    pushUtil.accumulateBuyDepthList = function(list) {

        var i, buy;
        var sum = 0;

        if(!list){
            return [];
        }
        // 买入正序累计
        for (i = 0; i < list.length; i++) {
            buy = list[i];

            buy[2] = 0;

            sum = accAdd(sum, buy[1]);

            buy[3] = sum;
        }

        return list;
    };

    // 计算卖出积累量
    pushUtil.accumulateSellDepthList = function(list) {

        var i, sell;
        var sum = 0;

        if(!list){
            return [];
        }
        // 卖出倒序累计
        for (i = list.length - 1; i >= 0; i--) {
            sell = list[i];

            sell[2] = 0;

            sum = accAdd(sum, sell[1]);

            sell[3] = sum;
        }

        return list;
    };

    // 获取深度买入列表渲染数据
    pushUtil.getBuyDepthList = function (depthList) {
        if (!buyDepth) {//第一次加载为空的时候
            buyDepth = depthList;

            return pushUtil.accumulateBuyDepthList(buyDepth);
        }
        if (!!depthList) {
            for (var i = 0; i < depthList.length; i++) {
                var price = depthList[i][0];
                var amount=depthList[i][1];
                var index = buyDepth.binarySearchDesc(price);
                if(Number(amount)==0){//删除
                    if(index!=-1){
                        buyDepth.splice(index,1);
                    }
                    continue;
                }
                if (index != -1) {//修改
                    buyDepth[index] = depthList[i];
                    continue;
                }
                if(index==-1){//增加
                    buyDepth.push(depthList[i]);
                }
            }
            //重新排序
            buyDepth.sort(function(o1,o2){
                return Number(o2[0])-Number(o1[0]);
            });
            //删除超过200的
            if(buyDepth.length>200){
                buyDepth.splice(200,buyDepth.length-200);
            }
        }

        return pushUtil.accumulateBuyDepthList(buyDepth);
    };

    // 获取深度卖出列表渲染数据
    //正序
    pushUtil.getSellDepthList=function(depthList){
        if(!sellDepth){//第一次加载为空的时候
            sellDepth=depthList;

            return pushUtil.accumulateSellDepthList(sellDepth);
        }
        if (!!depthList) {
            for (var i = 0; i < depthList.length; i++) {
                var price = depthList[i][0];
                var amount=depthList[i][1];
                var index = sellDepth.binarySearchDesc(price);
                if(Number(amount)==0){//删除
                    if(index!=-1){
                        sellDepth.splice(index,1);
                    }
                    continue;
                }
                if (index != -1) {//修改
                    sellDepth[index] = depthList[i];
                    continue;
                }
                if(index==-1){//增加
                    sellDepth.push(depthList[i]);
                }
            }
            //重新排序
            sellDepth.sort(function(o1,o2){
                return Number(o2[0])-Number(o1[0]);
            });
            //删除超过200的
            if(sellDepth.length>200){
                sellDepth.splice(0,sellDepth.length-200);
            }
        }

        return pushUtil.accumulateSellDepthList(sellDepth);
    };

    //反序
    pushUtil.getSellDepthListReverse=function(depthList){
        if(!sellDepth){//第一次加载为空的时候
            sellDepth=depthList;

            return depthList;
        }
        if (!!depthList) {
            for (var i = 0; i < depthList.length; i++) {
                var price = depthList[i][0];
                var amount=depthList[i][1];
                var index = sellDepth.binarySearchDesc(price);
                if(Number(amount)==0){//删除
                    if(index!=-1){
                        sellDepth.splice(index,1);
                    }
                    continue;
                }
                if (index != -1) {//修改
                    sellDepth[index] = depthList[i];
                    continue;
                }
                if(index==-1){//增加
                    sellDepth.push(depthList[i]);
                }
            }
            //重新排序
            sellDepth.sort(function(o1,o2){
                return Number(o2[0])-Number(o1[0]);
            });
            //删除超过200的
            if(sellDepth.length>200){
                sellDepth.splice(0,sellDepth.length-200);
            }
        }

        return sellDepth;
    };

    // 将交易记录推送数据转换为轮询数据格式
    pushUtil.convertTradeForRefresh = function(tradeData) {

        // 推送的交易记录时间是正序的，需要反转一下
        tradeData.reverse();

        for (var i = 0; i < tradeData.length; i++) {
            var trade = tradeData[i];

            trade[0] = trade[1];
            trade[1] = trade[2];
            trade[2] = trade[3];
            trade[3] = trade[4] == 'ask' ? '2' : '1';
        }

        return tradeData;
    };

    // 对推送的K线数据进行转换
    pushUtil.getKlineData = function (datas) {
        var dataNew = [];
        for (var i = 0; i < datas.length; i++) {
            var data = datas[i];
            var tmp = [];
            var length = data.length;
            if (length < 6) {
                continue;
            }
            tmp.push(Number(data[0]));
            tmp.push(Number(data[1]));
            tmp.push(Number(data[2]));
            tmp.push(Number(data[3]));
            tmp.push(Number(data[4]));
            tmp.push(Number(data[5]));
            dataNew.push(tmp);
        }
        return dataNew;
    };

    window.pushUtil = pushUtil;

})();
