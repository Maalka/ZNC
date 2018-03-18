/**
 * A building property directive
 * changes form inputs based on property type
 * and supports multiple property types
 */
define(['angular','./main'], function(angular) {
  'use strict';

  var mod = angular.module('common.directives');

    mod.directive('buildingInfo', [function() {
        return {
            restrict: 'A',
            scope: {
                model: '=model',
                forms: '=forms'
            },

            templateUrl: function(){
                   return 'javascripts/common/partials/property_fields.html';
            },

            controller: ["$scope", function ($scope) {

                $scope.buildingName =  ($scope.model.name) ? $scope.model.name : "Anonymous";

                $scope.benchmark = $scope.$parent;
                $scope.propFieldsRequired = false;
                $scope.propertyModel = {};
                $scope.model.propertyModel = $scope.propertyModel ;
                $scope.model.propertyModel.buildingType = $scope.model.type;
                $scope.model.valid = false;

                $scope.$watch("forms.baselineForm.$valid", function (validity) {
                    $scope.model.valid = validity;
                });

                $scope.removeProp = function() { 
                    $scope.$parent.removeProp(this);
                };

                $scope.$watch("forms.baselineForm.$valid", function () {
                    if($scope.forms.baselineForm.$valid){
                        $scope.propFieldsRequired = false;
                    } else {
                        $scope.propFieldsRequired = true;
                    }
                });
            }]
        };
    }]);



  return mod;
});


