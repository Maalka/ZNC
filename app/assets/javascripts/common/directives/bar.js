/**
 * A building property directive
 * changes form inputs based on property type
 * and supports multiple property types
 */
define(['angular','highcharts', 'maalkaflags', './main'], function(angular) {
  'use strict';

  var mod = angular.module('common.directives');

  mod.directive('bar', [function() {
  // create the flag icon with anchor

      return {
          restrict: 'A',
          scope: {
            endUses: '=endUses',
            units: '=units'
          },
          controller: ["$scope", "$element","$timeout", function ($scope, $element, $timeout) {
            var chart;

            var loadSeries = function(chart) {

                //$element.css({height: 400px});
                chart.margin = 0;
                chart.isDirtyBox = true;

                chart.redraw();
                chart.reflow();

            };


            var plot = function () {


                /*(function(H) {
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
                })(highcharts);*/

                var options = {
                  chart: {
                      type: 'column',
                      marginRight: 190,
                      spacingTop: 20,
                      //spacingRight: 10,
                      spacingBottom: 30,
                      spacingLeft: 10,
                  },
                  legend: {
                    itemStyle: {
                            font: '9pt',
                            fontWeight: 100
                        },
                    verticalAlign: 'middle',
                    width: 150,
                    align: 'right'
                  },
                  firstLegend: {
                    itemWidth: 100,
                    title: {
                        text: 'End Uses',
                    style: {
                            fontStyle: 'bold'
                      }
                  },
                    y: -20
                  },
                  secondLegend: {
                    itemWidth: 100,
                     title: {
                            text: 'Renewable Energy',
                        style: {
                                fontStyle: 'bold'
                          }
                      },
                    y: 120
                  },
                  title: {
                      text: 'ESTIMATED ENERGY CONSUMPTION',
                      align: 'left',
                      margin: 20,
                      style: {
                            color: '#00A0B0',
                            fontWeight: 'bold',
                            fontSize: 15,
                        }
                  },
                  xAxis: {
                      categories: ['End Uses', 'Renewable Energy'],
                      labels: {
                        autoRotation: false
                      }
                  },
                  yAxis: {
                      min: 0,
                      max: 70,
                      title: {
                          text: 'kBtu/ft2-yr'
                      },
                  },
                  tooltip: {
                      shared: false
                  },
                  credits: {
                      enabled: false
                  },
                  plotOptions: {
                      column: {
                          stacking: 'normal'
                      },
                      series: {
                          borderWidth: 0
                      }
                  },
                  series: [
                      {
                          name: 'Heating',
                          color: '#f88b50',
                          data: [[0,5]],
                          legendID: 0,
                      },
                      {
                          name: 'Cooling',
                          color: '#9bd9fd',
                          data: [[0,5]],
                                    legendID: 0,
                      },
                      {
                          name: 'Fans',
                          color: '#B15679',
                          data: [[0,2]],
                          legendID: 0,
                      },
                      {
                          name: 'Interior Lighting',
                          color: '#facd6f',
                          data: [[0,10]],
                          legendID: 0,
                      },
                      {
                          name: 'Plug Loads',
                          color: '#2f4598',
                          data: [[0,8]],
                          legendID: 0,
                      },
                      {
                          name: 'Service Hot Water',
                          color: '#06a1f9',
                          data: [[0,6]],
                          legendID: 0,
                      },
                      {
                          name: 'Other',
                          color: '#7f6fb1',
                          data: [[0,15]],
                          legendID: 0,
                      },
                      {
                          name: 'On site',
                          color: '#398371',
                          data: [[1,18]],
                          legendID: 1,
                      },
                      {
                          name: 'Off site',
                          color: '#b0cdc6',
                          data: [[1,33]],
                          legendID: 1,
                      }
                  ]
              };

              $timeout(function () {

                angular.element($element).highcharts(options, function () { 
                  chart = this;
                });
              }, 0);
            };
            if ($scope.endUses !== undefined) {
              plot();
            }

            $scope.$watch("endUses", function (br) {

              if (chart !== undefined) {
                if (br !== undefined) {
                  loadSeries(chart);

                }
              }
            });

            $scope.$watch("tableEUIUnits", function (br) {

              if (chart !== undefined) {
                if (br !== undefined) {
                  loadSeries(chart);

                }
              }
            });

          }]
        };
  }]);
});