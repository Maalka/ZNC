/*global
    maalkaIncludeHeader
*/
/**
 * Dashboard controllers.
 */
//define(["./test/sample_response_test_data"], function(sampleTestData) {
define(['angular'], function() {
  'use strict';
  var RootCtrl = function($rootScope) { 
    $rootScope.includeHeader = maalkaIncludeHeader;
  };

  RootCtrl.$inject = ['$rootScope'];

  var DashboardCtrl = function($rootScope, $scope, $window, $sce, $timeout, $q, $log, benchmarkServices) {

    $rootScope.includeHeader = maalkaIncludeHeader;
    $rootScope.pageTitle = "ZNC Tool";


    $scope.auxModel = {};
    $scope.tempModel = {};
    $scope.energies = [{}, {}];
    $scope.pvList = [{id:0,name:"PV SYSTEM",showDivider:false}];
    $scope.pvCounter = 1;

    $scope.benchmarkResult = null;

    $scope.propOutputList = [];
    $scope.tableEUIUnits = null;
    $scope.tableEnergyUnits = null;
    $scope.forms = {'hasValidated': false};
    $scope.propTypes = [];
    $scope.mainColumnWidth = "";
    $scope.propText = "Primary Building Use";


    if (window.matchMedia) {

        var printQueryList = window.matchMedia('print');
        var phoneQueryList = window.matchMedia('(max-width: 767px)');      
        var tabletQueryList = window.matchMedia('(min-width: 768px) and (max-width: 1200px)');            
        var desktopQueryList = window.matchMedia('(min-width: 1200px) and (max-width: 1919px');                  
        var largeQueryList = window.matchMedia('(min-width: 1919px)');                  

        var updateMatchMedia= function (q) { 
            console.log(q);
            if (printQueryList.matches) {
                $scope.media = "print";                                    
            } else if (phoneQueryList.matches) {
                $scope.media = "phone";                        
            } else if (tabletQueryList.matches) { 
                $scope.media = "tablet";            
            } else if (desktopQueryList.matches) { 
                $scope.media = "desktop";
            } 

            if (largeQueryList.matches) {
                $scope.largeScreen = true;
            } else {
                $scope.largeScreen = false;
            }

            console.log($scope.media);
            $timeout(function () {
                $scope.$apply();
            });
        };
        updateMatchMedia();

        printQueryList.addListener(updateMatchMedia);

        $scope.$on("$destroy", function handler() {
            printQueryList.removeListener(updateMatchMedia);
        });
    }

    $scope.$watch("tempModel.buildingType", function (v) {
        if (v === undefined || v === null) {
            return; 
        }

        if(v){

            $scope.propTypes.push({
                changeTo: v,
                type: v.id,
                name: v.name,
            });

            $scope.propText="Add Another Use";
            $scope.tempModel.resetBuildingType = true;
            $scope.tempModel.buildingType = undefined;
        }
    });

    $scope.updatePropType = function($index) {

        $scope.propTypes[$index] = {
            changeTo: $scope.propTypes[$index].changeTo,
            type: $scope.propTypes[$index].changeTo.id,
            name: $scope.propTypes[$index].changeTo.name,
        };
    };

    $scope.$watch("auxModel.country", function () {
        $scope.benchmarkResult = null;
        $scope.clearGeography();
    });

    $scope.clearGeography = function () {
        $scope.auxModel.city = undefined;
    };


    //populate user-input energy information table to calculate site/source EUI and Energy Star metrics
    //display errors when present
    $scope.addEnergiesRow = function(){
        $scope.energies.push({});
    };

    $scope.print = function () {
        window.print();
    };

    $scope.removeRow = function(index){
        $scope.energies.splice(index, 1);
        if ($scope.energies.length ===    1) {
            $scope.addEnergiesRow();
        }
    };


    $scope.removeProp = function(prop){
        var index;
        for(var i = 0; i < $scope.propTypes.length; i++ ) {
            if($scope.propTypes[i].name === prop.model.name) {
                index = i;
                break;
            }
        }
        $scope.propTypes.splice(index, 1);
    };

    $scope.showDivider = function() {
        if($scope.pvList.length > 1){
            return true;
            }else {
            return false;
                }
    };

    $scope.addPV = function(){
        var divider = true;
        if ($scope.pvList.length ===  0) {
            divider = false;
        }
        $scope.pvList.push({id:$scope.pvCounter,name:"PV SYSTEM",showDivider:divider});
        $scope.pvCounter = $scope.pvCounter + 1;
    };

    $scope.removePV = function(pv){
        var index;
        for(var i = 0; i < $scope.pvList.length; i++ ) {
            if($scope.pvList[i].id === pv.model.id) {
                index = i;
                break;
            }
        }

        $scope.pvList.splice(index, 1);

        if ($scope.pvList.length ===  0) {
            $scope.addPV();
        }
    };


    $scope.clearProp = function(prop){
        var index;

        for(var i = 0; i < $scope.propTypes.length; i++ ) {
            if($scope.propTypes[i].name === prop.name) {
                index = i;
                break;
            }
        }

        $scope.propTypes.splice(index, 1);
        if($scope.propTypes.length === 0){
            $scope.propText="Primary Building Use";
        }
    };

    $scope.computeBenchmarkResult = function(){


        $log.info($scope.submitArray);

        $scope.futures = benchmarkServices.getZNCMetrics($scope.submitArray);

        $q.resolve($scope.futures).then(function (results) {
            $scope.scoreGraph = "Rating";
            $scope.FFText = $sce.trustAsHtml('Site EUI');

            $scope.benchmarkResult = $scope.computeBenchmarkMix(results);
            $scope.benchmarkResult.city = $scope.auxModel.city;
        });
    };


    $scope.getPropResponseField = function(propResponse,key){
        var returnValue;

        for (var i =0; i < propResponse.values.length; i ++) {
            if (propResponse.values[i][key] !== undefined) {
              returnValue = propResponse.values[i][key];
              break;
            }
        }
        return returnValue;
    };

    $scope.computeBenchmarkMix = function(results){

        $scope.propOutputList = $scope.getPropResponseField(results,"propOutputList");
        $scope.percentBetterSiteEUI = Math.ceil($scope.getPropResponseField(results,"percentBetterSiteEUI"));
        $scope.siteEUI = Math.ceil($scope.getPropResponseField(results,"siteEUI"));

        var metricsTable = [

              {"test": $scope.getPropResponseField(results,"tester")},
              {"test": $scope.getPropResponseField(results,"tester")}

        ];
        return metricsTable;
    };

    $scope.submitErrors = function () {
        for (var i = 0; i < $scope.forms.baselineForm.$error.required.length; i++){
            $log.info($scope.forms.baselineForm.$error.required[i].$name);
        }
    };

    $scope.$watch("auxModel.reportingUnits", function (value) {
        if (value === undefined) {
            return;
        }
        // only submit if the user has already CLICK on the submit button
        if($scope.forms.hasValidated) {
            $scope.submit();
        }
    });

    $scope.submit = function () {
        if($scope.forms.baselineForm === undefined) {
            return;
        }
        $scope.forms.hasValidated = true; /// only check the field errors if this form has attempted to validate.

        if($scope.auxModel.reportingUnits==="imperial"){
            $scope.tableEnergyUnits="(kBtu/yr)";
            $scope.tableEUIUnits="(kBtu/ft²/yr)";
        }else {
            $scope.tableEnergyUnits="(kWh/yr)";
            $scope.tableEUIUnits="(kWh/m²/yr)";
        }

        var validEnergy = function(e) {
            return (e.energy_type !== undefined &&
                    e.energy_name !== undefined &&
                    e.energy_units !== undefined &&
                    e.energy_use);
        };

        var mapEnergy = function (e) {
            return {
                'energy_type': (e.energy_type) ? e.energy_type.id : undefined,
                'energy_name': (e.energy_type) ? e.energy_type.name : null,
                'energy_units': e.energy_units,
                'energy_use': Number(e.energy_use)
            };
        };

        var getFullEnergyList = function () {

            var energyListFromRegular = $scope.energies.map(mapEnergy).filter(validEnergy);

            energyListFromRegular.push.apply(energyListFromRegular);

            return energyListFromRegular;
        };

        var getPropTypes = function () {

            var props = [];
            for (var i =0; i < $scope.propTypes.length; i ++) {
                props.push($scope.propTypes[i].propertyModel);
                }
            return props;
        };

        var getPVData = function () {

            var pv_data = [];
            for (var i =0; i < $scope.pvList.length; i ++) {
                pv_data.push($scope.pvList[i].pvModel);
                }
            return pv_data;
        };

        var getCityValue = function (value) {

            for (var i =0; i < $scope.geographicProperties.city.length; i ++) {
                if($scope.geographicProperties.city[i].id === $scope.auxModel.city){
                    return $scope.geographicProperties.city[i][value];
                }
            }
        };


        if($scope.forms.baselineForm.$valid){

            $scope.submitArray = [];

            $scope.auxModel.climate_zone = getCityValue("climate_zone");
            $scope.auxModel.file_id = getCityValue("file_id");

            if($scope.energies.map(mapEnergy).filter(validEnergy).length===0){
                $scope.auxModel.energies=null;
            } else {
                $scope.auxModel.energies = getFullEnergyList();
            }

            $scope.auxModel.prop_types = getPropTypes();
            $scope.auxModel.pv_data = getPVData();

            $scope.submitArray.push($scope.auxModel);
            $scope.computeBenchmarkResult();

        }else {
            $scope.submitErrors();
            $scope.benchmarkResult = null;
        }

    };

        $scope.geographicProperties = {
                country:
                    [{id:"USA",name:"United States"},
                    {id:"Canada",name:"Canada"}],
                city:
                    [
                    {id:"Chicago",name:"Chicago",climate_zone:"1A",file_id:"0-93738",filter_id:"USA"},
                    {id:"New York City",name:"New York City",climate_zone:"1A",file_id:"0-93738",filter_id:"USA"},
                    {id:"Toronto",name:"Toronto",climate_zone:"1A",file_id:"0-93738",filter_id:"Canada"},
                    {id:"Vancouver",name:"Vancouver",climate_zone:"1A",file_id:"0-93738",filter_id:"Canada"}
                    ]
            };

        $scope.buildingProperties = {

            buildingType: {
                commercial: [
                    {id:"OfficeLarge",name:"Office - Large"},
                    {id:"OfficeMedium",name:"Office - Medium"},
                    {id:"OfficeSmall",name:"Office - Small"},
                    {id:"Office",name:"Office - Other"},
                    {id:"RetailStandalone",name:"Retail - Standalone"},
                    {id:"RetailStripmall",name:"Retail - Stripmall"},
                    {id:"Retail",name:"Retail - Other"},
                    {id:"SchoolPrimary",name:"School - Primary"},
                    {id:"SchoolSecondary",name:"School - Secondary"},
                    {id:"School",name:"School - Other"},
                    {id:"Hospital",name:"Hospital"},
                    {id:"OutPatientHealthCare",name:"Healthcare - Outpatient"},
                    {id:"Healthcare",name:"Healthcare - Other"},
                    {id:"RestaurantSitDown",name:"Restaurant - Sit Down"},
                    {id:"RestaurantFastFood",name:"Restaurant - Fast Food"},
                    {id:"Restaurant",name:"Restaurant - Other"},
                    {id:"HotelLarge",name:"Hotel - Large"},
                    {id:"HotelSmall",name:"Hotel - Small"},
                    {id:"Hotel",name:"Hotel - Other"},
                    {id:"Warehouse",name:"Warehouse"},
                    {id:"ApartmentHighRise",name:"Apartment - High Rise"},
                    {id:"ApartmentMidRise",name:"Apartment - Mid Rise"} ,
                    {id:"Apartment",name:"Apartment - Other"},
                    {id:"AllOthers",name:"Other"}
                ]
            }
        };

        $scope.energyProperties = {

            energyType:[
                {id:"electricity",name:"Electricity"},
                {id:"natural_gas",name:"Natural Gas"},
                {id:"fuel_oil",name:"Fuel Oil"},
                {id:"propane",name:"Propane"},
                {id:"steam",name:"District Steam"},
                {id:"hot_water",name:"District Hot Water"},
                {id:"chilled_water",name:"District Chilled Water"},
                {id:"coal",name:"Coal"},
                {id:"other",name:"Diesel"},
                {id:"other",name:"Wood"},
                {id:"other",name:"Coke"},
                {id:"other",name:"Other"}
            ],

            energyUnits: [
                //<!--Electricity - Grid -->
                {id:"KBtu",name:"kBtu",filter_id:"electricity"},
                {id:"MBtu",name:"MBtu",filter_id:"electricity"},
                {id:"kWh",name:"kWh",filter_id:"electricity"},
                {id:"MWh",name:"MWh",filter_id:"electricity"},
                {id:"GJ",name:"GJ",filter_id:"electricity"},

                //<!--Natural Gas -->
                {id:"NGMcf",name:"MCF",filter_id:"natural_gas"},
                {id:"NGKcf",name:"kcf",filter_id:"natural_gas"},
                {id:"NGCcf",name:"ccf",filter_id:"natural_gas"},
                {id:"NGcf",name:"cf",filter_id:"natural_gas"},
                {id:"NGm3",name:"Cubic Meters",filter_id:"natural_gas"},
                {id:"GJ",name:"GJ",filter_id:"natural_gas"},
                {id:"KBtu",name:"kBtu",filter_id:"natural_gas"},
                {id:"MBtu",name:"MBtu",filter_id:"natural_gas"},
                {id:"Therms",name:"Therms",filter_id:"natural_gas"},

                //<!--Fuel Oil No. 1 -->
                {id:"KBtu",name:"kBtu",filter_id:"fuel_oil"},
                {id:"MBtu",name:"MBtu ",filter_id:"fuel_oil"},
                {id:"GJ",name:"GJ",filter_id:"fuel_oil"},

                //<!--Propane-->
                {id:"GJ",name:"GJ",filter_id:"propane"},
                {id:"KBtu",name:"kBtu",filter_id:"propane"},
                {id:"MBtu",name:"MBtu",filter_id:"propane"},
                {id:"PropaneUKG",name:"Gallons (UK)",filter_id:"propane"},
                {id:"PropaneUSG",name:"Gallons",filter_id:"propane"},
                {id:"PropaneCf",name:"kcf",filter_id:"propane"},
                {id:"PropaneCCf",name:"ccf",filter_id:"propane"},
                {id:"PropaneKCf",name:"cf",filter_id:"propane"},
                {id:"PropaneL",name:"Liters",filter_id:"propane"},

                //<!--District Steam-->
                {id:"GJ",name:"GJ",filter_id:"steam"},
                {id:"KBtu",name:"kBtu",filter_id:"steam"},
                {id:"MBtu",name:"MBtu",filter_id:"steam"},
                {id:"therms",name:"Therms",filter_id:"steam"},
                {id:"SteamLb",name:"Pounds",filter_id:"steam"},
                {id:"SteamKLb",name:"Thousand pounds",filter_id:"steam"},
                {id:"SteamMLb",name:"Million pounds",filter_id:"steam"},

                //<!--District Hot Water-->
                {id:"KBtu",name:"kBtu",filter_id:"hot_water"},
                {id:"MBtu",name:"MBtu",filter_id:"hot_water"},
                {id:"GJ",name:"GJ",filter_id:"hot_water"},
                {id:"therms",name:"Therms",filter_id:"hot_water"},

                //<!--District Chilled Water-->
                {id:"KBtu",name:"kBtu",filter_id:"chilled_water"},
                {id:"MBtu",name:"MBtu",filter_id:"chilled_water"},
                {id:"GJ",name:"GJ",filter_id:"chilled_water"},
                {id:"CHWTonH",name:"Ton Hours",filter_id:"chilled_water"},

                //<!--Coal-->
                {id:"KBtu",name:"kBtu",filter_id:"coal"},
                {id:"MBtu",name:"MBtu",filter_id:"coal"},
                {id:"GJ",name:"GJ",filter_id:"coal"},

                //<!--Other-->
                {id:"KBtu",name:"kBtu",filter_id:"other"},
                {id:"MBtu",name:"MBtu",filter_id:"other"},
                {id:"kWh",name:"kWh",filter_id:"other"},
                {id:"MWh",name:"MWh",filter_id:"other"},
                {id:"GJ",name:"GJ",filter_id:"other"}
                ]
        };


  };
  DashboardCtrl.$inject = ['$rootScope', '$scope', '$window','$sce','$timeout', '$q', '$log', 'benchmarkServices'];
  return {
    DashboardCtrl: DashboardCtrl,
    RootCtrl: RootCtrl    

  };
});
