'use strict';
define(['highcharts', 'highcharts-more'], function(angular, nvd3) {
    (function() {
        Highcharts.theme = {
            chart: {
                style: {
                    fontFamily: '"Open Sans", "Helvetica Neue", Arial, Helvetica, sans-serif'
                }
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                area: {
                    showInLegend: false,
                    enableMouseTracking: false
                },
                column: {
                    showInLegend: false,
                    enableMouseTracking: false
                },
                line: {
                    showInLegend: false,
                    enableMouseTracking: false
                },
                flag: {
                    showInLegend: false,
                    enableMouseTracking: false
                }
            }
        };

        // Apply the theme
        Highcharts.setOptions(Highcharts.theme);

        //set the line legond symbol to be the area symbol (we want a box)
        Highcharts.seriesTypes.line.prototype.drawLegendSymbol = 
            Highcharts.seriesTypes.area.prototype.drawLegendSymbol;


        // add new area symbols
        Highcharts.Renderer.prototype.symbols['arrow-right'] = function (x, y, w, h, options) {
            return [
                "M", x - w / 2, y,
                "L", x + w / 2, y + h /2,
                x - w / 2, y + h,
                'Z'
            ];
        };
         Highcharts.Renderer.prototype.symbols['arrow-left'] = function (x, y, w, h, options) {
            return [
                "M", x, y,
                "L", x + w, y + h /2,
                    x + w, y - h / 2,
                'Z'
            ];
        };
        (function(H) {
            var merge = H.merge;

            H.wrap(H.Legend.prototype, 'getAllItems', function() {
              var allItems = [],
                chart = this.chart,
                options = this.options,
                legendID = options.legendID;

              H.each(chart.series, function(series) {
                if (series) {
                  var seriesOptions = series.options;

                  // use points or series for the legend item depending on legendType
                  if (!isNaN(legendID) && (seriesOptions.legendID === legendID)) {
                    allItems = allItems.concat(
                      series.legendItems ||
                      (seriesOptions.legendType === 'point' ?
                        series.data :
                        series)
                    );
                  }
                }
              });

              return allItems;
            });

            H.wrap(H.Chart.prototype, 'render', function(p) {
              var chart = this,
                chartOptions = chart.options;

              chart.firstLegend = new H.Legend(chart, merge(chartOptions.legend, chartOptions.firstLegend, {
                legendID: 0
              }));

              chart.secondLegend = new H.Legend(chart, merge(chartOptions.legend, chartOptions.secondLegend, {
                legendID: 1
              }));

              p.call(this);
            });

            H.wrap(H.Chart.prototype, 'redraw', function(p, r, a) {
              var chart = this;

              p.call(chart, r, a);

              chart.firstLegend.render();
              chart.secondLegend.render();
            });

            H.wrap(H.Legend.prototype, 'positionItem', function(p, item) {
              p.call(this, item);
            });
        })(Highcharts);
        return Highcharts;
    })();
});