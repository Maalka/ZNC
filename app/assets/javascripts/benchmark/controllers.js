/*global
    maalkaIncludeHeader
*/
/**
 * Dashboard controllers.
 */
//define(["./test/sample_response_test_data"], function(sampleTestData) {
define(['angular','json!../../data/cities.json'], function(angular, cities) {
  'use strict';
  var RootCtrl = function($rootScope) {
    $rootScope.includeHeader = maalkaIncludeHeader;
  };


  RootCtrl.$inject = ['$rootScope'];

  var DashboardCtrl = function($rootScope, $scope, $window, $sce, $timeout, $q, $log, benchmarkServices) {



    $rootScope.includeHeader = maalkaIncludeHeader;
    $rootScope.pageTitle = "ZNC Tool";


    $scope.auxModel = {};
    $scope.temp = {};
    $scope.auxModel.state = "";
    $scope.auxModel.approach = null;
    $scope.auxModel.prescriptive_resource = null;
    $scope.tempModel = {};
    $scope.energies = [{}, {}];
    $scope.pvList = [];
    $scope.pvCounter = 1;

    $scope.userSystemList = [];
    $scope.userSystemCounter = 1;

    $scope.benchmarkResult = null;

    $scope.propOutputList = [];
    $scope.tableEUIUnits = null;
    $scope.tableEnergyUnits = null;
    $scope.forms = {'hasValidated': false};
    $scope.propTypes = [];
    $scope.mainColumnWidth = "";
    $scope.propText = "Primary Building Use";

    $scope.showEnergy = true;
    $scope.showBar = false;
    $scope.showSolar = false;


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

    function add(a, b) {
        return a + b;
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


    $scope.$watch("auxModel.pv_method", function (v) {
        if(v === "pvWatts"){
            $scope.userSystemList = [];
            $scope.pvList.push({id:0,name:"",showDivider:false});
        } else {
            $scope.pvList = [];
            $scope.userSystemList.push({id:0,name:"",showDivider:false});
        }

        $scope.buildingRequirements = null;
        $scope.solarResults =null;
        $scope.pv_capacity = null;
        $scope.solarMonthly = null;
        $scope.prescriptiveRequirements = null;
        $scope.endUses = null;
        $scope.showSolar = false;
        $scope.showBar = false;

    });

    $scope.clearGeography = function () {
        $scope.temp.city = undefined;
        $scope.auxModel.state = undefined;
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
        $scope.pvList.push({id:$scope.pvCounter,name:"",showDivider:divider});
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


      $scope.addUserSystem = function(){
          var divider = true;
          if ($scope.userSystemList.length ===  0) {
              divider = false;
          }
          $scope.userSystemList.push({id:$scope.userSystemCounter,name:"",showDivider:divider});
          $scope.userSystemCounter = $scope.userSystemCounter + 1;
      };

      $scope.removeUserSystem = function(pv){
          var index;
          for(var i = 0; i < $scope.userSystemList.length; i++ ) {
              if($scope.userSystemList[i].id === pv.model.id) {
                  index = i;
                  break;
              }
          }

          $scope.userSystemList.splice(index, 1);

          if ($scope.userSystemList.length ===  0) {
              $scope.addUserSystem();
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

    $scope.showPrescriptive = function(){
        if($scope.showBar===false){
                $scope.showBar = true;
            } else {
                $scope.showBar = false;
            }
    };
    $scope.showEnergyRequirement = function(){
        if($scope.showEnergy===false){
                $scope.showEnergy = true;
            } else {
                $scope.showEnergy = false;
            }
    };
    $scope.showSolarPlot = function(){
        if($scope.showSolar===false){
                $scope.showSolar = true;
            } else {
                $scope.showSolar = false;
            }
    };


    $scope.getFile = function(city){

            var getStation = function(stations){
                if ($scope.auxModel.country === 'United States'){
                    return stations.us_station.id;
                } else {
                    return stations.intl_station.id;
                }
            };

            var location = {"lat":city.lat, "lon":city.lon};
            $scope.futures = benchmarkServices.getSolarFile(location);
            $q.resolve($scope.futures).then(function (results) {
                $scope.auxModel.file_id = (typeof results === 'undefined') ? null : getStation(results);
            });
        };

    $scope.computeBenchmarkResult = function(){

        $log.info($scope.submitArray);

        $scope.futures = benchmarkServices.getZNCMetrics($scope.submitArray);

        $q.resolve($scope.futures).then(function (results) {

            $scope.buildingRequirements = $scope.setBuildingRequirements(results);            

            $scope.solarResults = $scope.getPropResponseField(results,"pvwatts_system_details");
            $scope.pv_capacity = $scope.buildingRequirements.pv_capacity;

            $scope.solarMonthly = (typeof $scope.solarResults === 'undefined') ? undefined : $scope.solarResults.outputs;

            $scope.prescriptiveRequirements = $scope.computePrescriptiveRequirements(results);

            $scope.endUses = $scope.computeEndUses(results);

            $scope.showSolar = false;
            $scope.showBar = false;

        });
    };

    $scope.setBuildingRequirements = function(results){


        if ($scope.auxModel.approach === "performance") {
            return $scope.computePerformanceRequirements(results);
        } else {
            return $scope.computePrescriptiveRequirements(results);
        }

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

    $scope.getPropSize = function(building_sub_types){

        var size = [];
        for (var i =0; i < building_sub_types.length; i ++) {
            size.push(building_sub_types[i].floor_area);
        }

        return size.reduce(add, 0);
    };


    $scope.computePerformanceRequirements = function(results){

        var performance_requirements = $scope.getPropResponseField(results,"performance_requirements");

        var building_sub_types = $scope.getPropResponseField(results,"building_sub_types");
        var building_size = $scope.getPropSize(building_sub_types);

        var performanceTable = {
              "pv_area": ($scope.getPropResponseField(results,"pv_area")),
              "pv_capacity": ($scope.getPropResponseField(results,"pv_capacity_kW")),
              "building_energy": (performance_requirements.building_energy),
              "required": (performance_requirements.re_total_needed),
              "pv_potential": (performance_requirements.re_rec_onsite_pv),
              "procured": (performance_requirements.re_procured),

              "building_energy_norm": (performance_requirements.building_energy / building_size * 1000),
              "required_norm": (performance_requirements.re_total_needed / building_size * 1000),
              "pv_potential_norm": (performance_requirements.re_rec_onsite_pv / building_size * 1000),
              "procured_norm": (performance_requirements.re_procured / building_size * 1000)
        };


        return performanceTable;
    };

    $scope.computePrescriptiveRequirements = function(results){    

        var prescriptive_requirements = $scope.getPropResponseField(results,"prescriptive_requirements");

        if(prescriptive_requirements) {

            var building_sub_types = $scope.getPropResponseField(results,"building_sub_types");
            var building_size = $scope.getPropSize(building_sub_types);

            var prescriptiveTable = {
                  "pv_area": ($scope.getPropResponseField(results,"pv_area")),
                  "pv_capacity": ($scope.getPropResponseField(results,"pv_capacity_kW")),
                  "building_energy": (prescriptive_requirements.prescriptive_building_energy),
                  "required": (prescriptive_requirements.prescriptive_re_total_needed),
                  "pv_potential": (prescriptive_requirements.re_rec_onsite_pv),
                  "procured": (prescriptive_requirements.prescriptive_re_procured),

                  "building_energy_norm": (prescriptive_requirements.prescriptive_building_energy / building_size * 1000),
                  "required_norm": (prescriptive_requirements.prescriptive_re_total_needed / building_size * 1000),
                  "pv_potential_norm": (prescriptive_requirements.re_rec_onsite_pv / building_size * 1000),
                  "procured_norm": (prescriptive_requirements.prescriptive_re_procured / building_size * 1000)
            };

            return prescriptiveTable;

        } else {
            return undefined;
        }




    };

    $scope.computeEndUses = function(results){

        function nullZero(a) {
            if(a===0){
                return null;
            } else {
            return a;
            }
        }

        var endUses = ["Heating", "Cooling", "Interior Lighting", "Plug Loads", "Service Hot Water", "Fans"];
        var shortNames = ["htg", "clg", "intLgt", "intEqp", "swh", "fans"];
        var othersEndUses = ["Exterior Equipment","Exterior Light","Generators","Heat Recovery","Heat Rejection","Humidity Control","Pumps","Refrigeration"];
        var othersNames = ["extEqp","extLgt","gentor","heatRec","heatRej","humid","pumps","refrg"];


        var endUsesTable = {} ;
        endUsesTable.endUses = [] ;
        endUsesTable.endUsesOther = [] ;
        endUsesTable.endUsesTotal = [] ;


        var endUseResponse = $scope.getPropResponseField(results,"prescriptive_metrics");

        endUsesTable.eui = endUseResponse.site_eui;
        endUsesTable.energy = endUseResponse.site_energy / 1000; // this will be either MBtu or MWh



        for (var i =0; i < endUses.length; i ++) {

            endUsesTable.endUses.push([
                endUses[i],
                nullZero(endUseResponse.prescriptive_electricity_metric_data[shortNames[i]]),
                nullZero(endUseResponse.prescriptive_natural_gas_metric_data[shortNames[i]]),
                nullZero(endUseResponse.prescriptive_end_use_metric_data[shortNames[i]]),
                endUseResponse.prescriptive_end_use_metric_percents[shortNames[i]]*100
            ]);
        }

        for (var j =0; j < othersEndUses.length; j ++) {

            endUsesTable.endUsesOther.push([
                othersEndUses[j],
                nullZero(endUseResponse.prescriptive_electricity_metric_data[othersNames[j]]),
                nullZero(endUseResponse.prescriptive_natural_gas_metric_data[othersNames[j]]),
                nullZero(endUseResponse.prescriptive_end_use_metric_data[othersNames[j]]),
                endUseResponse.prescriptive_end_use_metric_percents[othersNames[j]]*100
            ]);
        }

        endUsesTable.endUsesTotal.push([
            "Total",
            endUseResponse.prescriptive_electricity_metric_data.net,
            endUseResponse.prescriptive_natural_gas_metric_data.net,
            endUseResponse.prescriptive_end_use_metric_data.net,
            100,
        ]);

        return endUsesTable;

    };

    $scope.submitErrors = function () {
        if($scope.forms.baselineForm.$error.required){
            for (var i = 0; i < $scope.forms.baselineForm.$error.required.length; i++){
                $log.info($scope.forms.baselineForm.$error.required[i].$name);
            }
            $scope.performanceError = false;
        } else {
            $scope.performanceError = true;
        }
    };

    $scope.$watch("auxModel.reporting_units", function (value) {
        if (value === undefined) {
            return;
        }
        // only submit if the user has already CLICK on the submit button
        if($scope.forms.hasValidated) {
            $scope.submit();
        }
    });

    $scope.submit = function () {

        $scope.solarResults = null;
        $scope.endUses = null;
        $scope.buildingRequirements = null;




        if($scope.forms.baselineForm === undefined) {
            return;
        }
        $scope.forms.hasValidated = true; /// only check the field errors if this form has attempted to validate.

        if($scope.auxModel.reporting_units==="imperial"){
            $scope.tableEnergyUnits="(kBtu)";
            $scope.graphEnergyUnits="kBtu";
            $scope.tableBigEnergyUnits="MBtu/yr";
            $scope.tableEUIUnits="kBtu/ft²-yr";
            $scope.tableAreaUnits="(ft²)";
        }else {
            $scope.tableEnergyUnits="(kWh)";
            $scope.graphEnergyUnits="kWh";
            $scope.tableBigEnergyUnits="MWh/yr";
            $scope.tableEUIUnits="kWh/m²-yr";
            $scope.tableAreaUnits="(m²)";
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

        var getUserSystemData = function () {

            var user_data = [];
            for (var i =0; i < $scope.userSystemList.length; i ++) {
                user_data.push($scope.userSystemList[i].userCapacity);
                }
            return user_data;
        };


        if($scope.forms.baselineForm.$valid){

            $scope.submitArray = [];


            $scope.auxModel.climate_zone = $scope.temp.city.cz;
            $scope.auxModel.lat = $scope.temp.city.lat;
            $scope.auxModel.lon = $scope.temp.city.lon;


            if($scope.energies.map(mapEnergy).filter(validEnergy).length===0){
                $scope.auxModel.energies=null;
            } else {
                $scope.auxModel.energies = getFullEnergyList();
            }

            if($scope.auxModel.approach === 'performance' && $scope.auxModel.energies!==null || $scope.auxModel.approach === 'prescriptive'){
                $scope.auxModel.prop_types = getPropTypes();
                $scope.auxModel.pv_data = getPVData();
                $scope.auxModel.user_system_data = getUserSystemData();

                $scope.submitArray.push($scope.auxModel);
                $scope.computeBenchmarkResult();
            } else {
                $scope.displayErrors();
            }


        }else {
            $scope.displayErrors();
        }

    };

        $scope.displayErrors = function () {
            $scope.submitErrors();
            $scope.benchmarkResult = null;
            $scope.buildingRequirements = null;
        };



        $scope.endUseRef = [
            {id:0,name:"ZERO Code / 2021 IECC Appendix"},
            {id:1,name:"ZERO Code 2.0"}
        ];

        $scope.buildingProperties = {

            buildingType: {
                commercial: [
                    //{id:"OfficeLarge",name:"Office - Large"},
                    //{id:"OfficeMedium",name:"Office - Medium"},
                    //{id:"OfficeSmall",name:"Office - Small"},
                    {id:"Office",name:"Office"},
                    //{id:"RetailStandalone",name:"Retail - Standalone"},
                    //{id:"RetailStripmall",name:"Retail - Stripmall"},
                    {id:"Retail",name:"Retail"},
                    //{id:"SchoolPrimary",name:"School - Primary"},
                    //{id:"SchoolSecondary",name:"School - Secondary"},
                    {id:"School",name:"School"},
                    //{id:"Hospital",name:"Hospital"},
                    //{id:"OutPatientHealthCare",name:"Healthcare - Outpatient"},
                    {id:"Healthcare",name:"Healthcare"},
                    //{id:"RestaurantSitDown",name:"Restaurant - Sit Down"},
                    //{id:"RestaurantFastFood",name:"Restaurant - Fast Food"},
                    {id:"Restaurant",name:"Restaurant"},
                    //{id:"HotelLarge",name:"Hotel - Large"},
                    //{id:"HotelSmall",name:"Hotel - Small"},
                    {id:"Hotel",name:"Hotel"},
                    {id:"Warehouse",name:"Warehouse"},
                    //{id:"ApartmentHighRise",name:"Apartment - High Rise"},
                    //{id:"ApartmentMidRise",name:"Apartment - Mid Rise"} ,
                    {id:"Apartment",name:"Apartment"},
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
                {id:"kBtu",name:"kBtu",filter_id:"electricity"},
                {id:"MBtu",name:"MBtu",filter_id:"electricity"},
                {id:"kWh",name:"kWh",filter_id:"electricity"},
                {id:"MWh",name:"MWh",filter_id:"electricity"},
                {id:"GJ",name:"GJ",filter_id:"electricity"},

                //<!--Natural Gas -->
                {id:"NG Mcf",name:"Mcf",filter_id:"natural_gas"},
                {id:"NG kcf",name:"kcf",filter_id:"natural_gas"},
                {id:"NG ccf",name:"ccf",filter_id:"natural_gas"},
                {id:"NG cf",name:"cf",filter_id:"natural_gas"},
                {id:"NGm3",name:"m³",filter_id:"natural_gas"},
                {id:"GJ",name:"GJ",filter_id:"natural_gas"},
                {id:"kBtu",name:"kBtu",filter_id:"natural_gas"},
                {id:"MBtu",name:"MBtu",filter_id:"natural_gas"},
                {id:"therms",name:"Therms",filter_id:"natural_gas"},

                //<!--Fuel Oil No. 1 -->
                {id:"kBtu",name:"kBtu",filter_id:"fuel_oil"},
                {id:"MBtu",name:"MBtu ",filter_id:"fuel_oil"},
                {id:"GJ",name:"GJ",filter_id:"fuel_oil"},

                //<!--Propane-->
                {id:"GJ",name:"GJ",filter_id:"propane"},
                {id:"kBtu",name:"kBtu",filter_id:"propane"},
                {id:"MBtu",name:"MBtu",filter_id:"propane"},
                {id:"Propane cf",name:"kcf",filter_id:"propane"},
                {id:"Propane ccf",name:"ccf",filter_id:"propane"},
                {id:"Propane kcf",name:"cf",filter_id:"propane"},
                {id:"Propane L",name:"L",filter_id:"propane"},
                {id:"Propane igal",name:"Gallons (Imperial)",filter_id:"propane"},
                {id:"Propane gal",name:"Gallons",filter_id:"propane"},

                //<!--District Steam-->
                {id:"GJ",name:"GJ",filter_id:"steam"},
                {id:"kBtu",name:"kBtu",filter_id:"steam"},
                {id:"MBtu",name:"MBtu",filter_id:"steam"},
                {id:"therms",name:"Therms",filter_id:"steam"},
                {id:"Steam lb",name:"Pounds",filter_id:"steam"},
                {id:"Steam klb",name:"k lbs",filter_id:"steam"},
                {id:"Steam Mlb",name:"M lbs",filter_id:"steam"},

                //<!--District Hot Water-->
                {id:"kBtu",name:"kBtu",filter_id:"hot_water"},
                {id:"MBtu",name:"MBtu",filter_id:"hot_water"},
                {id:"GJ",name:"GJ",filter_id:"hot_water"},
                {id:"therms",name:"Therms",filter_id:"hot_water"},

                //<!--District Chilled Water-->
                {id:"kBtu",name:"kBtu",filter_id:"chilled_water"},
                {id:"MBtu",name:"MBtu",filter_id:"chilled_water"},
                {id:"GJ",name:"GJ",filter_id:"chilled_water"},
                {id:"CHW TonH",name:"Ton Hours",filter_id:"chilled_water"},

                //<!--Coal-->
                {id:"kBtu",name:"kBtu",filter_id:"coal"},
                {id:"MBtu",name:"MBtu",filter_id:"coal"},
                {id:"GJ",name:"GJ",filter_id:"coal"},

                //<!--Other-->
                {id:"kBtu",name:"kBtu",filter_id:"other"},
                {id:"MBtu",name:"MBtu",filter_id:"other"},
                {id:"kWh",name:"kWh",filter_id:"other"},
                {id:"MWh",name:"MWh",filter_id:"other"},
                {id:"GJ",name:"GJ",filter_id:"other"}
                ]
        };


        $scope.geographicProperties = {
            country : [],
            city : [],
            state: [
                {id:"AL",name:"Alabama",filter_id:"United States"},
                {id:"AK",name:"Alaska",filter_id:"United States"},
                {id:"AZ",name:"Arizona",filter_id:"United States"},
                {id:"AR",name:"Arkansas",filter_id:"United States"},
                //{id:"CA",name:"California",filter_id:"United States"},
                {id:"CO",name:"Colorado",filter_id:"United States"},
                {id:"CT",name:"Connecticut",filter_id:"United States"},
                {id:"DE",name:"Delaware",filter_id:"United States"},
                //{id:"DC",name:"District Of Columbia",filter_id:"United States"},
                {id:"FL",name:"Florida",filter_id:"United States"},
                {id:"GA",name:"Georgia",filter_id:"United States"},
                {id:"HI",name:"Hawaii",filter_id:"United States"},
                {id:"ID",name:"Idaho",filter_id:"United States"},
                {id:"IL",name:"Illinois",filter_id:"United States"},
                {id:"IN",name:"Indiana",filter_id:"United States"},
                {id:"IA",name:"Iowa",filter_id:"United States"},
                {id:"KS",name:"Kansas",filter_id:"United States"},
                {id:"KY",name:"Kentucky",filter_id:"United States"},
                {id:"LA",name:"Louisiana",filter_id:"United States"},
                {id:"ME",name:"Maine",filter_id:"United States"},
                {id:"MD",name:"Maryland",filter_id:"United States"},
                {id:"MA",name:"Massachusetts",filter_id:"United States"},
                {id:"MI",name:"Michigan",filter_id:"United States"},
                {id:"MN",name:"Minnesota",filter_id:"United States"},
                {id:"MS",name:"Mississippi",filter_id:"United States"},
                {id:"MO",name:"Missouri",filter_id:"United States"},
                {id:"MT",name:"Montana",filter_id:"United States"},
                {id:"NE",name:"Nebraska",filter_id:"United States"},
                {id:"NV",name:"Nevada",filter_id:"United States"},
                {id:"NH",name:"New Hampshire",filter_id:"United States"},
                {id:"NJ",name:"New Jersey",filter_id:"United States"},
                {id:"NM",name:"New Mexico",filter_id:"United States"},
                {id:"NY",name:"New York",filter_id:"United States"},
                {id:"NC",name:"North Carolina",filter_id:"United States"},
                {id:"ND",name:"North Dakota",filter_id:"United States"},
                {id:"OH",name:"Ohio",filter_id:"United States"},
                {id:"OK",name:"Oklahoma",filter_id:"United States"},
                {id:"OR",name:"Oregon",filter_id:"United States"},
                {id:"PA",name:"Pennsylvania",filter_id:"United States"},
                {id:"RI",name:"Rhode Island",filter_id:"United States"},
                {id:"SC",name:"South Carolina",filter_id:"United States"},
                {id:"SD",name:"South Dakota",filter_id:"United States"},
                {id:"TN",name:"Tennessee",filter_id:"United States"},
                {id:"TX",name:"Texas",filter_id:"United States"},
                {id:"UT",name:"Utah",filter_id:"United States"},
                {id:"VT",name:"Vermont",filter_id:"United States"},
                {id:"VA",name:"Virginia",filter_id:"United States"},
                {id:"WA",name:"Washington",filter_id:"United States"},
                {id:"WV",name:"West Virginia",filter_id:"United States"},
                {id:"WI",name:"Wisconsin",filter_id:"United States"},
                {id:"WY",name:"Wyoming",filter_id:"United States"},
                {id:"AB",name:"Alberta",filter_id:"Canada"},
                {id:"BC",name:"British Columbia",filter_id:"Canada"},
                {id:"MB",name:"Manitoba",filter_id:"Canada"},
                {id:"NB",name:"New Brunswick",filter_id:"Canada"},
                {id:"NL",name:"Newfoundland",filter_id:"Canada"},
                {id:"NS",name:"Nova Scotia",filter_id:"Canada"},
                {id:"NT",name:"Northwest Territories",filter_id:"Canada"},
                {id:"NU",name:"Nunavut",filter_id:"Canada"},
                {id:"ON",name:"Ontario",filter_id:"Canada"},
                {id:"PE",name:"Prince Edward Island",filter_id:"Canada"},
                {id:"QC",name:"Quebec",filter_id:"Canada"},
                {id:"SK",name:"Saskatchewan",filter_id:"Canada"},
                {id:"YT",name:"Yukon",filter_id:"Canada"}
            ]
        };


        for (var i = 0; i < cities.length; i++) {
            $scope.geographicProperties.country.push(cities[i].country);
        }

        $scope.$watch("auxModel.state", function (v) {
            $scope.geographicProperties.city = [];

            if (v !== undefined && v !== null && $scope.auxModel.country !== undefined && $scope.auxModel.country !== null) {
                for (var i = 0; i < cities.length; i++) {
                    if (cities[i].country === $scope.auxModel.country){
                        for (var j = 0; j < cities[i].cities.length; j++) {
                            if (cities[i].cities[j].state_id === v){
                                $scope.geographicProperties.city.push(cities[i].cities[j]);
                            }
                        }
                    }
                }
            }

        });

        $scope.$watch("auxModel.country", function (v) {
            $scope.geographicProperties.city = [];

            if (v !== undefined && v !== null) {
                if (v === "United States" || v === "Canada"){
                    $scope.auxModel.state = null;
                } else {
                    for (var i = 0; i < cities.length; i++) {
                        if (cities[i].country === $scope.auxModel.country){
                            for (var j = 0; j < cities[i].cities.length; j++) {
                                $scope.geographicProperties.city.push(cities[i].cities[j]);
                            }
                        }
                    }
                }
            }

        });




  };
  DashboardCtrl.$inject = ['$rootScope', '$scope', '$window','$sce','$timeout', '$q', '$log', 'benchmarkServices'];
  return {
    DashboardCtrl: DashboardCtrl,
    RootCtrl: RootCtrl

  };
});
