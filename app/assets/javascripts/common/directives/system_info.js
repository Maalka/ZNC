/**
 * A systen property directive
 * changes form inputs based on pv system
 */
define(['angular','./main'], function(angular) {
  'use strict';

  var mod = angular.module('common.directives');

    mod.directive('systemInfo', [function() {
        return {
            restrict: 'A',
            scope: {
                model: '=model',
                forms: '=forms'
            },

            templateUrl: function(){
                   return 'javascripts/common/partials/pv_fields.html';
            },

            controller: ["$scope", function ($scope) {

                $scope.benchmark = $scope.$parent;
                $scope.propFieldsRequired = false;
                $scope.propertyModel = {};
                $scope.model.propertyModel = $scope.propertyModel ;
                $scope.model.valid = false;

                $scope.$watch("forms.baselineForm.$valid", function (validity) {
                    $scope.model.valid = validity;
                });

                $scope.clearParams = function(){

                    $scope.propertyModel.module_type=null;
                    $scope.propertyModel.losses=null;
                    $scope.propertyModel.array_type=null;
                    $scope.propertyModel.tilt=null;
                    $scope.propertyModel.azimuth=null;
                    $scope.propertyModel.inv_eff=null;
                };

                $scope.$watch("propertyModel.defaultValues", function () {
                    if($scope.propertyModel.defaultValues){
                        $scope.setDefaults();
                    } else {
                        $scope.clearParams();
                    }
                });

                $scope.removeProp = function() {
                    $scope.$parent.removeProp(this);
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

                $scope.pvProperties = {
                    areaUnits: [
                            {id:"ftSQ",name:"sq.ft"},
                            {id:"mSQ",name:"sq.m"}
                    ],

                    arrayType: [
                            {id:0,name:"0 Fixed - Open Rack"},
                            {id:1,name:"1 Fixed - Roof Mounted"},
                            {id:2,name:"2 1-Axis"},
                            {id:3,name:"3 1-Axis Backtracking"},
                            {id:4,name:"4 2-Axis"}
                   ],
                   moduleType: [
                            {id:0,name:"0 Standard"},
                            {id:1,name:"1 Premium"},
                            {id:2,name:"2 Thin Film)"}
                           ]
               };

                var setPropertyModelFields = function()  {
                    $scope.propertyModelFields = {
                        pvSystem    : [
                            {
                                name: "module_type",
                                default: $scope.pvProperties.moduleType[0].id,
                                type: "select",
                                title: "Module Type",
                                required: 'all'
                            },
                            {
                                name: "losses",
                                default: 10,
                                type: "number",
                                title: "Losses (%)",
                                required: 'all'
                            },
                            {
                                name: "array_type",
                                default: $scope.pvProperties.arrayType[0].id,
                                type: "select",
                                title: "Array Type",
                                required: 'all'
                            },
                            {
                                name: "tilt",
                                default: 10.0,
                                type: "number",
                                title: "Tilt (Degrees)",
                                required: 'all'
                            },
                            {
                                name: "azimuth",
                                default: 180.0,
                                type: "number",
                                title: "Azimuth (Degrees)",
                                required: "all"
                            },
                            {
                                name: "inv_eff",
                                default: 96.0,
                                type: "number",
                                title: "Inverter Efficiency (Degrees)",
                                required: 'all'
                            }
                        ]
                    };
                };
                setPropertyModelFields();


                //for setting defaults based on building Type, Country does not matter here due to unused parameters upon analysis
                $scope.setDefaults = function() {

                        setPropertyModelFields();

                        // set the defaults
                        $scope.propertyModelFields.pvSystem.forEach(function (v){
                            $scope.propertyModel[v.name] = v.default;
                        });
                };


            }]
        };
    }]);



  return mod;
});


