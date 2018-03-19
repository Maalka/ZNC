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


    $scope.$watch("auxModel.buildingType", function (v) {
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
            $scope.auxModel.resetBuildingType = true;
            $scope.auxModel.buildingType = undefined;
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


        $log.info($scope.auxModel);

        $scope.futures = benchmarkServices.getZNCMetrics($scope.auxModel);

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

        if($scope.auxModel.reportingUnits==="us"){
            $scope.tableEnergyUnits="(kBtu/yr)";
            $scope.tableEUIUnits="(kBtu/ft²/yr)";
        }else {
            $scope.tableEnergyUnits="(kWh/yr)";
            $scope.tableEUIUnits="(kWh/m²/yr)";
        }

        var validEnergy = function(e) {
            return (e.energyType !== undefined &&
                    e.energyName !== undefined &&
                    e.energyUnits !== undefined &&
                    e.energyUse);
        };

        var mapEnergy = function (e) {
            return {
                'energyType': (e.energyType) ? e.energyType.id : undefined,
                'energyName': (e.energyType) ? e.energyType.name : undefined,
                'energyUnits': e.energyUnits,
                'energyUse': Number(e.energyUse),
                'energyRate': null
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



        if($scope.forms.baselineForm.$valid){

            if($scope.energies.map(mapEnergy).filter(validEnergy).length===0){
                $scope.auxModel.energies=null;
            } else {
                $scope.auxModel.energies = getFullEnergyList();
            }

            $scope.auxModel.prop_types = getPropTypes();
            $scope.auxModel.pv_data = getPVData();

            $scope.computeBenchmarkResult();

        }else {
            $scope.submitErrors();
            $scope.benchmarkResult = null;
        }

    };

        $scope.geographicProperties = {
                city:
                    [
                    {id:"Chicago",name:"Chicago",filter_id:"USA"},
                    {id:"New York City",name:"New York City",filter_id:"USA"},
                    {id:"Toronto",name:"Toronto",filter_id:"Canada"},
                    {id:"Vancouver",name:"Vancouver",filter_id:"Canada"}
                    ],
                country:
                    [{id:"USA",name:"United States"},
                    {id:"Canada",name:"Canada"}],
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
                {id:"grid",name:"Electric (Grid)"},
                {id:"naturalGas",name:"Natural Gas"},
                {id:"fuelOil1",name:"Fuel Oil 1"},
                {id:"fuelOil2",name:"Fuel Oil 2"},
                {id:"fuelOil4",name:"Fuel Oil 4"},
                {id:"fuelOil6",name:"Fuel Oil 5,6"},
                {id:"propane",name:"Propane"},
                {id:"kerosene",name:"Kerosene"},
                {id:"steam",name:"District Steam"},
                {id:"hotWater",name:"District Hot Water"},
                {id:"chilledWater",name:"District Chilled Water (Absorption)"},
                {id:"chilledWater",name:"District Chilled Water (Electric)"},
                {id:"chilledWater",name:"District Chilled Water (Engine)"},
                {id:"chilledWater",name:"District Chilled Water (Other)"},
                {id:"wood",name:"Wood"},
                {id:"coke",name:"Coke"},
                {id:"coalA",name:"Coal (Anthracite)"},
                {id:"coalB",name:"Coal (Bituminous) "},
                {id:"diesel",name:"Diesel"},
                {id:"other",name:"Other"}
            ],

            energyUnits: [
                //<!--Electricity - Grid -->
                {id:"KBtu",name:"kBtu",filter_id:"grid"},
                {id:"MBtu",name:"MBtu",filter_id:"grid"},
                {id:"kWh",name:"kWh",filter_id:"grid"},
                {id:"MWh",name:"MWh",filter_id:"grid"},
                {id:"GJ",name:"GJ",filter_id:"grid"},

                //<!--Natural Gas -->
                {id:"NGMcf",name:"MCF",filter_id:"naturalGas"},
                {id:"NGKcf",name:"kcf",filter_id:"naturalGas"},
                {id:"NGCcf",name:"ccf",filter_id:"naturalGas"},
                {id:"NGcf",name:"cf",filter_id:"naturalGas"},
                {id:"NGm3",name:"Cubic Meters",filter_id:"naturalGas"},
                {id:"GJ",name:"GJ",filter_id:"naturalGas"},
                {id:"KBtu",name:"kBtu",filter_id:"naturalGas"},
                {id:"MBtu",name:"MBtu",filter_id:"naturalGas"},
                {id:"therms",name:"Therms",filter_id:"naturalGas"},

                //<!--Fuel Oil No. 1 -->
                {id:"KBtu",name:"kBtu",filter_id:"fueloil1Unit"},
                {id:"MBtu",name:"MBtu ",filter_id:"fueloil1Unit"},
                {id:"GJ",name:"GJ",filter_id:"fueloil1Unit"},
                {id:"No1UKG",name:"Gallons (UK)",filter_id:"fueloil1Unit"},
                {id:"No1USG",name:"Gallons",filter_id:"fueloil1Unit"},
                {id:"No1L",name:"Liters",filter_id:"fueloil1Unit"},

                //<!--Fuel Oil No. 2 -->
                {id:"KBtu",name:"kBtu",filter_id:"fueloil2Unit"},
                {id:"MBtu",name:"MBtu",filter_id:"fueloil2Unit"},
                {id:"GJ",name:"GJ",filter_id:"fueloil2Unit"},
                {id:"No2UKG",name:"Gallons (UK)",filter_id:"fueloil2Unit"},
                {id:"No2USG",name:"Gallons",filter_id:"fueloil2Unit"},
                {id:"No2L",name:"Liters",filter_id:"fueloil2Unit"},

                //<!--Fuel Oil No. 4 -->
                {id:"KBtu",name:"kBtu",filter_id:"fueloil4Unit"},
                {id:"MBtu",name:"MBtu",filter_id:"fueloil4Unit"},
                {id:"GJ",name:"GJ",filter_id:"fueloil4Unit"},
                {id:"No4UKG",name:"Gallons (UK)",filter_id:"fueloil4Unit"},
                {id:"No4USG",name:"Gallons",filter_id:"fueloil4Unit"},
                {id:"No4L",name:"Liters",filter_id:"fueloil4Unit"},

                //<!--Fuel Oil No. 5,6 -->
                {id:"KBtu",name:"kBtu",filter_id:"fueloil6Unit"},
                {id:"MBtu",name:"MBtu",filter_id:"fueloil6Unit"},
                {id:"GJ",name:"GJ",filter_id:"fueloil6Unit"},
                {id:"No6UKG",name:"Gallons (UK)",filter_id:"fueloil6Unit"},
                {id:"No6USG",name:"Gallons",filter_id:"fueloil6Unit"},
                {id:"No6L",name:"Liters",filter_id:"fueloil6Unit"},

                //<!--Diesel-->
                {id:"KBtu",name:"kBtu",filter_id:"diesel"},
                {id:"MBtu",name:"MBtu",filter_id:"diesel"},
                {id:"GJ",name:"GJ",filter_id:"diesel"},
                {id:"DieselUKG",name:"Gallons (UK)",filter_id:"diesel"},
                {id:"DieselUSG",name:"Gallons",filter_id:"diesel"},
                {id:"DieselL",name:"Liters",filter_id:"diesel"},

                //<!--Kerosene-->
                {id:"KBtu",name:"kBtu",filter_id:"kerosene"},
                {id:"MBtu",name:"MBtu",filter_id:"kerosene"},
                {id:"GJ",name:"GJ",filter_id:"kerosene"},
                {id:"KeroseneUKG",name:"Gallons (UK)",filter_id:"kerosene"},
                {id:"KeroseneUSG",name:"Gallons",filter_id:"kerosene"},
                {id:"KeroseneL",name:"Liters",filter_id:"kerosene"},

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
                {id:"KBtu",name:"kBtu",filter_id:"hotWater"},
                {id:"MBtu",name:"MBtu",filter_id:"hotWater"},
                {id:"GJ",name:"GJ",filter_id:"hotWater"},
                {id:"therms",name:"Therms",filter_id:"hotWater"},

                //<!--District Chilled Water-->
                {id:"KBtu",name:"kBtu",filter_id:"chilledWater"},
                {id:"MBtu",name:"MBtu",filter_id:"chilledWater"},
                {id:"GJ",name:"GJ",filter_id:"chilledWater"},
                {id:"CHWTonH",name:"Ton Hours",filter_id:"chilledWater"},

                //<!--Coal (Anthracite)-->
                {id:"KBtu",name:"kBtu",filter_id:"coalA"},
                {id:"MBtu",name:"MBtu",filter_id:"coalA"},
                {id:"GJ",name:"GJ",filter_id:"coalA"},
                {id:"CoalATon",name:"Tons",filter_id:"coalA"},
                {id:"CoalATonne",name:"Tonnes (Metric)",filter_id:"coalA"},
                {id:"CoalALb",name:"Pounds",filter_id:"coalA"},
                {id:"CoalAKLb",name:"Thousand Pounds",filter_id:"coalA"},
                {id:"CoalAMLb",name:"Million Pounds",filter_id:"coalA"},

                //<!--Coal (Bituminous)-->
                {id:"KBtu",name:"kBtu",filter_id:"coalB"},
                {id:"MBtu",name:"MBtu",filter_id:"coalB"},
                {id:"GJ",name:"GJ",filter_id:"coalB"},
                {id:"CoalBitTon",name:"Tons",filter_id:"coalB"},
                {id:"CoalBitTonne",name:"Tonnes (Metric)",filter_id:"coalB"},
                {id:"CoalBitLb",name:"Pounds",filter_id:"coalB"},
                {id:"CoalBitKLb",name:"Thousand Pounds",filter_id:"coalB"},
                {id:"CoalBitMLb",name:"Million Pounds",filter_id:"coalB"},

                //<!--Coke-->
                {id:"KBtu",name:"kBtu",filter_id:"coke"},
                {id:"MBtu",name:"MBtu",filter_id:"coke"},
                {id:"GJ",name:"GJ",filter_id:"coke"},
                {id:"CokeTon",name:"Tons",filter_id:"coke"},
                {id:"CokeTonne",name:"Tonnes (Metric)",filter_id:"coke"},
                {id:"CokeLb",name:"Pounds",filter_id:"coke"},
                {id:"CokeKLb",name:"Thousand Pounds",filter_id:"coke"},
                {id:"CokeMLb",name:"Million Pounds",filter_id:"coke"},

                //<!--Wood-->
                {id:"KBtu",name:"kBtu",filter_id:"wood"},
                {id:"MBtu",name:"MBtu",filter_id:"wood"},
                {id:"GJ",name:"GJ",filter_id:"wood"},
                {id:"WoodTon",name:"Tons",filter_id:"wood"},
                {id:"WoodTonne",name:"Tonnes (Metric)",filter_id:"wood"},

                //<!--Other-->
                {id:"KBtu",name:"kBtu",filter_id:"other"},
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
