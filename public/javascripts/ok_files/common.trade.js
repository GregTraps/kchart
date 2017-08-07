/**
 * 交易中心&行情图表&全屏交易三个页面共用的方法
 * */
var CommonTrade = (function() {
    // 推送ticker
    function tickerManager() {
        this.refreshTitlePrice = function(data) {
            // 修改title
            var oldTitle = document.title;
            var arrs = oldTitle.split("-");
            //前辍用来判断title是显示BTC还是LTC
            if(oldTitle!=null&&oldTitle.length>0){
                if(arrs.length > 0){
                    oldTitle = arrs[arrs.length-1];
                }
                var newTitle =  global.currencySymbol+data.last+"-"+oldTitle;

                //newCoinLabel
                if(global.symbol==0){
                    newTitle = ":"+global.currencySymbol+data.last+"-"+oldTitle;
                }else if(global.symbol== 1) {
                    newTitle = ":"+global.currencySymbol+data.last+"-"+oldTitle;
                }
                return newTitle;
            }
            return "";
        };
        this.checkBanner = function () {
            if (document.getElementById('bannerAccountBtcLast') == null || !islogin) {
                return false;
            }
            return true;
        };
        this.dealSpotEthTicker = function (data) {
            // 更新title上的价格
            if(global.symbol == global.eth && document.title!=null && !isSpider() && data.last != 0) {
                var newTitle = this.refreshTitlePrice(data);
                if (newTitle != "") {
                    document.title = global.ethSymbol + newTitle;
                }
            }
            if (!this.checkBanner()) {
                return;
            }

            if (data != null && data != '' && data != 'undefined') {
                if (document.getElementById("bannerAccountEthLast") != null && data.last != null && data.last != '' && data.last != 'undefined') {
                    document.getElementById("bannerAccountEthLast").value = data.last;
                    push.ethlast = Number(document.getElementById('bannerAccountEthLast').value);
                }
                if (document.getElementById("bannerEthBuy") != null && data.buy != null && data.buy != '' && data.buy != 'undefined') {
                    document.getElementById("bannerEthBuy").value = data.buy;
                }
                if (document.getElementById("bannerEthSell") != null && data.sell != null && data.sell != '' && data.sell != 'undefined') {
                    document.getElementById("bannerEthSell").value = data.sell;
                }
                AccountingUserAccountInfo();
                if (document.getElementById("canpush") != null) {
                    _ChangeBalance();
                }
            }
            if (document.getElementById("bannerEthLast") != null) {
                push.ethlast = data.last;
                push.ethsell = data.sell;
                push.ethbuy = data.buy;
                document.getElementById("bannerEthLast").innerHTML = (push.ethlast + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
            }
            if (document.getElementById("bannerEthVol") != null) {
                var tempEth = data.vol + '';
                var end = tempEth.indexOf('.');
                if (end == -1) {
                    end = tempEth.length;
                }
                document.getElementById("bannerEthVol").innerHTML = tempEth.substr(0, end);
            }
            if (document.getElementById("indexEthVol") != null) {
                document.getElementById("indexEthVol").innerHTML = data.vol;
            }
            if (global.symbol == 2 && document.getElementById("tradeLastPrice") != null) {
                document.getElementById("tradeLastPrice").innerHTML = (data.last + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
            }
        };
        this.dealSpotLtcTicker = function (data) {
            // 更新title上的价格
            if(global.symbol == global.ltc && document.title!=null && !isSpider() && data.last != 0) {
                var newTitle = this.refreshTitlePrice(data);
                if (newTitle != "") {
                    document.title = global.ltcSymbol + newTitle;
                }
            }
            if (!this.checkBanner()) {
                return;
            }

            if (data != null && data != '' && data != 'undefined') {
                if (document.getElementById("bannerAccountLtcLast") != null && data.last != null && data.last != '' && data.last != 'undefined') {
                    document.getElementById("bannerAccountLtcLast").value = data.last;
                    push.btclast = Number(document.getElementById('bannerAccountLtcLast').value);
                }
                if (document.getElementById("bannerLtcBuy") != null && data.buy != null && data.buy != '' && data.buy != 'undefined') {
                    document.getElementById("bannerLtcBuy").value = data.buy;
                }
                if (document.getElementById("bannerLtcSell") != null && data.sell != null && data.sell != '' && data.sell != 'undefined') {
                    document.getElementById("bannerLtcSell").value = data.sell;
                }
                AccountingUserAccountInfo();
                if (document.getElementById("canpush") != null) {
                    _ChangeBalance();
                }
            }
            if (document.getElementById("bannerLtcLast") != null) {
                push.ltclast = data.last;
                push.ltcsell = data.sell;
                push.ltcbuy = data.buy;
                document.getElementById("bannerLtcLast").innerHTML = (push.ltclast + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
            }
            if (document.getElementById("bannerLtcVol") != null) {
                var tempLtc = data.vol + '';
                var end = tempLtc.indexOf('.');
                if (end == -1) {
                    end = tempLtc.length;
                }
                document.getElementById("bannerLtcVol").innerHTML = tempLtc.substr(0, end);
            }
            if (document.getElementById("indexLtcVol") != null) {
                document.getElementById("indexLtcVol").innerHTML = data.vol;
            }
            if (global.symbol == 1 && document.getElementById("tradeLastPrice") != null) {
                document.getElementById("tradeLastPrice").innerHTML = (data.last + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
            }
        };
        this.dealSpotBtcTicker = function (data) {
            // 更新title上的价格
            if(global.symbol == global.btc && document.title!=null && !isSpider() && data.last != 0) {
                var newTitle = this.refreshTitlePrice(data);
                if (newTitle != "") {
                    document.title = global.btcSymbol + newTitle;
                }
            }

            if (!this.checkBanner()) {
                return;
            }
            if (data != null && data != '' && data != 'undefined') {
                if (document.getElementById("bannerAccountBtcLast") != null && data.last != null && data.last != '' && data.last != 'undefined') {
                    document.getElementById("bannerAccountBtcLast").value = data.last;
                    push.btclast = Number(document.getElementById('bannerAccountBtcLast').value);
                }
                if (document.getElementById("bannerBtcBuy") != null && data.buy != null && data.buy != '' && data.buy != 'undefined') {
                    document.getElementById("bannerBtcBuy").value = data.buy;
                }
                if (document.getElementById("bannerBtcSell") != null && data.sell != null && data.sell != '' && data.sell != 'undefined') {
                    document.getElementById("bannerBtcSell").value = data.sell;
                }
                AccountingUserAccountInfo();
                if (document.getElementById("canpush") != null) {
                    _ChangeBalance();
                }
            }
            if (document.getElementById("bannerBtcLast") != null) {
                push.btclast = data.last;
                push.btcsell = data.sell;
                push.btcbuy = data.buy;
                document.getElementById("bannerBtcLast").innerHTML = (push.btclast + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
            }
            if (document.getElementById("bannerBtcVol") != null) {
                var tempBtc = data.vol + '';
                var end = tempBtc.indexOf('.');
                if (end == -1) {
                    end = tempBtc.length;
                }
                document.getElementById("bannerBtcVol").innerHTML = tempBtc.substr(0, end);
            }
            //更新首页大图成交量
            if (document.getElementById("indexVol") != null) {
                document.getElementById("indexVol").innerHTML = data.vol;
            }
            if (global.symbol == 0 && document.getElementById("tradeLastPrice") != null) {
                document.getElementById("tradeLastPrice").innerHTML = (data.last + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
            }
        };
    }

    function userInfoFormatToOldSocketFormat(data) {
        var res = {};
        if (global.siteFlag == 1) {
            res.cnyBalance = data.info.free.cny;
            res.freezeCnyBalance = data.info.freezed.cny;
            res.lendCnyBalance = data.info.lend.cny;
            res.lendFreezeCnyBalance = data.info.lendFreeze.cny;
            res.lendedCnyBalance = data.info.lended.cny;
            res.borrowCnyBalance = data.info.borrow.cny;
            res.binterestCnyBalance = data.info.binterest.cny;
        } else {
            res.cnyBalance = data.info.free.usd;
            res.freezeCnyBalance = data.info.freezed.usd;
            res.lendCnyBalance = data.info.lend.usd;
            res.lendFreezeCnyBalance = data.info.lendFreeze.usd;
            res.lendedCnyBalance = data.info.lended.usd;
            res.borrowCnyBalance = data.info.borrow.usd;
            res.binterestCnyBalance = data.info.binterest.usd;
        }
        res.btcBalance = Number(data.info.free.btc);
        res.ltcBalance = Number(data.info.free.ltc);
        res.ethBalance = Number(data.info.free.eth) || 0;
        res.freezeBtcBalance = data.info.freezed.btc;
        res.freezeLtcBalance = data.info.freezed.ltc;
        res.freezeEthBalance = data.info.freezed.eth || 0;
        res.lendBtcBalance = data.info.lend.btc;
        res.lendLtcBalance = data.info.lend.ltc;
        res.lendEthBalance = data.info.lend.eth || 0;
        res.lendedBtcBalance = data.info.lended.btc;
        res.lendedLtcBalance = data.info.lended.ltc;
        res.lendedEthBalance = data.info.lended.eth || 0;
        res.lendFreezeBtcBalance = data.info.lendFreeze.btc;
        res.lendFreezeLtcBalance = data.info.lendFreeze.ltc;
        res.lendFreezeEthBalance = data.info.lendFreeze.eth || 0;
        res.fundBtcBalance = data.info.fund.btc;
        res.fundLtcBalance = data.info.fund.ltc;
        res.fundEthBalance = data.info.fund.eth || 0;
        res.borrowBtcBalance = data.info.borrow.btc;
        res.borrowLtcBalance = data.info.borrow.ltc;
        res.borrowEthBalance = data.info.borrow.eth || 0;
        res.binterestBtcBalance = data.info.binterest.btc;
        res.binterestLtcBalance = data.info.binterest.ltc;
        res.binterestEthBalance = data.info.binterest.eth || 0;

        res.borrowFreeze = data.borrowFreeze;
        return res;
    }
    /**
     * 推送填充用户信息，并核算
     */
    function trade_injectUserParam(pushjson){
        if(document.getElementById('bannerAccountBtcLast')==null || !islogin){
            return ;
        }
        _updateBannerHiddenInputByPush(pushjson);
        AccountingUserAccountInfo();
        if(document.getElementById("canpush")!=null){
            _ChangeBalance();
        }
    }
    /**
     * @param data_push 推送用户账户json数据
     */
    function _updateBannerHiddenInputByPush(data_push){
        if(data_push == null || data_push ==  "undefined" || data_push == ''){
            return;
        }
        document.getElementById("bannerUserCnyBalance").value = data_push.cnyBalance;
        document.getElementById("bannerUserLtcBalance").value = data_push.ltcBalance;
        document.getElementById("bannerUserBtcBalance").value = data_push.btcBalance;
        document.getElementById("bannerUserEthBalance").value = data_push.ethBalance;
        document.getElementById("bannerFreezeBtcBalance").value = data_push.freezeBtcBalance;
        document.getElementById("bannerFreezeLtcBalance").value = data_push.freezeLtcBalance;
        document.getElementById("bannerFreezeEthBalance").value = data_push.freezeEthBalance;
        document.getElementById("bannerFreezeCnyBalance").value = data_push.freezeCnyBalance;
    }


    /**
     * @param pollingBannerUserAccountData 轮询用户账户json数据
     */
    function bannerUserAccountPolling(pollingBannerUserAccountData){
        document.getElementById("lendBtc").value=pollingBannerUserAccountData.lendBtc;
        document.getElementById("lendLtc").value=pollingBannerUserAccountData.lendLtc;
        document.getElementById("lendEth").value=pollingBannerUserAccountData.lendEth;
        document.getElementById("lendCny").value=pollingBannerUserAccountData.lendCny;
        document.getElementById("bannerborrowsBtc").value=pollingBannerUserAccountData.bannerborrowsBtc;
        document.getElementById("bannerborrowsLtc").value=pollingBannerUserAccountData.bannerborrowsLtc;
        document.getElementById("bannerborrowsEth").value=pollingBannerUserAccountData.bannerborrowsEth;
        document.getElementById("bannerborowsCny").value=pollingBannerUserAccountData.bannerborowsCny;
        document.getElementById("bannerBinterestBtc").value=pollingBannerUserAccountData.bannerBinterestBtc;
        document.getElementById("bannerBinterestLtc").value=pollingBannerUserAccountData.bannerBinterestLtc;
        document.getElementById("bannerBinterestEth").value=pollingBannerUserAccountData.bannerBinterestEth;
        document.getElementById("bannerBinterestCny").value=pollingBannerUserAccountData.bannerBinterestCny;

        if(document.getElementById("bannerAccountBtcLast") && pollingBannerUserAccountData.bannerBtcLast!=null && pollingBannerUserAccountData.bannerBtcLast!='' && pollingBannerUserAccountData.bannerBtcLast!= 'undefined'){
            document.getElementById("bannerAccountBtcLast").value=pollingBannerUserAccountData.bannerBtcLast;
        }
        if(document.getElementById("bannerAccountLtcLast") && pollingBannerUserAccountData.bannerLtcLast!=null && pollingBannerUserAccountData.bannerLtcLast!='' && pollingBannerUserAccountData.bannerLtcLast!= 'undefined'){
            document.getElementById("bannerAccountLtcLast").value=pollingBannerUserAccountData.bannerLtcLast;
        }
        if(!!document.getElementById("bannerAccountEthLast") && !!pollingBannerUserAccountData.bannerEthLast){
            document.getElementById("bannerAccountEthLast").value=pollingBannerUserAccountData.bannerEthLast;
        }
        if(document.getElementById("bannerBtcBuy") && pollingBannerUserAccountData.bannerBtcBuy!=null && pollingBannerUserAccountData.bannerBtcBuy!='' && pollingBannerUserAccountData.bannerBtcBuy!= 'undefined'){
            document.getElementById("bannerBtcBuy").value=pollingBannerUserAccountData.bannerBtcBuy;
        }
        if(document.getElementById("bannerBtcSell") && pollingBannerUserAccountData.bannerBtcSell!=null && pollingBannerUserAccountData.bannerBtcSell!='' && pollingBannerUserAccountData.bannerBtcSell!= 'undefined'){
            document.getElementById("bannerBtcSell").value=pollingBannerUserAccountData.bannerBtcSell;
        }
        if(document.getElementById("bannerLtcBuy") && pollingBannerUserAccountData.bannerLtcBuy!=null && pollingBannerUserAccountData.bannerLtcBuy!='' && pollingBannerUserAccountData.bannerLtcBuy!= 'undefined'){
            document.getElementById("bannerLtcBuy").value=pollingBannerUserAccountData.bannerLtcBuy;
        }
        if(document.getElementById("bannerLtcSell") && pollingBannerUserAccountData.bannerLtcSell!=null && pollingBannerUserAccountData.bannerLtcSell!='' && pollingBannerUserAccountData.bannerLtcSell!= 'undefined'){
            document.getElementById("bannerLtcSell").value=pollingBannerUserAccountData.bannerLtcSell;
        }
        if(document.getElementById("bannerEthBuy") && pollingBannerUserAccountData.bannerEthBuy!=null && pollingBannerUserAccountData.bannerEthBuy!='' && pollingBannerUserAccountData.bannerEthBuy!= 'undefined'){
            document.getElementById("bannerEthBuy").value=pollingBannerUserAccountData.bannerEthBuy;
        }
        if(document.getElementById("bannerEthSell") && pollingBannerUserAccountData.bannerEthSell!=null && pollingBannerUserAccountData.bannerEthSell!='' && pollingBannerUserAccountData.bannerEthSell!= 'undefined'){
            document.getElementById("bannerEthSell").value=pollingBannerUserAccountData.bannerEthSell;
        }
        document.getElementById("bannerUserCnyBalance").value=pollingBannerUserAccountData.bannerUserCnyBalance;
        document.getElementById("bannerUserLtcBalance").value=pollingBannerUserAccountData.bannerUserLtcBalance;
        document.getElementById("bannerUserBtcBalance").value=pollingBannerUserAccountData.bannerUserBtcBalance;
        document.getElementById("bannerUserEthBalance").value=pollingBannerUserAccountData.bannerUserEthBalance;

        document.getElementById("bannerFreezeBtcBalance").value=pollingBannerUserAccountData.bannerFreezeBtcBalance;
        document.getElementById("bannerFreezeLtcBalance").value=pollingBannerUserAccountData.bannerFreezeLtcBalance;
        document.getElementById("bannerFreezeCnyBalance").value=pollingBannerUserAccountData.bannerFreezeCnyBalance;
        document.getElementById("bannerFreezeEthBalance").value=pollingBannerUserAccountData.bannerFreezeEthBalance;

        document.getElementById("bannerBorrowBtcBalance").value=pollingBannerUserAccountData.bannerBorrowBtcBalance;
        document.getElementById("bannerBorrowLtcBalance").value=pollingBannerUserAccountData.bannerBorrowLtcBalance;
        document.getElementById("bannerBorrowEthBalance").value=pollingBannerUserAccountData.bannerBorrowEthBalance;
        document.getElementById("bannerBorrowCnyBalance").value=pollingBannerUserAccountData.bannerBorrowCnyBalance;
        document.getElementById("bannerLendFreezeBtcBalance").value=pollingBannerUserAccountData.bannerLendFreezeBtcBalance;
        document.getElementById("bannerLendFreezeEthBalance").value=pollingBannerUserAccountData.bannerLendFreezeEthBalance;
        document.getElementById("bannerLendFreezeLtcBalanced").value=pollingBannerUserAccountData.bannerLendFreezeLtcBalanced;
        document.getElementById("bannerLendFreezeCnyBalance").value=pollingBannerUserAccountData.bannerLendFreezeCnyBalance;
        document.getElementById("bannerFundBtcBalance").value=pollingBannerUserAccountData.bannerFundBtcBalance;
        document.getElementById("bannerFundLtcBalance").value=pollingBannerUserAccountData.bannerFundLtcBalance;
        document.getElementById("bannerFundEthBalance").value=pollingBannerUserAccountData.bannerFundEthBalance;
        document.getElementById("bannerLendedOutBtcBalance").value = pollingBannerUserAccountData.bannerLendedOutBtcBalance;
        document.getElementById("bannerLendedOutLtcBalance").value = pollingBannerUserAccountData.bannerLendedOutLtcBalance;
        document.getElementById("bannerLendedOutEthBalance").value = pollingBannerUserAccountData.bannerLendedOutEthBalance;
        document.getElementById("bannerLendedOutCnyBalance").value = pollingBannerUserAccountData.bannerLendedOutCnyBalance;
        document.getElementById("bannerfutureAccountBtcRights").value=pollingBannerUserAccountData.bannerfutureAccountBtcRights;
        document.getElementById("bannerfutureAccountLtcRights").value=pollingBannerUserAccountData.bannerfutureAccountLtcRights;
        document.getElementById("bannerfutureAccountEthRights").value=pollingBannerUserAccountData.bannerfutureAccountEthRights;
    }

    /**
     * 核算并更新页面用户账户信息 suguangqiang
     */
    function AccountingUserAccountInfo(){
        if(!islogin){
            return;
        }
        var account_bannerBtcLast = Number(document.getElementById("bannerAccountBtcLast").value);
        var account_bannerLtcLast = Number(document.getElementById("bannerAccountLtcLast").value);
        var account_bannerEthLast = Number(document.getElementById("bannerAccountEthLast").value);

        var account_bannerBtcBuy = Number(document.getElementById("bannerBtcBuy").value);
        var account_bannerBtcSell = Number(document.getElementById("bannerBtcSell").value);
        var account_bannerLtcBuy = Number(document.getElementById("bannerLtcBuy").value);
        var account_bannerLtcSell = Number(document.getElementById("bannerLtcSell").value);
        if(isNaN(account_bannerEthLast)||isNaN(account_bannerBtcLast)||isNaN(account_bannerLtcLast)||isNaN(account_bannerBtcBuy)||isNaN(account_bannerBtcSell)||isNaN(account_bannerLtcBuy)||isNaN(account_bannerLtcSell)){
            return ;
        }
        var account_Futureaccount = Number(document.getElementById('futureaccount_hidden').value);
        //合约使用 两个权益来计算合约账户余额
        var account_futrueBtcRights = Number(document.getElementById("bannerfutureAccountBtcRights").value);
        var account_futrueLtcRights = Number(document.getElementById("bannerfutureAccountLtcRights").value);
        var account_futrueEthRights = Number(document.getElementById("bannerfutureAccountEthRights").value);
        var account_LendBtc = Number(document.getElementById("lendBtc").value);
        var account_LendLtc = Number(document.getElementById("lendLtc").value);
        var account_LendEth = Number(document.getElementById("lendEth").value);
        var account_LendCny = Number(document.getElementById("lendCny").value);
        var account_bannerborrowsLtc = Number(document.getElementById("bannerborrowsLtc").value);
        var account_bannerborrowsEth = Number(document.getElementById("bannerborrowsEth").value);
        var account_bannerborowsCny = Number(document.getElementById("bannerborowsCny").value);
        var account_bannerBinterestBtc = Number(document.getElementById("bannerBinterestBtc").value);
        var account_bannerBinterestLtc = Number(document.getElementById("bannerBinterestLtc").value);
        var account_bannerBinterestEth = Number(document.getElementById("bannerBinterestEth").value);
        var account_bannerBinterestCny = Number(document.getElementById("bannerBinterestCny").value);

        var account_bannerUserCnyBalance = Number(document.getElementById("bannerUserCnyBalance").value);
        var account_bannerUserLtcBalance = Number(document.getElementById("bannerUserLtcBalance").value);
        var account_bannerUserEthBalance = Number(document.getElementById("bannerUserEthBalance").value);
        var account_bannerUserBtcBalance = Number(document.getElementById("bannerUserBtcBalance").value);

        var account_bannerFreezeBtcBalance = Number(document.getElementById("bannerFreezeBtcBalance").value);
        var account_bannerFreezeLtcBalance = Number(document.getElementById("bannerFreezeLtcBalance").value);
        var account_bannerFreezeCnyBalance = Number(document.getElementById("bannerFreezeCnyBalance").value);
        var account_bannerFreezeEthBalance = Number(document.getElementById("bannerFreezeEthBalance").value);

        var account_bannerBorrowBtcBalance = Number(document.getElementById("bannerBorrowBtcBalance").value);
        var account_bannerBorrowLtcBalance = Number(document.getElementById("bannerBorrowLtcBalance").value);
        var account_bannerBorrowEthBalance = Number(document.getElementById("bannerBorrowEthBalance").value);
        var account_bannerBorrowCnyBalance = Number(document.getElementById("bannerBorrowCnyBalance").value);
        var account_bannerLendFreezeBtcBalance = Number(document.getElementById("bannerLendFreezeBtcBalance").value);
        var account_bannerLendFreezeEthBalance = Number(document.getElementById("bannerLendFreezeEthBalance").value);
        var account_bannerLendFreezeLtcBalanced = Number(document.getElementById("bannerLendFreezeLtcBalanced").value);
        var account_bannerLendFreezeCnyBalance = Number(document.getElementById("bannerLendFreezeCnyBalance").value);
        var account_bannerFundBtcBalance = Number(document.getElementById("bannerFundBtcBalance").value);
        var account_bannerFundLtcBalance = Number(document.getElementById("bannerFundLtcBalance").value);
        var account_bannerFundEthBalance = Number(document.getElementById("bannerFundEthBalance").value);
        var account_bannerLendedOutBtcBalance = Number(document.getElementById("bannerLendedOutBtcBalance").value);
        var account_bannerLendedOutLtcBalance = Number(document.getElementById("bannerLendedOutLtcBalance").value);
        var account_bannerLendedOutEthBalance = Number(document.getElementById("bannerLendedOutEthBalance").value);
        var account_bannerLendedOutCnyBalance = Number( document.getElementById("bannerLendedOutCnyBalance").value);
        var futureaccountSum = Calculate.accAdd_z(Calculate.accMul_z(account_futrueBtcRights,account_bannerBtcLast),Calculate.accMul_z(account_futrueLtcRights,account_bannerLtcLast));
        if(!isNaN(futureaccountSum)){
            account_Futureaccount = futureaccountSum;
        }
        // 2017.05.28 TODO计算ETH？
        //借贷账户 借出 BTC * 市价  LTC * 市价  + CNY
        var account_Sum_LendBtc = Calculate.accAdd_z(Calculate.accAdd_z(account_LendBtc,account_bannerLendFreezeBtcBalance),account_bannerLendedOutBtcBalance);
        var account_Sum_LendLtc = Calculate.accAdd_z(Calculate.accAdd_z(account_LendLtc,account_bannerLendFreezeLtcBalanced),account_bannerLendedOutLtcBalance);
        var account_Sum_LendEth = Calculate.accAdd_z(Calculate.accAdd_z(account_LendEth,account_bannerLendFreezeEthBalance),account_bannerLendedOutEthBalance);
        var account_Sum_LendCny = Calculate.accAdd_z(Calculate.accAdd_z(account_LendCny,account_bannerLendFreezeCnyBalance),account_bannerLendedOutCnyBalance);
        var account_lendValue = Calculate.accAdd_z(Calculate.accAdd_z(Calculate.accMul_z(account_Sum_LendBtc,account_bannerBtcLast),Calculate.accMul_z(account_Sum_LendLtc,account_bannerLtcLast)),account_Sum_LendCny);
        //交易账户BTC 可用BTC + 冻结BTC
        var  account_tradeBtc = Calculate.accAdd_z(account_bannerUserBtcBalance,account_bannerFreezeBtcBalance);
        //交易账户LTC
        var  account_tradeLtc = Calculate.accAdd_z(account_bannerUserLtcBalance,account_bannerFreezeLtcBalance);
        var  account_tradeEth = Calculate.accAdd_z(account_bannerUserEthBalance,account_bannerFreezeEthBalance);
        //交易账户 交易BTC * 市价 + 交易：LTC *市价　+可用CNY + 冻结CNY
        var account_tradeValue = Calculate.accAdd_z(Calculate.accAdd_z(Calculate.accAdd_z(Calculate.accAdd_z(Calculate.accMul_z(account_tradeBtc,account_bannerBtcLast),Calculate.accMul_z(account_tradeLtc,account_bannerLtcLast)),Calculate.accMul_z(account_tradeEth,account_bannerEthLast)),account_bannerUserCnyBalance),account_bannerFreezeCnyBalance);
        //基金账户
        var account_fundValue = Calculate.accAdd_z(Calculate.accMul_z(account_bannerFundBtcBalance,account_bannerBtcLast),Calculate.accMul_z(account_bannerFundLtcBalance,account_bannerLtcLast));
        //交易账户合计
        var account_asubtotalCnyValue = Calculate.accAdd_z(account_bannerUserCnyBalance,account_bannerFreezeCnyBalance);
        var account_asubtotalBtcValue = Calculate.accAdd_z(account_bannerFreezeBtcBalance,account_bannerUserBtcBalance);
        var account_asubtotalLtcValue = Calculate.accAdd_z(account_bannerFreezeLtcBalance,account_bannerUserLtcBalance);
        var account_asubtotalEthValue = Calculate.accAdd_z(account_bannerFreezeEthBalance,account_bannerUserEthBalance);
        //借贷合计
        var account_lsubtotalCnyValue = Calculate.accAdd_z(Calculate.accAdd_z(account_LendCny,account_bannerLendFreezeCnyBalance),account_bannerLendedOutCnyBalance);
        var account_lsubtotalBtcValue = Calculate.accAdd_z(Calculate.accAdd_z(account_LendBtc,account_bannerLendFreezeBtcBalance),account_bannerLendedOutBtcBalance);
        var account_lsubtotalLtcValue = Calculate.accAdd_z(Calculate.accAdd_z(account_LendLtc,account_bannerLendFreezeLtcBalanced),account_bannerLendedOutLtcBalance);
        //净资产CNY = 可用CNY + 冻结CNY -借款CNY - 减去利息
        var cny = DoubleUtil.subtract(DoubleUtil.subtract(Calculate.accAdd_z(account_bannerUserCnyBalance,account_bannerFreezeCnyBalance),account_bannerBorrowCnyBalance),account_bannerBinterestCny);
        //净资产BTC = 可用BTC + 冻结BTC - 借款BTC - 利息BTC
        var btc = DoubleUtil.subtract(DoubleUtil.subtract(Calculate.accAdd_z(account_bannerUserBtcBalance,account_bannerFreezeBtcBalance),account_bannerBorrowBtcBalance),account_bannerBinterestBtc);
        //净资产LTC = 可用LTC + 冻结LTC -借款LTC - 利息LTC
        var ltc = DoubleUtil.subtract(DoubleUtil.subtract(Calculate.accAdd_z(account_bannerUserLtcBalance,account_bannerFreezeLtcBalance),account_bannerBorrowLtcBalance),account_bannerBinterestLtc);
        //净资产eth = 可用 + 冻结
        var eth=Calculate.accAdd_z(account_bannerUserEthBalance,account_bannerFreezeEthBalance);
        btc = Calculate.accMul_z(btc, account_bannerBtcLast);
        ltc = Calculate.accMul_z(ltc, account_bannerLtcLast);
        eth = Calculate.accMul_z(eth, account_bannerEthLast);
        var account_uNetValue = Calculate.accAdd_z(Calculate.accAdd_z(Calculate.accAdd_z(cny,btc),ltc),eth);

        //净资产
        var account_netasset = Calculate.accAdd_z(Calculate.accAdd_z(account_uNetValue,account_lendValue)<0?0:Calculate.accAdd_z(Calculate.accAdd_z(account_uNetValue,account_lendValue),account_fundValue),account_Futureaccount);
        //总资产
        var account_allasset = Calculate.accAdd_z(Calculate.accAdd_z(Calculate.accAdd_z(account_tradeValue, account_lendValue),account_fundValue),account_Futureaccount);

        if(document.getElementById('futureaccount_bannerShow')!=null){
            document.getElementById('futureaccount_bannerShow').innerHTML=CommaFormatted(floor(account_Futureaccount,2),2);
        }
        if(document.getElementById('availableCny')!=null){
            //合约账户不做核算
            document.getElementById('availableCny').innerHTML=CommaFormatted(floor(account_bannerUserCnyBalance,2),2);
            document.getElementById('available.btc').innerHTML=flexibleNumber(account_bannerUserBtcBalance);
            document.getElementById('available.ltc').innerHTML=flexibleNumber(account_bannerUserLtcBalance);
            document.getElementById('available.eth').innerHTML=flexibleNumber(account_bannerUserEthBalance);

            document.getElementById('frozenCny').innerHTML=CommaFormatted(floor(account_bannerFreezeCnyBalance,2),2);
            document.getElementById('frozen.btc').innerHTML=flexibleNumber(account_bannerFreezeBtcBalance);
            document.getElementById('frozen.ltc').innerHTML=flexibleNumber(account_bannerFreezeLtcBalance);
            document.getElementById('frozen.eth').innerHTML=flexibleNumber(account_bannerFreezeEthBalance);

            document.getElementById('allasset').innerHTML=CommaFormatted(floor(account_allasset,2),2);
            document.getElementById('netasset').innerHTML=CommaFormatted(floor(account_netasset,2),2);
            document.getElementById('tradeValue').innerHTML=CommaFormatted(floor(account_tradeValue,2),2);
            //account_uNetValue 若净资产< 0 那么显示 0
            document.getElementById('uNetValue').innerHTML=CommaFormatted(floor((account_uNetValue<0?0:account_uNetValue),2),2);
            document.getElementById('trade.available.cny').innerHTML=CommaFormatted(floor(account_bannerUserCnyBalance,2),2);
            document.getElementById('trade.available.btc').innerHTML=flexibleNumber(account_bannerUserBtcBalance);
            document.getElementById('trade.available.ltc').innerHTML=flexibleNumber(account_bannerUserLtcBalance);
            document.getElementById('trade.available.eth').innerHTML=flexibleNumber(account_bannerUserEthBalance);
            document.getElementById('trade.frozen.cny').innerHTML=CommaFormatted(floor(account_bannerFreezeCnyBalance,2),2);
            document.getElementById('trade.frozen.btc').innerHTML=flexibleNumber(account_bannerFreezeBtcBalance);
            document.getElementById('trade.frozen.ltc').innerHTML=flexibleNumber(account_bannerFreezeLtcBalance);
            document.getElementById('trade.frozen.eth').innerHTML=flexibleNumber(account_bannerFreezeEthBalance);
            if(document.getElementById('asubtotalCny')!=null){
                document.getElementById('asubtotalCny').innerHTML=CommaFormatted(floor(account_asubtotalCnyValue,2),2);
                document.getElementById('asubtotalBtc').innerHTML=flexibleNumber(account_asubtotalBtcValue);
                document.getElementById('asubtotalEth').innerHTML=flexibleNumber(account_asubtotalEthValue);
                document.getElementById('asubtotalLtc').innerHTML=flexibleNumber(account_asubtotalLtcValue);
            }
            if(document.getElementById('fundValue_bannerShow')!=null){
                document.getElementById('fundValue_bannerShow').innerHTML = CommaFormatted(floor(account_fundValue,2),2);
            }
            if(document.getElementById('lendValue_bannerShow')!=null){
                document.getElementById('lendValue_bannerShow').innerHTML = CommaFormatted(floor(account_lendValue,2));
            }
        }
        var url = window.location.href;

        if(document.getElementById('canpush')!=null){

        }
        if(document.getElementById('canUseCny')!=null ){
            document.getElementById('canUseCny').innerHTML= CommaFormatted(floor(account_bannerUserCnyBalance,2),2);
        }
        if(document.getElementById('canBuyLTC')!=null){
            var canBuyLTC = '0.0000';
            if( push.ltclast !=0){
                canBuyLTC = CommaFormatted(floor(accDiv(account_bannerUserCnyBalance,account_bannerLtcLast),4),4);
                document.getElementById('canBuyLTC').innerHTML = canBuyLTC;
            }
        }
        if(document.getElementById('canSellLTC')!=null){
            document.getElementById('canSellLTC').innerHTML=CommaFormatted(floor(account_bannerUserLtcBalance,4),4);
        }
        if(document.getElementById('cangetLTCCny')!=null){
            var cangetLTCCny ="0.00"
            if( push.ltclast !=0) {
                cangetLTCCny = CommaFormatted(floor(accMul(floor(account_bannerUserLtcBalance,4), account_bannerLtcLast),2),2);
                document.getElementById('cangetLTCCny').innerHTML = cangetLTCCny;
            }
        }

        if(document.getElementById('canBuyETH')!=null){
            var canBuyETH = '0.00';
            if( push.ltclast !=0){
                canBuyETH = CommaFormatted(floor(accDiv(account_bannerUserCnyBalance,account_bannerEthLast),4),4);
                document.getElementById('canBuyETH').innerHTML = canBuyETH;
            }
        }

        if(document.getElementById('canSellETH') != null) {
            document.getElementById('canSellETH').innerHTML=CommaFormatted(floor(account_bannerUserEthBalance,4),4);
        }
        if(document.getElementById('canGetETHCny')!=null){
            var cangetETHCny ="0.00"
            if( push.ethlast !=0) {
                cangetETHCny = CommaFormatted(floor(accMul(floor(account_bannerUserEthBalance,4), account_bannerEthLast),2),2);
                document.getElementById('canGetETHCny').innerHTML = cangetETHCny;
            }
        }


        if(document.getElementById('userCnyBalance')!=null){
            document.getElementById('userCnyBalance').value=  account_bannerUserCnyBalance;
        }
        if(document.getElementById('canBuyBTC')!=null){
            var  canBuyBTC = '0.00';
            if( push.btclast !=0){
                canBuyBTC = CommaFormatted(floor(account_bannerUserCnyBalance/account_bannerBtcLast,4),4);
                document.getElementById('canBuyBTC').innerHTML = canBuyBTC;
            }
        }

        if(document.getElementById('canSellBTC')!=null){
            document.getElementById('canSellBTC').innerHTML=CommaFormatted(floor(account_bannerUserBtcBalance,4),4);
        }
        if(document.getElementById('canGetCny')!=null){

            if( account_bannerBtcLast !=0) {
                canGetCny = CommaFormatted(floor(accMul(account_bannerUserBtcBalance, account_bannerBtcLast), 2),2);
                document.getElementById('canGetCny').innerHTML = canGetCny;
            }
        }

        if(document.getElementById("canpush")!=null){
            _ChangeBalance();
        }
    }


    /***
     * @param _money_CanUse 可用Cny
     * @param _amount_CanBuy 可买Coin
     * @param coin_CanSell 可卖币
     * @param _money_CanSell 卖币可得
     * @private
     */
    function _ChangeBalance(){
        if(!islogin){
            return;
        }
        var _currentSymbol = document.getElementById('symbol').value;
        var _btc_last = Number(document.getElementById("bannerAccountBtcLast").value);
        var _ltc_last = Number(document.getElementById("bannerAccountLtcLast").value);
        var _eth_last = Number(document.getElementById("bannerAccountEthLast").value);
        var _btc_buy = Number(document.getElementById("bannerBtcBuy").value);
        var _btc_sell = Number(document.getElementById("bannerBtcSell").value);
        var _ltc_buy = Number(document.getElementById("bannerLtcBuy").value);
        var _ltc_sell = Number(document.getElementById("bannerLtcSell").value);
        var _eth_buy = Number(document.getElementById("bannerEthBuy").value);
        var _eth_sell = Number(document.getElementById("bannerEthSell").value);
        var _cny_balance = Number(document.getElementById("bannerUserCnyBalance").value);
        var _ltc_balance = Number(document.getElementById("bannerUserLtcBalance").value);
        var _btc_balance = Number(document.getElementById("bannerUserBtcBalance").value);
        var _eth_balance = Number(document.getElementById("bannerUserEthBalance").value);
        var _money_CanUse=0,_amount_CanBuy= 0,coin_CanSell= 0,_money_CanSell=0;
        // newCoinLabel
        if(_currentSymbol==0 || _currentSymbol=='0'){//btc
            _money_CanUse = floor(_cny_balance,2);
            coin_CanSell = floor(_btc_balance,4)
            if(_btc_last==0){
                _amount_CanBuy =0;
                _money_CanSell = 0;
            }else{
                _amount_CanBuy =floor(accDiv(floor(_cny_balance,2),_btc_last),4);
                _money_CanSell = floor(accMul(floor(_btc_balance,4),_btc_last),2);
            }
        }else if(_currentSymbol=='1' || _currentSymbol==1) {//ltc
            _money_CanUse = floor(_cny_balance, 2);
            coin_CanSell = floor(_ltc_balance, 4);

            if (_ltc_last == 0) {
                _amount_CanBuy = 0;
                _money_CanSell = 0;
            } else {
                _money_CanSell = floor(accMul(floor(_ltc_balance, 4), _ltc_last), 2);
                _amount_CanBuy = floor(accDiv(floor(_cny_balance, 2), _ltc_last), 4);
            }
        }else if(_currentSymbol=='2' || _currentSymbol==2) {//eth
            _money_CanUse = floor(_cny_balance, 2);
            coin_CanSell = floor(_eth_balance, 4);

            if (_eth_last == 0) {
                _amount_CanBuy = 0;
                _money_CanSell = 0;
            } else {
                _money_CanSell = floor(accMul(floor(_eth_balance, 4), _eth_last), 2);
                _amount_CanBuy = floor(accDiv(floor(_cny_balance, 2), _eth_last), 4);
            }
        }
        var tradeTypeValue = 0;
        if(document.getElementById('tradeType')!=null ){
            tradeTypeValue =  document.getElementById('tradeType').value;
        }
        if(_currentSymbol==0){
            if(tradeTypeValue==1){//sell btc
                if(document.getElementById("userBalance")!=null){
                    document.getElementById("userBalance").value=floor(_btc_balance,4);
                    document.getElementById("userCoinBalance").value=floor(_btc_balance,4);
                }
            }else if(tradeTypeValue==0){ //buy btc
                document.getElementById("nowPrice").value = push.btcsell;
                if(document.getElementById("userBalance")!=null){
                    document.getElementById("userBalance").value=floor(_cny_balance,4);
                }
            }
        }else if(_currentSymbol==1){
            if(tradeTypeValue==1){//sell btc
                if(document.getElementById("userBalance")!=null){
                    document.getElementById("userBalance").value=floor(_ltc_balance,4);
                    document.getElementById("userCoinBalance").value=floor(_ltc_balance,4);
                }
            }else if(tradeTypeValue==0){ //buy btc
                document.getElementById("nowPrice").value = push.ltcsell;
                if(document.getElementById("userBalance")!=null){
                    document.getElementById("userBalance").value=floor(_cny_balance,4);
                }
            }
        }else if(_currentSymbol==2){
            if(tradeTypeValue==1){//sell eth
                if(document.getElementById("userBalance")!=null){
                    document.getElementById("userBalance").value=floor(_eth_balance,4);
                    document.getElementById("userCoinBalance").value=floor(_eth_balance,4);
                }
            }else if(tradeTypeValue==0){ //buy eth
                document.getElementById("nowPrice").value = push.ethsell;
                if(document.getElementById("userBalance")!=null){
                    document.getElementById("userBalance").value=floor(_cny_balance,4);
                }
            }
        }
        if(document.getElementById("userCnyBalance")!=null){
            document.getElementById("userCnyBalance").value=_money_CanUse;
        }
        if(document.getElementById("cny")!=null){
            document.getElementById("cny").innerHTML=CommaFormatted(_money_CanUse,2);
        }
        if(document.getElementById("amount")!=null){
            document.getElementById("amount").innerHTML=CommaFormatted(_amount_CanBuy,4);
        }
        if(document.getElementById("klineuserBalance")!=null){
            document.getElementById("klineuserBalance").value=coin_CanSell;
        }
        if(document.getElementById("coinBalance")!=null){
            document.getElementById("coinBalance").innerHTML=CommaFormatted(coin_CanSell,4);
        }
        if(document.getElementById("klineuserCoinBalance")!=null){
            document.getElementById("klineuserCoinBalance").value=coin_CanSell;
        }
        if(document.getElementById("kmoney")!=null){
            document.getElementById("kmoney").innerHTML=CommaFormatted(_money_CanSell,2);
        }
    }

    //对外提供方法
    return {
        //----------------- 以下是推送方法 ----------------------
        wsRefreshTicker: new tickerManager(),
        /**
         * websocket方式更新个人信息
         * （交易中心，行情图表 中使用）
         * */
        wsRefreshUserInfo: function(data) {
            trade_injectUserParam(userInfoFormatToOldSocketFormat(data));
        },
        //----------------- 以下是轮询方法 ----------------------
        // 【公共】更新banner
        ajaxRefreshTicker: function() {
            var symbol = Number(document.getElementById("symbol").value);
            jQuery.post("/real/ticker.do?random="+Math.round(Math.random()*100),{symbol:symbol},function(ticker){
                if(!!ticker){
                    var btcLast = ticker.btcLast;
                    var ltcLast = ticker.ltcLast;
                    var ethLast = ticker.ethLast;
                    var btcVol = ticker.btcVolume;
                    var ltcVol = ticker.ltcVolume;
                    var ethVol = ticker.ethVolume;
                    push.ltclast = ticker.ltcLast;
                    push.btclast = ticker.btcLast;
                    push.ethlast = ticker.ethLast;
                    switch(symbol){
                        case 0:
                            push.btcsell = ticker.sell;
                            push.btcbuy = ticker.buy;
                            break;
                        case 1:
                            push.ltcsell = ticker.sell ;
                            push.ltcbuy = ticker.buy ;
                            break;
                        case 2:
                            push.ethbuy = ticker.buy;
                            push.ethsell = ticker.sell;
                            break;
                    }
                    jQuery("#bannerAccountBtcLast").val(btcLast);
                    jQuery("#bannerAccountLtcLast").val(ltcLast);
                    jQuery("#bannerAccountEthLast").val(ethLast);
                    if(btcLast!=0){
                        if(document.getElementById("bannerBtcLast")!=null){
                            document.getElementById("bannerBtcLast").innerHTML=Calculate.CommaFormattedByOriginal(Number(btcLast).toFixed(symbolSubPaltPoint(0)) + "");
                        }
                        jQuery(".indexBtcPrice").html(Calculate.CommaFormattedByOriginal(btcLast));
                    }
                    if(ltcLast!=0){
                        if(document.getElementById("bannerLtcLast")!=null){
                            document.getElementById("bannerLtcLast").innerHTML=CommaFormattedByOriginal(Number(ltcLast).toFixed(symbolSubPaltPoint(1)) + "");
                        }
                        jQuery(".indexLtcPrice").html(CommaFormattedByOriginal(ltcLast));
                    }
                    if(ethLast!=0 && ethLast!=null){
                        if(document.getElementById("bannerEthLast")!=null){
                            document.getElementById("bannerEthLast").innerHTML=CommaFormattedByOriginal(Number(ethLast).toFixed(symbolSubPaltPoint(2)) + "");
                        }
                        jQuery(".indexEthPrice").html(CommaFormattedByOriginal(ethLast));
                    }
                    if(btcVol!=0){
                        if(document.getElementById("bannerBtcVol")!=null){
                            document.getElementById("bannerBtcVol").innerHTML=formatValue(btcVol);
                        }
                        jQuery(".indexBtcVolume").html(CommaFormattedByOriginal(btcVol));
                    }
                    if(ltcVol!=0){
                        if(document.getElementById("bannerLtcVol")!=null){
                            document.getElementById("bannerLtcVol").innerHTML=formatValue(ltcVol);
                        }
                        jQuery(".indexLtcVolume").html(CommaFormattedByOriginal(ltcVol));
                    }
                    if(ethVol!=0 && ethVol!=null){
                        if(document.getElementById("bannerEthVol")!=null){
                            document.getElementById("bannerEthVol").innerHTML=formatValue(ethVol);
                        }
                        jQuery(".indexEthVolume").html(CommaFormattedByOriginal(ethVol));
                    }

                    /*行情下单刷新人民币，比特币余额   start*/
                    if(document.getElementById("marketIsUpdate") !=null){
                        if(document.getElementById("nowPrice")!=null){
                            document.getElementById("nowPrice").value=ticker.buy;
                        }
                        if(document.getElementById("snowPrice")!=null){
                            document.getElementById("snowPrice").value=ticker.sell;
                        }
                    }
                    /* end */
                    //更新首页大图成交量
                    if(document.getElementById("indexVol")!=null){
                        document.getElementById("indexVol").innerHTML=btcVol;
                    }
                    if(document.getElementById("indexLtcVol")!=null){
                        if(ltcVol != "" && ltcVol.length > 10){
                            var index = ltcVol.indexOf(".");
                            if(index >5){
                                ltcVol = ltcVol.substring(0,index);
                            }
                        }
                        document.getElementById("indexLtcVol").innerHTML=ltcVol;
                    }
                    //更新行情页最新价格
                    if(document.getElementById("marketLast")!=null){
                        var last = ticker.last+"";
                        if(!!document.title&& last!=0&&!isfuture()){
                            var oldTitle = document.title;
                            var arrs  =oldTitle.split("-");
                            var newTitle = "";
                            var info = SYMBOLS_UTIL.symbolStr[Number(ticker.symbol)];
                            if(arrs.length==3){
                                if(coincommonjs41==arrs[1]){
                                    newTitle = info+cnyOrUsdSymbol+last+"-"+coincommonjs41+"-"+arrs[2];
                                }else{
                                    newTitle = info+cnyOrUsdSymbol+last+"-"+coincommonjs41+"-"+arrs[1]+"-"+arrs[2];
                                }
                            }else if(arrs.length==4){
                                newTitle = info+cnyOrUsdSymbol+last+"-"+coincommonjs41+"-"+arrs[2]+"-"+arrs[3];
                            }else if(arrs.length==2){
                                newTitle = info+cnyOrUsdSymbol+last+"-"+coincommonjs41+"-"+arrs[0]+"-"+arrs[1];
                            }else if(arrs.length==1){
                                newTitle = info+cnyOrUsdSymbol+last+"-"+coincommonjs41+"-"+arrs[0];
                            }
                            document.title = newTitle;
                        }
                    }else{
                        if(!!document.title && !isSpider()&&btcLast!=0&&ltcLast!=0&&ethLast!=0&&!isfuture()){
                            var oldTitle = document.title;
                            var arrs  =oldTitle.split("-");
                            if(arrs.length > 0){
                                oldTitle = arrs[arrs.length-1];
                            }
                            var url=document.location.href;
                            if(url.indexOf("futureFull.do")==-1){
                                switch(symbol){
                                    case 0:
                                        document.title = SYMBOLS_UTIL.symbolStr[symbol]+cnyOrUsdSymbol+btcLast+"-"+oldTitle;
                                        break;
                                    case 1:
                                        document.title = SYMBOLS_UTIL.symbolStr[symbol]+cnyOrUsdSymbol+ltcLast+"-"+oldTitle;
                                        break;
                                    case 2:
                                        document.title = SYMBOLS_UTIL.symbolStr[symbol]+cnyOrUsdSymbol+ticker.ethLast+"-"+oldTitle;
                                        break;
                                }
                            }

                        }
                    }
                }
            },"JSON");
        },
        //  ajax方式更新个人信息
        ajaxRefreshUserInfo: function() {
            var url = "/trade/freshUserInfo.do";
            jQuery.post(url, function (data) {
                if (!data) {
                    return;
                }
                bannerUserAccountPolling(data);
                AccountingUserAccountInfo();
                if (document.getElementById("canpush") != null) {
                    _ChangeBalance();
                }
            },"json");
        },
        getChannelsBySymbol: function (webSocket, symbol, site_flag, depth, newMergeType, oldMergeType) {
            var newDepthType = '';
            var oldDepthType = '';
            var method = 'getSpotDepth5';
            if (depth === 200) {
                method = 'getSpotDepth200';
            }

            if (symbol == 0) {
                if (site_flag == 1) {// btc国内三档
                    var depthArrByType = ['', '1.0', '0.1'];
                    newDepthType = webSocket.Utils[method](depthArrByType[+newMergeType]);
                    if (oldMergeType || oldMergeType === 0) {
                        oldDepthType = webSocket.Utils[method](depthArrByType[+oldMergeType]);
                    }
                } else { // btc国际两档 0.2
                    if (newMergeType == 1) {
                        newDepthType = webSocket.Utils[method]('0.2');
                        oldDepthType = webSocket.Utils[method]();
                    } else {
                        newDepthType = webSocket.Utils[method]();
                        oldDepthType = webSocket.Utils[method]('0.2');
                    }
                }
            } else if (symbol == 1 && site_flag == 2) {
                if (newMergeType == 1) {
                    newDepthType = webSocket.Utils[method]('0.01');
                    oldDepthType = webSocket.Utils[method]();
                } else {
                    newDepthType = webSocket.Utils[method]();
                    oldDepthType = webSocket.Utils[method]('0.01');
                }
            } else {
                if (newMergeType == 1) {
                    newDepthType = webSocket.Utils[method]('0.1');
                    oldDepthType = webSocket.Utils[method]();
                } else {
                    newDepthType = webSocket.Utils[method]();
                    oldDepthType = webSocket.Utils[method]('0.1');
                }
            }
            return {
                new: newDepthType,
                old: oldDepthType
            }
        }
    }
})();