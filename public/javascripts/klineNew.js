Date.prototype.format = function(format){
	var o = {
		"M+" : this.getMonth()+1, //month
		"d+" : this.getDate(), //day
		"h+" : this.getHours(), //hour
		"m+" : this.getMinutes(), //minute
		"s+" : this.getSeconds(), //second
		"q+" : Math.floor((this.getMonth()+3)/3), //quarter
		"S" : this.getMilliseconds() //millisecond
	}

	if(/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
	}

	for(var k in o) {
		if(new RegExp("("+ k +")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
		}
	}
	return format;
}

function splitData(rawData) {
	var categoryData = [];
	var values = [];
	var volumns = [];
	for (var i = 0; i < rawData.length; i++) {
		categoryData.push(rawData[i].splice(0, 1)[0]);
		values.push([rawData[i][0],rawData[i][3],rawData[i][2],rawData[i][1]]);
		volumns.push(rawData[i][4]);
	}
	return {
		categoryData: categoryData,
		values: values,
		volumns: volumns
	};
}

function calculateMA(dayCount, data,type,marketFrom) {
	var result = [];
	if(type != 3 || marketFrom == 3){
		return result;
	}
	for (var i = 0, len = data.values.length; i < len; i++) {
		if (i < dayCount) {
			result.push('-');
			continue;
		}
		var sum = 0;
		for (var j = 0; j < dayCount; j++) {
			sum += data.values[i - j][1];
		}
		result.push(+(sum / dayCount).toFixed(3));
	}
	return result;
}

function calculateStartEnd(type,range,data) {
	if(data == null)
		return ;
	var start = 0;
	var end = data.categoryData.length-1;
	if(type == 0){
		return start;
	}
	start = end - range;
	return start;
}

/**
 * @param marketFrom
 * @param type
 * @param mainType 3:表示外站数据
 */
function dataKLineNew(marketFrom,type,mainType){
	var kline1_all = get$("kline1_all");//document.getElementById("kline1_all").value;
	var kline1_price_mark = get$("kline1_price");//document.getElementById("kline1_price").value;
	var kline1_volume_mark = get$("kline1_volume");//document.getElementById("kline1_volume").value;
	var kline1_averageLine_5day = get$("kline1_5AverageLine");//document.getElementById("kline1_5AverageLine").value;
	var kline1_averageLine_15day =get$("kline1_15AverageLine");// document.getElementById("kline1_15AverageLine").value;
	var kline1_Monday = get$("kline1_Monday");//document.getElementById("kline1_Monday").value;
	var kline1_Tuesday = get$("kline1_Tuesday");//document.getElementById("kline1_Tuesday").value;
	var kline1_Wednesday = get$("kline1_Wednesday");//document.getElementById("kline1_Wednesday").value;
	var kline1_Thursday = get$("kline1_Thursday");//document.getElementById("kline1_Thursday").value;
	var kline1_Friday = get$("kline1_Friday");//document.getElementById("kline1_Friday").value;
	var kline1_Saturday = get$("kline1_Saturday");//document.getElementById("kline1_Saturday").value;
	var kline1_Sunday =get$("kline1_Sunday");//document.getElementById("kline1_Sunday").value;
	var kline1_open =get$("kline1_open");
	var kline1_high =get$("kline1_high");
	var kline1_low =get$("kline1_low");
	var kline1_close =get$("kline1_close");
	var weekday=[kline1_Sunday,kline1_Monday,kline1_Tuesday,kline1_Wednesday,kline1_Thursday,kline1_Friday,kline1_Saturday];
	var h8=96;
	var d1=288;
	var w1=7;
	var m1=30;

	var url = '';
	var cnyOrUsdStr2 = '';
	if(mainType != 3){
		url = '/api/klineData.do?type='+type+'&marketFrom='+marketFrom;
		cnyOrUsdStr2 = cnyOrUsdStr;
	}else{
		var coinUrl = document.getElementById("coinUrl").value;
		url = coinUrl+'/api/klineData.do?type='+type+'&marketFrom='+marketFrom;
		cnyOrUsdStr2 = cnyOrUsdStr=='USD'?'CNY':'USD';
	}

	var tooltipDateFormat='';
	var axisLabelDateFormat='';
	if(type != 3){
		tooltipDateFormat = 'yyyy-MM-dd hh:mm';
		axisLabelDateFormat = 'hh:mm';
	}else{
		tooltipDateFormat = 'yyyy-MM-dd';
		axisLabelDateFormat = 'MM-dd';
	}

	var xAxisMoney = "BTC/"+cnyOrUsdStr2;
	var labelText  = kline1_volume_mark+"(BTC)";
	if(marketFrom == 3){
		xAxisMoney = "LTC/"+cnyOrUsdStr2;
		labelText  = kline1_volume_mark+"(LTC)";
	}

	jQuery.getJSON(url, function(rawData) {
		if(rawData==null){
			return;
		}
		// 基于准备好的dom，初始化echarts实例
		var myChart = echarts.init(document.getElementById('container'));
		// 指定图表的配置项和数据
		var data = splitData(rawData);

		var startValue,endValue;
		if(type != 3){
			startValue = calculateStartEnd(1,h8,data);
			endValue = calculateStartEnd(1,0,data);
		}else{
			startValue = calculateStartEnd(1,m1,data);
			endValue = calculateStartEnd(1,0,data);
		}

		myChart.setOption(option = {
			title: {
				text: 'OKCoin.com',
				link: 'https://www.okcoin.com',
				x:'right',
				y:'bottom',
				textStyle:{fontWeight:'lighter',fontSize:12}
			},
			backgroundColor: '#FFFFFF',
			animation: false,
			tooltip: {
				trigger: 'axis',
				axisPointer: {type: 'line'},
				backgroundColor:'#FFFFFF',
				borderColor:'#20B2AA',
				borderWidth:1,
				textStyle:{color:'#000000',fontSize:'12'},
				formatter: function (param) {
					var paramZ = param[0];
					var paramO = param[1];
					var paramT = param[2];
					var date = new Date(paramZ.name);
					var dateStr = date.format(tooltipDateFormat)+' '+weekday[date.getDay()];
					if(type != 3 || marketFrom == 3){
						return [
							dateStr + '<br/>',
							'<font color="red">'+paramZ.seriesName + '</font><br/>',
							kline1_open+': ' + CommaFormatted(paramZ.data[0],2) + '<br/>',
							kline1_high+': ' + CommaFormatted(paramZ.data[3],2) + '<br/>',
							kline1_low+': '  + CommaFormatted(paramZ.data[2],2) + '<br/>',
							kline1_close+': '+ CommaFormatted(paramZ.data[1],2) + '<br/>',
							'<font color="#2999D4">'+kline1_volume_mark+'</font>: ' + CommaFormatted(data.volumns[paramZ.dataIndex],2) + '<br/>'
						].join('');
					}
					return [
						dateStr + '<br/>',
						'<font color="red">'+paramZ.seriesName + '</font><br/>',
						kline1_open+': ' + CommaFormatted(paramZ.data[0],2) + '<br/>',
						kline1_high+': ' + CommaFormatted(paramZ.data[3],2) + '<br/>',
						kline1_low+': '  + CommaFormatted(paramZ.data[2],2) + '<br/>',
						kline1_close+': '+ CommaFormatted(paramZ.data[1],2) + '<br/>',
						kline1_averageLine_5day+': ' + CommaFormatted(paramO.value,2) + '<br/>',
						'<font color="#0000FF">'+kline1_averageLine_15day+'</font>: ' + CommaFormatted(paramT.value,2) + '<br/>',
						'<font color="#2999D4">'+kline1_volume_mark+'</font>: ' + CommaFormatted(data.volumns[paramZ.dataIndex],2) + '<br/>'
					].join('');
				}
			},
			toolbox:{show:false},
			brush: {
				xAxisIndex: 'all',
				brushLink: 'all',
				outOfBrush: {colorAlpha: 0.1}
			},
			grid: [
				{left: '2%',right: '2%',top: '5%',height: '60%'},
				{left: '2%',right: '2%',top: '63%',height: '12%'}
			],
			xAxis: [
				{
					type: 'category',
					position:'bottom',
					data: data.categoryData,
					scale: true,
					boundaryGap : true,
					axisLine: {show:false,onZero: false},
					splitLine: {show: false},
					axisLabel: {show: false},
					axisTick: {show: false},
					splitNumber: 20,
					min: 'dataMin',
					max: 'dataMax'
				},
				{
					type: 'category',
					position:'bottom',
					gridIndex: 1,
					data: data.categoryData,
					scale: true,
					boundaryGap : true,
					axisLine: {onZero: false},
					splitLine: {show: false},
					splitNumber: 20,
					axisLabel:{
						formatter:function (value, index) {
							var date = new Date(value);
							var texts = date.format(axisLabelDateFormat);
							return texts;
						}
					},
					min: 'dataMin',
					max: 'dataMax'
				}
			],
			yAxis: [
				{
					name:kline1_price_mark+'('+cnyOrUsdStr2+')',
					nameLocation:'middle',
					nameGap:4,
					nameTextStyle:{color:'#6D869F',fontWeight:'bold'},
					scale: true,
					splitArea: {show: true},
					axisTick:{show:false},
					axisLabel:{inside:true,margin:2},
					splitArea:{show:false}
				},
				{
					name:labelText,
					nameLocation:'middle',
					nameGap:4,
					nameTextStyle:{color:'#6D869F',fontWeight:'bold'},
					nameRotate:270,
					scale: true,
					gridIndex: 1,
					splitNumber: 2,
					axisTick: {show: false},
					splitLine: {show: false},
					position:'right',
					axisLabel:{
						inside:true,
						margin:2,
						formatter:function (value, index) {
							if(value < 1000)
								return CommaFormatted(value,0);
							if(value < 1000000)
								return CommaFormatted(value/1000,0)+'k';
							if(value < 1000000000)
								return CommaFormatted(value/1000000,0)+'M';
						}
					},
					//min: 'dataMin',
					max:'dataMax'
				}
			],
			dataZoom: [
				{
					type: 'inside',
					xAxisIndex: [0, 1],
					startValue: startValue,
					endValue: endValue
				},
				{
					show: true,
					xAxisIndex: [0, 1],
					type: 'slider',
					top: '85%',
					bottom:'5%',
					startValue: startValue,
					endValue: endValue,
					labelFormatter:function (value) {return '';},
					dataBackground:{areaStyle:{color:'#ADD8E6'}}
				}
			],
			series: [
				{
					name: xAxisMoney,
					type: 'candlestick',
					data: data.values,
					itemStyle: {
						normal: {
							color:'#99EE44',
							color0:'#DD3333',
							borderColor:'#000000',
							borderColor0:' #000000'
						}
					}
				},
				{
					name: kline1_averageLine_5day,
					type: 'line',
					data: calculateMA(5, data,type,marketFrom),
					smooth: true,
					lineStyle: {normal: {color:'#000000',opacity: 0.5}},
					itemStyle:{normal:{opacity:0}}
				},
				{
					name: kline1_averageLine_15day,
					type: 'line',
					data: calculateMA(15, data,type,marketFrom),
					smooth: true,
					lineStyle: {normal: {color:'#0000FF',opacity: 0.5}},
					itemStyle:{normal:{opacity:0}}
				},
				{
					name: kline1_volume_mark,
					type: 'bar',
					xAxisIndex: 1,
					yAxisIndex: 1,
					barWidth:'50%',
					itemStyle:{normal:{color:'#2999D4'}},
					data: data.volumns,
					tooltip:{show:false,trigger:'item'}
				}
			]
		}, true);
		// 使用刚指定的配置项和数据显示图表。
		//myChart.setOption(option);
	});
}
/**
 * 刷新行情数据
*/
function klineDataNew(marketFrom,type,mainType){
	dataKLineNew(marketFrom,type,mainType);
	switch(type){
	case 1:
		document.getElementById("okcoinData1").className="cur";
		document.getElementById("okcoinData3").className="";
		break;
	case 3:
		document.getElementById("okcoinData1").className="";
		document.getElementById("okcoinData3").className="cur";
		break;
	}
	//@todo add new coin
}