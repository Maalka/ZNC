/**
 * A building property directive
 * changes form inputs based on property type
 * and supports multiple property types
 */
define(['angular','highcharts', './main'], function(angular) {
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
                      spacingTop: 20,
                      spacingRight: 10,
                      spacingBottom: 50,
                      spacingLeft: 10,
                  },
                  title: {
                          text: 'ANNUAL AC & DC PRODUCTION',
                          align: 'left',
                          margin: 20,
                          x:15,
                          style: {
                              color: '#00A0B0',
                              fontWeight: 'bold',
                              fontSize: 15,
                          }
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
                          enabled:true,
                          align: 'center',
                          verticalAlign: 'bottom',
                          y: 40
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
                          showInLegend: true,
                          data:  $scope.solarMonthly.dc_monthly,
                          legendID: 0
                      }, {
                          name: 'AC',
                          color: '#1f2c5c',
                          showInLegend: true,
                          data: $scope.solarMonthly.ac_monthly,
                          legendID: 0
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
                                      verticalAlign: 'bottom',
                                      y: 40
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