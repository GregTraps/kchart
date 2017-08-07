/**
 * 计算
 * */
var Calculate = (function () {
    return {
        //过滤输入的数字
        checkNumberByName_new: function (name,length){
            var number = document.getElementById(name).value.split('.');
            if(number.length > 1){
                return number[0].replace(/\D/g, '') + '.' + number[1].replace(/\D/g, '').slice(0, length);
            }else{
                return number[0].replace(/\D/g,'');
            }
        },
        //加法
        accAdd: function(arg1,arg2){
            var r1,r2,m;
            try{r1=arg1.toString().split(".")[1].length;}catch(e){r1=0;}
            try{r2=arg2.toString().split(".")[1].length;}catch(e){r2=0;}
            m=Math.pow(10,Math.max(r1,r2));
            return (arg1*m+arg2*m)/m;
        },
        //乘法
        accMul: function(arg1,arg2) {
            var m=0,s1=arg1.toString(),s2=arg2.toString();
            try{m+=s1.split(".")[1].length;}catch(e){}
            try{m+=s2.split(".")[1].length;}catch(e){}
            return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m);
        },
        //除法
        accDiv: function(arg1,arg2){
            var t1=0,t2=0,r1,r2;
            try{t1=arg1.toString().split(".")[1].length;}catch(e){}
            try{t2=arg2.toString().split(".")[1].length;}catch(e){}
            with(Math){
                r1=Number(arg1.toString().replace(".",""));
                r2=Number(arg2.toString().replace(".",""));
                return (r1/r2)*pow(10,t2-t1);
            }
        },
        //加法
        accAdd_z: function(arg1,arg2){
            return (Number(arg1)+Number(arg2)).toFixed(8);
        },
        //乘法
        accMul_z: function(arg1,arg2) {
            return (Number(arg1)*Number(arg2)).toFixed(8);
        },
        //除法
        accDiv_z: function(arg1,arg2) {
            if(Number(arg2)==0){
                return 0;
            }
            return (Number(arg1)/Number(arg2)).toFixed(8);
        },
        // 向下截位 number截位位数
        DownTruncation: function (val, number) {
            return this.CommaFormatted(this.floor(val, number), number);
        },
        CommaFormattedCommon: function(s, n) {
            n = n > 0 && n <= 20 ? n : 2;
            s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";

            return s;
        },
        CommaFormattedLittle: function(s, n) {
            if(Number(s)<1000){
                return Number(s).toFixed(n);
            }
            return (Number(s).toFixed(n) + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
        },
        CommaFormatted: function(s, n) {
            var k = n;
            n = n > 0 && n <= 20 ? n : 2;
            s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
            var l = s.split(".")[0].split("").reverse(), r = s.split(".")[1];
            t = "";
            for (var i = 0; i < l.length; i++) {
                t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
            }
            var result =t.split("").reverse().join("") + "." + r;
            if(Number(s)<0){
                if(result!=null&&result.substr(0,2)=="-,"){
                    result=result.substr(2,result.length);
                    result="-"+result;
                }
            }
            if(k==0){
                return result.split(".")[0];
            }
            return result;
        },
        //只千分位，不补位，0.00-->0
        CommaFormattedByOriginal: function(s) {
            if (s) {
                var temp = s.split(".");
                var tempLength = temp.length==2?temp[1].length:0;
                return this.CommaFormatted(s,tempLength);
            }
            return 0;
        },

        //只千分位，不补位，0.00-->0
        CommaFormattedOnly: function(s) {
            s = parseFloat((s + "").replace(/[^\d\.-]/g, "")) + "";
            var slength = s.split(".").length;
            var l = s.split(".")[0].split("").reverse(), r = s.split(".")[1];
            t = "";
            for (var i = 0; i < l.length; i++) {
                t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
            }
            var result;
            if(slength>1){
                result =t.split("").reverse().join("") + "." + r;
            }else{
                result =t.split("").reverse().join("");
            }
            if(Number(s)<0){
                if(result!=null&&result.substr(0,2)=="-,"){
                    result=result.substr(2,result.length);
                    result="-"+result;
                }
            }
            return result;
        },
        /**
         *
         * @param data数据
         * @param symbol币种0-btc,1-ltc,2-eth,4-etc
         * @returns {*}
         */
        formatTickerData: function(data,symbol) {
            data.vol = CommaFormattedByOriginal(data.vol + "");
            data.last = Number(data.last).toFixed(symbolSubPaltPoint(symbol));
            return data;
        },
        /**
         * 保留小数位
         * value：值，rate：截位（四舍五入）
         */
        formatNumber: function(value,rate){
            var result=CommaFormatted(value,rate);
            if(rate==0||!rate){
                if(!!result&&result.indexOf(".")!=-1){
                    return result.substring(0, result.length-3);
                }
                return result ;
            }
            return result;
        },
        /**
         * 截取指定位数
         * @param value
         * @param rate
         * @returns {*}
         */
        formatNumberTruncate: function (value, rate) {
            return formatValue(floor(value, rate), rate);
        },
        /**
         * 向上整数
         */
        round: function(value,scale){
            var sca=Math.pow(10, scale);
            var val=value*sca;
            val=Math.ceil(val);
            return val/sca;
        },
        /**
         * 向下取证
         */
        floor: function(value,scale){
            var sca=Math.pow(10, scale);
            var val=this.accMul(value,sca);
            val=Math.floor(val);
            return val/sca;
        }
    }
})();