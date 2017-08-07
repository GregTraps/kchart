var gobal_talk="TALK_ON";
var md5_code=jQuery("#md5_code").val();
var gobal_talk_nike_name=md5_code;
var languageType=jQuery("#languageType").val();
var random=jQuery("#random").val();
function setCookieValue(name,value,time){
    var real_time=-1;
    if(!!time){
        real_time=time;
    }
    var cookie = new CookieClass();
    cookie.expires=real_time;
    cookie.setCookie(name,value);
}
/**
 * 获取cookie值
 * @param name
 * @returns {*}
 */
function getCookieValue(name) {
    var mode = new CookieClass();
    var current_id = mode.getCookie(name);
    return current_id;
}

function needLoginFirst() {
    return jQuery('.entrance').attr('need-forward-login') == 'true';
}

function initChat(islogin){

    // 国际站不显示聊天室
    if (parseInt(languageType) === 1) return;

    if (!islogin) {
        jQuery(".entrance").attr('need-forward-login', 'true').fadeIn(200);
        return;
    }

    var talk_on=getCookieValue(gobal_talk);
    if((!talk_on||Number(talk_on)==1)&&languageType!=1){
        if(!!socket){
            socket.emit && socket.emit("addTalk", "{IS_OPEN_TALK:'1',RANDOM:'"+random+"',binary:'"+isBinary+"'}");
        }
        var nikeName=decodeURI(getCookieValue(gobal_talk_nike_name));
        if(!!nikeName){
            jQuery("#personalName").html(nikeName);
            jQuery("#inputPersonalName").val(nikeName);
        }
        jQuery(".entrance").fadeIn(200);
        jQuery(".msg_context").empty();
    }
}
jQuery(".chatContent").mouseover(function () {
    jQuery(this).bind('mousewheel',function(event){
        var value=0;
        if(event.originalEvent.wheelDelta){
            value=event.originalEvent.wheelDelta;
        }else if(event.originalEvent.detail){
            value=event.originalEvent.detail;
        }
        var heigh=jQuery(".chatContent")[0].scrollTop;
        if(value<0){
            heigh=heigh+30;
        }else{
            heigh=heigh-30;
            heigh=heigh<0?0:heigh;
        }
        jQuery(".chatContent").scrollTop(heigh);
        return false;
    });
});
jQuery(".chatContent").mouseout(function(){
    jQuery(this).unbind('mousewheel');
});
jQuery(".closePop").click(function(event){
    var callback={okBack:function(){
        jQuery(".entrance").hide(500);
        jQuery(".chatBody").hide(500);
        setCookieValue(gobal_talk,0,60*24*365);
    },noBack:void(0)}
    okcoinAlert("可在“用户支持-聊天室”重新打开聊天室!",false,callback);
});
var send=true;
jQuery(".entrance .upPopChatWrapper").click(function(){

    if (needLoginFirst()) {
        jQuery('.layerPopChat').show();
        return;
    }

    if(!socket){
        socketConnection(true);
    }
    if(send){
        socket.emit && socket.emit("addTalk", "{IS_OPEN_TALK:'1',RANDOM:'"+random+"',binary:'"+isBinary+"'}");
        send=false;
    }
    jQuery(".chatBodyNew").slideDown();
    jQuery('.chatContent').scrollTop( jQuery('.chatContent')[0].scrollHeight );
    jQuery(".entrance").hide();
});
jQuery('.entrance .upPopServiceWrapper').click(function() {
    jQuery('.entrance').hide();
    jQuery('.chatBodyService').slideDown();
});
jQuery(".downPop").click(function(){
    jQuery(".chatBody").slideUp(300, function() {
        jQuery(".entrance").show();
    });
});
jQuery('.chatBodyService .right').click(function() {

    if (needLoginFirst()) {
        jQuery('.layerPopChat').show();
        return;
    }

    jQuery('.chatBodyService').hide();
    jQuery('.chatBodyNew').slideDown();
});
jQuery('.chatBodyService .question').click(function(e) {
    if (needLoginFirst()) {
        e.preventDefault();
        jQuery('.layerPopChat').show();
        return;
    }
});
jQuery('.chatBodyNew .left').click(function() {
    jQuery('.chatBodyNew').hide();
    jQuery('.chatBodyService').slideDown();
});
jQuery(".changeIcon").click(function(){
    jQuery(".edit").show();
    jQuery(".show").hide();
    jQuery("#inputPersonalName").focus();
});

function changeChatPersonalName(){
    var oldNikeName=getCookieValue(gobal_talk_nike_name);
    var nowNikeName=encodeURI(jQuery(this).val());
    if(!!oldNikeName&&oldNikeName!=nowNikeName){
        showErrorMsg("昵称一个月之内只能修改一次！");
        jQuery(this).val(decodeURI(oldNikeName));
        jQuery(".show").show();
        jQuery(".edit").hide();
        return ;
    }
    if(oldNikeName==nowNikeName||jQuery.trim(jQuery("#personalName").html())==nowNikeName){
        jQuery(".show").show();
        jQuery(".edit").hide();
        return;
    }
    jQuery("#personalName").html(jQuery(this).val());
    if(!!jQuery(this).val()&&jQuery(this).val().indexOf("管理")!=-1){
        showErrorMsg("昵称非法“管理”！请重新输入！");
        return;
    }
    if(jQuery(this).val().length>10){
        showErrorMsg("请输入10个字符以内的名称！");
        return ;
    }
    if (!!jQuery(this).val()) {
        setCookieValue(gobal_talk_nike_name, nowNikeName, 60 * 24 * 30);
    }
    jQuery(".show").show();
    jQuery(".edit").hide();
}

jQuery("#inputPersonalName").blur(function() {
    if (jQuery(this).attr('enter-pressed')) {
        jQuery(this).removeAttr('enter-pressed');
        return;
    }
    changeChatPersonalName.apply(this);
});
jQuery("#inputPersonalName").keyup(function(e) {
    var keyCode = e.keyCode || e.which || e.charCode;
    if (keyCode == 13) {
        changeChatPersonalName.apply(this);
        jQuery(this).attr('enter-pressed', 'true');
    }
});

jQuery(".clearScreen").click(function(){
    jQuery(".chatContent").hide();
    jQuery(".msg_context").empty();
    jQuery(".chatContent").show();
});
jQuery(".speakContent textarea").keydown(function(event){
    if(event.keyCode===13){
        jQuery(".sendMsge").click();
        return false;
    }
});
jQuery(".sendMsge").click(function(){
    var msg=jQuery(".speakContent textarea").val();
    if(!msg){
        showErrorMsg("请输入信息!")
        jQuery(".speakContent textarea").focus();
        return;
    }
    var url="/dialogSendMsg.do";
    var param={msg:encodeURI(msg),nikeName:encodeURI(jQuery.trim(jQuery("#personalName").html()))};
    jQuery(this).attr("disable",true);
    jQuery.post(url,param,function(data){
        jQuery(this).attr("disable",false);
        switch (Number(data.errorCode)){
            case 10000:
                jQuery(".speakContent textarea").val("");
                break;
            case -10000:
                showErrorMsg("请先登录！");
                break;
            case -10001:
                showErrorMsg('您已经被禁言！请联系OKCOIN管理员！<a class="" target="_blank" href="http://wpa.b.qq.com/cgi/wpa.php?ln=1&amp;key=XzgwMDA0NTEyNV82MjQ4Nl84MDAwNDUxMjVfMl8">800045125</a>');
                break;
            case -10002:
                showErrorMsg("请输入信息！");
                break;
            case -10003:
                showErrorMsg("请输入昵称！");
                break;
            case -10004:
                showErrorMsg("您输入的话太长了！");
                break;
            case -10005:
                showErrorMsg("昵称非法“管理”！请重新输入！");
                break;
            case -10006:
                showErrorMsg("禁止发送链接！");
                break;
            case -10007:
                showErrorMsg("您输入的内容包含敏感词汇，请修改！");
                break;
            case -10008:
                showErrorMsg("您的昵称输入了非法语句！");
                break;
            case -10009:
                showErrorMsg("请输入10个字符以内的昵称！");
                break;
            case -10010:
                showErrorMsg("您没有任何交易信息，无法发送消息!");
                break;
        }
    },"JSON");
});
function  showErrorMsg(msg){
    if(jQuery("#stopTalk").length>0){
        jQuery("#stopTalk").remove();
    }
    var result='<li id="stopTalk" ><p class="speak_other" style="color: red" title="系统信息">系统信息:'+msg+'</p></li>';
    if(jQuery(".msg_context li").length>=100){
        jQuery(".msg_context li").first().remove();
    }
    jQuery(".msg_context").append(result);
    jQuery('.chatContent').scrollTop( jQuery('.chatContent')[0].scrollHeight);
}
function clearError(){
    jQuery(".chatErrorMsg").html("");
}
function loadTalkMsg(data){
    if(!data){
        return;
    }
    for (var i = 0; i < data.length; i++) {
        if(!!data[i]){
            var type=data[i].type;
            if(type==="talk"){
                addMsg(data[i].data);
            }
        }
    }
}
function addMsg(data){
    if(!data){
        return;
    }
    var result="";
    for(var i=0;i<data.length;i++){
        var tmp=data[i];
        if(tmp.email==="onLineCount"){
            jQuery(".talks").html(tmp.onLineCount);
            addMsg(tmp.message);
            continue;
        }
        result+="<li>";
        var cls="speak_other";
        if(jQuery.trim(tmp.uid)===jQuery.trim(md5_code)){
            cls="speak_own";
        }
        var showName=checkMsg(decodeURI(tmp.userName));
        if(!!tmp.mananger&&Number(tmp.mananger)===1){
           cls="speak_manager";
           showName="管理员("+showName+")";
        }
        var emailShow=showName;
        if(!!tmp.email){
            emailShow=tmp.email+"("+showName+")";
            showName=emailShow;
        }
        result+='<p class="'+cls+'" title="'+emailShow+'">'+showName+':'+checkMsg(decodeURI(tmp.message))+'</p>';
        result+='<p class="'+cls+'" style="color:#aab2bd">'+tmp.time+'</p>';
        result+='</li>';
        jQuery(".talks").html(tmp.onLineCount);
        if(jQuery(".msg_context li").length>=100){
            jQuery(".msg_context li").first().remove();
        }
    }
    if(!!result){
        jQuery(".msg_context").append(result);
        jQuery('.chatContent').scrollTop( jQuery('.chatContent')[0].scrollHeight );
    }
}
function checkMsg(msg){
    msg=msg.replace("'","\"");
    msg=msg.replace("<","&#60;");
    msg=msg.replace(">","&#62;");
    return msg;
}

function showChatRulePop() {
	dialogBoxShadow();
	var screenWidth = document.documentElement.clientWidth;
	var leftDis=(screenWidth-600)/2;
	jQuery(".chatRulePop").css("left",leftDis);
	jQuery(".chatRulePop").show();
}
function closeChatRulePop() {
	dialogBoxHidden();
	jQuery(".chatRulePop").hide();
}

function layerPopChatLogin() {
    location.href='/user/login.do?forward=' + encodeURIComponent(location.href);
}
function layerPopChatCancel() {
    jQuery('.layerPopChat').hide();
}