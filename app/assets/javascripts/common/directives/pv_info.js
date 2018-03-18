/**
 * A building property directive
 * changes form inputs based on property type
 * and supports multiple property types
 */
define(['angular','./main'], function(angular) {
  'use strict';

  var mod = angular.module('common.directives');

    mod.directive('pvInfo', [function() {
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

                $scope.benchmark = $scope.$parent;
                $scope.propFieldsRequired = false;
                $scope.propertyModel = {};
                $scope.model.propertyModel = $scope.propertyModel ;
                $scope.model.propertyModel.buildingType = $scope.model.type;

                $scope.model.valid = false;

                $scope.$watch("forms.baselineForm.$valid", function (validity) {
                    $scope.model.valid = validity;
                });

                $scope.round = function(value, decimals) {
                    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
                };

                //auto-populate default parameters by building type and country
                $scope.$watch("propertyModel.defaultValues", function () {
                    if($scope.propertyModel.defaultValues){
                            $scope.setDefaults();
                    } else {
                        $scope.clearParams();
                    }

                });
                // if the building type changes.  then 
                $scope.$watch('model.propertyModel.buildingType', function (propertyType, lastValue) { 
                    if (propertyType !== undefined && lastValue !== undefined){
                        setPropertyModelFields();
                    }
                });

                $scope.removeProp = function() { 
                    $scope.$parent.removeProp(this);
                };
                $scope.isRequired = function(field) {
                    if (field.required === undefined) {
                        return false;
                    } else if (field.required === $scope.model.country) {
                        return true;
                    } else if (field.required === "all") {
                        return true;
                    } else {
                        return false;
                    }
                };
                $scope.isShown = function (field) {
                    if (field.required === undefined) {
                        return true;
                    } else if (field.required === $scope.model.country) {
                        return true;
                    } else if (field.required === "all") {
                        return true;
                    } else {
                        return false;
                    }
                };
                $scope.required = function(field) {
                    return $scope.isRequired(field) ? "required" : "";
                };

                $scope.$watch("propertyModel.areaUnits", function () {
                    if($scope.propertyModel.GFA && $scope.propertyModel.areaUnits){
                        if($scope.propertyModel.defaultValues===true){$scope.setDefaults();}
                    }
                });

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
                        Hospital    : [
                            {
                                name: "module_type",
                                default: $scope.pvProperties.module_type[0].id,
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
                                default: $scope.pvProperties.array_type[0].id,
                                type: "number",
                                title: "Number of Full Time Workers",
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
                            },
                            {
                                name: "pv_area_units",
                                default:  $scope.buildingProperties.areaHVAC[10].id,
                                type: "select",
                                fields: $scope.buildingProperties.areaHVAC,
                                title: "Percent Cooled",
                                required: 'all'
                            }
                        ]
                    };
                };
                setPropertyModelFields();

                //for setting defaults based on building Type, Country does not matter here due to unused parameters upon analysis
                $scope.setDefaults = function() {

                        var prop = $scope.model.type;

                        setPropertyModelFields();

                        // set the defaults
                        $scope.propertyModelFields[prop].forEach(function (v){
                            $scope.propertyModel[v.name] = v.default;

                        });
                };


                $scope.clearParams = function(){

                    $scope.propertyModel.module_type=null;
                    $scope.propertyModel.losses=null;
                    $scope.propertyModel.array_type=null;
                    $scope.propertyModel.tilt=null;
                    $scope.propertyModel.azimuth=null;
                    $scope.propertyModel.inv_eff=null;
                };
            }]
        };
    }]);



  return mod;
});


