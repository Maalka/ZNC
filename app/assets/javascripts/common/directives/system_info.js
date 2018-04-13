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
                forms: '=forms',
                index: '=idx',
            },

            templateUrl: function(){
                   return 'javascripts/common/partials/pv_fields.html';
            },

            controller: ["$scope", function ($scope) {

                $scope.benchmark = $scope.$parent;
                $scope.propFieldsRequired = false;
                $scope.pvModel = {};
                $scope.model.pvModel = $scope.pvModel ;
                $scope.model.valid = false;
                $scope.name = $scope.model.name;
                $scope.showDivider = $scope.model.showDivider;

                $scope.$watch("forms.baselineForm.$valid", function (validity) {
                    $scope.model.valid = validity;
                });

                $scope.clearParams = function(){

                    $scope.pvModel.module_type=null;
                    $scope.pvModel.losses=null;
                    $scope.pvModel.array_type=null;
                    $scope.pvModel.tilt=null;
                    $scope.pvModel.azimuth=null;
                    $scope.pvModel.inv_eff=null;
                    $scope.pvModel.estimated_area=null;
                };

                $scope.round = function(number, precision) {
                  var factor = Math.pow(10, precision);
                  return Math.round(number * factor) / factor;
                };

                $scope.$watch("defaultValues", function () {
                    if($scope.defaultValues){
                        $scope.setDefaults();
                    } else {
                        $scope.clearParams();
                    }
                });

                $scope.removePV = function() {
                    $scope.$parent.removePV(this);
                };

                $scope.addPV = function() {
                    $scope.$parent.addPV();
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
                            {id:0,name:"Fixed - Open Rack"},
                            {id:1,name:"Fixed - Roof Mounted"},
                            {id:2,name:"1-Axis"},
                            {id:3,name:"1-Axis Backtracking"},
                            {id:4,name:"2-Axis"}
                   ],
                   moduleType: [
                            {id:0,name:"Standard"},
                            {id:1,name:"Premium"},
                            {id:2,name:"Thin Film)"}
                           ]
               };

                var setpvModelFields = function()  {
                    $scope.pvModelFields = {
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
                setpvModelFields();


                //for setting defaults based on building Type, Country does not matter here due to unused parameters upon analysis
                $scope.setDefaults = function() {

                    setpvModelFields();

                    // set the defaults
                    $scope.pvModelFields.pvSystem.forEach(function (v){
                        $scope.pvModel[v.name] = v.default;
                    });

                    var floor_area = 0.0;
                    var floor_area_units = "ftSQ";

                    for (var i =0; i < $scope.benchmark.propTypes.length; i ++) {
                        var units = $scope.benchmark.propTypes[i].propertyModel.floor_area_units;

                        if(units === "mSQ"){
                            floor_area = floor_area + $scope.benchmark.propTypes[i].propertyModel.floor_area;
                        } else {
                             floor_area = floor_area + $scope.benchmark.propTypes[i].propertyModel.floor_area / 10.7639;
                        }

                    }

                    if ($scope.benchmark.propTypes[0].propertyModel.floor_area_units === "mSQ"){
                        floor_area_units = "mSQ";
                    }


                    var stories = $scope.benchmark.auxModel.stories;

                    if (stories !== undefined && stories !== null && floor_area !== undefined && floor_area !== null){

                        var estimated_area = (floor_area / stories) - 8 * (Math.sqrt(floor_area / stories) - 2);
                        if (floor_area_units === "mSQ"){
                            $scope.pvModel.estimated_area = $scope.round(estimated_area,1);
                            $scope.pvModel.pv_area_units = "mSQ";
                        } else {
                            $scope.pvModel.estimated_area = $scope.round(estimated_area * 10.7639,1);
                            $scope.pvModel.pv_area_units = "ftSQ";
                        }

                    } else {
                        $scope.pvModel.estimated_area = null;
                        $scope.pvModel.pv_area_units = "mSQ";
                    }
                };


            }]
        };
    }]);

  return mod;
});


