/**
 * Created by greg on 17-8-19.
 */
$(function () {
    $.getJSON('https://data.jianshukeji.com/jsonp?filename=json/aapl-c.json&callback=?', function (data) {
        // Create the chart
        $('#container').highcharts('StockChart', {
            rangeSelector : {
                selected : 1
            },
            exporting : {
                enabled : false
            },
            navigator:{
                enabled:false
            },
            scrollbar:{enabled:false},
            xAxis:[{visible:false,crosshair:false}],
            yAxis:[{visible:false,crosshair:false}],
            tooltip:{enabled:false},
            rangeSelector:{enabled:false},
            series : [{
                name : 'AAPL Stock Price',
                data : data,
                type : 'areaspline',
                threshold : null,
                states:{hover:{enabled:false}},
                fillColor : {
                    linearGradient : {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops : [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                }
            }]
        });
    });
});
