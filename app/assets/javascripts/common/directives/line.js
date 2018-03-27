/**
 * A building property directive
 * changes form inputs based on property type
 * and supports multiple property types
 */
define(['angular','highcharts', 'maalkaflags', './main'], function(angular) {
  'use strict';

  var mod = angular.module('common.directives');

  mod.directive('line', [function() {
  // create the flag icon with anchor

      return {
          restrict: 'A',
          scope: {
            solarMonthly: '=solarMonthly',
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

              var options = {
                  chart: {
                    spacingTop: 0,
                    spacingRight: 0,
                    spacingBottom: 10,
                    spacingLeft: 0,
                    plotBorderWidth: 0,
                      events: {
                        'load': function () {
                          loadSeries(chart);
                        },
                        beforePrint: function () {
                            this.oldhasUserSize = this.hasUserSize;
                            this.resetParams = [this.chartWidth, this.chartHeight, false];
                            this.setSize(600, 400, false);
                        },
                        afterPrint: function () {
                            this.setSize.apply(this, this.resetParams);
                            this.hasUserSize = this.oldhasUserSize;
                        }
                      }
                  },
                  title: {
                          text: 'ANNUAL AC & DC PRODUCTION',
                          align: 'left',
                      },

                      yAxis: {
                          title: {
                              text: $scope.units
                          }
                      },
                      xAxis: [{
                          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Oct', 'Sep', 'Nov', 'Dec']
                      }],
                      legend: {
                          align: 'center',
                          verticalAlign: 'bottom',
                          x: 0,
                          y: 0
                      },

                      plotOptions: {
                          series: {
                              label: {
                                  enabled: false

                              },
                          }
                      },

                      series: [{
                          name: 'DC',
                          color: '#359BB4',
                          data:  $scope.solarMonthly.dc_monthly
                      }, {
                          name: 'AC',
                          color: '#1f2c5c',
                          data: $scope.solarMonthly.ac_monthly
                      }],

                      responsive: {
                          rules: [{
                              condition: {
                                  maxWidth: 500
                              },
                              chartOptions: {
                                  legend: {
                                      layout: 'horizontal',
                                      align: 'center',
                                      verticalAlign: 'bottom'
                                  }
                              }
                          }]
                      }
              };

              $timeout(function () {

                angular.element($element).highcharts(options, function () { 
                  chart = this;
                });
              }, 0);
            };
            if ($scope.solarMonthly !== undefined) {
              plot();
            }

            $scope.$watch("buildingRequirments", function (br) {

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