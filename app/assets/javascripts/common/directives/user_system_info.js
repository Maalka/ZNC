/**
 * A systen property directive
 * changes form inputs based on pv system
 */
define(['angular','./main'], function(angular) {
  'use strict';

  var mod = angular.module('common.directives');

    mod.directive('userSystemInfo', [function() {
        return {
            restrict: 'A',
            scope: {
                model: '=model',
                forms: '=forms',
                index: '=idx',
            },

            templateUrl: function(){
                   return 'javascripts/common/partials/user_system_capacity.html';
            },

            controller: ["$scope", function ($scope) {


                $scope.propFieldsRequired = false;
                $scope.userCapacity = {};
                $scope.model.userCapacity = $scope.userCapacity ;
                $scope.model.valid = false;
                $scope.name = $scope.model.name;
                $scope.showDivider = $scope.model.showDivider;


                $scope.$watch("forms.baselineForm.$valid", function (validity) {
                    $scope.model.valid = validity;
                });

                $scope.clearParams = function(){

                    $scope.userCapacity.estimated_capacity=null;
                    $scope.userCapacity.power_units=null;

                };

                $scope.round = function(number, precision) {
                  var factor = Math.pow(10, precision);
                  return Math.round(number * factor) / factor;
                };

                $scope.removeUserSystem = function() {
                    $scope.$parent.removeUserSystem(this);
                };

                $scope.addUserSystem = function() {
                    $scope.$parent.addUserSystem();
                };


                $scope.isRequired = function(field) {
                    if (field.required === undefined) {
                        return false;
                    } else if (field.required === "all") {
                        return true;
                    } else {
                        return false;
                    }
                };

                $scope.required = function(field) {
                    return $scope.isRequired(field) ? "required" : "";
                };

                $scope.$watch("forms.baselineForm.$valid", function () {
                    if($scope.forms.baselineForm.$valid){
                        $scope.propFieldsRequired = false;
                    } else {
                        $scope.propFieldsRequired = true;
                    }
                });

                $scope.systemProperties = {
                    power_units: [
                            {id:"kWh",name:"kWh"},
                            {id:"kBtu",name:"kBtu"}
                    ]
               };


            }]
        };
    }]);

  return mod;
});


