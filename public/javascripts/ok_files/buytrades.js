/**
 * 撤销委托
 * @param entrustId
 */
function cancelEntrust(entrustId,type){
    var symbol = document.getElementById("symbol").value;
    var sign = SYMBOLS_UTIL.symbolStr[symbol];
    var url = "/trade/cancelEntrust.do?random="+Math.round(Math.random()*100);
    var param={entrustId:entrustId,symbol:symbol,isMarket:1};
    if(document.getElementById("tradeType") != null){
        type = document.getElementById("tradeType").value;
    }
    jQuery.post(url,param,function(data){
        var result = eval('(' + data + ')');
        if(result!=null){
        	if(data==-200){
        		if(jQuery("#entrustStatus"+entrustId).parent().children(".red").length==1){
        			//卖单撤销在卖币的地方提示
        			klinealertTipsSpan(get$("youfreezebymastercancel"));
        		}else{
        			alertTipsSpan(get$("youfreezebymastercancel"));
        		}
        	}else if(data==-10){
                alertTipsSpan(get$("reBackMoney"));
            }else{
	            handleTicker();
        	}
        }
    });
}
function tradeTurnoverValue(){
    tradeTurnoverValue(0,null);
}
//type :0 默认 type=1 price type=2 amount
function tradeTurnoverValue(type,event){
    var isreturn = ctrlAorTab(event);
    if(isreturn){
        return;
    }
    var tradeType = document.getElementById("tradeType").value;
    var symbol = document.getElementById("symbol").value;
    var tradeAmount = 0;
    var tradeCnyPrice = 0;
    if(type == 2){
        var  amountSelectionStart = getPositionForInput(document.getElementById("tradeAmount"));
        tradeAmount = document.getElementById("tradeAmount").value= checkNumberByName("tradeAmount");
        setCursorPosition(document.getElementById("tradeAmount"),amountSelectionStart);
    }else{
        tradeAmount = document.getElementById("tradeAmount").value;
    }
    if(type == 1){
        var  priceSelectionStart = getPositionForInput(document.getElementById("tradeCnyPrice"));
        tradeCnyPrice =document.getElementById("tradeCnyPrice").value =  checkNumberByName("tradeCnyPrice");
        setCursorPosition(document.getElementById("tradeCnyPrice"),priceSelectionStart);
    }else{
        tradeCnyPrice =document.getElementById("tradeCnyPrice").value;
    }

    var turnover = tradeAmount*tradeCnyPrice;
    if(turnover!= null && turnover.toString().split(".")!=null && turnover.toString().split(".")[1] != null && turnover.toString().split(".")[1].length>4){
        turnover=turnover.toFixed(4);
    }
    document.getElementById("tradeTurnover").value = turnover;
    var userBalance = 0, userBalanceBorrowAll = -1;
    if(document.getElementById("userBalance")!=null){
        userBalance = document.getElementById("userBalance").value;
        userBalanceBorrowAll = accAdd_z(userBalance, getCanBorrowAmount(tradeType));
    }
    if(tradeType ==0){
        var tradeTurnover = tradeAmount*tradeCnyPrice;
        if(Number(userBalanceBorrowAll) >= 0 && Number(userBalanceBorrowAll) < Number(tradeTurnover)){
            alertTipsSpan(buytradejs1);
        }else{
            clearTipsSpan();
        }
        showNeedBorrowAmount(symbol, tradeType, userBalance, tradeTurnover);
    }else{
        if(Number(userBalanceBorrowAll) >= 0 && Number(userBalanceBorrowAll) < Number(tradeAmount)){
            //newCoinLabel
            if(symbol == 0) {
                alertTipsSpan(buytradejs2);
            }else if (symbol == 1) {
                alertTipsSpan(buytradejs3);
            }
        }else{
            clearTipsSpan();
        }
        showNeedBorrowAmount(symbol, tradeType, userBalance, tradeAmount);
    }
}
var check = 1;
function submitTradeBtcForm(){
    if(check == 2){
        return;
    }
    var isLogin = document.getElementById("isLogin").value;
    if(isLogin==0){
        showlogin(0);
        return;
    }
    var tradeAmount =document.getElementById("tradeAmount").value;
    var tradeCnyPrice =document.getElementById("tradeCnyPrice").value;
    var tradePwd = trim(document.getElementById("tradePwd").value);
    var tradeType = document.getElementById("tradeType").value;
    var symbol = document.getElementById("symbol").value;
    var isopen = document.getElementById("isopen").value;
    var islimited = document.getElementById("limitedType").checked;
    var limited = 0;
    var userBalance = document.getElementById("userBalance").value;
    var limitedMoney = Number(document.getElementById("limitedMoney").value);
    var openBorrow = (tradeType == 0 ? jQuery('#borrowCnySwitch').val() == 1 : jQuery('#borrowBtcSwitch').val() == 1);

    var isOpenBorrowAndNeed = false;
    if (!islimited) {
        isOpenBorrowAndNeed = openBorrow && isNeedBorrowAndTrade(tradeType, 0, tradeCnyPrice, tradeAmount, symbol);
    } else {
        isOpenBorrowAndNeed = openBorrow && isNeedBorrowAndTrade(tradeType, 1, tradeCnyPrice, limitedMoney, symbol);
    }
    if (isOpenBorrowAndNeed) {
        if (tradeType == 0) {
            userBalance = accAdd(Number(userBalance), Number(jQuery('#cnyCanBorrow').val()));
        } else {
            userBalance = accAdd(Number(userBalance), Number(jQuery('#btcCanBorrow').val()));
        }
    }
    if(!islimited){
        if(tradeType ==0){
            var tradeTurnover = accMul(tradeAmount, tradeCnyPrice);
            if(Number(userBalance) <  Number(tradeTurnover)){
                alertTipsSpan(buytradejs1);
                return;
            }else{
                clearTipsSpan();
            }
        }else{
            if(Number(userBalance) <  Number(tradeAmount)){
                //newCoinLabel
                if(symbol == 0){
                    alertTipsSpan(buytradejs2);
                }else if(symbol == 1){
                    alertTipsSpan(buytradejs3);
                }
                return;
            }else{
                clearTipsSpan();
            }
        }
        var reg = new RegExp("^[0-9]+\.{0,1}[0-9]{0,8}$");
        if(!reg.test(tradeAmount) ){
            alertTipsSpan(buytradejs4);
            return;
        }else{
            clearTipsSpan();
        }
        //newCoinLabel
        if(symbol==0 && tradeAmount < 0.01){
            alertTipsSpan(buytradejs6);
            return;
        }else if(symbol==1 && tradeAmount < 0.1){
            alertTipsSpan(buytradejs5);
            return;
        }else{
            clearTipsSpan();
        }
        if(!reg.test(tradeCnyPrice) ){
            alertTipsSpan(buytradejs7);
            return;
        }else{
            clearTipsSpan();
        }
    }else{
        limited = 1;
        if(tradeType == 0) {
            var nowPrice = 0;
            //newCoinLabel
            if (symbol == 0) {
                nowPrice = accMul(0.01, Number(document.getElementById("nowPrice").value));
            } else if(symbol == 1){
                nowPrice = accMul(0.1,Number(document.getElementById("nowPrice").value));
            }
            if(limitedMoney < nowPrice){
                //newCoinLabel
                if(symbol == 0){
                    alertTipsSpan(buytradejs21);
                }else if(symbol == 1){
                    alertTipsSpan(buytradejs22);
                }
                return;
            }
        }else{
            //newCoinLabel
            if(symbol == 0){
                if(limitedMoney < 0.01){
                    alertTipsSpan(selltradejs1);
                    return;
                }
            }else if(symbol == 1){
                if(limitedMoney < 0.1){
                    alertTipsSpan(selltradejs2);
                    return;
                }
            }
        }
        if(tradeType ==0){
            if (Number(userBalance) <  limitedMoney){
                alertTipsSpan(buytradejs1);
                return;
            }else{
                clearTipsSpan();
            }
            tradeCnyPrice = limitedMoney;
        }else{
            if(Number(userBalance) <  limitedMoney){
                //newCoinLabel
                if(symbol == 0){
                    alertTipsSpan(buytradejs2);
                }else if(symbol == 1){
                    alertTipsSpan(buytradejs3);
                }
                return;
            }else{
                clearTipsSpan();
            }
        }
        tradeAmount = limitedMoney;
    }
    if(tradePwd == "" && isopen == 0){
        alertTipsSpan(entertransactionpassword);
        return;
    }else{
        document.getElementById("tradeBtcTips").style.display="";
        document.getElementById("tradeBtcTips").innerHTML="&nbsp;";
    }
    tradePwd = isopen==1?"":tradePwd;
    var param={tradeAmount:tradeAmount,tradeCnyPrice:tradeCnyPrice,tradePwd:tradePwd,symbol:symbol,limited:limited,isMarket:1};
    
    var url = "";
    if (isOpenBorrowAndNeed) {
        url = "/trade/borrowAndTrade.do";
        param.tradeType = tradeType + 1;
    } else {
        if (tradeType == 0) {
            url = "/trade/buyBtcSubmit.do?random=" + Math.round(Math.random() * 100);
        } else {
            url = "/trade/sellBtcSubmit.do?random=" + Math.round(Math.random() * 100);
        }
    }


    var lastPrice = 0 ;
    //newCoinLabel
    if(symbol == 0 ){
        lastPrice = jQuery("#bannerAccountBtcLast").val();
    }else if(symbol == 1){
        lastPrice = jQuery("#bannerAccountLtcLast").val();
    }

    if(!islimited){
        var callback = {okBack:function(){
            submitTradeBtcForm_post(url,param,symbol,isOpenBorrowAndNeed);
        },noBack:void(0)};


        var rate = accDiv(tradeCnyPrice,lastPrice);

        if(tradeType == 0 && rate >= 1.02){
            okcoinAlert(get$("tradeorderbuyalert"),true,callback);
            return ;
        }

        if(tradeType == 1 && rate <= 0.98){
            okcoinAlert(get$("tradeordersellalert"),true,callback);
            return ;
        }
    }

    submitTradeBtcForm_post(url,param,symbol,isOpenBorrowAndNeed);
}


function submitTradeBtcForm_post(url,param,symbol,isOpenBorrowAndNeed){
    check = 2;
    //开启且可用钱不够，要借钱
    waitingStation("btnA",insubmiting);
    disabledStation("klinebtnA");
    var tradeType = jQuery("#tradeType").val();
    jQuery.post(url,param,function(data){
        var json = eval('(' + data + ')');
        if(json==null){
            return ;
        }
        var result = json.result;
        if(result==null){
            result = eval('(' + data + ')');
        }
        if(result!=null){
            if(result.resultCode != 0){
                check = 1;
            }
            if (isOpenBorrowAndNeed) {
                refreshBorrowAndTradeData(symbol, tradeType);
                var btnId = "btnA";
                if (result.resultCode < -20000) {
                    result.resultCode = result.resultCode + 20000;
                    waitingStationStatic(btnId, ordering);
                    setTimeout(function () {
                        clearWaitingStation(btnId, buyin);
                    }, 500);
                } else if (result.resultCode < -10000) {
                    waitingStationStatic(btnId, borrowFail);
                    var res = result.resultCode + 10000;
                    jQuery('#' + btnId).val(borrowFail);
                    if (res == -7) {
                        alertTipsSpan(get$("margintrading11"));
                    } else if (res == -15) {
                        alertTipsSpan(youHaveOtcOrder);
                    } else if (res == -17) {
                        experienceBack();
                    } else {
                        alertTipsSpan(borrowFail);
                    }
                    setTimeout(function () {
                        clearWaitingStation(btnId, buyin);
                    }, 500);
                    return;
                } else {
                    waitingStationStatic(btnId, ordering);
                    setTimeout(function () {
                        clearWaitingStation(btnId, buyin);
                    }, 500);
                }
            }
            if(result.resultCode == -1){
                if(tradeType ==0){
                    //newCoinLabel
                    if(symbol==1) alertTipsSpan(buytradejs9);
                    else if(symbol==0) alertTipsSpan(buytradejs8);
                }else{
                    //newCoinLabel
                    if(symbol==1) alertTipsSpan(selltradejs4);
                    else if (symbol == 0) alertTipsSpan(selltradejs3);
                }
            }else if(result.resultCode == -2){
                if(result.errorNum == 0){
                    alertTipsSpan(buytradejs10);
                }else{
                    alertTipsSpan(buytradejs11+youhave+result.errorNum+attemptsleft);
                }
                if(document.getElementById("tradePwd") != null){
                    document.getElementById("tradePwd").value = "";
                }
            }else if(result.resultCode == -3){
                alertTipsSpan(buytradejs13);
            }else if(result.resultCode == -4){
                alertTipsSpan(buytradejs14);
            }else if(result.resultCode == -5){
                alertTipsSpan(buytradejs15);
            }else if(result.resultCode == -6){
                okcoinAlert(buytradejs16,null,null,"");
            }else if(result.resultCode == -7){
                alertTipsSpan(buytradejs17);
            }else if(result.resultCode == -8){
                alertTipsSpan(entertransactionpassword);
            }else if(result.resultCode == -10){
                alertTipsSpan(get$("reBackMoney"));
            }else if(result.resultCode == 0){

                if(typeof(isConnect) == 'undefined' || !isConnect){
                    refreshTradeOrders();
                }
                var open = json.isOpen;
                if(open==1){
                    document.getElementById("isopen").value= open;
                    document.getElementById("klineisopen").value= open;
                    document.getElementById("tradePwdLi").style.display="none";
                    document.getElementById("klinetradePwdLi").style.display="none";
                }
                alertTipsSpan(buytradejs18);
                check=1;
                //buyChangeBalance(); suguagnqiang
                document.getElementById("tradePwd").value="";
                document.getElementById("tradeAmount").value="";
                document.getElementById("tradeTurnover").value="";
                document.getElementById("limitedMoney").value="";
                AccountingUserAccountInfo();
                tradeTurnoverValue_borrow(symbol, tradeType);
                setTimeout("clearTipsSpan()", "5000");
            }else if(result.resultCode == 2){
                alertTipsSpan(buytradejs19);
            }else if(result.resultCode == -200){
            	alertTipsSpan(get$("youfreezebymasterxia"));
            }else if(result.resultCode == 3){
                alertTipsSpan(buytradejs20);
            }else if (result.resultCode == -97) {
                alertTipsSpan(get$("tradesmallamountmore"));
            }
        }
    });
    clearWaitingStation("btnA",immediatelybuy);
    clearDisabledStation("klinebtnA");
    // 一键杠杆
    if (isOpenBorrowAndNeed) {
        waitingStation("btnA", borrowing);
    }
    
}
function buyChangeBalance(){


    var cnyBalance = Number(document.getElementById("bannerUserCnyBalance").value);
    var _current_symbol = document.getElementById('symbol').value;
    var coin = 0;
    //newCoinLabel
    if(_current_symbol==0){
        coin = document.getElementById("bannerUserBtcBalance").value
    }else if (_current_symbol == 1) {
        coin = document.getElementById("bannerUserLtcBalance").value;
    }
    var coinBalance =Number(coin);
    var buyAmount =Number(document.getElementById("tradeAmount").value);
    var buyTurnover = Number(document.getElementById("tradeTurnover").value);
    var islimited = document.getElementById("limitedType").checked;
    if(!islimited){
        var money = accAdd(cnyBalance,-buyTurnover);
        var amount =accAdd(coinBalance, -buyAmount);
        money = subPoint2(money);
        document.getElementById("userBalance").value=money;
        document.getElementById("userCnyBalance").value=money;
        document.getElementById("cny").innerHTML=money;
        document.getElementById("amount").innerHTML=amount;
    }else{
        var limitedMoney = Number(document.getElementById("limitedMoney").value);
        var price = document.getElementById("snowPrice").value;
        var money = accAdd(cnyBalance, -limitedMoney);
        var amount =subPoint(money/price);
        money = subPoint2(money);
        amount= subPoint(amount);
        document.getElementById("userBalance").value=money;
        document.getElementById("userCnyBalance").value=money;
        document.getElementById("cny").innerHTML=money;
        document.getElementById("amount").innerHTML=amount;


    }
}
function clearTipsSpan(){
    document.getElementById("tradeBtcTips").style.display="";
    document.getElementById("tradeBtcTips").innerHTML="";
}

function alertTipsSpan(tips){
    document.getElementById("tradeBtcTips").style.display="";
    document.getElementById("tradeBtcTips").innerHTML=tips;
    setTimeout(function(){
        document.getElementById("tradeBtcTips").innerHTML="";
    },5000);
}

function summoneyValue(event){
    var isreturn = ctrlAorTab(event);
    if(isreturn){
        return;
    }
    var tradeType = document.getElementById("tradeType").value;
    var symbol = document.getElementById("symbol").value;
    var  turnoverSelectionStart = getPositionForInput(document.getElementById("tradeTurnover"));
    var tradeTurnover = document.getElementById("tradeTurnover").value=checkNumberByName("tradeTurnover");
    setCursorPosition(document.getElementById("tradeTurnover"),turnoverSelectionStart);
    var tradeCnyPrice = document.getElementById("tradeCnyPrice").value;
    var tradeAmount =document.getElementById("tradeAmount").value;
    if(tradeCnyPrice!=0){
        tradeAmount = tradeTurnover/tradeCnyPrice;
    }else {
        tradeAmount = 0;
    }
    if(tradeAmount!= null && tradeAmount.toString().split(".")!=null &&tradeAmount.toString().split(".")[1] != null && tradeAmount.toString().split(".")[1].length>4){
        tradeAmount=tradeAmount.toFixed(5);
        tradeAmount = tradeAmount.substring(0, tradeAmount.length-1);
    }
    document.getElementById("tradeAmount").value=tradeAmount;
    var reg=/^(-?\d*)\.?\d{1,4}$/;
    if(tradeTurnover!=null && tradeTurnover.toString().split(".")!=null && tradeTurnover.toString().split(".")[1]!=null && tradeTurnover.toString().split(".")[1].length>4){
        if(!reg.test(tradeTurnover)){
            document.getElementById("tradeTurnover").value = tradeTurnover.substring(0, tradeTurnover.length-1);
            return false;
        }
    }
    var userBalance = 0, userBalanceBorrowAll = -1;
    if(document.getElementById("userBalance")!=null){
        userBalance = document.getElementById("userBalance").value;
        userBalanceBorrowAll = accAdd_z(userBalance, getCanBorrowAmount(tradeType));
    }
    if(tradeType ==0){
        if(Number(userBalanceBorrowAll) >= 0 && Number(userBalanceBorrowAll) < Number(tradeTurnover)){
            alertTipsSpan(buytradejs1);
        }else{
            clearTipsSpan();
        }
        showNeedBorrowAmount(symbol, tradeType, userBalance, tradeTurnover);
    }else{
        if(Number(userBalanceBorrowAll) >= 0 && Number(userBalanceBorrowAll) < Number(tradeAmount)){
            //newCoinLabel
            if(symbol == 0){
                alertTipsSpan(buytradejs2);
            }else if(symbol == 1){
                alertTipsSpan(buytradejs3);
            }
        }else{
            clearTipsSpan();
        }
        showNeedBorrowAmount(symbol, tradeType, userBalance, tradeAmount);
    }
}

function limitedSummoneyValue(){
    var limitedMoney = document.getElementById("limitedMoney");
    var tradeType = document.getElementById("tradeType").value;
    var length = tradeType==0?2:4;
    var priceSelectionStart = getPositionForInput(limitedMoney);
    var money =limitedMoney.value=(function (a) {return a.length > 1 ? a.shift().replace(/\D/g, '') + '.' + a.join('').replace(/\D/g, '').slice(0, length) : a[0].replace(/\D/g,'');})(limitedMoney.value.split('.'));
    setCursorPosition(limitedMoney,priceSelectionStart);
    var symbol = document.getElementById("symbol").value;
    if(tradeType == 0){
        var userBalance = Number(document.getElementById("userCnyBalance").value);
        var userBalanceBorrowAll = accAdd_z(userBalance, getCanBorrowAmount(tradeType));
        if(Number(money) > Number(userBalanceBorrowAll)){
            alertTipsSpan(buytradejs1);
        }else{
            clearTipsSpan();
        }
        showNeedBorrowAmount(symbol, tradeType, userBalance, money);
    }else{
        var coinBalance = Number(document.getElementById("userCoinBalance").value);
        var coinBalanceBorrowAll = accAdd_z(coinBalance, getCanBorrowAmount(tradeType));
        if(Number(money) > Number(coinBalanceBorrowAll)){
            //newCoinLabel
            if(symbol == 0){
                alertTipsSpan(buytradejs2);
            }else if(symbol == 1){
                alertTipsSpan(buytradejs3);
            }
        }else{
            clearTipsSpan();
        }
        showNeedBorrowAmount(symbol, tradeType, coinBalance, money);
    }
}

function getEntrust(){
    var status =  document.getElementById("selectedStatus").value;
    window.location.href = "/trade/entrust.do?status="+status;
}

function buyautoTrade(index){
    document.getElementById("slimitedType").checked = "";
    slimitedTypeChange();
    var priceNum = 0;
    var amountNum = 0;
    var tradeType = document.getElementById("tradeType").value;

    var name = "buy";

    var priceName = name+"Price"+index;
    priceNum =	Number(document.getElementById(priceName).value);
    for ( var i = 1; i <= index; i++) {
        var amountName = name+"Amount"+i;
        var amount = Number(document.getElementById(amountName).value);
        amountNum = accAdd(amountNum,amount);
    }
    var money = Number(document.getElementById("klineuserBalance").value);
    var moneyNum = amountNum * priceNum;

    var reg=/^(-?\d*)\.?\d{1,4}$/;
    if(money!=null && money.toString().split(".")!=null && money.toString().split(".")[1]!=null && money.toString().split(".")[1].length>4){
        if(!reg.test(money)){
            var end =  money.toString().split(".")[1];
            if(end.length>4){
                end = end.substring(0, 4);
            }
            money = money.toString().split(".")[0]+"."+end;
        }
    }
    amountNum = round(amountNum,4);
    if(money < amountNum){
        document.getElementById("klinetradeAmount").value = money;
        document.getElementById("klinetradeCnyPrice").value = priceNum;
        klinetradeTurnoverValue();
    }else{
        document.getElementById("klinetradeCnyPrice").value = priceNum;
        document.getElementById("klinetradeAmount").value = amountNum;
        klinetradeTurnoverValue();
    }

}
function antoTurnover(money){
    var reg=/^(-?\d*)\.?\d{1,2}$/;
    if(money!=null && money.toString().split(".")!=null && money.toString().split(".")[1]!=null && money.toString().split(".")[1].length>2){
        if(!reg.test(money)){
            var end =  money.toString().split(".")[1];
            if(end.length>2){
                end = end.substring(0, 2);
            }
            money = money.toString().split(".")[0]+"."+end;
        }
    }
    document.getElementById("tradeTurnover").value = money;
    document.getElementById("limitedMoney").value = money;
    summoneyValue(null);
}
function buyantoTurnover(){
    money = document.getElementById("userCnyBalance").value;
    var reg=/^(-?\d*)\.?\d{1,2}$/;
    if(money!=null && money.toString().split(".")!=null && money.toString().split(".")[1]!=null && money.toString().split(".")[1].length>2){
        if(!reg.test(money)){
            var end =  money.toString().split(".")[1];
            if(end.length>2){
                end = end.substring(0, 2);
            }
            money = money.toString().split(".")[0]+"."+end;
        }
    }
    document.getElementById("tradeTurnover").value = money;
    document.getElementById("limitedMoney").value = money;
    summoneyValue(null);
}
// 全部买入，可能加了杠杆
function buyantoTurnoverBorrow(){
    // 获得融资融币开关的状态
    var tradeType = 0;
    var borrowSwitch = getBorrowSwitch(tradeType);
    if(borrowSwitch==1) {
        var money = document.getElementById("userBalance").value;
        money = accAdd_z(floor(money, 4), getCanBorrowAmount(tradeType));
        antoTurnover(money);
    }else{
        buyantoTurnover();
    }
}
function antoAmount(money){
    var reg=/^(-?\d*)\.?\d{1,4}$/;
    if(money!=null && money.toString().split(".")!=null && money.toString().split(".")[1]!=null && money.toString().split(".")[1].length>4){
        if(!reg.test(money)){
            var end =  money.toString().split(".")[1];
            if(end.length>4){
                end = end.substring(0, 4);
            }
            money = money.toString().split(".")[0]+"."+end;
        }
    }
    document.getElementById("tradeAmount").value = money;
    document.getElementById("limitedMoney").value = money;
    tradeTurnoverValue();
}
function updateSecond(){
    var second = document.getElementById("updateSecond").value;
    var secondCookie = new CookieClass();
    secondCookie.setCookie("REFRESH_HANDLEENTRUST_TIME", second);
    if(entrustTime != null){
        clearTimeout(entrustTime);
    }
    if(updateTime != null){
        clearInterval(updateTime);
    }
    updateNumber = second/1000-1;
    updateTime = setInterval(updateNumberFun, 1000);
    entrustTime = setTimeout("handleEntrust("+second+")", second);
}
function autoSecond(time){
    var updateSecond = document.getElementById("updateSecond");
    for(var i=0;i<updateSecond.options.length;i++){
        if(updateSecond.options[i].value == time){
            updateSecond.options[i].selected = true;
            break;
        }
    }
    entrustTime = setTimeout("handleEntrust("+time+")", time);
    updateNumber = time/1000-1;
    if(updateTime != null){
        clearInterval(updateTime);
    }
    updateTime = setInterval(updateNumberFun, 1000);
}
function limitedTypeChange(){
    if(document.getElementById("limitedType").checked){
        document.getElementById("treadBuyContTextDiv").style.display = "none";
        document.getElementById("treadBuyContDiv").style.display = "none";
        document.getElementById("limitedDiv").style.display = "";
    }else{
        document.getElementById("treadBuyContTextDiv").style.display = "";
        document.getElementById("treadBuyContDiv").style.display = "";
        document.getElementById("limitedDiv").style.display = "none";
    }
}
function onPortion(portion){
    var tradeType = document.getElementById("tradeType").value;
    // 获得融资融币开关的状态
    var borrowSwitch = getBorrowSwitch(tradeType);
    if(tradeType == 0){
        var money = Number(document.getElementById("userCnyBalance").value);
        if(borrowSwitch==1) {
            money = accAdd_z(money, getCanBorrowAmount(tradeType));
        }
        var portionMoney = accMul(money,portion);
        antoTurnover(portionMoney);
    }else{
        var money = Number(document.getElementById("userCoinBalance").value);
        if(borrowSwitch==1) {
            money = accAdd_z(money, getCanBorrowAmount(tradeType));
        }
        var portionMoney = accMul(money,portion);
        antoAmount(portionMoney);
    }
}