/**
 * A building property directive
 * changes form inputs based on property type
 * and supports multiple property types
 */
define(['angular','highcharts', './main'], function(angular) {
  'use strict';

  var mod = angular.module('common.directives');

  mod.directive('bar', [function() {

      return {
          restrict: 'A',
          scope: {
            endUses: '=endUses',
            units: '=units',
            prescriptiveRequirements: '=prescriptiveRequirements'
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

            $scope.getEndUse = function(key){
                for(var i = 0; i < $scope.endUses.endUses.length; i++ ) {
                    if($scope.endUses.endUses[i][0] === key) {
                        if($scope.endUses.endUses[i][3] === null){
                            return 0.0;
                        }else {
                            return $scope.endUses.endUses[i][3];
                        }
                    }
                }
            };

            $scope.getOtherEndUses = function(){
                var sumOther = 0;
                for(var j = 0; j < $scope.endUses.endUsesOther.length; j++ ) {
                    if($scope.endUses.endUsesOther[j][3] !== null){
                        sumOther = sumOther + $scope.endUses.endUsesOther[j][3];
                    }
                }
                return sumOther;
            };

            var plot = function () {

                var options = {
                  chart: {
                      type: 'column',
                      marginRight: 190,
                      spacingTop: 20,
                      //spacingRight: 10,
                      spacingBottom: 15,
                      spacingLeft: 10,
                  },
                  legend: {
                    itemStyle: {
                            font: '9pt',
                            fontWeight: 100
                        },
                    verticalAlign: 'top',
                    width: 150,
                    align: 'right'
                  },
                  firstLegend: {
                    itemWidth: 100,
                    itemMarginBottom: 7,
                    title: {
                        text: '<span style="margin-bottom: 5px;">End Uses</span>',
                    style: {
                            fontStyle: 'bold'
                      }
                  },
                    y: 10
                  },
                  secondLegend: {
                    itemWidth: 100,
                    itemMarginBottom: 7,
                    title: {
                        text: '<span style="margin-bottom: 5px;">Renewable Energy</span>',
                    style: {
                            fontStyle: 'bold'
                      }
},
                    y: 220
                  },
                  title: {
                      text: null,//'ESTIMATED ENERGY CONSUMPTION',
                      align: 'left',
                      margin: 20,
                      x:15,
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
                      max: $scope.prescriptiveRequirements.building_energy_norm + 20,
                      title: {
                          text: $scope.units
                      },
                  },
                  tooltip: {
                      shared: false,
                      pointFormat: "{point.y:.2f}"
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
                          data: [[0,$scope.getEndUse("Heating")]],
                          legendID: 0,
                      },
                      {
                          name: 'Cooling',
                          color: '#9bd9fd',
                          data: [[0,$scope.getEndUse("Cooling")]],
                                    legendID: 0,
                      },
                      {
                          name: 'Fans',
                          color: '#B15679',
                          data: [[0,$scope.getEndUse("Fans")]],
                          legendID: 0,
                      },
                      {
                          name: 'Interior Lighting',
                          color: '#facd6f',
                          data: [[0,$scope.getEndUse("Interior Lighting")]],
                          legendID: 0,
                      },
                      {
                          name: 'Plug Loads',
                          color: '#2f4598',
                          data: [[0,$scope.getEndUse("Plug Loads")]],
                          legendID: 0,
                      },
                      {
                          name: 'Service Hot Water',
                          color: '#06a1f9',
                          data: [[0,$scope.getEndUse("Service Hot Water")]],
                          legendID: 0,
                      },
                      {
                          name: 'Other',
                          color: '#7f6fb1',
                          data: [[0,$scope.getOtherEndUses()]],
                          legendID: 0,
                      },
                      {
                          name: 'On site',
                          color: '#398371',
                          data: [[1,$scope.prescriptiveRequirements.pv_potential_norm]],
                          legendID: 1,
                      },
                      {
                          name: 'Off site',
                          color: '#b0cdc6',
                          data: [[1,$scope.prescriptiveRequirements.procured_norm]],
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
                console.log($scope.endUses);
              plot();
            }

            $scope.$watch("endUses", function (br) {

              if (chart !== undefined) {
                if (br !== undefined) {
                  loadSeries(chart);
                }
              }
            });

            $scope.$watch("prescriptiveRequirements", function (br) {

              if (chart !== undefined) {
                if (br !== undefined) {
                  loadSeries(chart);
                }
              }
            });
            $scope.$watch("auxModel.reportingUnits", function (br) {

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