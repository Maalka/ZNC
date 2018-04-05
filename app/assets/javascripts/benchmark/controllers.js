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
    $scope.temp = {};
    $scope.auxModel.state = "";
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

    $scope.showBar = true;
    $scope.showEnergy = true;
    $scope.showSolar = true;


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

    /*$scope.sample = [
      {
        "prescriptive_resource": 0,
        "pv_defaults_resource": 0,
        "approach": "performance",
        "metric":
          {
            "conversion_resource": 0,
            "source_natural_gas": 2.1,
            "carbon_natural_gas": 0.61
          },
        "climate_zone": "1A",
        "file_id": "0-93738",
        "reporting_units": "imperial",
        "prop_types": [
            {
            "building_type": "OfficeLarge",
            "floor_area": 100000,
            "floor_area_units": "ftSQ"
            }
        ],
        "stories": 6.0,
        "pv_data": [
          {
            "estimated_area": 100,
            "module_type": 0,
            "losses": 20.0,
            "array_type": 0,
            "tilt": 20,
            "azimuth": 45,
            "inv_eff": 93.0,
            "access_perimeter": 6,
            "pv_area_units": "mSQ"
          },
          {
            "module_type": 0,
            "losses": 20.0,
            "array_type": 0,
            "tilt": 20,
            "azimuth": 45,
            "inv_eff": 93.0,
            "access_perimeter": 6,
            "pv_area_units": "mSQ"
          },
          {
            "w_per_meter2": 150,
            "module_type": 0,
            "losses": 2.0,
            "inv_eff": 91.0
            }
          ],
        "energies": [
          {
            "energy_name": "Electric (Grid)",
            "energy_type": "electricity",
            "energy_units": "kWh",
            "energy_use": 1500000
          },
          {
            "energy_name": "Natural Gas",
            "energy_type": "natural_gas",
            "energy_units": "therms",
            "energy_use": 20000
          }
        ]
      }
    ];*/



    $scope.computeBenchmarkResult = function(){


        $log.info($scope.submitArray);

        $scope.futures = benchmarkServices.getZNCMetrics($scope.submitArray);

        $q.resolve($scope.futures).then(function (results) {


            $scope.buildingRequirements = $scope.setBuildingRequirements(results);

            $scope.solarResults = $scope.getPropResponseField(results,"pvwatts_system_details");
            $scope.solarMonthly = $scope.solarResults.outputs;
            $scope.prescriptiveRequirements = $scope.computePrescriptiveRequirements(results);

            $scope.endUses = $scope.computeEndUses(results);

        });
    };

    $scope.setBuildingRequirements = function(results){


        if($scope.auxModel.approach === "performance"){
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
                console.log($scope.forms.baselineForm.$error.required[i].$name);
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


        if($scope.forms.baselineForm.$valid){

            $scope.submitArray = [];

            for (var i = 0; i < $scope.geographicProperties.city.length; i++){
                if($scope.geographicProperties.city[i].city === $scope.temp.city){
                    $scope.auxModel.file_id = $scope.geographicProperties.city[i].file;
                    $scope.auxModel.climate_zone = $scope.geographicProperties.city[i].cz;

                }

            }

            if($scope.energies.map(mapEnergy).filter(validEnergy).length===0){
                $scope.auxModel.energies=null;
            } else {
                $scope.auxModel.energies = getFullEnergyList();
            }

            if($scope.auxModel.approach === 'performance' && $scope.auxModel.energies!==null || $scope.auxModel.approach === 'prescriptive'){
                $scope.auxModel.prop_types = getPropTypes();
                $scope.auxModel.pv_data = getPVData();

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
                country:
                    [
                    {id:"USA",name:"United States"},
                    {id:"India",name:"India"},
                    {id:"China",name:"China"}
                    ],
                state: [
                    {id:"AL",name:"Alabama",filter_id:"USA"},
                    {id:"AK",name:"Alaska",filter_id:"USA"},
                    {id:"AZ",name:"Arizona",filter_id:"USA"},
                    {id:"AR",name:"Arkansas",filter_id:"USA"},
                    {id:"CA",name:"California",filter_id:"USA"},
                    {id:"CO",name:"Colorado",filter_id:"USA"},
                    {id:"CT",name:"Connecticut",filter_id:"USA"},
                    {id:"DE",name:"Delaware",filter_id:"USA"},
                    {id:"DC",name:"District Of Columbia",filter_id:"USA"},
                    {id:"FL",name:"Florida",filter_id:"USA"},
                    {id:"GA",name:"Georgia",filter_id:"USA"},
                    {id:"HI",name:"Hawaii",filter_id:"USA"},
                    {id:"ID",name:"Idaho",filter_id:"USA"},
                    {id:"IL",name:"Illinois",filter_id:"USA"},
                    {id:"IN",name:"Indiana",filter_id:"USA"},
                    {id:"IA",name:"Iowa",filter_id:"USA"},
                    {id:"KS",name:"Kansas",filter_id:"USA"},
                    {id:"KY",name:"Kentucky",filter_id:"USA"},
                    {id:"LA",name:"Louisiana",filter_id:"USA"},
                    {id:"ME",name:"Maine",filter_id:"USA"},
                    {id:"MD",name:"Maryland",filter_id:"USA"},
                    {id:"MA",name:"Massachusetts",filter_id:"USA"},
                    {id:"MI",name:"Michigan",filter_id:"USA"},
                    {id:"MN",name:"Minnesota",filter_id:"USA"},
                    {id:"MS",name:"Mississippi",filter_id:"USA"},
                    {id:"MO",name:"Missouri",filter_id:"USA"},
                    {id:"MT",name:"Montana",filter_id:"USA"},
                    {id:"NE",name:"Nebraska",filter_id:"USA"},
                    {id:"NV",name:"Nevada",filter_id:"USA"},
                    {id:"NH",name:"New Hampshire",filter_id:"USA"},
                    {id:"NJ",name:"New Jersey",filter_id:"USA"},
                    {id:"NM",name:"New Mexico",filter_id:"USA"},
                    {id:"NY",name:"New York",filter_id:"USA"},
                    {id:"NC",name:"North Carolina",filter_id:"USA"},
                    {id:"ND",name:"North Dakota",filter_id:"USA"},
                    {id:"OH",name:"Ohio",filter_id:"USA"},
                    {id:"OK",name:"Oklahoma",filter_id:"USA"},
                    {id:"OR",name:"Oregon",filter_id:"USA"},
                    {id:"PA",name:"Pennsylvania",filter_id:"USA"},
                    {id:"RI",name:"Rhode Island",filter_id:"USA"},
                    {id:"SC",name:"South Carolina",filter_id:"USA"},
                    {id:"SD",name:"South Dakota",filter_id:"USA"},
                    {id:"TN",name:"Tennessee",filter_id:"USA"},
                    {id:"TX",name:"Texas",filter_id:"USA"},
                    {id:"UT",name:"Utah",filter_id:"USA"},
                    {id:"VT",name:"Vermont",filter_id:"USA"},
                    {id:"VA",name:"Virginia",filter_id:"USA"},
                    {id:"WA",name:"Washington",filter_id:"USA"},
                    {id:"WV",name:"West Virginia",filter_id:"USA"},
                    {id:"WI",name:"Wisconsin",filter_id:"USA"},
                    {id:"WY",name:"Wyoming",filter_id:"USA"}
                ],
                city:
                [
                  {
                    city: "New York",
                    zip: "10001",
                    country: "USA",
                    lon: "-73.996328",
                    cz: "4A",
                    state: "NY",
                    file: "0-14734",
                    lat: "40.750422"
                  },
                  {
                    city: "Los Angeles",
                    zip: "90001",
                    country: "USA",
                    lon: "-118.248405",
                    cz: "3B",
                    state: "CA",
                    file: "0-23174",
                    lat: "33.973951"
                  },
                  {
                    city: "Chicago",
                    zip: "60601",
                    country: "USA",
                    lon: "-87.68732",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "41.811929"
                  },
                  {
                    city: "Houston",
                    zip: "77001",
                    country: "USA",
                    lon: "-95.309789",
                    cz: "2A",
                    state: "TX",
                    file: "0-12960",
                    lat: "29.813142"
                  },
                  {
                    city: "Philadelphia",
                    zip: "19019",
                    country: "USA",
                    lon: "-75.11787",
                    cz: "4A",
                    state: "PA",
                    file: "0-13739",
                    lat: "40.001811"
                  },
                  {
                    city: "Phoenix",
                    zip: "85001",
                    country: "USA",
                    lon: "-112.351835",
                    cz: "2B",
                    state: "AZ",
                    file: "0-23183",
                    lat: "33.703967"
                  },
                  {
                    city: "San Antonio",
                    zip: "78201",
                    country: "USA",
                    lon: "-98.537495",
                    cz: "2A",
                    state: "TX",
                    file: "0-12921",
                    lat: "29.399933"
                  },
                  {
                    city: "San Diego",
                    zip: "92101",
                    country: "USA",
                    lon: "-117.174366",
                    cz: "3B",
                    state: "CA",
                    file: "0-23188",
                    lat: "32.7211"
                  },
                  {
                    city: "Dallas",
                    zip: "75201",
                    country: "USA",
                    lon: "-96.790329",
                    cz: "2A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.781179"
                  },
                  {
                    city: "San Jose",
                    zip: "95101",
                    country: "USA",
                    lon: "-121.705327",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.189396"
                  },
                  {
                    city: "Austin",
                    zip: "73301",
                    country: "USA",
                    lon: "-97.771258",
                    cz: "2A",
                    state: "TX",
                    file: "0-13958",
                    lat: "30.326374"
                  },
                  {
                    city: "Indianapolis",
                    zip: "46201",
                    country: "USA",
                    lon: "-86.13216",
                    cz: "5A",
                    state: "IN",
                    file: "0-93819",
                    lat: "39.775092"
                  },
                  {
                    city: "Jacksonville",
                    zip: "32099",
                    country: "USA",
                    lon: "-81.768622",
                    cz: "2A",
                    state: "FL",
                    file: "0-13889",
                    lat: "30.337538"
                  },
                  {
                    city: "San Francisco",
                    zip: "94101",
                    country: "USA",
                    lon: "-122.727802",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.784827"
                  },
                  {
                    city: "Columbus",
                    zip: "43085",
                    country: "USA",
                    lon: "-82.897222",
                    cz: "5A",
                    state: "OH",
                    file: "0-14821",
                    lat: "40.040113"
                  },
                  {
                    city: "Charlotte",
                    zip: "28201",
                    country: "USA",
                    lon: "-80.804151",
                    cz: "3A",
                    state: "NC",
                    file: "0-13881",
                    lat: "35.26002"
                  },
                  {
                    city: "Fort Worth",
                    zip: "76101",
                    country: "USA",
                    lon: "-97.291484",
                    cz: "2A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.771419"
                  },
                  {
                    city: "Detroit",
                    zip: "48201",
                    country: "USA",
                    lon: "-83.150823",
                    cz: "5A",
                    state: "MI",
                    file: "0-94847",
                    lat: "42.239933"
                  },
                  {
                    city: "El Paso",
                    zip: "79901",
                    country: "USA",
                    lon: "-106.484592",
                    cz: "3B",
                    state: "TX",
                    file: "0-23044",
                    lat: "31.763608"
                  },
                  {
                    city: "Memphis",
                    zip: "37501",
                    country: "USA",
                    lon: "-89.990415",
                    cz: "4A",
                    state: "TN",
                    file: "0-13893",
                    lat: "35.169255"
                  },
                  {
                    city: "Seattle",
                    zip: "98101",
                    country: "USA",
                    lon: "-121.803388",
                    cz: "5B",
                    state: "WA",
                    file: "0-24233",
                    lat: "47.432251"
                  },
                  {
                    city: "Denver",
                    zip: "80201",
                    country: "USA",
                    lon: "-104.856808",
                    cz: "5B",
                    state: "CO",
                    file: "0-94018",
                    lat: "39.726303"
                  },
                  {
                    city: "Boston",
                    zip: "02101",
                    country: "USA",
                    lon: "-71.026964",
                    cz: "5A",
                    state: "MA",
                    file: "0-14739",
                    lat: "42.370567"
                  },
                  {
                    city: "Baltimore",
                    zip: "21201",
                    country: "USA",
                    lon: "-76.623489",
                    cz: "4A",
                    state: "MD",
                    file: "0-93721",
                    lat: "39.296536"
                  },
                  {
                    city: "Oklahoma City",
                    zip: "73101",
                    country: "USA",
                    lon: "-97.562817",
                    cz: "3A",
                    state: "OK",
                    file: "0-13967",
                    lat: "35.491608"
                  },
                  {
                    city: "Portland",
                    zip: "97201",
                    country: "USA",
                    lon: "-122.693157",
                    cz: "4C",
                    state: "OR",
                    file: "0-24229",
                    lat: "45.498931"
                  },
                  {
                    city: "Las Vegas",
                    zip: "89101",
                    country: "USA",
                    lon: "-115.10647",
                    cz: "5B",
                    state: "NV",
                    file: "0-23169",
                    lat: "36.17372"
                  },
                  {
                    city: "Milwaukee",
                    zip: "53201",
                    country: "USA",
                    lon: "-87.958409",
                    cz: "5A",
                    state: "WI",
                    file: "0-14839",
                    lat: "43.011264"
                  },
                  {
                    city: "Albuquerque",
                    zip: "87101",
                    country: "USA",
                    lon: "-106.644831",
                    cz: "4B",
                    state: "NM",
                    file: "0-23050",
                    lat: "35.199592"
                  },
                  {
                    city: "Tucson",
                    zip: "85701",
                    country: "USA",
                    lon: "-110.970869",
                    cz: "2B",
                    state: "AZ",
                    file: "0-23160",
                    lat: "32.217975"
                  },
                  {
                    city: "Fresno",
                    zip: "93650",
                    country: "USA",
                    lon: "-119.801015",
                    cz: "3B",
                    state: "CA",
                    file: "0-93193",
                    lat: "36.8411"
                  },
                  {
                    city: "Sacramento",
                    zip: "94203",
                    country: "USA",
                    lon: "-121.555406",
                    cz: "3B",
                    state: "CA",
                    file: "0-23232",
                    lat: "38.380456"
                  },
                  {
                    city: "Long Beach",
                    zip: "90801",
                    country: "USA",
                    lon: "-118.200957",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.804309"
                  },
                  {
                    city: "Kansas City",
                    zip: "64101",
                    country: "USA",
                    lon: "-94.598583",
                    cz: "4A",
                    state: "MO",
                    file: "0-3947",
                    lat: "39.102404"
                  },
                  {
                    city: "Mesa",
                    zip: "85201",
                    country: "USA",
                    lon: "-111.856967",
                    cz: "2B",
                    state: "AZ",
                    file: "0-23183",
                    lat: "33.440695"
                  },
                  {
                    city: "Virginia Beach",
                    zip: "23450",
                    country: "USA",
                    lon: "-76.12036",
                    cz: "3A",
                    state: "VA",
                    file: "0-13737",
                    lat: "36.844004"
                  },
                  {
                    city: "Atlanta",
                    zip: "30301",
                    country: "USA",
                    lon: "-84.47405",
                    cz: "3A",
                    state: "GA",
                    file: "0-13874",
                    lat: "33.844371"
                  },
                  {
                    city: "Colorado Springs",
                    zip: "80901",
                    country: "USA",
                    lon: "-104.857828",
                    cz: "5B",
                    state: "CO",
                    file: "0-93037",
                    lat: "38.861469"
                  },
                  {
                    city: "Omaha",
                    zip: "68101",
                    country: "USA",
                    lon: "-96.171104",
                    cz: "5A",
                    state: "NE",
                    file: "0-94918",
                    lat: "41.291736"
                  },
                  {
                    city: "Raleigh",
                    zip: "27601",
                    country: "USA",
                    lon: "-78.604175",
                    cz: "3A",
                    state: "NC",
                    file: "0-13722",
                    lat: "35.773755"
                  },
                  {
                    city: "Miami",
                    zip: "33101",
                    country: "USA",
                    lon: "-80.19782",
                    cz: "1A",
                    state: "FL",
                    file: "0-12839",
                    lat: "25.779076"
                  },
                  {
                    city: "Oakland",
                    zip: "94601",
                    country: "USA",
                    lon: "-122.223779",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.786027"
                  },
                  {
                    city: "Minneapolis",
                    zip: "55401",
                    country: "USA",
                    lon: "-93.273024",
                    cz: "6A",
                    state: "MN",
                    file: "0-14922",
                    lat: "44.979265"
                  },
                  {
                    city: "Tulsa",
                    zip: "74101",
                    country: "USA",
                    lon: "-95.868667",
                    cz: "3A",
                    state: "OK",
                    file: "0-13968",
                    lat: "36.039147"
                  },
                  {
                    city: "Cleveland",
                    zip: "44101",
                    country: "USA",
                    lon: "-81.599648",
                    cz: "5A",
                    state: "OH",
                    file: "0-14820",
                    lat: "41.523401"
                  },
                  {
                    city: "Wichita",
                    zip: "67201",
                    country: "USA",
                    lon: "-97.258997",
                    cz: "4A",
                    state: "KS",
                    file: "0-3928",
                    lat: "37.651974"
                  },
                  {
                    city: "Arlington",
                    zip: "76001",
                    country: "USA",
                    lon: "-97.291484",
                    cz: "2A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.771419"
                  },
                  {
                    city: "New Orleans",
                    zip: "70112",
                    country: "USA",
                    lon: "-90.077",
                    cz: "2A",
                    state: "LA",
                    file: "0-12916",
                    lat: "29.958304"
                  },
                  {
                    city: "Bakersfield",
                    zip: "93301",
                    country: "USA",
                    lon: "-119.007662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23155",
                    lat: "35.483501"
                  },
                  {
                    city: "Tampa",
                    zip: "33601",
                    country: "USA",
                    lon: "-82.582035",
                    cz: "2A",
                    state: "FL",
                    file: "0-12842",
                    lat: "27.996097"
                  },
                  {
                    city: "Honolulu",
                    zip: "96801",
                    country: "USA",
                    lon: "-168.021815",
                    cz: "1A",
                    state: "HI",
                    file: "0-22536",
                    lat: "24.859832"
                  },
                  {
                    city: "Aurora",
                    zip: "80010",
                    country: "USA",
                    lon: "-104.84748",
                    cz: "5B",
                    state: "CO",
                    file: "0-94018",
                    lat: "39.715287"
                  },
                  {
                    city: "Anaheim",
                    zip: "92801",
                    country: "USA",
                    lon: "-117.769442",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.640302"
                  },
                  {
                    city: "Santa Ana",
                    zip: "92701",
                    country: "USA",
                    lon: "-117.769442",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.640302"
                  },
                  {
                    city: "Riverside",
                    zip: "92501",
                    country: "USA",
                    lon: "-116.055617",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "33.752886"
                  },
                  {
                    city: "Corpus Christi",
                    zip: "78401",
                    country: "USA",
                    lon: "-97.648158",
                    cz: "2A",
                    state: "TX",
                    file: "0-12924",
                    lat: "27.759399"
                  },
                  {
                    city: "Pittsburgh",
                    zip: "15201",
                    country: "USA",
                    lon: "-80.024817",
                    cz: "5A",
                    state: "PA",
                    file: "0-94823",
                    lat: "40.434436"
                  },
                  {
                    city: "Anchorage",
                    zip: "99501",
                    country: "USA",
                    lon: "-149.486981",
                    cz: "7",
                    state: "AK",
                    file: "0-26451",
                    lat: "61.287624"
                  },
                  {
                    city: "Stockton",
                    zip: "95201",
                    country: "USA",
                    lon: "-121.298794",
                    cz: "3B",
                    state: "CA",
                    file: "0-23232",
                    lat: "37.672196"
                  },
                  {
                    city: "Cincinnati",
                    zip: "45201",
                    country: "USA",
                    lon: "-84.53822",
                    cz: "5A",
                    state: "OH",
                    file: "0-93814",
                    lat: "39.166759"
                  },
                  {
                    city: "Toledo",
                    zip: "43601",
                    country: "USA",
                    lon: "-83.569359",
                    cz: "5A",
                    state: "OH",
                    file: "0-94830",
                    lat: "41.720684"
                  },
                  {
                    city: "Greensboro",
                    zip: "27401",
                    country: "USA",
                    lon: "-79.831692",
                    cz: "3A",
                    state: "NC",
                    file: "0-13723",
                    lat: "36.055285"
                  },
                  {
                    city: "Newark",
                    zip: "07101",
                    country: "USA",
                    lon: "-74.22509",
                    cz: "4A",
                    state: "NJ",
                    file: "0-14734",
                    lat: "40.736101"
                  },
                  {
                    city: "Plano",
                    zip: "75023",
                    country: "USA",
                    lon: "-96.659574",
                    cz: "3A",
                    state: "TX",
                    file: "0-3927",
                    lat: "33.104885"
                  },
                  {
                    city: "Henderson",
                    zip: "89009",
                    country: "USA",
                    lon: "-114.972061",
                    cz: "5B",
                    state: "NV",
                    file: "0-23169",
                    lat: "35.927901"
                  },
                  {
                    city: "Lincoln",
                    zip: "68501",
                    country: "USA",
                    lon: "-96.823133",
                    cz: "5A",
                    state: "NE",
                    file: "0-94918",
                    lat: "40.865142"
                  },
                  {
                    city: "Buffalo",
                    zip: "14201",
                    country: "USA",
                    lon: "-78.832706",
                    cz: "5A",
                    state: "NY",
                    file: "0-14733",
                    lat: "42.929303"
                  },
                  {
                    city: "Jersey City",
                    zip: "07097",
                    country: "USA",
                    lon: "-74.075485",
                    cz: "4A",
                    state: "NJ",
                    file: "0-14734",
                    lat: "40.73276"
                  },
                  {
                    city: "Chula Vista",
                    zip: "91909",
                    country: "USA",
                    lon: "-116.846046",
                    cz: "3B",
                    state: "CA",
                    file: "0-23188",
                    lat: "33.016928"
                  },
                  {
                    city: "Fort Wayne",
                    zip: "46801",
                    country: "USA",
                    lon: "-85.070713",
                    cz: "5A",
                    state: "IN",
                    file: "0-14827",
                    lat: "41.093763"
                  },
                  {
                    city: "Orlando",
                    zip: "32801",
                    country: "USA",
                    lon: "-81.373291",
                    cz: "2A",
                    state: "FL",
                    file: "0-12842",
                    lat: "28.545179"
                  },
                  {
                    city: "Chandler",
                    zip: "85224",
                    country: "USA",
                    lon: "-111.85062",
                    cz: "2B",
                    state: "AZ",
                    file: "0-23183",
                    lat: "33.298461"
                  },
                  {
                    city: "Laredo",
                    zip: "78040",
                    country: "USA",
                    lon: "-99.494078",
                    cz: "2B",
                    state: "TX",
                    file: "0-12924",
                    lat: "27.515879"
                  },
                  {
                    city: "Norfolk",
                    zip: "23501",
                    country: "USA",
                    lon: "-76.208521",
                    cz: "3A",
                    state: "VA",
                    file: "0-13737",
                    lat: "36.895911"
                  },
                  {
                    city: "Durham",
                    zip: "27701",
                    country: "USA",
                    lon: "-78.875467",
                    cz: "3A",
                    state: "NC",
                    file: "0-13722",
                    lat: "36.004307"
                  },
                  {
                    city: "Madison",
                    zip: "53701",
                    country: "USA",
                    lon: "-89.423861",
                    cz: "5A",
                    state: "WI",
                    file: "0-14837",
                    lat: "43.06956"
                  },
                  {
                    city: "Lubbock",
                    zip: "79401",
                    country: "USA",
                    lon: "-101.842056",
                    cz: "3B",
                    state: "TX",
                    file: "0-23042",
                    lat: "33.607701"
                  },
                  {
                    city: "Irvine",
                    zip: "92602",
                    country: "USA",
                    lon: "-117.72222",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.718018"
                  },
                  {
                    city: "Glendale",
                    zip: "85301",
                    country: "USA",
                    lon: "-112.18717",
                    cz: "2B",
                    state: "AZ",
                    file: "0-23183",
                    lat: "33.276539"
                  },
                  {
                    city: "Garland",
                    zip: "75040",
                    country: "USA",
                    lon: "-96.615821",
                    cz: "2A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.931523"
                  },
                  {
                    city: "Hialeah",
                    zip: "33002",
                    country: "USA",
                    lon: "-80.458168",
                    cz: "1A",
                    state: "FL",
                    file: "0-12839",
                    lat: "25.558428"
                  },
                  {
                    city: "Reno",
                    zip: "89501",
                    country: "USA",
                    lon: "-119.704614",
                    cz: "5B",
                    state: "NV",
                    file: "0-23185",
                    lat: "39.65558"
                  },
                  {
                    city: "Chesapeake",
                    zip: "23320",
                    country: "USA",
                    lon: "-76.218759",
                    cz: "3A",
                    state: "VA",
                    file: "0-13737",
                    lat: "36.749991"
                  },
                  {
                    city: "Gilbert",
                    zip: "85233",
                    country: "USA",
                    lon: "-111.815281",
                    cz: "2B",
                    state: "AZ",
                    file: "0-23183",
                    lat: "33.335401"
                  },
                  {
                    city: "Baton Rouge",
                    zip: "70801",
                    country: "USA",
                    lon: "-91.185607",
                    cz: "2A",
                    state: "LA",
                    file: "0-13970",
                    lat: "30.44924"
                  },
                  {
                    city: "Irving",
                    zip: "75014",
                    country: "USA",
                    lon: "-96.777626",
                    cz: "2A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.767268"
                  },
                  {
                    city: "Scottsdale",
                    zip: "85250",
                    country: "USA",
                    lon: "-111.874248",
                    cz: "2B",
                    state: "AZ",
                    file: "0-23183",
                    lat: "33.524143"
                  },
                  {
                    city: "North Las Vegas",
                    zip: "89030",
                    country: "USA",
                    lon: "-115.15431",
                    cz: "5B",
                    state: "NV",
                    file: "0-23169",
                    lat: "36.225271"
                  },
                  {
                    city: "Fremont",
                    zip: "94536",
                    country: "USA",
                    lon: "-121.982721",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.565285"
                  },
                  {
                    city: "Richmond",
                    zip: "23218",
                    country: "USA",
                    lon: "-77.493157",
                    cz: "4A",
                    state: "VA",
                    file: "0-13740",
                    lat: "37.524246"
                  },
                  {
                    city: "San Bernardino",
                    zip: "92401",
                    country: "USA",
                    lon: "-115.967051",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "34.839964"
                  },
                  {
                    city: "Birmingham",
                    zip: "35201",
                    country: "USA",
                    lon: "-86.801904",
                    cz: "3A",
                    state: "AL",
                    file: "0-13876",
                    lat: "33.456412"
                  },
                  {
                    city: "Spokane",
                    zip: "99201",
                    country: "USA",
                    lon: "-117.435997",
                    cz: "5B",
                    state: "WA",
                    file: "0-24157",
                    lat: "47.66264"
                  },
                  {
                    city: "Rochester",
                    zip: "14601",
                    country: "USA",
                    lon: "-77.684264",
                    cz: "5A",
                    state: "NY",
                    file: "0-14768",
                    lat: "43.286024"
                  },
                  {
                    city: "Des Moines",
                    zip: "50301",
                    country: "USA",
                    lon: "-93.572173",
                    cz: "5A",
                    state: "IA",
                    file: "0-14933",
                    lat: "41.672687"
                  },
                  {
                    city: "Modesto",
                    zip: "95350",
                    country: "USA",
                    lon: "-121.016796",
                    cz: "3B",
                    state: "CA",
                    file: "0-23232",
                    lat: "37.669463"
                  },
                  {
                    city: "Fayetteville",
                    zip: "28301",
                    country: "USA",
                    lon: "-78.781027",
                    cz: "3A",
                    state: "NC",
                    file: "0-13722",
                    lat: "35.053416"
                  },
                  {
                    city: "Tacoma",
                    zip: "98401",
                    country: "USA",
                    lon: "-122.444335",
                    cz: "5B",
                    state: "WA",
                    file: "0-24233",
                    lat: "47.253671"
                  },
                  {
                    city: "Oxnard",
                    zip: "93030",
                    country: "USA",
                    lon: "-119.17749",
                    cz: "3C",
                    state: "CA",
                    file: "0-23174",
                    lat: "34.224892"
                  },
                  {
                    city: "Fontana",
                    zip: "92334",
                    country: "USA",
                    lon: "-115.967051",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "34.839964"
                  },
                  {
                    city: "Columbus",
                    zip: "31901",
                    country: "USA",
                    lon: "-84.97823",
                    cz: "3A",
                    state: "GA",
                    file: "0-93842",
                    lat: "32.472864"
                  },
                  {
                    city: "Montgomery",
                    zip: "36101",
                    country: "USA",
                    lon: "-86.257817",
                    cz: "3A",
                    state: "AL",
                    file: "0-13895",
                    lat: "32.356988"
                  },
                  {
                    city: "Moreno Valley",
                    zip: "92551",
                    country: "USA",
                    lon: "-116.055617",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "33.752886"
                  },
                  {
                    city: "Shreveport",
                    zip: "71101",
                    country: "USA",
                    lon: "-93.750228",
                    cz: "2A",
                    state: "LA",
                    file: "0-13957",
                    lat: "32.498202"
                  },
                  {
                    city: "Aurora",
                    zip: "60504",
                    country: "USA",
                    lon: "-88.136616",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "41.768399"
                  },
                  {
                    city: "Yonkers",
                    zip: "10701",
                    country: "USA",
                    lon: "-73.866926",
                    cz: "5A",
                    state: "NY",
                    file: "0-94728",
                    lat: "40.946107"
                  },
                  {
                    city: "Akron",
                    zip: "44301",
                    country: "USA",
                    lon: "-81.507831",
                    cz: "5A",
                    state: "OH",
                    file: "0-14895",
                    lat: "41.012239"
                  },
                  {
                    city: "Huntington Beach",
                    zip: "92605",
                    country: "USA",
                    lon: "-117.769442",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.640302"
                  },
                  {
                    city: "Little Rock",
                    zip: "72201",
                    country: "USA",
                    lon: "-92.284832",
                    cz: "3A",
                    state: "AR",
                    file: "0-13963",
                    lat: "34.755998"
                  },
                  {
                    city: "Amarillo",
                    zip: "79101",
                    country: "USA",
                    lon: "-101.795512",
                    cz: "4B",
                    state: "TX",
                    file: "0-23047",
                    lat: "35.205452"
                  },
                  {
                    city: "Glendale",
                    zip: "91201",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Mobile",
                    zip: "36601",
                    country: "USA",
                    lon: "-88.103184",
                    cz: "2A",
                    state: "AL",
                    file: "0-13894",
                    lat: "30.701142"
                  },
                  {
                    city: "Grand Rapids",
                    zip: "49501",
                    country: "USA",
                    lon: "-85.629101",
                    cz: "5A",
                    state: "MI",
                    file: "0-94860",
                    lat: "42.984226"
                  },
                  {
                    city: "Salt Lake City",
                    zip: "84101",
                    country: "USA",
                    lon: "-111.900719",
                    cz: "5B",
                    state: "UT",
                    file: "0-24127",
                    lat: "40.756095"
                  },
                  {
                    city: "Tallahassee",
                    zip: "32301",
                    country: "USA",
                    lon: "-84.203379",
                    cz: "2A",
                    state: "FL",
                    file: "0-93805",
                    lat: "30.418514"
                  },
                  {
                    city: "Huntsville",
                    zip: "35801",
                    country: "USA",
                    lon: "-86.556439",
                    cz: "3A",
                    state: "AL",
                    file: "0-3856",
                    lat: "34.718428"
                  },
                  {
                    city: "Grand Prairie",
                    zip: "75050",
                    country: "USA",
                    lon: "-96.777626",
                    cz: "2A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.767268"
                  },
                  {
                    city: "Knoxville",
                    zip: "37901",
                    country: "USA",
                    lon: "-83.884804",
                    cz: "4A",
                    state: "TN",
                    file: "0-13891",
                    lat: "36.032334"
                  },
                  {
                    city: "Worcester",
                    zip: "01601",
                    country: "USA",
                    lon: "-71.879415",
                    cz: "5A",
                    state: "MA",
                    file: "0-94746",
                    lat: "42.265275"
                  },
                  {
                    city: "Newport News",
                    zip: "23601",
                    country: "USA",
                    lon: "-76.463471",
                    cz: "3A",
                    state: "VA",
                    file: "0-13737",
                    lat: "37.058296"
                  },
                  {
                    city: "Brownsville",
                    zip: "78520",
                    country: "USA",
                    lon: "-97.514466",
                    cz: "1A",
                    state: "TX",
                    file: "0-12919",
                    lat: "26.052155"
                  },
                  {
                    city: "Santa Clarita",
                    zip: "91350",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Providence",
                    zip: "02901",
                    country: "USA",
                    lon: "-71.414451",
                    cz: "#N/A",
                    state: "RI",
                    file: "0-14765",
                    lat: "41.82275"
                  },
                  {
                    city: "Garden Grove",
                    zip: "92840",
                    country: "USA",
                    lon: "-117.769442",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.640302"
                  },
                  {
                    city: "Chattanooga",
                    zip: "37401",
                    country: "USA",
                    lon: "-85.206426",
                    cz: "4A",
                    state: "TN",
                    file: "0-13882",
                    lat: "35.017818"
                  },
                  {
                    city: "Oceanside",
                    zip: "92049",
                    country: "USA",
                    lon: "-116.846046",
                    cz: "3B",
                    state: "CA",
                    file: "0-23188",
                    lat: "33.016928"
                  },
                  {
                    city: "Jackson",
                    zip: "39201",
                    country: "USA",
                    lon: "-90.192687",
                    cz: "3A",
                    state: "MS",
                    file: "0-3940",
                    lat: "32.291095"
                  },
                  {
                    city: "Fort Lauderdale",
                    zip: "33301",
                    country: "USA",
                    lon: "-80.159317",
                    cz: "1A",
                    state: "FL",
                    file: "0-12839",
                    lat: "26.085115"
                  },
                  {
                    city: "Santa Rosa",
                    zip: "95401",
                    country: "USA",
                    lon: "-122.783159",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "38.450412"
                  },
                  {
                    city: "Rancho Cucamonga",
                    zip: "91701",
                    country: "USA",
                    lon: "-115.967051",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "34.839964"
                  },
                  {
                    city: "Tempe",
                    zip: "85280",
                    country: "USA",
                    lon: "-111.931298",
                    cz: "2B",
                    state: "AZ",
                    file: "0-23183",
                    lat: "33.401395"
                  },
                  {
                    city: "Ontario",
                    zip: "91758",
                    country: "USA",
                    lon: "-115.967051",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "34.839964"
                  },
                  {
                    city: "Vancouver",
                    zip: "98660",
                    country: "USA",
                    lon: "-122.713366",
                    cz: "5B",
                    state: "WA",
                    file: "0-24229",
                    lat: "45.74327"
                  },
                  {
                    city: "Cape Coral",
                    zip: "33904",
                    country: "USA",
                    lon: "-81.95016",
                    cz: "2A",
                    state: "FL",
                    file: "0-12844",
                    lat: "26.606491"
                  },
                  {
                    city: "Sioux Falls",
                    zip: "57101",
                    country: "USA",
                    lon: "-96.69063",
                    cz: "6A",
                    state: "SD",
                    file: "0-14944",
                    lat: "43.546358"
                  },
                  {
                    city: "Springfield",
                    zip: "65801",
                    country: "USA",
                    lon: "-93.343673",
                    cz: "4A",
                    state: "MO",
                    file: "0-13995",
                    lat: "37.25807"
                  },
                  {
                    city: "Peoria",
                    zip: "85345",
                    country: "USA",
                    lon: "-112.18717",
                    cz: "2B",
                    state: "AZ",
                    file: "0-23183",
                    lat: "33.276539"
                  },
                  {
                    city: "Pembroke Pines",
                    zip: "33082",
                    country: "USA",
                    lon: "-80.448254",
                    cz: "1A",
                    state: "FL",
                    file: "0-12839",
                    lat: "26.145724"
                  },
                  {
                    city: "Elk Grove",
                    zip: "95624",
                    country: "USA",
                    lon: "-121.307142",
                    cz: "3B",
                    state: "CA",
                    file: "0-23232",
                    lat: "38.44148"
                  },
                  {
                    city: "Salem",
                    zip: "97301",
                    country: "USA",
                    lon: "-122.921721",
                    cz: "4C",
                    state: "OR",
                    file: "0-24232",
                    lat: "44.90472"
                  },
                  {
                    city: "Lancaster",
                    zip: "93534",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Corona",
                    zip: "92877",
                    country: "USA",
                    lon: "-116.055617",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "33.752886"
                  },
                  {
                    city: "Eugene",
                    zip: "97401",
                    country: "USA",
                    lon: "-123.074193",
                    cz: "4C",
                    state: "OR",
                    file: "0-24221",
                    lat: "44.117868"
                  },
                  {
                    city: "Palmdale",
                    zip: "93550",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Salinas",
                    zip: "93901",
                    country: "USA",
                    lon: "-121.416603",
                    cz: "3C",
                    state: "CA",
                    file: "0-93193",
                    lat: "36.441768"
                  },
                  {
                    city: "Springfield",
                    zip: "01101",
                    country: "USA",
                    lon: "-72.604842",
                    cz: "5A",
                    state: "MA",
                    file: "0-14740",
                    lat: "42.170731"
                  },
                  {
                    city: "Pasadena",
                    zip: "77501",
                    country: "USA",
                    lon: "-95.434241",
                    cz: "2A",
                    state: "TX",
                    file: "0-12960",
                    lat: "29.83399"
                  },
                  {
                    city: "Fort Collins",
                    zip: "80521",
                    country: "USA",
                    lon: "-105.298344",
                    cz: "5B",
                    state: "CO",
                    file: "0-94018",
                    lat: "40.59227"
                  },
                  {
                    city: "Hayward",
                    zip: "94540",
                    country: "USA",
                    lon: "-121.921498",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.680181"
                  },
                  {
                    city: "Pomona",
                    zip: "91766",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Cary",
                    zip: "27511",
                    country: "USA",
                    lon: "-78.70732",
                    cz: "3A",
                    state: "NC",
                    file: "0-13722",
                    lat: "35.751243"
                  },
                  {
                    city: "Rockford",
                    zip: "61101",
                    country: "USA",
                    lon: "-89.157198",
                    cz: "5A",
                    state: "IL",
                    file: "0-94822",
                    lat: "42.33342"
                  },
                  {
                    city: "Alexandria",
                    zip: "22301",
                    country: "USA",
                    lon: "-77.079622",
                    cz: "4A",
                    state: "VA",
                    file: "0-93738",
                    lat: "38.823062"
                  },
                  {
                    city: "Escondido",
                    zip: "92025",
                    country: "USA",
                    lon: "-117.083403",
                    cz: "3B",
                    state: "CA",
                    file: "0-23188",
                    lat: "33.057128"
                  },
                  {
                    city: "Kansas City",
                    zip: "66101",
                    country: "USA",
                    lon: "-94.630384",
                    cz: "4A",
                    state: "KS",
                    file: "0-3947",
                    lat: "39.103053"
                  },
                  {
                    city: "Joliet",
                    zip: "60431",
                    country: "USA",
                    lon: "-87.93909",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "41.471206"
                  },
                  {
                    city: "Torrance",
                    zip: "90501",
                    country: "USA",
                    lon: "-118.303805",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.835665"
                  },
                  {
                    city: "Bridgeport",
                    zip: "06601",
                    country: "USA",
                    lon: "-73.363661",
                    cz: "5A",
                    state: "CT",
                    file: "0-94702",
                    lat: "41.308873"
                  },
                  {
                    city: "Hollywood",
                    zip: "33019",
                    country: "USA",
                    lon: "-80.192966",
                    cz: "1A",
                    state: "FL",
                    file: "0-12839",
                    lat: "26.091514"
                  },
                  {
                    city: "Paterson",
                    zip: "07501",
                    country: "USA",
                    lon: "-74.174488",
                    cz: "5A",
                    state: "NJ",
                    file: "0-14734",
                    lat: "40.915045"
                  },
                  {
                    city: "Naperville",
                    zip: "60540",
                    country: "USA",
                    lon: "-88.152381",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "41.759029"
                  },
                  {
                    city: "Syracuse",
                    zip: "13201",
                    country: "USA",
                    lon: "-76.197701",
                    cz: "5A",
                    state: "NY",
                    file: "0-14771",
                    lat: "43.02143"
                  },
                  {
                    city: "Mesquite",
                    zip: "75149",
                    country: "USA",
                    lon: "-96.62315",
                    cz: "2A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.777779"
                  },
                  {
                    city: "Dayton",
                    zip: "45401",
                    country: "USA",
                    lon: "-84.268593",
                    cz: "5A",
                    state: "OH",
                    file: "0-93815",
                    lat: "39.750471"
                  },
                  {
                    city: "Savannah",
                    zip: "31401",
                    country: "USA",
                    lon: "-81.135618",
                    cz: "2A",
                    state: "GA",
                    file: "0-3822",
                    lat: "32.072257"
                  },
                  {
                    city: "Clarksville",
                    zip: "37040",
                    country: "USA",
                    lon: "-87.308491",
                    cz: "4A",
                    state: "TN",
                    file: "0-13897",
                    lat: "36.51674"
                  },
                  {
                    city: "Orange",
                    zip: "92856",
                    country: "USA",
                    lon: "-117.769442",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.640302"
                  },
                  {
                    city: "Pasadena",
                    zip: "91050",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Fullerton",
                    zip: "92831",
                    country: "USA",
                    lon: "-117.769442",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.640302"
                  },
                  {
                    city: "Killeen",
                    zip: "76540",
                    country: "USA",
                    lon: "-97.357099",
                    cz: "2A",
                    state: "TX",
                    file: "0-13959",
                    lat: "31.085833"
                  },
                  {
                    city: "Frisco",
                    zip: "75034",
                    country: "USA",
                    lon: "-96.796437",
                    cz: "3A",
                    state: "TX",
                    file: "0-3927",
                    lat: "33.152222"
                  },
                  {
                    city: "Hampton",
                    zip: "23630",
                    country: "USA",
                    lon: "-76.38992",
                    cz: "3A",
                    state: "VA",
                    file: "0-13737",
                    lat: "37.072658"
                  },
                  {
                    city: "Bellevue",
                    zip: "98004",
                    country: "USA",
                    lon: "-122.207221",
                    cz: "5B",
                    state: "WA",
                    file: "0-24233",
                    lat: "47.615471"
                  },
                  {
                    city: "Columbia",
                    zip: "29201",
                    country: "USA",
                    lon: "-81.024864",
                    cz: "3A",
                    state: "SC",
                    file: "0-13883",
                    lat: "33.987454"
                  },
                  {
                    city: "Olathe",
                    zip: "66051",
                    country: "USA",
                    lon: "-94.831991",
                    cz: "4A",
                    state: "KS",
                    file: "0-3947",
                    lat: "38.899901"
                  },
                  {
                    city: "Sterling Heights",
                    zip: "48310",
                    country: "USA",
                    lon: "-83.068475",
                    cz: "5A",
                    state: "MI",
                    file: "0-94847",
                    lat: "42.564395"
                  },
                  {
                    city: "New Haven",
                    zip: "06501",
                    country: "USA",
                    lon: "-72.927507",
                    cz: "5A",
                    state: "CT",
                    file: "0-94702",
                    lat: "41.365709"
                  },
                  {
                    city: "Waco",
                    zip: "76701",
                    country: "USA",
                    lon: "-97.15508",
                    cz: "2A",
                    state: "TX",
                    file: "0-13959",
                    lat: "31.551566"
                  },
                  {
                    city: "ThoUSAnd Oaks",
                    zip: "91358",
                    country: "USA",
                    lon: "-119.1343",
                    cz: "3C",
                    state: "CA",
                    file: "0-23174",
                    lat: "34.032383"
                  },
                  {
                    city: "Cedar Rapids",
                    zip: "52401",
                    country: "USA",
                    lon: "-91.657578",
                    cz: "5A",
                    state: "IA",
                    file: "0-94910",
                    lat: "41.976612"
                  },
                  {
                    city: "Charleston",
                    zip: "29401",
                    country: "USA",
                    lon: "-79.940844",
                    cz: "3A",
                    state: "SC",
                    file: "0-13880",
                    lat: "32.780326"
                  },
                  {
                    city: "Visalia",
                    zip: "93277",
                    country: "USA",
                    lon: "-119.355559",
                    cz: "3B",
                    state: "CA",
                    file: "0-93193",
                    lat: "36.13188"
                  },
                  {
                    city: "Topeka",
                    zip: "66601",
                    country: "USA",
                    lon: "-95.780662",
                    cz: "4A",
                    state: "KS",
                    file: "0-13996",
                    lat: "38.988075"
                  },
                  {
                    city: "Elizabeth",
                    zip: "07201",
                    country: "USA",
                    lon: "-74.183438",
                    cz: "4A",
                    state: "NJ",
                    file: "0-14734",
                    lat: "40.672052"
                  },
                  {
                    city: "Gainesville",
                    zip: "32601",
                    country: "USA",
                    lon: "-82.345739",
                    cz: "2A",
                    state: "FL",
                    file: "0-13889",
                    lat: "29.68041"
                  },
                  {
                    city: "Roseville",
                    zip: "95661",
                    country: "USA",
                    lon: "-121.25603",
                    cz: "3B",
                    state: "CA",
                    file: "0-23232",
                    lat: "38.74073"
                  },
                  {
                    city: "Carrollton",
                    zip: "75006",
                    country: "USA",
                    lon: "-96.777626",
                    cz: "2A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.767268"
                  },
                  {
                    city: "Stamford",
                    zip: "06901",
                    country: "USA",
                    lon: "-73.536216",
                    cz: "5A",
                    state: "CT",
                    file: "0-94702",
                    lat: "41.054082"
                  },
                  {
                    city: "Simi Valley",
                    zip: "93062",
                    country: "USA",
                    lon: "-119.1343",
                    cz: "3C",
                    state: "CA",
                    file: "0-23174",
                    lat: "34.032383"
                  },
                  {
                    city: "Concord",
                    zip: "94518",
                    country: "USA",
                    lon: "-122.022872",
                    cz: "3B",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.953672"
                  },
                  {
                    city: "Hartford",
                    zip: "06101",
                    country: "USA",
                    lon: "-72.677099",
                    cz: "5A",
                    state: "CT",
                    file: "0-14740",
                    lat: "41.78007"
                  },
                  {
                    city: "Kent",
                    zip: "98031",
                    country: "USA",
                    lon: "-122.16538",
                    cz: "5B",
                    state: "WA",
                    file: "0-24233",
                    lat: "47.379972"
                  },
                  {
                    city: "Lafayette",
                    zip: "70501",
                    country: "USA",
                    lon: "-92.066574",
                    cz: "2A",
                    state: "LA",
                    file: "0-13970",
                    lat: "30.232955"
                  },
                  {
                    city: "Midland",
                    zip: "79701",
                    country: "USA",
                    lon: "-102.091276",
                    cz: "3B",
                    state: "TX",
                    file: "0-23023",
                    lat: "31.861876"
                  },
                  {
                    city: "Surprise",
                    zip: "85374",
                    country: "USA",
                    lon: "-112.18717",
                    cz: "2B",
                    state: "AZ",
                    file: "0-23183",
                    lat: "33.276539"
                  },
                  {
                    city: "Denton",
                    zip: "76201",
                    country: "USA",
                    lon: "-97.200555",
                    cz: "3A",
                    state: "TX",
                    file: "0-3927",
                    lat: "33.244683"
                  },
                  {
                    city: "Victorville",
                    zip: "92392",
                    country: "USA",
                    lon: "-114.754916",
                    cz: "3B",
                    state: "CA",
                    file: "0-23169",
                    lat: "34.491985"
                  },
                  {
                    city: "Evansville",
                    zip: "47701",
                    country: "USA",
                    lon: "-87.574963",
                    cz: "4A",
                    state: "IN",
                    file: "0-93817",
                    lat: "37.997128"
                  },
                  {
                    city: "Santa Clara",
                    zip: "95050",
                    country: "USA",
                    lon: "-121.705327",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.189396"
                  },
                  {
                    city: "Abilene",
                    zip: "79601",
                    country: "USA",
                    lon: "-99.80213",
                    cz: "3B",
                    state: "TX",
                    file: "0-13962",
                    lat: "32.344457"
                  },
                  {
                    city: "Vallejo",
                    zip: "94589",
                    country: "USA",
                    lon: "-122.280383",
                    cz: "3B",
                    state: "CA",
                    file: "0-23234",
                    lat: "38.158221"
                  },
                  {
                    city: "Allentown",
                    zip: "18101",
                    country: "USA",
                    lon: "-75.470026",
                    cz: "5A",
                    state: "PA",
                    file: "0-14737",
                    lat: "40.607497"
                  },
                  {
                    city: "Norman",
                    zip: "73019",
                    country: "USA",
                    lon: "-97.44451",
                    cz: "3A",
                    state: "OK",
                    file: "0-13967",
                    lat: "35.208566"
                  },
                  {
                    city: "Beaumont",
                    zip: "77701",
                    country: "USA",
                    lon: "-94.109705",
                    cz: "3A",
                    state: "TX",
                    file: "0-12917",
                    lat: "30.073712"
                  },
                  {
                    city: "Independence",
                    zip: "64050",
                    country: "USA",
                    lon: "-94.409828",
                    cz: "4A",
                    state: "MO",
                    file: "0-3947",
                    lat: "39.107798"
                  },
                  {
                    city: "Murfreesboro",
                    zip: "37127",
                    country: "USA",
                    lon: "-86.372158",
                    cz: "3A",
                    state: "TN",
                    file: "0-13897",
                    lat: "35.762951"
                  },
                  {
                    city: "Ann Arbor",
                    zip: "48103",
                    country: "USA",
                    lon: "-83.849042",
                    cz: "5A",
                    state: "MI",
                    file: "0-94847",
                    lat: "42.266638"
                  },
                  {
                    city: "Springfield",
                    zip: "62701",
                    country: "USA",
                    lon: "-89.598978",
                    cz: "5A",
                    state: "IL",
                    file: "0-93822",
                    lat: "39.820839"
                  },
                  {
                    city: "Berkeley",
                    zip: "94701",
                    country: "USA",
                    lon: "-122.29673",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.860576"
                  },
                  {
                    city: "Peoria",
                    zip: "61601",
                    country: "USA",
                    lon: "-89.589847",
                    cz: "5A",
                    state: "IL",
                    file: "0-14842",
                    lat: "40.693137"
                  },
                  {
                    city: "Provo",
                    zip: "84601",
                    country: "USA",
                    lon: "-111.695558",
                    cz: "5B",
                    state: "UT",
                    file: "0-24127",
                    lat: "40.235053"
                  },
                  {
                    city: "El Monte",
                    zip: "91731",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Columbia",
                    zip: "65201",
                    country: "USA",
                    lon: "-92.274145",
                    cz: "4A",
                    state: "MO",
                    file: "0-3945",
                    lat: "38.894165"
                  },
                  {
                    city: "Lansing",
                    zip: "48901",
                    country: "USA",
                    lon: "-84.371973",
                    cz: "5A",
                    state: "MI",
                    file: "0-14836",
                    lat: "42.599184"
                  },
                  {
                    city: "Fargo",
                    zip: "58102",
                    country: "USA",
                    lon: "-96.990615",
                    cz: "6A",
                    state: "ND",
                    file: "0-14914",
                    lat: "46.92536"
                  },
                  {
                    city: "Downey",
                    zip: "90239",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Costa Mesa",
                    zip: "92626",
                    country: "USA",
                    lon: "-117.778398",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.6829"
                  },
                  {
                    city: "Wilmington",
                    zip: "28401",
                    country: "USA",
                    lon: "-77.95481",
                    cz: "3A",
                    state: "NC",
                    file: "0-13748",
                    lat: "34.163503"
                  },
                  {
                    city: "Arvada",
                    zip: "80001",
                    country: "USA",
                    lon: "-105.223945",
                    cz: "5B",
                    state: "CO",
                    file: "0-94018",
                    lat: "39.522014"
                  },
                  {
                    city: "Inglewood",
                    zip: "90301",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Carlsbad",
                    zip: "92008",
                    country: "USA",
                    lon: "-116.846046",
                    cz: "3B",
                    state: "CA",
                    file: "0-23188",
                    lat: "33.016928"
                  },
                  {
                    city: "Westminster",
                    zip: "80030",
                    country: "USA",
                    lon: "-105.034487",
                    cz: "5B",
                    state: "CO",
                    file: "0-94018",
                    lat: "39.872535"
                  },
                  {
                    city: "Rochester",
                    zip: "55901",
                    country: "USA",
                    lon: "-92.516916",
                    cz: "6A",
                    state: "MN",
                    file: "0-14925",
                    lat: "44.075285"
                  },
                  {
                    city: "Odessa",
                    zip: "79760",
                    country: "USA",
                    lon: "-102.354346",
                    cz: "3B",
                    state: "TX",
                    file: "0-23023",
                    lat: "31.765163"
                  },
                  {
                    city: "Manchester",
                    zip: "03101",
                    country: "USA",
                    lon: "-71.462111",
                    cz: "5A",
                    state: "NH",
                    file: "0-14745",
                    lat: "42.988483"
                  },
                  {
                    city: "Elgin",
                    zip: "60120",
                    country: "USA",
                    lon: "-88.429777",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "41.990689"
                  },
                  {
                    city: "West Jordan",
                    zip: "84084",
                    country: "USA",
                    lon: "-111.978898",
                    cz: "5B",
                    state: "UT",
                    file: "0-24127",
                    lat: "40.606125"
                  },
                  {
                    city: "Round Rock",
                    zip: "78664",
                    country: "USA",
                    lon: "-97.635103",
                    cz: "3A",
                    state: "TX",
                    file: "0-13958",
                    lat: "30.530497"
                  },
                  {
                    city: "Clearwater",
                    zip: "33755",
                    country: "USA",
                    lon: "-82.781523",
                    cz: "2A",
                    state: "FL",
                    file: "0-12842",
                    lat: "27.978147"
                  },
                  {
                    city: "Waterbury",
                    zip: "06701",
                    country: "USA",
                    lon: "-72.927507",
                    cz: "5A",
                    state: "CT",
                    file: "0-94702",
                    lat: "41.365709"
                  },
                  {
                    city: "Gresham",
                    zip: "97030",
                    country: "USA",
                    lon: "-122.430233",
                    cz: "4C",
                    state: "OR",
                    file: "0-24229",
                    lat: "45.508117"
                  },
                  {
                    city: "Fairfield",
                    zip: "94533",
                    country: "USA",
                    lon: "-122.020276",
                    cz: "3B",
                    state: "CA",
                    file: "0-23232",
                    lat: "38.278428"
                  },
                  {
                    city: "Billings",
                    zip: "59101",
                    country: "USA",
                    lon: "-108.387392",
                    cz: "6B",
                    state: "MT",
                    file: "0-24033",
                    lat: "45.686966"
                  },
                  {
                    city: "Lowell",
                    zip: "01850",
                    country: "USA",
                    lon: "-71.459405",
                    cz: "5A",
                    state: "MA",
                    file: "0-14739",
                    lat: "42.446396"
                  },
                  {
                    city: "Pueblo",
                    zip: "81001",
                    country: "USA",
                    lon: "-104.427776",
                    cz: "5B",
                    state: "CO",
                    file: "0-93058",
                    lat: "38.344117"
                  },
                  {
                    city: "High Point",
                    zip: "27260",
                    country: "USA",
                    lon: "-79.988711",
                    cz: "3A",
                    state: "NC",
                    file: "0-13723",
                    lat: "35.993538"
                  },
                  {
                    city: "West Covina",
                    zip: "91790",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Richmond",
                    zip: "94801",
                    country: "USA",
                    lon: "-122.384032",
                    cz: "3B",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.947523"
                  },
                  {
                    city: "Murrieta",
                    zip: "92562",
                    country: "USA",
                    lon: "-116.861027",
                    cz: "3B",
                    state: "CA",
                    file: "0-23188",
                    lat: "33.44204"
                  },
                  {
                    city: "Cambridge",
                    zip: "02138",
                    country: "USA",
                    lon: "-71.132947",
                    cz: "5A",
                    state: "MA",
                    file: "0-14739",
                    lat: "42.380442"
                  },
                  {
                    city: "Antioch",
                    zip: "94509",
                    country: "USA",
                    lon: "-121.906748",
                    cz: "3B",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.931997"
                  },
                  {
                    city: "Temecula",
                    zip: "92589",
                    country: "USA",
                    lon: "-116.055617",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "33.752886"
                  },
                  {
                    city: "Norwalk",
                    zip: "90650",
                    country: "USA",
                    lon: "-118.076549",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.906763"
                  },
                  {
                    city: "Everett",
                    zip: "98201",
                    country: "USA",
                    lon: "-122.199795",
                    cz: "4C",
                    state: "WA",
                    file: "0-24233",
                    lat: "47.988661"
                  },
                  {
                    city: "Palm Bay",
                    zip: "32905",
                    country: "USA",
                    lon: "-80.611642",
                    cz: "2A",
                    state: "FL",
                    file: "0-12842",
                    lat: "27.96861"
                  },
                  {
                    city: "Wichita Falls",
                    zip: "76301",
                    country: "USA",
                    lon: "-98.48283",
                    cz: "3A",
                    state: "TX",
                    file: "0-13966",
                    lat: "33.959758"
                  },
                  {
                    city: "Green Bay",
                    zip: "54301",
                    country: "USA",
                    lon: "-87.976051",
                    cz: "6A",
                    state: "WI",
                    file: "0-14898",
                    lat: "44.494385"
                  },
                  {
                    city: "Burbank",
                    zip: "91501",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Richardson",
                    zip: "75080",
                    country: "USA",
                    lon: "-96.726826",
                    cz: "2A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.962811"
                  },
                  {
                    city: "Pompano Beach",
                    zip: "33060",
                    country: "USA",
                    lon: "-80.139816",
                    cz: "1A",
                    state: "FL",
                    file: "0-12844",
                    lat: "26.240059"
                  },
                  {
                    city: "North Charleston",
                    zip: "29405",
                    country: "USA",
                    lon: "-79.991295",
                    cz: "3A",
                    state: "SC",
                    file: "0-13880",
                    lat: "32.853019"
                  },
                  {
                    city: "Broken Arrow",
                    zip: "74011",
                    country: "USA",
                    lon: "-95.818064",
                    cz: "3A",
                    state: "OK",
                    file: "0-13968",
                    lat: "35.986399"
                  },
                  {
                    city: "Boulder",
                    zip: "80301",
                    country: "USA",
                    lon: "-105.278083",
                    cz: "5B",
                    state: "CO",
                    file: "0-94018",
                    lat: "40.094787"
                  },
                  {
                    city: "West Palm Beach",
                    zip: "33401",
                    country: "USA",
                    lon: "-80.070613",
                    cz: "1A",
                    state: "FL",
                    file: "0-12844",
                    lat: "26.672643"
                  },
                  {
                    city: "Santa Maria",
                    zip: "93454",
                    country: "USA",
                    lon: "-120.340795",
                    cz: "3C",
                    state: "CA",
                    file: "0-23273",
                    lat: "34.875832"
                  },
                  {
                    city: "El Cajon",
                    zip: "92019",
                    country: "USA",
                    lon: "-117.041287",
                    cz: "3B",
                    state: "CA",
                    file: "0-23188",
                    lat: "32.865113"
                  },
                  {
                    city: "Davenport",
                    zip: "52801",
                    country: "USA",
                    lon: "-90.573686",
                    cz: "5A",
                    state: "IA",
                    file: "0-14923",
                    lat: "41.527232"
                  },
                  {
                    city: "Rialto",
                    zip: "92376",
                    country: "USA",
                    lon: "-115.567483",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "34.202339"
                  },
                  {
                    city: "Las Cruces",
                    zip: "88001",
                    country: "USA",
                    lon: "-106.854065",
                    cz: "3B",
                    state: "NM",
                    file: "0-23044",
                    lat: "32.41467"
                  },
                  {
                    city: "San Mateo",
                    zip: "94401",
                    country: "USA",
                    lon: "-122.32253",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.573485"
                  },
                  {
                    city: "Lewisville",
                    zip: "75029",
                    country: "USA",
                    lon: "-97.116282",
                    cz: "3A",
                    state: "TX",
                    file: "0-3927",
                    lat: "33.20743"
                  },
                  {
                    city: "South Bend",
                    zip: "46601",
                    country: "USA",
                    lon: "-86.251654",
                    cz: "5A",
                    state: "IN",
                    file: "0-14848",
                    lat: "41.673383"
                  },
                  {
                    city: "Lakeland",
                    zip: "33801",
                    country: "USA",
                    lon: "-81.956122",
                    cz: "2A",
                    state: "FL",
                    file: "0-12842",
                    lat: "28.059997"
                  },
                  {
                    city: "Erie",
                    zip: "16501",
                    country: "USA",
                    lon: "-80.087341",
                    cz: "5A",
                    state: "PA",
                    file: "0-14860",
                    lat: "42.087337"
                  },
                  {
                    city: "Tyler",
                    zip: "75701",
                    country: "USA",
                    lon: "-95.200403",
                    cz: "3A",
                    state: "TX",
                    file: "0-93987",
                    lat: "32.288029"
                  },
                  {
                    city: "Pearland",
                    zip: "77581",
                    country: "USA",
                    lon: "-95.316425",
                    cz: "2A",
                    state: "TX",
                    file: "0-12960",
                    lat: "29.328311"
                  },
                  {
                    city: "College Station",
                    zip: "77840",
                    country: "USA",
                    lon: "-96.289328",
                    cz: "2A",
                    state: "TX",
                    file: "0-12960",
                    lat: "30.582241"
                  },
                  {
                    city: "Kenosha",
                    zip: "53140",
                    country: "USA",
                    lon: "-87.830375",
                    cz: "5A",
                    state: "WI",
                    file: "0-14839",
                    lat: "42.622449"
                  },
                  {
                    city: "Clovis",
                    zip: "93611",
                    country: "USA",
                    lon: "-119.592146",
                    cz: "3B",
                    state: "CA",
                    file: "0-93193",
                    lat: "36.832583"
                  },
                  {
                    city: "Flint",
                    zip: "48501",
                    country: "USA",
                    lon: "-83.780835",
                    cz: "5A",
                    state: "MI",
                    file: "0-14826",
                    lat: "42.965926"
                  },
                  {
                    city: "Roanoke",
                    zip: "24001",
                    country: "USA",
                    lon: "-79.95786",
                    cz: "4A",
                    state: "VA",
                    file: "0-13741",
                    lat: "37.274175"
                  },
                  {
                    city: "Albany",
                    zip: "12201",
                    country: "USA",
                    lon: "-73.970812",
                    cz: "5A",
                    state: "NY",
                    file: "0-14735",
                    lat: "42.614852"
                  },
                  {
                    city: "Compton",
                    zip: "90220",
                    country: "USA",
                    lon: "-118.240208",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.874815"
                  },
                  {
                    city: "San Angelo",
                    zip: "76901",
                    country: "USA",
                    lon: "-100.533397",
                    cz: "3B",
                    state: "TX",
                    file: "0-23034",
                    lat: "31.44451"
                  },
                  {
                    city: "Hillsboro",
                    zip: "97123",
                    country: "USA",
                    lon: "-122.977963",
                    cz: "4C",
                    state: "OR",
                    file: "0-24229",
                    lat: "45.458397"
                  },
                  {
                    city: "Lawton",
                    zip: "73501",
                    country: "USA",
                    lon: "-98.448452",
                    cz: "3A",
                    state: "OK",
                    file: "0-13966",
                    lat: "34.635378"
                  },
                  {
                    city: "Renton",
                    zip: "98055",
                    country: "USA",
                    lon: "-122.02967",
                    cz: "5B",
                    state: "WA",
                    file: "0-24233",
                    lat: "47.485348"
                  },
                  {
                    city: "Vista",
                    zip: "92083",
                    country: "USA",
                    lon: "-116.846046",
                    cz: "3B",
                    state: "CA",
                    file: "0-23188",
                    lat: "33.016928"
                  },
                  {
                    city: "Greeley",
                    zip: "80631",
                    country: "USA",
                    lon: "-104.680631",
                    cz: "5B",
                    state: "CO",
                    file: "0-94018",
                    lat: "40.384991"
                  },
                  {
                    city: "Mission Viejo",
                    zip: "92690",
                    country: "USA",
                    lon: "-117.769442",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.640302"
                  },
                  {
                    city: "Portsmouth",
                    zip: "23701",
                    country: "USA",
                    lon: "-76.367715",
                    cz: "3A",
                    state: "VA",
                    file: "0-13737",
                    lat: "36.811498"
                  },
                  {
                    city: "Dearborn",
                    zip: "48120",
                    country: "USA",
                    lon: "-83.177625",
                    cz: "5A",
                    state: "MI",
                    file: "0-94847",
                    lat: "42.310037"
                  },
                  {
                    city: "South Gate",
                    zip: "90280",
                    country: "USA",
                    lon: "-118.193403",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.937714"
                  },
                  {
                    city: "Tuscaloosa",
                    zip: "35401",
                    country: "USA",
                    lon: "-87.597599",
                    cz: "3A",
                    state: "AL",
                    file: "0-13876",
                    lat: "33.241899"
                  },
                  {
                    city: "Livonia",
                    zip: "48150",
                    country: "USA",
                    lon: "-83.371753",
                    cz: "5A",
                    state: "MI",
                    file: "0-94847",
                    lat: "42.369351"
                  },
                  {
                    city: "New Bedford",
                    zip: "02740",
                    country: "USA",
                    lon: "-70.951045",
                    cz: "5A",
                    state: "MA",
                    file: "0-14765",
                    lat: "41.633416"
                  },
                  {
                    city: "Vacaville",
                    zip: "95687",
                    country: "USA",
                    lon: "-121.912773",
                    cz: "3B",
                    state: "CA",
                    file: "0-23232",
                    lat: "38.35056"
                  },
                  {
                    city: "Brockton",
                    zip: "02301",
                    country: "USA",
                    lon: "-71.03999",
                    cz: "5A",
                    state: "MA",
                    file: "0-14739",
                    lat: "42.079399"
                  },
                  {
                    city: "Roswell",
                    zip: "30075",
                    country: "USA",
                    lon: "-84.370475",
                    cz: "3A",
                    state: "GA",
                    file: "0-13874",
                    lat: "34.055198"
                  },
                  {
                    city: "Beaverton",
                    zip: "97005",
                    country: "USA",
                    lon: "-122.800146",
                    cz: "4C",
                    state: "OR",
                    file: "0-24229",
                    lat: "45.496289"
                  },
                  {
                    city: "Quincy",
                    zip: "02169",
                    country: "USA",
                    lon: "-71.006042",
                    cz: "5A",
                    state: "MA",
                    file: "0-14739",
                    lat: "42.241799"
                  },
                  {
                    city: "Sparks",
                    zip: "89431",
                    country: "USA",
                    lon: "-119.640601",
                    cz: "5B",
                    state: "NV",
                    file: "0-23185",
                    lat: "40.039169"
                  },
                  {
                    city: "Yakima",
                    zip: "98901",
                    country: "USA",
                    lon: "-120.725557",
                    cz: "5B",
                    state: "WA",
                    file: "0-24243",
                    lat: "46.644476"
                  },
                  {
                    city: "Federal Way",
                    zip: "98003",
                    country: "USA",
                    lon: "-121.803388",
                    cz: "5B",
                    state: "WA",
                    file: "0-24233",
                    lat: "47.432251"
                  },
                  {
                    city: "Carson",
                    zip: "90745",
                    country: "USA",
                    lon: "-118.261154",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.813317"
                  },
                  {
                    city: "Santa Monica",
                    zip: "90401",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Hesperia",
                    zip: "92340",
                    country: "USA",
                    lon: "-115.967051",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "34.839964"
                  },
                  {
                    city: "Allen",
                    zip: "75002",
                    country: "USA",
                    lon: "-96.646773",
                    cz: "3A",
                    state: "TX",
                    file: "0-3927",
                    lat: "33.208033"
                  },
                  {
                    city: "Rio Rancho",
                    zip: "87124",
                    country: "USA",
                    lon: "-106.712495",
                    cz: "5B",
                    state: "NM",
                    file: "0-23050",
                    lat: "35.282859"
                  },
                  {
                    city: "Yuma",
                    zip: "85364",
                    country: "USA",
                    lon: "-114.648722",
                    cz: "2B",
                    state: "AZ",
                    file: "0-23188",
                    lat: "32.615305"
                  },
                  {
                    city: "Westminster",
                    zip: "92683",
                    country: "USA",
                    lon: "-117.769442",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.640302"
                  },
                  {
                    city: "Orem",
                    zip: "84057",
                    country: "USA",
                    lon: "-111.72496",
                    cz: "5B",
                    state: "UT",
                    file: "0-24127",
                    lat: "40.311353"
                  },
                  {
                    city: "Lynn",
                    zip: "01901",
                    country: "USA",
                    lon: "-70.946743",
                    cz: "5A",
                    state: "MA",
                    file: "0-14739",
                    lat: "42.461246"
                  },
                  {
                    city: "Redding",
                    zip: "96001",
                    country: "USA",
                    lon: "-122.456982",
                    cz: "3B",
                    state: "CA",
                    file: "0-24283",
                    lat: "40.675738"
                  },
                  {
                    city: "Miami Beach",
                    zip: "33109",
                    country: "USA",
                    lon: "-80.458168",
                    cz: "1A",
                    state: "FL",
                    file: "0-12839",
                    lat: "25.558428"
                  },
                  {
                    city: "League City",
                    zip: "77573",
                    country: "USA",
                    lon: "-95.052262",
                    cz: "2A",
                    state: "TX",
                    file: "0-12960",
                    lat: "29.496451"
                  },
                  {
                    city: "Lawrence",
                    zip: "66044",
                    country: "USA",
                    lon: "-95.283982",
                    cz: "4A",
                    state: "KS",
                    file: "0-13996",
                    lat: "38.907518"
                  },
                  {
                    city: "Santa Barbara",
                    zip: "93101",
                    country: "USA",
                    lon: "-119.707135",
                    cz: "3C",
                    state: "CA",
                    file: "0-23273",
                    lat: "34.421897"
                  },
                  {
                    city: "Sandy",
                    zip: "84070",
                    country: "USA",
                    lon: "-111.859504",
                    cz: "5B",
                    state: "UT",
                    file: "0-24127",
                    lat: "40.578597"
                  },
                  {
                    city: "Macon",
                    zip: "31201",
                    country: "USA",
                    lon: "-83.595066",
                    cz: "3A",
                    state: "GA",
                    file: "0-3813",
                    lat: "32.827949"
                  },
                  {
                    city: "Longmont",
                    zip: "80501",
                    country: "USA",
                    lon: "-105.1633",
                    cz: "5B",
                    state: "CO",
                    file: "0-94018",
                    lat: "40.165634"
                  },
                  {
                    city: "Boca Raton",
                    zip: "33427",
                    country: "USA",
                    lon: "-80.10717",
                    cz: "1A",
                    state: "FL",
                    file: "0-12844",
                    lat: "26.375954"
                  },
                  {
                    city: "San Marcos",
                    zip: "92069",
                    country: "USA",
                    lon: "-117.215112",
                    cz: "3B",
                    state: "CA",
                    file: "0-23188",
                    lat: "33.099573"
                  },
                  {
                    city: "Greenville",
                    zip: "27833",
                    country: "USA",
                    lon: "-77.392609",
                    cz: "3A",
                    state: "NC",
                    file: "0-13722",
                    lat: "35.580444"
                  },
                  {
                    city: "Waukegan",
                    zip: "60079",
                    country: "USA",
                    lon: "-87.610053",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "42.322814"
                  },
                  {
                    city: "Fall River",
                    zip: "02720",
                    country: "USA",
                    lon: "-71.165971",
                    cz: "5A",
                    state: "MA",
                    file: "0-14765",
                    lat: "41.819766"
                  },
                  {
                    city: "Chico",
                    zip: "95926",
                    country: "USA",
                    lon: "-121.840083",
                    cz: "3B",
                    state: "CA",
                    file: "0-23232",
                    lat: "39.746159"
                  },
                  {
                    city: "Newton",
                    zip: "02458",
                    country: "USA",
                    lon: "-71.208399",
                    cz: "5A",
                    state: "MA",
                    file: "0-14739",
                    lat: "42.385096"
                  },
                  {
                    city: "San Leandro",
                    zip: "94577",
                    country: "USA",
                    lon: "-122.158621",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.715629"
                  },
                  {
                    city: "Reading",
                    zip: "19601",
                    country: "USA",
                    lon: "-75.940153",
                    cz: "4A",
                    state: "PA",
                    file: "0-14737",
                    lat: "40.357242"
                  },
                  {
                    city: "Norwalk",
                    zip: "06850",
                    country: "USA",
                    lon: "-73.442423",
                    cz: "5A",
                    state: "CT",
                    file: "0-94702",
                    lat: "41.126146"
                  },
                  {
                    city: "Fort Smith",
                    zip: "72901",
                    country: "USA",
                    lon: "-94.339412",
                    cz: "3A",
                    state: "AR",
                    file: "0-13964",
                    lat: "35.231245"
                  },
                  {
                    city: "Newport Beach",
                    zip: "92658",
                    country: "USA",
                    lon: "-117.769442",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.640302"
                  },
                  {
                    city: "Asheville",
                    zip: "28801",
                    country: "USA",
                    lon: "-82.567281",
                    cz: "4A",
                    state: "NC",
                    file: "0-3812",
                    lat: "35.602711"
                  },
                  {
                    city: "Nashua",
                    zip: "03060",
                    country: "USA",
                    lon: "-71.626336",
                    cz: "5A",
                    state: "NH",
                    file: "0-14745",
                    lat: "42.771537"
                  },
                  {
                    city: "Edmond",
                    zip: "73003",
                    country: "USA",
                    lon: "-97.499681",
                    cz: "3A",
                    state: "OK",
                    file: "0-13967",
                    lat: "35.674777"
                  },
                  {
                    city: "Whittier",
                    zip: "90601",
                    country: "USA",
                    lon: "-118.0441",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "34.004311"
                  },
                  {
                    city: "Deltona",
                    zip: "32725",
                    country: "USA",
                    lon: "-81.245074",
                    cz: "2A",
                    state: "FL",
                    file: "0-12834",
                    lat: "28.900274"
                  },
                  {
                    city: "Hawthorne",
                    zip: "90250",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Duluth",
                    zip: "55801",
                    country: "USA",
                    lon: "-92.001934",
                    cz: "6A",
                    state: "MN",
                    file: "0-14913",
                    lat: "47.005566"
                  },
                  {
                    city: "Carmel",
                    zip: "46032",
                    country: "USA",
                    lon: "-86.117215",
                    cz: "5A",
                    state: "IN",
                    file: "0-93819",
                    lat: "40.071102"
                  },
                  {
                    city: "Suffolk",
                    zip: "23432",
                    country: "USA",
                    lon: "-76.553061",
                    cz: "3A",
                    state: "VA",
                    file: "0-13737",
                    lat: "36.874916"
                  },
                  {
                    city: "Clifton",
                    zip: "07011",
                    country: "USA",
                    lon: "-74.141237",
                    cz: "5A",
                    state: "NJ",
                    file: "0-14734",
                    lat: "40.877949"
                  },
                  {
                    city: "Citrus Heights",
                    zip: "95610",
                    country: "USA",
                    lon: "-121.26736",
                    cz: "3B",
                    state: "CA",
                    file: "0-23232",
                    lat: "38.689802"
                  },
                  {
                    city: "Livermore",
                    zip: "94550",
                    country: "USA",
                    lon: "-121.91605",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.676781"
                  },
                  {
                    city: "Tracy",
                    zip: "95304",
                    country: "USA",
                    lon: "-121.253872",
                    cz: "3B",
                    state: "CA",
                    file: "0-23232",
                    lat: "37.889849"
                  },
                  {
                    city: "Alhambra",
                    zip: "91801",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Kirkland",
                    zip: "98033",
                    country: "USA",
                    lon: "-122.187029",
                    cz: "5B",
                    state: "WA",
                    file: "0-24233",
                    lat: "47.673263"
                  },
                  {
                    city: "Trenton",
                    zip: "08601",
                    country: "USA",
                    lon: "-74.712018",
                    cz: "4A",
                    state: "NJ",
                    file: "0-13739",
                    lat: "40.280531"
                  },
                  {
                    city: "Ogden",
                    zip: "84201",
                    country: "USA",
                    lon: "-112.007924",
                    cz: "5B",
                    state: "UT",
                    file: "0-24127",
                    lat: "41.244261"
                  },
                  {
                    city: "Cicero",
                    zip: "60804",
                    country: "USA",
                    lon: "-87.68732",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "41.811929"
                  },
                  {
                    city: "Fishers",
                    zip: "46038",
                    country: "USA",
                    lon: "-85.964894",
                    cz: "5A",
                    state: "IN",
                    file: "0-93819",
                    lat: "39.967406"
                  },
                  {
                    city: "Sugar Land",
                    zip: "77478",
                    country: "USA",
                    lon: "-95.756462",
                    cz: "2A",
                    state: "TX",
                    file: "0-12960",
                    lat: "29.525461"
                  },
                  {
                    city: "Danbury",
                    zip: "06810",
                    country: "USA",
                    lon: "-73.471416",
                    cz: "5A",
                    state: "CT",
                    file: "0-94702",
                    lat: "41.376242"
                  },
                  {
                    city: "Indio",
                    zip: "92201",
                    country: "USA",
                    lon: "-116.035705",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "33.728721"
                  },
                  {
                    city: "Concord",
                    zip: "28025",
                    country: "USA",
                    lon: "-80.562141",
                    cz: "3A",
                    state: "NC",
                    file: "0-13881",
                    lat: "35.371633"
                  },
                  {
                    city: "Menifee",
                    zip: "92584",
                    country: "USA",
                    lon: "-116.055617",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "33.752886"
                  },
                  {
                    city: "Champaign",
                    zip: "61820",
                    country: "USA",
                    lon: "-88.197166",
                    cz: "5A",
                    state: "IL",
                    file: "0-93822",
                    lat: "40.101777"
                  },
                  {
                    city: "Buena Park",
                    zip: "90620",
                    country: "USA",
                    lon: "-117.769442",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.640302"
                  },
                  {
                    city: "Troy",
                    zip: "48007",
                    country: "USA",
                    lon: "-83.297593",
                    cz: "5A",
                    state: "MI",
                    file: "0-94847",
                    lat: "42.606088"
                  },
                  {
                    city: "Bellingham",
                    zip: "98225",
                    country: "USA",
                    lon: "-122.454297",
                    cz: "4C",
                    state: "WA",
                    file: "0-24233",
                    lat: "48.747687"
                  },
                  {
                    city: "Westland",
                    zip: "48185",
                    country: "USA",
                    lon: "-83.373093",
                    cz: "5A",
                    state: "MI",
                    file: "0-94847",
                    lat: "42.31507"
                  },
                  {
                    city: "Bloomington",
                    zip: "47401",
                    country: "USA",
                    lon: "-86.435094",
                    cz: "5A",
                    state: "IN",
                    file: "0-93819",
                    lat: "39.07881"
                  },
                  {
                    city: "Sioux City",
                    zip: "51101",
                    country: "USA",
                    lon: "-96.399356",
                    cz: "5A",
                    state: "IA",
                    file: "0-14943",
                    lat: "42.494745"
                  },
                  {
                    city: "Warwick",
                    zip: "02886",
                    country: "USA",
                    lon: "-71.47902",
                    cz: "#N/A",
                    state: "RI",
                    file: "0-14765",
                    lat: "41.70247"
                  },
                  {
                    city: "Hemet",
                    zip: "92543",
                    country: "USA",
                    lon: "-116.777014",
                    cz: "3B",
                    state: "CA",
                    file: "0-23188",
                    lat: "33.651652"
                  },
                  {
                    city: "Longview",
                    zip: "75601",
                    country: "USA",
                    lon: "-94.730285",
                    cz: "3A",
                    state: "TX",
                    file: "0-13957",
                    lat: "32.517846"
                  },
                  {
                    city: "Bend",
                    zip: "97701",
                    country: "USA",
                    lon: "-121.227125",
                    cz: "5B",
                    state: "OR",
                    file: "0-24230",
                    lat: "44.082037"
                  },
                  {
                    city: "Lakewood",
                    zip: "90711",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Merced",
                    zip: "95340",
                    country: "USA",
                    lon: "-120.475427",
                    cz: "3B",
                    state: "CA",
                    file: "0-93193",
                    lat: "37.338191"
                  },
                  {
                    city: "Mission",
                    zip: "78572",
                    country: "USA",
                    lon: "-98.192732",
                    cz: "3A",
                    state: "TX",
                    file: "0-12919",
                    lat: "26.229639"
                  },
                  {
                    city: "Chino",
                    zip: "91708",
                    country: "USA",
                    lon: "-115.967051",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "34.839964"
                  },
                  {
                    city: "Redwood City",
                    zip: "94059",
                    country: "USA",
                    lon: "-122.334825",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.381144"
                  },
                  {
                    city: "Edinburg",
                    zip: "78539",
                    country: "USA",
                    lon: "-98.139672",
                    cz: "3A",
                    state: "TX",
                    file: "0-12919",
                    lat: "26.328674"
                  },
                  {
                    city: "Cranston",
                    zip: "02910",
                    country: "USA",
                    lon: "-71.435251",
                    cz: "#N/A",
                    state: "RI",
                    file: "0-14765",
                    lat: "41.7917"
                  },
                  {
                    city: "New Rochelle",
                    zip: "10801",
                    country: "USA",
                    lon: "-73.801401",
                    cz: "5A",
                    state: "NY",
                    file: "0-94728",
                    lat: "41.035123"
                  },
                  {
                    city: "Lake Forest",
                    zip: "92630",
                    country: "USA",
                    lon: "-117.693074",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.64079"
                  },
                  {
                    city: "Napa",
                    zip: "94558",
                    country: "USA",
                    lon: "-122.311921",
                    cz: "3C",
                    state: "CA",
                    file: "0-23232",
                    lat: "38.516158"
                  },
                  {
                    city: "Hammond",
                    zip: "46320",
                    country: "USA",
                    lon: "-87.487242",
                    cz: "5A",
                    state: "IN",
                    file: "0-94846",
                    lat: "41.444246"
                  },
                  {
                    city: "Fayetteville",
                    zip: "72701",
                    country: "USA",
                    lon: "-94.190997",
                    cz: "4A",
                    state: "AR",
                    file: "0-13964",
                    lat: "35.974602"
                  },
                  {
                    city: "Bloomington",
                    zip: "61701",
                    country: "USA",
                    lon: "-88.850396",
                    cz: "5A",
                    state: "IL",
                    file: "0-14842",
                    lat: "40.462041"
                  },
                  {
                    city: "Avondale",
                    zip: "85323",
                    country: "USA",
                    lon: "-112.18717",
                    cz: "2B",
                    state: "AZ",
                    file: "0-23183",
                    lat: "33.276539"
                  },
                  {
                    city: "Somerville",
                    zip: "02143",
                    country: "USA",
                    lon: "-71.098896",
                    cz: "5A",
                    state: "MA",
                    file: "0-14739",
                    lat: "42.38092"
                  },
                  {
                    city: "Palm Coast",
                    zip: "32135",
                    country: "USA",
                    lon: "-81.282815",
                    cz: "2A",
                    state: "FL",
                    file: "0-12834",
                    lat: "29.466085"
                  },
                  {
                    city: "Bryan",
                    zip: "77801",
                    country: "USA",
                    lon: "-96.361631",
                    cz: "2A",
                    state: "TX",
                    file: "0-12960",
                    lat: "30.667044"
                  },
                  {
                    city: "Gary",
                    zip: "46401",
                    country: "USA",
                    lon: "-87.319937",
                    cz: "5A",
                    state: "IN",
                    file: "0-94846",
                    lat: "41.590686"
                  },
                  {
                    city: "Largo",
                    zip: "33770",
                    country: "USA",
                    lon: "-82.802668",
                    cz: "2A",
                    state: "FL",
                    file: "0-12842",
                    lat: "27.916998"
                  },
                  {
                    city: "Tustin",
                    zip: "92780",
                    country: "USA",
                    lon: "-117.731534",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.579122"
                  },
                  {
                    city: "Racine",
                    zip: "53401",
                    country: "USA",
                    lon: "-87.675979",
                    cz: "5A",
                    state: "WI",
                    file: "0-14839",
                    lat: "42.727153"
                  },
                  {
                    city: "Deerfield Beach",
                    zip: "33441",
                    country: "USA",
                    lon: "-80.140769",
                    cz: "1A",
                    state: "FL",
                    file: "0-12844",
                    lat: "26.273761"
                  },
                  {
                    city: "Lynchburg",
                    zip: "24501",
                    country: "USA",
                    lon: "-79.178326",
                    cz: "4A",
                    state: "VA",
                    file: "0-13733",
                    lat: "37.383112"
                  },
                  {
                    city: "Mountain View",
                    zip: "94035",
                    country: "USA",
                    lon: "-121.705327",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.189396"
                  },
                  {
                    city: "Medford",
                    zip: "97501",
                    country: "USA",
                    lon: "-122.72255",
                    cz: "4C",
                    state: "OR",
                    file: "0-24225",
                    lat: "42.482623"
                  },
                  {
                    city: "Lawrence",
                    zip: "01840",
                    country: "USA",
                    lon: "-71.161052",
                    cz: "5A",
                    state: "MA",
                    file: "0-14739",
                    lat: "42.70734"
                  },
                  {
                    city: "Bellflower",
                    zip: "90706",
                    country: "USA",
                    lon: "-118.12965",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.888014"
                  },
                  {
                    city: "Melbourne",
                    zip: "32901",
                    country: "USA",
                    lon: "-80.585519",
                    cz: "2A",
                    state: "FL",
                    file: "0-12842",
                    lat: "28.012189"
                  },
                  {
                    city: "Camden",
                    zip: "08101",
                    country: "USA",
                    lon: "-74.938259",
                    cz: "4A",
                    state: "NJ",
                    file: "0-13739",
                    lat: "39.80237"
                  },
                  {
                    city: "Kennewick",
                    zip: "99336",
                    country: "USA",
                    lon: "-119.155671",
                    cz: "5B",
                    state: "WA",
                    file: "0-24155",
                    lat: "46.212306"
                  },
                  {
                    city: "Baldwin Park",
                    zip: "91706",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Chino Hills",
                    zip: "91709",
                    country: "USA",
                    lon: "-115.967051",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "34.839964"
                  },
                  {
                    city: "Alameda",
                    zip: "94501",
                    country: "USA",
                    lon: "-122.264779",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.770563"
                  },
                  {
                    city: "Albany",
                    zip: "31701",
                    country: "USA",
                    lon: "-84.176751",
                    cz: "2A",
                    state: "GA",
                    file: "0-93842",
                    lat: "31.560674"
                  },
                  {
                    city: "Arlington Heights",
                    zip: "60004",
                    country: "USA",
                    lon: "-87.99822",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "42.085626"
                  },
                  {
                    city: "Scranton",
                    zip: "18501",
                    country: "USA",
                    lon: "-75.637626",
                    cz: "5A",
                    state: "PA",
                    file: "0-14777",
                    lat: "41.401881"
                  },
                  {
                    city: "Evanston",
                    zip: "60201",
                    country: "USA",
                    lon: "-87.702155",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "42.049148"
                  },
                  {
                    city: "Kalamazoo",
                    zip: "49001",
                    country: "USA",
                    lon: "-85.510095",
                    cz: "5A",
                    state: "MI",
                    file: "0-94860",
                    lat: "42.261596"
                  },
                  {
                    city: "Baytown",
                    zip: "77520",
                    country: "USA",
                    lon: "-95.434241",
                    cz: "2A",
                    state: "TX",
                    file: "0-12960",
                    lat: "29.83399"
                  },
                  {
                    city: "Upland",
                    zip: "91784",
                    country: "USA",
                    lon: "-116.246997",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "34.128118"
                  },
                  {
                    city: "Springdale",
                    zip: "72762",
                    country: "USA",
                    lon: "-94.240112",
                    cz: "4A",
                    state: "AR",
                    file: "0-13964",
                    lat: "36.16722"
                  },
                  {
                    city: "Bethlehem",
                    zip: "18015",
                    country: "USA",
                    lon: "-75.351958",
                    cz: "5A",
                    state: "PA",
                    file: "0-14737",
                    lat: "40.58883"
                  },
                  {
                    city: "Schaumburg",
                    zip: "60159",
                    country: "USA",
                    lon: "-87.68732",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "41.811929"
                  },
                  {
                    city: "Mount Pleasant",
                    zip: "29464",
                    country: "USA",
                    lon: "-79.820563",
                    cz: "3A",
                    state: "SC",
                    file: "0-13880",
                    lat: "32.847273"
                  },
                  {
                    city: "Auburn",
                    zip: "98001",
                    country: "USA",
                    lon: "-121.821908",
                    cz: "5B",
                    state: "WA",
                    file: "0-24233",
                    lat: "47.465495"
                  },
                  {
                    city: "Decatur",
                    zip: "62521",
                    country: "USA",
                    lon: "-88.946486",
                    cz: "5A",
                    state: "IL",
                    file: "0-93822",
                    lat: "39.839477"
                  },
                  {
                    city: "San Ramon",
                    zip: "94583",
                    country: "USA",
                    lon: "-121.975531",
                    cz: "3B",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.768556"
                  },
                  {
                    city: "Pleasanton",
                    zip: "94566",
                    country: "USA",
                    lon: "-121.862128",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.646081"
                  },
                  {
                    city: "Lake Charles",
                    zip: "70601",
                    country: "USA",
                    lon: "-93.214903",
                    cz: "2A",
                    state: "LA",
                    file: "0-3937",
                    lat: "30.233355"
                  },
                  {
                    city: "Bolingbrook",
                    zip: "60440",
                    country: "USA",
                    lon: "-88.022464",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "41.623336"
                  },
                  {
                    city: "Pharr",
                    zip: "78577",
                    country: "USA",
                    lon: "-98.127765",
                    cz: "3A",
                    state: "TX",
                    file: "0-12919",
                    lat: "26.186698"
                  },
                  {
                    city: "Appleton",
                    zip: "54911",
                    country: "USA",
                    lon: "-88.370856",
                    cz: "5A",
                    state: "WI",
                    file: "0-14898",
                    lat: "44.275702"
                  },
                  {
                    city: "Gastonia",
                    zip: "28052",
                    country: "USA",
                    lon: "-81.178725",
                    cz: "3A",
                    state: "NC",
                    file: "0-13881",
                    lat: "35.267916"
                  },
                  {
                    city: "Folsom",
                    zip: "95630",
                    country: "USA",
                    lon: "-121.310796",
                    cz: "3B",
                    state: "CA",
                    file: "0-23232",
                    lat: "38.594181"
                  },
                  {
                    city: "Southfield",
                    zip: "48034",
                    country: "USA",
                    lon: "-83.279164",
                    cz: "5A",
                    state: "MI",
                    file: "0-94847",
                    lat: "42.478495"
                  },
                  {
                    city: "New Britain",
                    zip: "06050",
                    country: "USA",
                    lon: "-72.778391",
                    cz: "5A",
                    state: "CT",
                    file: "0-14740",
                    lat: "41.666049"
                  },
                  {
                    city: "Goodyear",
                    zip: "85338",
                    country: "USA",
                    lon: "-112.18717",
                    cz: "2B",
                    state: "AZ",
                    file: "0-23183",
                    lat: "33.276539"
                  },
                  {
                    city: "Canton",
                    zip: "44701",
                    country: "USA",
                    lon: "-81.371185",
                    cz: "5A",
                    state: "OH",
                    file: "0-14895",
                    lat: "40.782408"
                  },
                  {
                    city: "Warner Robins",
                    zip: "31088",
                    country: "USA",
                    lon: "-83.644751",
                    cz: "3A",
                    state: "GA",
                    file: "0-3813",
                    lat: "32.555039"
                  },
                  {
                    city: "Union City",
                    zip: "94587",
                    country: "USA",
                    lon: "-121.97362",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.589084"
                  },
                  {
                    city: "Perris",
                    zip: "92570",
                    country: "USA",
                    lon: "-116.055617",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "33.752886"
                  },
                  {
                    city: "Manteca",
                    zip: "95336",
                    country: "USA",
                    lon: "-121.177601",
                    cz: "3B",
                    state: "CA",
                    file: "0-23232",
                    lat: "37.807297"
                  },
                  {
                    city: "Iowa City",
                    zip: "52240",
                    country: "USA",
                    lon: "-91.541579",
                    cz: "5A",
                    state: "IA",
                    file: "0-14923",
                    lat: "41.648207"
                  },
                  {
                    city: "Jonesboro",
                    zip: "72401",
                    country: "USA",
                    lon: "-90.623071",
                    cz: "3A",
                    state: "AR",
                    file: "0-13893",
                    lat: "35.835847"
                  },
                  {
                    city: "Wilmington",
                    zip: "19801",
                    country: "USA",
                    lon: "-75.547844",
                    cz: "4A",
                    state: "DE",
                    file: "0-13781",
                    lat: "39.727113"
                  },
                  {
                    city: "Lynwood",
                    zip: "90262",
                    country: "USA",
                    lon: "-118.202954",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.924538"
                  },
                  {
                    city: "Loveland",
                    zip: "80537",
                    country: "USA",
                    lon: "-105.266415",
                    cz: "5B",
                    state: "CO",
                    file: "0-94018",
                    lat: "40.553704"
                  },
                  {
                    city: "Pawtucket",
                    zip: "02860",
                    country: "USA",
                    lon: "-71.392732",
                    cz: "#N/A",
                    state: "RI",
                    file: "0-14765",
                    lat: "41.875149"
                  },
                  {
                    city: "Boynton Beach",
                    zip: "33424",
                    country: "USA",
                    lon: "-80.430269",
                    cz: "1A",
                    state: "FL",
                    file: "0-12844",
                    lat: "26.645895"
                  },
                  {
                    city: "Waukesha",
                    zip: "53186",
                    country: "USA",
                    lon: "-88.217715",
                    cz: "5A",
                    state: "WI",
                    file: "0-14839",
                    lat: "42.987835"
                  },
                  {
                    city: "Gulfport",
                    zip: "39501",
                    country: "USA",
                    lon: "-89.064103",
                    cz: "3A",
                    state: "MS",
                    file: "0-13894",
                    lat: "30.396277"
                  },
                  {
                    city: "Apple Valley",
                    zip: "92307",
                    country: "USA",
                    lon: "-115.967051",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "34.839964"
                  },
                  {
                    city: "Passaic",
                    zip: "07055",
                    country: "USA",
                    lon: "-74.126916",
                    cz: "5A",
                    state: "NJ",
                    file: "0-14734",
                    lat: "40.855103"
                  },
                  {
                    city: "Rapid City",
                    zip: "57701",
                    country: "USA",
                    lon: "-103.240024",
                    cz: "6A",
                    state: "SD",
                    file: "0-24090",
                    lat: "44.004363"
                  },
                  {
                    city: "Layton",
                    zip: "84040",
                    country: "USA",
                    lon: "-111.92614",
                    cz: "5B",
                    state: "UT",
                    file: "0-24127",
                    lat: "41.088889"
                  },
                  {
                    city: "Lafayette",
                    zip: "47901",
                    country: "USA",
                    lon: "-86.830286",
                    cz: "5A",
                    state: "IN",
                    file: "0-93819",
                    lat: "40.39905"
                  },
                  {
                    city: "Turlock",
                    zip: "95380",
                    country: "USA",
                    lon: "-120.844063",
                    cz: "3B",
                    state: "CA",
                    file: "0-23232",
                    lat: "37.540206"
                  },
                  {
                    city: "Muncie",
                    zip: "47302",
                    country: "USA",
                    lon: "-85.389874",
                    cz: "5A",
                    state: "IN",
                    file: "0-93819",
                    lat: "40.142124"
                  },
                  {
                    city: "Temple",
                    zip: "76501",
                    country: "USA",
                    lon: "-97.3047",
                    cz: "2A",
                    state: "TX",
                    file: "0-13959",
                    lat: "31.068306"
                  },
                  {
                    city: "Missouri City",
                    zip: "77459",
                    country: "USA",
                    lon: "-95.649939",
                    cz: "2A",
                    state: "TX",
                    file: "0-12960",
                    lat: "29.323965"
                  },
                  {
                    city: "Redlands",
                    zip: "92373",
                    country: "USA",
                    lon: "-116.889474",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "34.2409"
                  },
                  {
                    city: "Milpitas",
                    zip: "95035",
                    country: "USA",
                    lon: "-121.861989",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.436454"
                  },
                  {
                    city: "Palatine",
                    zip: "60038",
                    country: "USA",
                    lon: "-88.014072",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "42.097976"
                  },
                  {
                    city: "Missoula",
                    zip: "59801",
                    country: "USA",
                    lon: "-113.909123",
                    cz: "6B",
                    state: "MT",
                    file: "0-24153",
                    lat: "46.853606"
                  },
                  {
                    city: "Rock Hill",
                    zip: "29730",
                    country: "USA",
                    lon: "-81.052437",
                    cz: "3A",
                    state: "SC",
                    file: "0-13881",
                    lat: "34.909109"
                  },
                  {
                    city: "Jacksonville",
                    zip: "28540",
                    country: "USA",
                    lon: "-77.414673",
                    cz: "3A",
                    state: "NC",
                    file: "0-13748",
                    lat: "34.726587"
                  },
                  {
                    city: "Franklin",
                    zip: "37064",
                    country: "USA",
                    lon: "-86.965691",
                    cz: "4A",
                    state: "TN",
                    file: "0-13897",
                    lat: "35.890746"
                  },
                  {
                    city: "Flagstaff",
                    zip: "86001",
                    country: "USA",
                    lon: "-111.597853",
                    cz: "5B",
                    state: "AZ",
                    file: "0-3103",
                    lat: "35.932116"
                  },
                  {
                    city: "Flower Mound",
                    zip: "75022",
                    country: "USA",
                    lon: "-97.119331",
                    cz: "3A",
                    state: "TX",
                    file: "0-3927",
                    lat: "33.026795"
                  },
                  {
                    city: "Waterloo",
                    zip: "50701",
                    country: "USA",
                    lon: "-92.339209",
                    cz: "5A",
                    state: "IA",
                    file: "0-94910",
                    lat: "42.441117"
                  },
                  {
                    city: "Union City",
                    zip: "07087",
                    country: "USA",
                    lon: "-74.056335",
                    cz: "4A",
                    state: "NJ",
                    file: "0-14734",
                    lat: "40.758951"
                  },
                  {
                    city: "Mount Vernon",
                    zip: "10550",
                    country: "USA",
                    lon: "-73.83389",
                    cz: "5A",
                    state: "NY",
                    file: "0-94728",
                    lat: "40.909838"
                  },
                  {
                    city: "Fort Myers",
                    zip: "33901",
                    country: "USA",
                    lon: "-81.925065",
                    cz: "2A",
                    state: "FL",
                    file: "0-12839",
                    lat: "26.564355"
                  },
                  {
                    city: "Dothan",
                    zip: "36301",
                    country: "USA",
                    lon: "-85.371845",
                    cz: "2A",
                    state: "AL",
                    file: "0-93805",
                    lat: "31.148124"
                  },
                  {
                    city: "Rancho Cordova",
                    zip: "95670",
                    country: "USA",
                    lon: "-121.270426",
                    cz: "3B",
                    state: "CA",
                    file: "0-23232",
                    lat: "38.597705"
                  },
                  {
                    city: "Redondo Beach",
                    zip: "90277",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Jackson",
                    zip: "38301",
                    country: "USA",
                    lon: "-88.862742",
                    cz: "4A",
                    state: "TN",
                    file: "0-13893",
                    lat: "35.570424"
                  },
                  {
                    city: "Pasco",
                    zip: "99301",
                    country: "USA",
                    lon: "-118.899447",
                    cz: "5B",
                    state: "WA",
                    file: "0-24155",
                    lat: "46.42066"
                  },
                  {
                    city: "Eau Claire",
                    zip: "54701",
                    country: "USA",
                    lon: "-91.473097",
                    cz: "6A",
                    state: "WI",
                    file: "0-14991",
                    lat: "44.75653"
                  },
                  {
                    city: "North Richland Hills",
                    zip: "76180",
                    country: "USA",
                    lon: "-97.217416",
                    cz: "2A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.868023"
                  },
                  {
                    city: "Bismarck",
                    zip: "58501",
                    country: "USA",
                    lon: "-100.502724",
                    cz: "6A",
                    state: "ND",
                    file: "0-24011",
                    lat: "46.981207"
                  },
                  {
                    city: "Yorba Linda",
                    zip: "92885",
                    country: "USA",
                    lon: "-117.769442",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.640302"
                  },
                  {
                    city: "Kenner",
                    zip: "70062",
                    country: "USA",
                    lon: "-90.20446",
                    cz: "2A",
                    state: "LA",
                    file: "0-12916",
                    lat: "29.994398"
                  },
                  {
                    city: "Walnut Creek",
                    zip: "94595",
                    country: "USA",
                    lon: "-122.070625",
                    cz: "3B",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.873343"
                  },
                  {
                    city: "Frederick",
                    zip: "21701",
                    country: "USA",
                    lon: "-77.369299",
                    cz: "4A",
                    state: "MD",
                    file: "0-93738",
                    lat: "39.512748"
                  },
                  {
                    city: "Oshkosh",
                    zip: "54901",
                    country: "USA",
                    lon: "-88.55756",
                    cz: "6A",
                    state: "WI",
                    file: "0-14898",
                    lat: "44.005661"
                  },
                  {
                    city: "Pittsburg",
                    zip: "94565",
                    country: "USA",
                    lon: "-121.917219",
                    cz: "3B",
                    state: "CA",
                    file: "0-23234",
                    lat: "38.00307"
                  },
                  {
                    city: "Palo Alto",
                    zip: "94301",
                    country: "USA",
                    lon: "-121.705327",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.189396"
                  },
                  {
                    city: "Bossier City",
                    zip: "71111",
                    country: "USA",
                    lon: "-93.586698",
                    cz: "3A",
                    state: "LA",
                    file: "0-13957",
                    lat: "32.516708"
                  },
                  {
                    city: "Portland",
                    zip: "04101",
                    country: "USA",
                    lon: "-70.262393",
                    cz: "6A",
                    state: "ME",
                    file: "0-14764",
                    lat: "43.658784"
                  },
                  {
                    city: "Davis",
                    zip: "95616",
                    country: "USA",
                    lon: "-121.749016",
                    cz: "3B",
                    state: "CA",
                    file: "0-23232",
                    lat: "38.521776"
                  },
                  {
                    city: "South San Francisco",
                    zip: "94080",
                    country: "USA",
                    lon: "-122.423483",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.657443"
                  },
                  {
                    city: "Camarillo",
                    zip: "93010",
                    country: "USA",
                    lon: "-119.084253",
                    cz: "3C",
                    state: "CA",
                    file: "0-23174",
                    lat: "34.307783"
                  },
                  {
                    city: "North Little Rock",
                    zip: "72114",
                    country: "USA",
                    lon: "-92.262899",
                    cz: "3A",
                    state: "AR",
                    file: "0-13963",
                    lat: "34.766561"
                  },
                  {
                    city: "Schenectady",
                    zip: "12301",
                    country: "USA",
                    lon: "-74.058015",
                    cz: "5A",
                    state: "NY",
                    file: "0-14735",
                    lat: "42.833261"
                  },
                  {
                    city: "Gaithersburg",
                    zip: "20877",
                    country: "USA",
                    lon: "-77.182953",
                    cz: "4A",
                    state: "MD",
                    file: "0-93738",
                    lat: "39.139336"
                  },
                  {
                    city: "Harlingen",
                    zip: "78550",
                    country: "USA",
                    lon: "-97.536807",
                    cz: "1A",
                    state: "TX",
                    file: "0-12919",
                    lat: "26.185202"
                  },
                  {
                    city: "Yuba City",
                    zip: "95991",
                    country: "USA",
                    lon: "-121.612481",
                    cz: "3B",
                    state: "CA",
                    file: "0-23232",
                    lat: "39.048854"
                  },
                  {
                    city: "Youngstown",
                    zip: "44501",
                    country: "USA",
                    lon: "-80.802854",
                    cz: "5A",
                    state: "OH",
                    file: "0-14852",
                    lat: "41.017082"
                  },
                  {
                    city: "Skokie",
                    zip: "60076",
                    country: "USA",
                    lon: "-87.883566",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "42.057878"
                  },
                  {
                    city: "Kissimmee",
                    zip: "34741",
                    country: "USA",
                    lon: "-81.461385",
                    cz: "2A",
                    state: "FL",
                    file: "0-12842",
                    lat: "28.307138"
                  },
                  {
                    city: "Johnson City",
                    zip: "37601",
                    country: "USA",
                    lon: "-82.387716",
                    cz: "4A",
                    state: "TN",
                    file: "0-13877",
                    lat: "36.3417"
                  },
                  {
                    city: "Victoria",
                    zip: "77901",
                    country: "USA",
                    lon: "-97.026681",
                    cz: "2A",
                    state: "TX",
                    file: "0-12912",
                    lat: "28.777373"
                  },
                  {
                    city: "San Clemente",
                    zip: "92672",
                    country: "USA",
                    lon: "-117.616082",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.568923"
                  },
                  {
                    city: "Bayonne",
                    zip: "07002",
                    country: "USA",
                    lon: "-74.109486",
                    cz: "4A",
                    state: "NJ",
                    file: "0-14734",
                    lat: "40.670858"
                  },
                  {
                    city: "Laguna Niguel",
                    zip: "92607",
                    country: "USA",
                    lon: "-117.769442",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.640302"
                  },
                  {
                    city: "East Orange",
                    zip: "07017",
                    country: "USA",
                    lon: "-74.207039",
                    cz: "4A",
                    state: "NJ",
                    file: "0-14734",
                    lat: "40.77185"
                  },
                  {
                    city: "Homestead",
                    zip: "33030",
                    country: "USA",
                    lon: "-80.458168",
                    cz: "1A",
                    state: "FL",
                    file: "0-12839",
                    lat: "25.558428"
                  },
                  {
                    city: "Rockville",
                    zip: "20847",
                    country: "USA",
                    lon: "-77.207617",
                    cz: "4A",
                    state: "MD",
                    file: "0-93738",
                    lat: "39.143979"
                  },
                  {
                    city: "Delray Beach",
                    zip: "33444",
                    country: "USA",
                    lon: "-80.081614",
                    cz: "1A",
                    state: "FL",
                    file: "0-12844",
                    lat: "26.457598"
                  },
                  {
                    city: "Janesville",
                    zip: "53545",
                    country: "USA",
                    lon: "-89.112201",
                    cz: "5A",
                    state: "WI",
                    file: "0-14837",
                    lat: "42.710981"
                  },
                  {
                    city: "Conway",
                    zip: "72032",
                    country: "USA",
                    lon: "-92.376466",
                    cz: "3A",
                    state: "AR",
                    file: "0-13963",
                    lat: "35.146446"
                  },
                  {
                    city: "Pico Rivera",
                    zip: "90660",
                    country: "USA",
                    lon: "-118.088787",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.985812"
                  },
                  {
                    city: "Lorain",
                    zip: "44052",
                    country: "USA",
                    lon: "-82.166534",
                    cz: "5A",
                    state: "OH",
                    file: "0-14820",
                    lat: "41.450991"
                  },
                  {
                    city: "Montebello",
                    zip: "90640",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Lodi",
                    zip: "95240",
                    country: "USA",
                    lon: "-121.172415",
                    cz: "3B",
                    state: "CA",
                    file: "0-23232",
                    lat: "38.111356"
                  },
                  {
                    city: "New Braunfels",
                    zip: "78130",
                    country: "USA",
                    lon: "-98.221041",
                    cz: "2A",
                    state: "TX",
                    file: "0-12921",
                    lat: "29.776488"
                  },
                  {
                    city: "Marysville",
                    zip: "98270",
                    country: "USA",
                    lon: "-122.161951",
                    cz: "4C",
                    state: "WA",
                    file: "0-24233",
                    lat: "48.049576"
                  },
                  {
                    city: "Madera",
                    zip: "93637",
                    country: "USA",
                    lon: "-120.182423",
                    cz: "3B",
                    state: "CA",
                    file: "0-93193",
                    lat: "36.928286"
                  },
                  {
                    city: "Conroe",
                    zip: "77301",
                    country: "USA",
                    lon: "-95.51232",
                    cz: "3A",
                    state: "TX",
                    file: "0-12960",
                    lat: "30.310041"
                  },
                  {
                    city: "Santa Cruz",
                    zip: "95060",
                    country: "USA",
                    lon: "-122.111126",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.052748"
                  },
                  {
                    city: "Eden Prairie",
                    zip: "55344",
                    country: "USA",
                    lon: "-93.440429",
                    cz: "6A",
                    state: "MN",
                    file: "0-14922",
                    lat: "44.850563"
                  },
                  {
                    city: "Cheyenne",
                    zip: "82001",
                    country: "USA",
                    lon: "-104.56264",
                    cz: "5B",
                    state: "WY",
                    file: "0-24018",
                    lat: "41.25173"
                  },
                  {
                    city: "Daytona Beach",
                    zip: "32114",
                    country: "USA",
                    lon: "-81.053368",
                    cz: "2A",
                    state: "FL",
                    file: "0-12834",
                    lat: "29.146163"
                  },
                  {
                    city: "Alpharetta",
                    zip: "30004",
                    country: "USA",
                    lon: "-84.30205",
                    cz: "3A",
                    state: "GA",
                    file: "0-13874",
                    lat: "34.112373"
                  },
                  {
                    city: "Hamilton",
                    zip: "45011",
                    country: "USA",
                    lon: "-84.472925",
                    cz: "4A",
                    state: "OH",
                    file: "0-93814",
                    lat: "39.425137"
                  },
                  {
                    city: "Waltham",
                    zip: "02451",
                    country: "USA",
                    lon: "-71.24505",
                    cz: "5A",
                    state: "MA",
                    file: "0-14739",
                    lat: "42.398588"
                  },
                  {
                    city: "Haverhill",
                    zip: "01830",
                    country: "USA",
                    lon: "-71.072501",
                    cz: "5A",
                    state: "MA",
                    file: "0-14739",
                    lat: "42.792639"
                  },
                  {
                    city: "Council Bluffs",
                    zip: "51501",
                    country: "USA",
                    lon: "-95.875086",
                    cz: "5A",
                    state: "IA",
                    file: "0-94918",
                    lat: "41.23238"
                  },
                  {
                    city: "Taylor",
                    zip: "48180",
                    country: "USA",
                    lon: "-83.249067",
                    cz: "5A",
                    state: "MI",
                    file: "0-94847",
                    lat: "42.245837"
                  },
                  {
                    city: "Utica",
                    zip: "13501",
                    country: "USA",
                    lon: "-75.233208",
                    cz: "6A",
                    state: "NY",
                    file: "0-14771",
                    lat: "43.077369"
                  },
                  {
                    city: "Ames",
                    zip: "50010",
                    country: "USA",
                    lon: "-93.600254",
                    cz: "5A",
                    state: "IA",
                    file: "0-14933",
                    lat: "42.037879"
                  },
                  {
                    city: "La Habra",
                    zip: "90631",
                    country: "USA",
                    lon: "-117.769442",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.640302"
                  },
                  {
                    city: "Encinitas",
                    zip: "92023",
                    country: "USA",
                    lon: "-116.846046",
                    cz: "3B",
                    state: "CA",
                    file: "0-23188",
                    lat: "33.016928"
                  },
                  {
                    city: "Bowling Green",
                    zip: "42101",
                    country: "USA",
                    lon: "-86.451752",
                    cz: "4A",
                    state: "KY",
                    file: "0-13897",
                    lat: "37.017407"
                  },
                  {
                    city: "Burnsville",
                    zip: "55306",
                    country: "USA",
                    lon: "-93.221535",
                    cz: "6A",
                    state: "MN",
                    file: "0-14922",
                    lat: "44.762208"
                  },
                  {
                    city: "Greenville",
                    zip: "29601",
                    country: "USA",
                    lon: "-82.402871",
                    cz: "3A",
                    state: "SC",
                    file: "0-3870",
                    lat: "34.848567"
                  },
                  {
                    city: "West Des Moines",
                    zip: "50265",
                    country: "USA",
                    lon: "-93.717232",
                    cz: "5A",
                    state: "IA",
                    file: "0-14933",
                    lat: "41.567138"
                  },
                  {
                    city: "Cedar Park",
                    zip: "78613",
                    country: "USA",
                    lon: "-97.628724",
                    cz: "3A",
                    state: "TX",
                    file: "0-13958",
                    lat: "30.494032"
                  },
                  {
                    city: "Tulare",
                    zip: "93274",
                    country: "USA",
                    lon: "-119.299856",
                    cz: "3B",
                    state: "CA",
                    file: "0-23155",
                    lat: "36.133527"
                  },
                  {
                    city: "Monterey Park",
                    zip: "91754",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Vineland",
                    zip: "08360",
                    country: "USA",
                    lon: "-75.025676",
                    cz: "4A",
                    state: "NJ",
                    file: "0-93730",
                    lat: "39.392671"
                  },
                  {
                    city: "Terre Haute",
                    zip: "47801",
                    country: "USA",
                    lon: "-87.410094",
                    cz: "4A",
                    state: "IN",
                    file: "0-93819",
                    lat: "39.433602"
                  },
                  {
                    city: "Mansfield",
                    zip: "76063",
                    country: "USA",
                    lon: "-97.291484",
                    cz: "2A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.771419"
                  },
                  {
                    city: "Bristol",
                    zip: "06010",
                    country: "USA",
                    lon: "-72.939577",
                    cz: "5A",
                    state: "CT",
                    file: "0-14740",
                    lat: "41.681198"
                  },
                  {
                    city: "Malden",
                    zip: "02148",
                    country: "USA",
                    lon: "-71.085396",
                    cz: "5A",
                    state: "MA",
                    file: "0-14739",
                    lat: "42.436545"
                  },
                  {
                    city: "Meriden",
                    zip: "06450",
                    country: "USA",
                    lon: "-72.801901",
                    cz: "5A",
                    state: "CT",
                    file: "0-14740",
                    lat: "41.536498"
                  },
                  {
                    city: "Cupertino",
                    zip: "95014",
                    country: "USA",
                    lon: "-121.705327",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.189396"
                  },
                  {
                    city: "Springfield",
                    zip: "97477",
                    country: "USA",
                    lon: "-123.444371",
                    cz: "4C",
                    state: "OR",
                    file: "0-24221",
                    lat: "43.937276"
                  },
                  {
                    city: "Rogers",
                    zip: "72756",
                    country: "USA",
                    lon: "-94.181568",
                    cz: "4A",
                    state: "AR",
                    file: "0-13964",
                    lat: "36.355417"
                  },
                  {
                    city: "Gardena",
                    zip: "90247",
                    country: "USA",
                    lon: "-118.295256",
                    cz: "3B",
                    state: "CA",
                    file: "0-23174",
                    lat: "33.888315"
                  },
                  {
                    city: "Pontiac",
                    zip: "48340",
                    country: "USA",
                    lon: "-83.289036",
                    cz: "5A",
                    state: "MI",
                    file: "0-14826",
                    lat: "42.670272"
                  },
                  {
                    city: "National City",
                    zip: "91950",
                    country: "USA",
                    lon: "-117.084353",
                    cz: "3B",
                    state: "CA",
                    file: "0-23188",
                    lat: "32.671194"
                  },
                  {
                    city: "Grand Junction",
                    zip: "81501",
                    country: "USA",
                    lon: "-108.583126",
                    cz: "5B",
                    state: "CO",
                    file: "0-23066",
                    lat: "39.069019"
                  },
                  {
                    city: "Rocklin",
                    zip: "95677",
                    country: "USA",
                    lon: "-121.230374",
                    cz: "3B",
                    state: "CA",
                    file: "0-23232",
                    lat: "38.801233"
                  },
                  {
                    city: "Chapel Hill",
                    zip: "27514",
                    country: "USA",
                    lon: "-79.054475",
                    cz: "3A",
                    state: "NC",
                    file: "0-13722",
                    lat: "36.004647"
                  },
                  {
                    city: "Casper",
                    zip: "82601",
                    country: "USA",
                    lon: "-106.312561",
                    cz: "6B",
                    state: "WY",
                    file: "0-24089",
                    lat: "42.859875"
                  },
                  {
                    city: "Broomfield",
                    zip: "80020",
                    country: "USA",
                    lon: "-105.097151",
                    cz: "5B",
                    state: "CO",
                    file: "0-94018",
                    lat: "40.046064"
                  },
                  {
                    city: "Petaluma",
                    zip: "94952",
                    country: "USA",
                    lon: "-122.822588",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "38.265366"
                  },
                  {
                    city: "South Jordan",
                    zip: "84095",
                    country: "USA",
                    lon: "-111.953891",
                    cz: "5B",
                    state: "UT",
                    file: "0-24127",
                    lat: "40.554098"
                  },
                  {
                    city: "Springfield",
                    zip: "45501",
                    country: "USA",
                    lon: "-83.813228",
                    cz: "5A",
                    state: "OH",
                    file: "0-93815",
                    lat: "39.927059"
                  },
                  {
                    city: "Great Falls",
                    zip: "59401",
                    country: "USA",
                    lon: "-111.422948",
                    cz: "6B",
                    state: "MT",
                    file: "0-24143",
                    lat: "47.402024"
                  },
                  {
                    city: "Lancaster",
                    zip: "17601",
                    country: "USA",
                    lon: "-76.31068",
                    cz: "4A",
                    state: "PA",
                    file: "0-14751",
                    lat: "40.076553"
                  },
                  {
                    city: "North Port",
                    zip: "34286",
                    country: "USA",
                    lon: "-82.175602",
                    cz: "2A",
                    state: "FL",
                    file: "0-12842",
                    lat: "27.074755"
                  },
                  {
                    city: "Lakewood",
                    zip: "98439",
                    country: "USA",
                    lon: "-122.510316",
                    cz: "5B",
                    state: "WA",
                    file: "0-24227",
                    lat: "47.128671"
                  },
                  {
                    city: "Marietta",
                    zip: "30006",
                    country: "USA",
                    lon: "-84.557181",
                    cz: "3A",
                    state: "GA",
                    file: "0-13874",
                    lat: "33.912473"
                  },
                  {
                    city: "San Rafael",
                    zip: "94901",
                    country: "USA",
                    lon: "-122.504286",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.970948"
                  },
                  {
                    city: "Royal Oak",
                    zip: "48067",
                    country: "USA",
                    lon: "-83.145375",
                    cz: "5A",
                    state: "MI",
                    file: "0-94847",
                    lat: "42.492485"
                  },
                  {
                    city: "Des Plaines",
                    zip: "60016",
                    country: "USA",
                    lon: "-87.890466",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "42.048278"
                  },
                  {
                    city: "Huntington Park",
                    zip: "90255",
                    country: "USA",
                    lon: "-118.213137",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.977987"
                  },
                  {
                    city: "La Mesa",
                    zip: "91941",
                    country: "USA",
                    lon: "-116.998102",
                    cz: "3B",
                    state: "CA",
                    file: "0-23188",
                    lat: "32.76105"
                  },
                  {
                    city: "Orland Park",
                    zip: "60462",
                    country: "USA",
                    lon: "-87.68732",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "41.811929"
                  },
                  {
                    city: "Auburn",
                    zip: "36830",
                    country: "USA",
                    lon: "-85.468222",
                    cz: "3A",
                    state: "AL",
                    file: "0-93842",
                    lat: "32.547542"
                  },
                  {
                    city: "Lakeville",
                    zip: "55044",
                    country: "USA",
                    lon: "-93.25812",
                    cz: "6A",
                    state: "MN",
                    file: "0-14922",
                    lat: "44.633421"
                  },
                  {
                    city: "Owensboro",
                    zip: "42301",
                    country: "USA",
                    lon: "-87.257303",
                    cz: "4A",
                    state: "KY",
                    file: "0-93817",
                    lat: "37.751818"
                  },
                  {
                    city: "Jupiter",
                    zip: "33458",
                    country: "USA",
                    lon: "-80.430269",
                    cz: "1A",
                    state: "FL",
                    file: "0-12844",
                    lat: "26.645895"
                  },
                  {
                    city: "Dubuque",
                    zip: "52001",
                    country: "USA",
                    lon: "-90.877135",
                    cz: "5A",
                    state: "IA",
                    file: "0-14923",
                    lat: "42.458876"
                  },
                  {
                    city: "Rowlett",
                    zip: "75030",
                    country: "USA",
                    lon: "-96.534737",
                    cz: "2A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.91747"
                  },
                  {
                    city: "Novi",
                    zip: "48374",
                    country: "USA",
                    lon: "-83.522221",
                    cz: "5A",
                    state: "MI",
                    file: "0-94847",
                    lat: "42.468959"
                  },
                  {
                    city: "White Plains",
                    zip: "10601",
                    country: "USA",
                    lon: "-73.769626",
                    cz: "5A",
                    state: "NY",
                    file: "0-94728",
                    lat: "41.031397"
                  },
                  {
                    city: "Arcadia",
                    zip: "91006",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Redmond",
                    zip: "98052",
                    country: "USA",
                    lon: "-122.121034",
                    cz: "5B",
                    state: "WA",
                    file: "0-24233",
                    lat: "47.678756"
                  },
                  {
                    city: "Lake Elsinore",
                    zip: "92530",
                    country: "USA",
                    lon: "-116.649216",
                    cz: "3B",
                    state: "CA",
                    file: "0-23188",
                    lat: "33.658068"
                  },
                  {
                    city: "Ocala",
                    zip: "34470",
                    country: "USA",
                    lon: "-82.169401",
                    cz: "2A",
                    state: "FL",
                    file: "0-12834",
                    lat: "29.238672"
                  },
                  {
                    city: "Tinley Park",
                    zip: "60477",
                    country: "USA",
                    lon: "-88.026517",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "42.143475"
                  },
                  {
                    city: "Port Orange",
                    zip: "32129",
                    country: "USA",
                    lon: "-81.172169",
                    cz: "2A",
                    state: "FL",
                    file: "0-12834",
                    lat: "29.022729"
                  },
                  {
                    city: "Medford",
                    zip: "02153",
                    country: "USA",
                    lon: "-71.459405",
                    cz: "5A",
                    state: "MA",
                    file: "0-14739",
                    lat: "42.446396"
                  },
                  {
                    city: "Oak Lawn",
                    zip: "60453",
                    country: "USA",
                    lon: "-87.68732",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "41.811929"
                  },
                  {
                    city: "Rocky Mount",
                    zip: "27801",
                    country: "USA",
                    lon: "-77.641181",
                    cz: "3A",
                    state: "NC",
                    file: "0-13722",
                    lat: "35.949051"
                  },
                  {
                    city: "Kokomo",
                    zip: "46901",
                    country: "USA",
                    lon: "-86.171054",
                    cz: "5A",
                    state: "IN",
                    file: "0-93819",
                    lat: "40.506851"
                  },
                  {
                    city: "Bowie",
                    zip: "20715",
                    country: "USA",
                    lon: "-76.74379",
                    cz: "4A",
                    state: "MD",
                    file: "0-93721",
                    lat: "38.982612"
                  },
                  {
                    city: "Berwyn",
                    zip: "60402",
                    country: "USA",
                    lon: "-87.68732",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "41.811929"
                  },
                  {
                    city: "Fountain Valley",
                    zip: "92708",
                    country: "USA",
                    lon: "-117.769442",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.640302"
                  },
                  {
                    city: "Buckeye",
                    zip: "85326",
                    country: "USA",
                    lon: "-112.18717",
                    cz: "2B",
                    state: "AZ",
                    file: "0-23183",
                    lat: "33.276539"
                  },
                  {
                    city: "Dearborn Heights",
                    zip: "48125",
                    country: "USA",
                    lon: "-83.298123",
                    cz: "5A",
                    state: "MI",
                    file: "0-94847",
                    lat: "42.342272"
                  },
                  {
                    city: "Woodland",
                    zip: "95695",
                    country: "USA",
                    lon: "-121.915653",
                    cz: "3B",
                    state: "CA",
                    file: "0-23232",
                    lat: "38.74388"
                  },
                  {
                    city: "Noblesville",
                    zip: "46060",
                    country: "USA",
                    lon: "-85.999521",
                    cz: "5A",
                    state: "IN",
                    file: "0-93819",
                    lat: "40.073328"
                  },
                  {
                    city: "Valdosta",
                    zip: "31601",
                    country: "USA",
                    lon: "-83.332068",
                    cz: "2A",
                    state: "GA",
                    file: "0-93805",
                    lat: "30.753904"
                  },
                  {
                    city: "Diamond Bar",
                    zip: "91765",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Manhattan",
                    zip: "66502",
                    country: "USA",
                    lon: "-96.564589",
                    cz: "4A",
                    state: "KS",
                    file: "0-13996",
                    lat: "39.209375"
                  },
                  {
                    city: "Santee",
                    zip: "92071",
                    country: "USA",
                    lon: "-116.994511",
                    cz: "3B",
                    state: "CA",
                    file: "0-23188",
                    lat: "32.843956"
                  },
                  {
                    city: "Taunton",
                    zip: "02780",
                    country: "USA",
                    lon: "-71.092827",
                    cz: "5A",
                    state: "MA",
                    file: "0-14765",
                    lat: "41.858851"
                  },
                  {
                    city: "Sanford",
                    zip: "32771",
                    country: "USA",
                    lon: "-81.299169",
                    cz: "2A",
                    state: "FL",
                    file: "0-12842",
                    lat: "28.793491"
                  },
                  {
                    city: "New Brunswick",
                    zip: "08901",
                    country: "USA",
                    lon: "-74.444395",
                    cz: "4A",
                    state: "NJ",
                    file: "0-14734",
                    lat: "40.486754"
                  },
                  {
                    city: "Decatur",
                    zip: "35601",
                    country: "USA",
                    lon: "-86.995551",
                    cz: "3A",
                    state: "AL",
                    file: "0-3856",
                    lat: "34.549833"
                  },
                  {
                    city: "Chicopee",
                    zip: "01013",
                    country: "USA",
                    lon: "-72.667341",
                    cz: "5A",
                    state: "MA",
                    file: "0-14740",
                    lat: "42.161492"
                  },
                  {
                    city: "Anderson",
                    zip: "46011",
                    country: "USA",
                    lon: "-85.766164",
                    cz: "5A",
                    state: "IN",
                    file: "0-93819",
                    lat: "40.141033"
                  },
                  {
                    city: "Hempstead",
                    zip: "11549",
                    country: "USA",
                    lon: "-73.601772",
                    cz: "4A",
                    state: "NY",
                    file: "0-94728",
                    lat: "40.754757"
                  },
                  {
                    city: "Corvallis",
                    zip: "97330",
                    country: "USA",
                    lon: "-123.275969",
                    cz: "4C",
                    state: "OR",
                    file: "0-24232",
                    lat: "44.639931"
                  },
                  {
                    city: "Porterville",
                    zip: "93257",
                    country: "USA",
                    lon: "-118.703592",
                    cz: "3B",
                    state: "CA",
                    file: "0-23155",
                    lat: "35.973777"
                  },
                  {
                    city: "West Haven",
                    zip: "06516",
                    country: "USA",
                    lon: "-72.940335",
                    cz: "5A",
                    state: "CT",
                    file: "0-94702",
                    lat: "41.272452"
                  },
                  {
                    city: "Brentwood",
                    zip: "94513",
                    country: "USA",
                    lon: "-121.843071",
                    cz: "3B",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.912274"
                  },
                  {
                    city: "Paramount",
                    zip: "90723",
                    country: "USA",
                    lon: "-118.165152",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.899015"
                  },
                  {
                    city: "Grand Forks",
                    zip: "58201",
                    country: "USA",
                    lon: "-97.431501",
                    cz: "7",
                    state: "ND",
                    file: "0-14914",
                    lat: "47.9041"
                  },
                  {
                    city: "Georgetown",
                    zip: "78626",
                    country: "USA",
                    lon: "-97.574706",
                    cz: "3A",
                    state: "TX",
                    file: "0-13958",
                    lat: "30.668034"
                  },
                  {
                    city: "Mount Prospect",
                    zip: "60056",
                    country: "USA",
                    lon: "-87.931797",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "42.062377"
                  },
                  {
                    city: "Hanford",
                    zip: "93230",
                    country: "USA",
                    lon: "-119.71776",
                    cz: "3B",
                    state: "CA",
                    file: "0-93193",
                    lat: "36.220468"
                  },
                  {
                    city: "Normal",
                    zip: "61761",
                    country: "USA",
                    lon: "-88.7989",
                    cz: "5A",
                    state: "IL",
                    file: "0-14842",
                    lat: "40.530375"
                  },
                  {
                    city: "Rosemead",
                    zip: "91770",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Lehi",
                    zip: "84043",
                    country: "USA",
                    lon: "-111.921078",
                    cz: "5B",
                    state: "UT",
                    file: "0-24127",
                    lat: "40.318139"
                  },
                  {
                    city: "Highland",
                    zip: "92346",
                    country: "USA",
                    lon: "-117.14027",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "34.156543"
                  },
                  {
                    city: "Novato",
                    zip: "94945",
                    country: "USA",
                    lon: "-122.540951",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "38.027654"
                  },
                  {
                    city: "Port Arthur",
                    zip: "77640",
                    country: "USA",
                    lon: "-93.964278",
                    cz: "3A",
                    state: "TX",
                    file: "0-12917",
                    lat: "29.870904"
                  },
                  {
                    city: "Carson City",
                    zip: "89701",
                    country: "USA",
                    lon: "-119.73074",
                    cz: "4B",
                    state: "NV",
                    file: "0-23185",
                    lat: "39.154485"
                  },
                  {
                    city: "San Marcos",
                    zip: "78666",
                    country: "USA",
                    lon: "-97.997166",
                    cz: "2A",
                    state: "TX",
                    file: "0-13958",
                    lat: "29.972907"
                  },
                  {
                    city: "Hendersonville",
                    zip: "37075",
                    country: "USA",
                    lon: "-86.612045",
                    cz: "4A",
                    state: "TN",
                    file: "0-13897",
                    lat: "36.347551"
                  },
                  {
                    city: "Elyria",
                    zip: "44035",
                    country: "USA",
                    lon: "-82.105112",
                    cz: "5A",
                    state: "OH",
                    file: "0-14820",
                    lat: "41.371396"
                  },
                  {
                    city: "Revere",
                    zip: "02151",
                    country: "USA",
                    lon: "-71.020494",
                    cz: "5A",
                    state: "MA",
                    file: "0-14739",
                    lat: "42.366303"
                  },
                  {
                    city: "Pflugerville",
                    zip: "78660",
                    country: "USA",
                    lon: "-97.597055",
                    cz: "2A",
                    state: "TX",
                    file: "0-13958",
                    lat: "30.442737"
                  },
                  {
                    city: "Greenwood",
                    zip: "46142",
                    country: "USA",
                    lon: "-86.100454",
                    cz: "5A",
                    state: "IN",
                    file: "0-93819",
                    lat: "39.491246"
                  },
                  {
                    city: "Bellevue",
                    zip: "68005",
                    country: "USA",
                    lon: "-95.903956",
                    cz: "5A",
                    state: "NE",
                    file: "0-94918",
                    lat: "41.132948"
                  },
                  {
                    city: "Wheaton",
                    zip: "60187",
                    country: "USA",
                    lon: "-88.088716",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "41.839679"
                  },
                  {
                    city: "Smyrna",
                    zip: "30080",
                    country: "USA",
                    lon: "-84.556181",
                    cz: "3A",
                    state: "GA",
                    file: "0-13874",
                    lat: "33.864604"
                  },
                  {
                    city: "Sarasota",
                    zip: "34230",
                    country: "USA",
                    lon: "-82.537169",
                    cz: "2A",
                    state: "FL",
                    file: "0-12842",
                    lat: "27.335023"
                  },
                  {
                    city: "Blue Springs",
                    zip: "64013",
                    country: "USA",
                    lon: "-94.370275",
                    cz: "4A",
                    state: "MO",
                    file: "0-3947",
                    lat: "38.964518"
                  },
                  {
                    city: "Colton",
                    zip: "92324",
                    country: "USA",
                    lon: "-116.900557",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "34.151161"
                  },
                  {
                    city: "Euless",
                    zip: "76039",
                    country: "USA",
                    lon: "-97.075688",
                    cz: "2A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.859305"
                  },
                  {
                    city: "Castle Rock",
                    zip: "80104",
                    country: "USA",
                    lon: "-104.849988",
                    cz: "5B",
                    state: "CO",
                    file: "0-93037",
                    lat: "39.374779"
                  },
                  {
                    city: "Cathedral City",
                    zip: "92234",
                    country: "USA",
                    lon: "-116.277152",
                    cz: "3B",
                    state: "CA",
                    file: "0-23188",
                    lat: "33.647301"
                  },
                  {
                    city: "Kingsport",
                    zip: "37660",
                    country: "USA",
                    lon: "-82.547615",
                    cz: "4A",
                    state: "TN",
                    file: "0-13877",
                    lat: "36.514384"
                  },
                  {
                    city: "Lake Havasu City",
                    zip: "86403",
                    country: "USA",
                    lon: "-114.310294",
                    cz: "3B",
                    state: "AZ",
                    file: "0-23184",
                    lat: "34.500556"
                  },
                  {
                    city: "Pensacola",
                    zip: "32501",
                    country: "USA",
                    lon: "-87.256471",
                    cz: "2A",
                    state: "FL",
                    file: "0-13894",
                    lat: "30.424838"
                  },
                  {
                    city: "Hoboken",
                    zip: "07030",
                    country: "USA",
                    lon: "-74.033934",
                    cz: "4A",
                    state: "NJ",
                    file: "0-14734",
                    lat: "40.746851"
                  },
                  {
                    city: "Yucaipa",
                    zip: "92399",
                    country: "USA",
                    lon: "-116.971138",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "34.06226"
                  },
                  {
                    city: "Watsonville",
                    zip: "95076",
                    country: "USA",
                    lon: "-121.74696",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "36.98025"
                  },
                  {
                    city: "Richland",
                    zip: "99352",
                    country: "USA",
                    lon: "-119.491659",
                    cz: "5B",
                    state: "WA",
                    file: "0-24155",
                    lat: "46.282031"
                  },
                  {
                    city: "Delano",
                    zip: "93215",
                    country: "USA",
                    lon: "-118.905173",
                    cz: "3B",
                    state: "CA",
                    file: "0-23155",
                    lat: "35.294405"
                  },
                  {
                    city: "Hoffman Estates",
                    zip: "60179",
                    country: "USA",
                    lon: "-88.223655",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "42.079336"
                  },
                  {
                    city: "Florissant",
                    zip: "63031",
                    country: "USA",
                    lon: "-90.351314",
                    cz: "4A",
                    state: "MO",
                    file: "0-13994",
                    lat: "38.805499"
                  },
                  {
                    city: "Placentia",
                    zip: "92870",
                    country: "USA",
                    lon: "-117.769442",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.640302"
                  },
                  {
                    city: "West New York",
                    zip: "07093",
                    country: "USA",
                    lon: "-74.011533",
                    cz: "4A",
                    state: "NJ",
                    file: "0-14734",
                    lat: "40.7888"
                  },
                  {
                    city: "Dublin",
                    zip: "94568",
                    country: "USA",
                    lon: "-121.906329",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.714402"
                  },
                  {
                    city: "Oak Park",
                    zip: "60301",
                    country: "USA",
                    lon: "-87.68732",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "41.811929"
                  },
                  {
                    city: "Peabody",
                    zip: "01960",
                    country: "USA",
                    lon: "-70.973646",
                    cz: "5A",
                    state: "MA",
                    file: "0-14739",
                    lat: "42.536996"
                  },
                  {
                    city: "Perth Amboy",
                    zip: "08861",
                    country: "USA",
                    lon: "-74.279144",
                    cz: "4A",
                    state: "NJ",
                    file: "0-14734",
                    lat: "40.520654"
                  },
                  {
                    city: "Battle Creek",
                    zip: "49014",
                    country: "USA",
                    lon: "-85.13044",
                    cz: "5A",
                    state: "MI",
                    file: "0-14836",
                    lat: "42.303041"
                  },
                  {
                    city: "Bradenton",
                    zip: "34201",
                    country: "USA",
                    lon: "-82.470456",
                    cz: "2A",
                    state: "FL",
                    file: "0-12842",
                    lat: "27.404731"
                  },
                  {
                    city: "Gilroy",
                    zip: "95020",
                    country: "USA",
                    lon: "-121.493849",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.023347"
                  },
                  {
                    city: "Milford",
                    zip: "06460",
                    country: "USA",
                    lon: "-72.951273",
                    cz: "5A",
                    state: "CT",
                    file: "0-94702",
                    lat: "41.343773"
                  },
                  {
                    city: "Albany",
                    zip: "97321",
                    country: "USA",
                    lon: "-122.581676",
                    cz: "4C",
                    state: "OR",
                    file: "0-24232",
                    lat: "44.594489"
                  },
                  {
                    city: "Ankeny",
                    zip: "50015",
                    country: "USA",
                    lon: "-93.572173",
                    cz: "5A",
                    state: "IA",
                    file: "0-14933",
                    lat: "41.672687"
                  },
                  {
                    city: "La Crosse",
                    zip: "54601",
                    country: "USA",
                    lon: "-91.132072",
                    cz: "5A",
                    state: "WI",
                    file: "0-14920",
                    lat: "43.85456"
                  },
                  {
                    city: "Burlington",
                    zip: "27215",
                    country: "USA",
                    lon: "-79.430129",
                    cz: "3A",
                    state: "NC",
                    file: "0-13723",
                    lat: "36.091025"
                  },
                  {
                    city: "Harrisonburg",
                    zip: "22801",
                    country: "USA",
                    lon: "-78.877137",
                    cz: "4A",
                    state: "VA",
                    file: "0-13729",
                    lat: "38.422777"
                  },
                  {
                    city: "Minnetonka",
                    zip: "55345",
                    country: "USA",
                    lon: "-93.481749",
                    cz: "6A",
                    state: "MN",
                    file: "0-14922",
                    lat: "44.916963"
                  },
                  {
                    city: "Elkhart",
                    zip: "46514",
                    country: "USA",
                    lon: "-85.937024",
                    cz: "5A",
                    state: "IN",
                    file: "0-14848",
                    lat: "41.71873"
                  },
                  {
                    city: "Lakewood",
                    zip: "44107",
                    country: "USA",
                    lon: "-81.637249",
                    cz: "5A",
                    state: "OH",
                    file: "0-14820",
                    lat: "41.514849"
                  },
                  {
                    city: "Glendora",
                    zip: "91740",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Southaven",
                    zip: "38671",
                    country: "USA",
                    lon: "-89.99624",
                    cz: "3A",
                    state: "MS",
                    file: "0-13893",
                    lat: "34.956633"
                  },
                  {
                    city: "Charleston",
                    zip: "25301",
                    country: "USA",
                    lon: "-81.605094",
                    cz: "4A",
                    state: "WV",
                    file: "0-13866",
                    lat: "38.328948"
                  },
                  {
                    city: "Joplin",
                    zip: "64801",
                    country: "USA",
                    lon: "-94.502663",
                    cz: "4A",
                    state: "MO",
                    file: "0-13995",
                    lat: "37.113343"
                  },
                  {
                    city: "Enid",
                    zip: "73701",
                    country: "USA",
                    lon: "-97.843091",
                    cz: "4A",
                    state: "OK",
                    file: "0-13967",
                    lat: "36.402681"
                  },
                  {
                    city: "Plainfield",
                    zip: "07060",
                    country: "USA",
                    lon: "-74.414995",
                    cz: "4A",
                    state: "NJ",
                    file: "0-14734",
                    lat: "40.615202"
                  },
                  {
                    city: "Grand Island",
                    zip: "68801",
                    country: "USA",
                    lon: "-98.368698",
                    cz: "5A",
                    state: "NE",
                    file: "0-14935",
                    lat: "40.87227"
                  },
                  {
                    city: "Palm Desert",
                    zip: "92211",
                    country: "USA",
                    lon: "-116.339766",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "33.76437"
                  },
                  {
                    city: "Huntersville",
                    zip: "28070",
                    country: "USA",
                    lon: "-80.898668",
                    cz: "3A",
                    state: "NC",
                    file: "0-13881",
                    lat: "35.462187"
                  },
                  {
                    city: "Saginaw",
                    zip: "48601",
                    country: "USA",
                    lon: "-83.886873",
                    cz: "5A",
                    state: "MI",
                    file: "0-14826",
                    lat: "43.41242"
                  },
                  {
                    city: "Grapevine",
                    zip: "76051",
                    country: "USA",
                    lon: "-97.080802",
                    cz: "2A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.932843"
                  },
                  {
                    city: "Aliso Viejo",
                    zip: "92656",
                    country: "USA",
                    lon: "-117.751341",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.603459"
                  },
                  {
                    city: "Casa Grande",
                    zip: "85222",
                    country: "USA",
                    lon: "-111.753991",
                    cz: "2B",
                    state: "AZ",
                    file: "0-23183",
                    lat: "32.89055"
                  },
                  {
                    city: "Pinellas Park",
                    zip: "33780",
                    country: "USA",
                    lon: "-82.724763",
                    cz: "2A",
                    state: "FL",
                    file: "0-12842",
                    lat: "27.891809"
                  },
                  {
                    city: "Troy",
                    zip: "12179",
                    country: "USA",
                    lon: "-73.525561",
                    cz: "5A",
                    state: "NY",
                    file: "0-14735",
                    lat: "42.71144"
                  },
                  {
                    city: "West Sacramento",
                    zip: "95605",
                    country: "USA",
                    lon: "-121.537801",
                    cz: "3B",
                    state: "CA",
                    file: "0-23232",
                    lat: "38.591854"
                  },
                  {
                    city: "Commerce City",
                    zip: "80022",
                    country: "USA",
                    lon: "-104.771527",
                    cz: "5B",
                    state: "CO",
                    file: "0-94018",
                    lat: "39.869835"
                  },
                  {
                    city: "Monroe",
                    zip: "71201",
                    country: "USA",
                    lon: "-92.094583",
                    cz: "2A",
                    state: "LA",
                    file: "0-13957",
                    lat: "32.502833"
                  },
                  {
                    city: "Cerritos",
                    zip: "90703",
                    country: "USA",
                    lon: "-118.068648",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.866914"
                  },
                  {
                    city: "Downers Grove",
                    zip: "60515",
                    country: "USA",
                    lon: "-88.012267",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "41.796279"
                  },
                  {
                    city: "Wilson",
                    zip: "27893",
                    country: "USA",
                    lon: "-77.925269",
                    cz: "3A",
                    state: "NC",
                    file: "0-13722",
                    lat: "35.723264"
                  },
                  {
                    city: "Niagara Falls",
                    zip: "14301",
                    country: "USA",
                    lon: "-79.009414",
                    cz: "5A",
                    state: "NY",
                    file: "0-14733",
                    lat: "43.089805"
                  },
                  {
                    city: "Poway",
                    zip: "92064",
                    country: "USA",
                    lon: "-117.030299",
                    cz: "3B",
                    state: "CA",
                    file: "0-23188",
                    lat: "32.994097"
                  },
                  {
                    city: "Cuyahoga Falls",
                    zip: "44221",
                    country: "USA",
                    lon: "-81.473585",
                    cz: "5A",
                    state: "OH",
                    file: "0-14895",
                    lat: "41.143906"
                  },
                  {
                    city: "Rancho Santa Margarita",
                    zip: "92688",
                    country: "USA",
                    lon: "-117.603684",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.601944"
                  },
                  {
                    city: "Harrisburg",
                    zip: "17101",
                    country: "USA",
                    lon: "-76.869644",
                    cz: "4A",
                    state: "PA",
                    file: "0-14751",
                    lat: "40.264589"
                  },
                  {
                    city: "Huntington",
                    zip: "25701",
                    country: "USA",
                    lon: "-82.412866",
                    cz: "4A",
                    state: "WV",
                    file: "0-3860",
                    lat: "38.371727"
                  },
                  {
                    city: "La Mirada",
                    zip: "90637",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Cypress",
                    zip: "90630",
                    country: "USA",
                    lon: "-117.769442",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.640302"
                  },
                  {
                    city: "Logan",
                    zip: "84321",
                    country: "USA",
                    lon: "-111.885084",
                    cz: "5B",
                    state: "UT",
                    file: "0-24127",
                    lat: "41.76695"
                  },
                  {
                    city: "Galveston",
                    zip: "77550",
                    country: "USA",
                    lon: "-94.913451",
                    cz: "2A",
                    state: "TX",
                    file: "0-12960",
                    lat: "29.323619"
                  },
                  {
                    city: "Sheboygan",
                    zip: "53081",
                    country: "USA",
                    lon: "-87.856793",
                    cz: "6A",
                    state: "WI",
                    file: "0-14839",
                    lat: "43.722489"
                  },
                  {
                    city: "Middletown",
                    zip: "45042",
                    country: "USA",
                    lon: "-84.442394",
                    cz: "4A",
                    state: "OH",
                    file: "0-93815",
                    lat: "39.543446"
                  },
                  {
                    city: "Roswell",
                    zip: "88201",
                    country: "USA",
                    lon: "-104.593687",
                    cz: "3B",
                    state: "NM",
                    file: "0-23048",
                    lat: "33.346666"
                  },
                  {
                    city: "Parker",
                    zip: "80134",
                    country: "USA",
                    lon: "-104.844731",
                    cz: "5B",
                    state: "CO",
                    file: "0-93037",
                    lat: "39.489472"
                  },
                  {
                    city: "Bedford",
                    zip: "76021",
                    country: "USA",
                    lon: "-97.136289",
                    cz: "2A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.852546"
                  },
                  {
                    city: "East Lansing",
                    zip: "48823",
                    country: "USA",
                    lon: "-84.503527",
                    cz: "5A",
                    state: "MI",
                    file: "0-14836",
                    lat: "42.737334"
                  },
                  {
                    city: "Methuen",
                    zip: "01844",
                    country: "USA",
                    lon: "-71.186915",
                    cz: "5A",
                    state: "MA",
                    file: "0-14739",
                    lat: "42.73184"
                  },
                  {
                    city: "Covina",
                    zip: "91722",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Alexandria",
                    zip: "71301",
                    country: "USA",
                    lon: "-92.431184",
                    cz: "2A",
                    state: "LA",
                    file: "0-3937",
                    lat: "31.175885"
                  },
                  {
                    city: "Olympia",
                    zip: "98501",
                    country: "USA",
                    lon: "-122.869079",
                    cz: "4C",
                    state: "WA",
                    file: "0-24227",
                    lat: "46.984767"
                  },
                  {
                    city: "Euclid",
                    zip: "44117",
                    country: "USA",
                    lon: "-81.526142",
                    cz: "5A",
                    state: "OH",
                    file: "0-14820",
                    lat: "41.566834"
                  },
                  {
                    city: "Mishawaka",
                    zip: "46544",
                    country: "USA",
                    lon: "-86.287884",
                    cz: "5A",
                    state: "IN",
                    file: "0-14848",
                    lat: "41.61536"
                  },
                  {
                    city: "Salina",
                    zip: "67401",
                    country: "USA",
                    lon: "-97.642113",
                    cz: "4A",
                    state: "KS",
                    file: "0-3928",
                    lat: "38.823673"
                  },
                  {
                    city: "AzUSA",
                    zip: "91702",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Newark",
                    zip: "43055",
                    country: "USA",
                    lon: "-82.485985",
                    cz: "5A",
                    state: "OH",
                    file: "0-14821",
                    lat: "40.085963"
                  },
                  {
                    city: "Chesterfield",
                    zip: "63005",
                    country: "USA",
                    lon: "-90.650024",
                    cz: "4A",
                    state: "MO",
                    file: "0-13994",
                    lat: "38.637002"
                  },
                  {
                    city: "Leesburg",
                    zip: "20175",
                    country: "USA",
                    lon: "-77.605404",
                    cz: "4A",
                    state: "VA",
                    file: "0-93738",
                    lat: "39.041987"
                  },
                  {
                    city: "Hattiesburg",
                    zip: "39401",
                    country: "USA",
                    lon: "-89.28071",
                    cz: "3A",
                    state: "MS",
                    file: "0-13894",
                    lat: "31.245138"
                  },
                  {
                    city: "Roseville",
                    zip: "48066",
                    country: "USA",
                    lon: "-82.936069",
                    cz: "5A",
                    state: "MI",
                    file: "0-94847",
                    lat: "42.509635"
                  },
                  {
                    city: "Bonita Springs",
                    zip: "34133",
                    country: "USA",
                    lon: "-81.94861",
                    cz: "2A",
                    state: "FL",
                    file: "0-12839",
                    lat: "26.552895"
                  },
                  {
                    city: "Portage",
                    zip: "49002",
                    country: "USA",
                    lon: "-85.563901",
                    cz: "5A",
                    state: "MI",
                    file: "0-94860",
                    lat: "42.193793"
                  },
                  {
                    city: "Collierville",
                    zip: "38017",
                    country: "USA",
                    lon: "-89.699083",
                    cz: "4A",
                    state: "TN",
                    file: "0-13893",
                    lat: "35.080992"
                  },
                  {
                    city: "Middletown",
                    zip: "06457",
                    country: "USA",
                    lon: "-72.655357",
                    cz: "5A",
                    state: "CT",
                    file: "0-14740",
                    lat: "41.550139"
                  },
                  {
                    city: "Stillwater",
                    zip: "74074",
                    country: "USA",
                    lon: "-97.069061",
                    cz: "3A",
                    state: "OK",
                    file: "0-13967",
                    lat: "36.101521"
                  },
                  {
                    city: "East Providence",
                    zip: "02914",
                    country: "USA",
                    lon: "-71.363348",
                    cz: "#N/A",
                    state: "RI",
                    file: "0-14765",
                    lat: "41.813429"
                  },
                  {
                    city: "Mentor",
                    zip: "44060",
                    country: "USA",
                    lon: "-81.328779",
                    cz: "5A",
                    state: "OH",
                    file: "0-14820",
                    lat: "41.679291"
                  },
                  {
                    city: "Ceres",
                    zip: "95307",
                    country: "USA",
                    lon: "-120.967976",
                    cz: "3B",
                    state: "CA",
                    file: "0-23232",
                    lat: "37.561889"
                  },
                  {
                    city: "Cedar Hill",
                    zip: "75104",
                    country: "USA",
                    lon: "-96.777626",
                    cz: "2A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.767268"
                  },
                  {
                    city: "Mansfield",
                    zip: "44901",
                    country: "USA",
                    lon: "-82.511369",
                    cz: "5A",
                    state: "OH",
                    file: "0-14891",
                    lat: "40.850833"
                  },
                  {
                    city: "Binghamton",
                    zip: "13901",
                    country: "USA",
                    lon: "-75.890685",
                    cz: "5A",
                    state: "NY",
                    file: "0-4725",
                    lat: "42.165629"
                  },
                  {
                    city: "San Luis Obispo",
                    zip: "93401",
                    country: "USA",
                    lon: "-120.62122",
                    cz: "3C",
                    state: "CA",
                    file: "0-23273",
                    lat: "35.265573"
                  },
                  {
                    city: "Minot",
                    zip: "58701",
                    country: "USA",
                    lon: "-101.419006",
                    cz: "7",
                    state: "ND",
                    file: "0-24013",
                    lat: "48.084625"
                  },
                  {
                    city: "Palm Springs",
                    zip: "92262",
                    country: "USA",
                    lon: "-116.527996",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "33.842567"
                  },
                  {
                    city: "Pine Bluff",
                    zip: "71601",
                    country: "USA",
                    lon: "-91.985946",
                    cz: "3A",
                    state: "AR",
                    file: "0-13963",
                    lat: "34.208962"
                  },
                  {
                    city: "Texas City",
                    zip: "77590",
                    country: "USA",
                    lon: "-94.921474",
                    cz: "2A",
                    state: "TX",
                    file: "0-12960",
                    lat: "29.376057"
                  },
                  {
                    city: "Summerville",
                    zip: "29483",
                    country: "USA",
                    lon: "-80.431751",
                    cz: "3A",
                    state: "SC",
                    file: "0-13880",
                    lat: "33.040201"
                  },
                  {
                    city: "Jeffersonville",
                    zip: "47130",
                    country: "USA",
                    lon: "-85.716548",
                    cz: "5A",
                    state: "IN",
                    file: "0-93821",
                    lat: "38.404909"
                  },
                  {
                    city: "San Jacinto",
                    zip: "92581",
                    country: "USA",
                    lon: "-116.055617",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "33.752886"
                  },
                  {
                    city: "Madison",
                    zip: "35756",
                    country: "USA",
                    lon: "-86.754233",
                    cz: "3A",
                    state: "AL",
                    file: "0-3856",
                    lat: "34.651409"
                  },
                  {
                    city: "Altoona",
                    zip: "16601",
                    country: "USA",
                    lon: "-78.349874",
                    cz: "5A",
                    state: "PA",
                    file: "0-14751",
                    lat: "40.489433"
                  },
                  {
                    city: "Columbus",
                    zip: "47201",
                    country: "USA",
                    lon: "-85.891338",
                    cz: "4A",
                    state: "IN",
                    file: "0-93819",
                    lat: "39.191447"
                  },
                  {
                    city: "Apopka",
                    zip: "32703",
                    country: "USA",
                    lon: "-81.488843",
                    cz: "2A",
                    state: "FL",
                    file: "0-12842",
                    lat: "28.635425"
                  },
                  {
                    city: "Elmhurst",
                    zip: "60126",
                    country: "USA",
                    lon: "-87.946413",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "41.88353"
                  },
                  {
                    city: "Maricopa",
                    zip: "85239",
                    country: "USA",
                    lon: "-112.053351",
                    cz: "2B",
                    state: "AZ",
                    file: "0-23183",
                    lat: "32.957645"
                  },
                  {
                    city: "Farmington",
                    zip: "87401",
                    country: "USA",
                    lon: "-108.100535",
                    cz: "5B",
                    state: "NM",
                    file: "0-23061",
                    lat: "36.826248"
                  },
                  {
                    city: "Glenview",
                    zip: "60025",
                    country: "USA",
                    lon: "-87.819714",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "42.082715"
                  },
                  {
                    city: "Draper",
                    zip: "84020",
                    country: "USA",
                    lon: "-111.869671",
                    cz: "5B",
                    state: "UT",
                    file: "0-24127",
                    lat: "40.506148"
                  },
                  {
                    city: "Lincoln",
                    zip: "95648",
                    country: "USA",
                    lon: "-121.327143",
                    cz: "3B",
                    state: "CA",
                    file: "0-23232",
                    lat: "38.929305"
                  },
                  {
                    city: "Sierra Vista",
                    zip: "85635",
                    country: "USA",
                    lon: "-109.997623",
                    cz: "3B",
                    state: "AZ",
                    file: "0-23160",
                    lat: "31.810649"
                  },
                  {
                    city: "Lacey",
                    zip: "98503",
                    country: "USA",
                    lon: "-122.796695",
                    cz: "4C",
                    state: "WA",
                    file: "0-24227",
                    lat: "47.026418"
                  },
                  {
                    city: "Biloxi",
                    zip: "39530",
                    country: "USA",
                    lon: "-88.978634",
                    cz: "3A",
                    state: "MS",
                    file: "0-13894",
                    lat: "30.432454"
                  },
                  {
                    city: "Strongsville",
                    zip: "44136",
                    country: "USA",
                    lon: "-81.831656",
                    cz: "5A",
                    state: "OH",
                    file: "0-14820",
                    lat: "41.313268"
                  },
                  {
                    city: "Wylie",
                    zip: "75098",
                    country: "USA",
                    lon: "-96.552397",
                    cz: "2A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.970309"
                  },
                  {
                    city: "Sayreville",
                    zip: "08871",
                    country: "USA",
                    lon: "-74.417344",
                    cz: "4A",
                    state: "NJ",
                    file: "0-14734",
                    lat: "40.430006"
                  },
                  {
                    city: "Kannapolis",
                    zip: "28081",
                    country: "USA",
                    lon: "-80.672531",
                    cz: "3A",
                    state: "NC",
                    file: "0-13881",
                    lat: "35.462981"
                  },
                  {
                    city: "Charlottesville",
                    zip: "22901",
                    country: "USA",
                    lon: "-78.561139",
                    cz: "4A",
                    state: "VA",
                    file: "0-13733",
                    lat: "38.093604"
                  },
                  {
                    city: "Littleton",
                    zip: "80120",
                    country: "USA",
                    lon: "-105.010182",
                    cz: "5B",
                    state: "CO",
                    file: "0-94018",
                    lat: "39.597937"
                  },
                  {
                    city: "Titusville",
                    zip: "32780",
                    country: "USA",
                    lon: "-80.853421",
                    cz: "2A",
                    state: "FL",
                    file: "0-12842",
                    lat: "28.548877"
                  },
                  {
                    city: "Hackensack",
                    zip: "07601",
                    country: "USA",
                    lon: "-74.001623",
                    cz: "5A",
                    state: "NJ",
                    file: "0-14734",
                    lat: "40.913482"
                  },
                  {
                    city: "Newark",
                    zip: "94560",
                    country: "USA",
                    lon: "-122.025352",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.534102"
                  },
                  {
                    city: "Pittsfield",
                    zip: "01201",
                    country: "USA",
                    lon: "-73.24807",
                    cz: "5A",
                    state: "MA",
                    file: "0-14735",
                    lat: "42.479475"
                  },
                  {
                    city: "York",
                    zip: "17401",
                    country: "USA",
                    lon: "-76.727139",
                    cz: "4A",
                    state: "PA",
                    file: "0-14751",
                    lat: "39.962998"
                  },
                  {
                    city: "Lombard",
                    zip: "60148",
                    country: "USA",
                    lon: "-88.003864",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "41.869829"
                  },
                  {
                    city: "Attleboro",
                    zip: "02703",
                    country: "USA",
                    lon: "-71.302297",
                    cz: "5A",
                    state: "MA",
                    file: "0-14765",
                    lat: "41.938976"
                  },
                  {
                    city: "Blacksburg",
                    zip: "24060",
                    country: "USA",
                    lon: "-80.43473",
                    cz: "4A",
                    state: "VA",
                    file: "0-13741",
                    lat: "37.256283"
                  },
                  {
                    city: "Dublin",
                    zip: "43016",
                    country: "USA",
                    lon: "-83.011389",
                    cz: "5A",
                    state: "OH",
                    file: "0-14821",
                    lat: "39.969036"
                  },
                  {
                    city: "Haltom City",
                    zip: "76117",
                    country: "USA",
                    lon: "-97.263393",
                    cz: "2A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.801874"
                  },
                  {
                    city: "Lompoc",
                    zip: "93436",
                    country: "USA",
                    lon: "-120.336594",
                    cz: "3C",
                    state: "CA",
                    file: "0-23273",
                    lat: "34.629464"
                  },
                  {
                    city: "El Centro",
                    zip: "92243",
                    country: "USA",
                    lon: "-115.503842",
                    cz: "2B",
                    state: "CA",
                    file: "0-23188",
                    lat: "32.900509"
                  },
                  {
                    city: "Danville",
                    zip: "94506",
                    country: "USA",
                    lon: "-121.916718",
                    cz: "3B",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.832075"
                  },
                  {
                    city: "Jefferson City",
                    zip: "65101",
                    country: "USA",
                    lon: "-92.165194",
                    cz: "4A",
                    state: "MO",
                    file: "0-3945",
                    lat: "38.494029"
                  },
                  {
                    city: "North Miami Beach",
                    zip: "33160",
                    country: "USA",
                    lon: "-80.139067",
                    cz: "1A",
                    state: "FL",
                    file: "0-12839",
                    lat: "25.944859"
                  },
                  {
                    city: "Freeport",
                    zip: "11520",
                    country: "USA",
                    lon: "-73.585222",
                    cz: "4A",
                    state: "NY",
                    file: "0-94728",
                    lat: "40.651251"
                  },
                  {
                    city: "Moline",
                    zip: "61265",
                    country: "USA",
                    lon: "-90.528972",
                    cz: "5A",
                    state: "IL",
                    file: "0-14923",
                    lat: "41.529431"
                  },
                  {
                    city: "Coachella",
                    zip: "92236",
                    country: "USA",
                    lon: "-116.143588",
                    cz: "3B",
                    state: "CA",
                    file: "0-23188",
                    lat: "33.646405"
                  },
                  {
                    city: "Fort Pierce",
                    zip: "34945",
                    country: "USA",
                    lon: "-80.534169",
                    cz: "2A",
                    state: "FL",
                    file: "0-12844",
                    lat: "27.412128"
                  },
                  {
                    city: "Smyrna",
                    zip: "37167",
                    country: "USA",
                    lon: "-86.45336",
                    cz: "3A",
                    state: "TN",
                    file: "0-13897",
                    lat: "35.856167"
                  },
                  {
                    city: "Bountiful",
                    zip: "84010",
                    country: "USA",
                    lon: "-111.870994",
                    cz: "5B",
                    state: "UT",
                    file: "0-24127",
                    lat: "40.874038"
                  },
                  {
                    city: "Everett",
                    zip: "02149",
                    country: "USA",
                    lon: "-71.051183",
                    cz: "5A",
                    state: "MA",
                    file: "0-14739",
                    lat: "42.407396"
                  },
                  {
                    city: "Danville",
                    zip: "24540",
                    country: "USA",
                    lon: "-79.376228",
                    cz: "4A",
                    state: "VA",
                    file: "0-13723",
                    lat: "36.603501"
                  },
                  {
                    city: "Keller",
                    zip: "76244",
                    country: "USA",
                    lon: "-97.291484",
                    cz: "2A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.771419"
                  },
                  {
                    city: "Belleville",
                    zip: "62220",
                    country: "USA",
                    lon: "-89.973877",
                    cz: "5A",
                    state: "IL",
                    file: "0-13994",
                    lat: "38.46435"
                  },
                  {
                    city: "Bell Gardens",
                    zip: "90202",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Cleveland",
                    zip: "37311",
                    country: "USA",
                    lon: "-84.874031",
                    cz: "4A",
                    state: "TN",
                    file: "0-13882",
                    lat: "35.149223"
                  },
                  {
                    city: "Fairfield",
                    zip: "45014",
                    country: "USA",
                    lon: "-84.499743",
                    cz: "4A",
                    state: "OH",
                    file: "0-93814",
                    lat: "39.387357"
                  },
                  {
                    city: "Salem",
                    zip: "01970",
                    country: "USA",
                    lon: "-70.904237",
                    cz: "5A",
                    state: "MA",
                    file: "0-14739",
                    lat: "42.512946"
                  },
                  {
                    city: "Rancho Palos Verdes",
                    zip: "90275",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "San Bruno",
                    zip: "94066",
                    country: "USA",
                    lon: "-122.436034",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.623159"
                  },
                  {
                    city: "Concord",
                    zip: "03301",
                    country: "USA",
                    lon: "-71.536101",
                    cz: "5A",
                    state: "NH",
                    file: "0-14745",
                    lat: "43.230314"
                  },
                  {
                    city: "Burlington",
                    zip: "05401",
                    country: "USA",
                    lon: "-73.151384",
                    cz: "6A",
                    state: "VT",
                    file: "0-14742",
                    lat: "44.507404"
                  },
                  {
                    city: "Apex",
                    zip: "27502",
                    country: "USA",
                    lon: "-78.834012",
                    cz: "3A",
                    state: "NC",
                    file: "0-13722",
                    lat: "35.748012"
                  },
                  {
                    city: "Midland",
                    zip: "48640",
                    country: "USA",
                    lon: "-84.33803",
                    cz: "5A",
                    state: "MI",
                    file: "0-94814",
                    lat: "43.626132"
                  },
                  {
                    city: "Altamonte Springs",
                    zip: "32701",
                    country: "USA",
                    lon: "-81.365039",
                    cz: "2A",
                    state: "FL",
                    file: "0-12842",
                    lat: "28.666625"
                  },
                  {
                    city: "Hutchinson",
                    zip: "67501",
                    country: "USA",
                    lon: "-97.88569",
                    cz: "4A",
                    state: "KS",
                    file: "0-3928",
                    lat: "37.954312"
                  },
                  {
                    city: "Buffalo Grove",
                    zip: "60089",
                    country: "USA",
                    lon: "-87.960771",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "42.180411"
                  },
                  {
                    city: "Urbandale",
                    zip: "50322",
                    country: "USA",
                    lon: "-93.753628",
                    cz: "5A",
                    state: "IA",
                    file: "0-14933",
                    lat: "41.630449"
                  },
                  {
                    city: "State College",
                    zip: "16801",
                    country: "USA",
                    lon: "-77.867822",
                    cz: "5A",
                    state: "PA",
                    file: "0-14778",
                    lat: "40.881935"
                  },
                  {
                    city: "Urbana",
                    zip: "61801",
                    country: "USA",
                    lon: "-88.182071",
                    cz: "5A",
                    state: "IL",
                    file: "0-93822",
                    lat: "40.133657"
                  },
                  {
                    city: "Plainfield",
                    zip: "60544",
                    country: "USA",
                    lon: "-88.169698",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "41.632457"
                  },
                  {
                    city: "Manassas",
                    zip: "20108",
                    country: "USA",
                    lon: "-77.487162",
                    cz: "4A",
                    state: "VA",
                    file: "0-93738",
                    lat: "38.744685"
                  },
                  {
                    city: "Bartlett",
                    zip: "60103",
                    country: "USA",
                    lon: "-88.157756",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "42.033376"
                  },
                  {
                    city: "Kearny",
                    zip: "07032",
                    country: "USA",
                    lon: "-74.122937",
                    cz: "4A",
                    state: "NJ",
                    file: "0-14734",
                    lat: "40.75175"
                  },
                  {
                    city: "Findlay",
                    zip: "45839",
                    country: "USA",
                    lon: "-83.650714",
                    cz: "5A",
                    state: "OH",
                    file: "0-94830",
                    lat: "40.993263"
                  },
                  {
                    city: "Rohnert Park",
                    zip: "94927",
                    country: "USA",
                    lon: "-122.989975",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "38.463088"
                  },
                  {
                    city: "Westfield",
                    zip: "01085",
                    country: "USA",
                    lon: "-72.501887",
                    cz: "5A",
                    state: "MA",
                    file: "0-14740",
                    lat: "42.14869"
                  },
                  {
                    city: "Linden",
                    zip: "07036",
                    country: "USA",
                    lon: "-74.250939",
                    cz: "4A",
                    state: "NJ",
                    file: "0-14734",
                    lat: "40.626953"
                  },
                  {
                    city: "Sumter",
                    zip: "29150",
                    country: "USA",
                    lon: "-80.354238",
                    cz: "3A",
                    state: "SC",
                    file: "0-13883",
                    lat: "33.913678"
                  },
                  {
                    city: "Woonsocket",
                    zip: "02895",
                    country: "USA",
                    lon: "-71.51939",
                    cz: "#N/A",
                    state: "RI",
                    file: "0-14765",
                    lat: "41.984598"
                  },
                  {
                    city: "Leominster",
                    zip: "01453",
                    country: "USA",
                    lon: "-71.837509",
                    cz: "5A",
                    state: "MA",
                    file: "0-94746",
                    lat: "42.471316"
                  },
                  {
                    city: "Shelton",
                    zip: "06484",
                    country: "USA",
                    lon: "-73.137143",
                    cz: "5A",
                    state: "CT",
                    file: "0-94702",
                    lat: "41.314347"
                  },
                  {
                    city: "Brea",
                    zip: "92821",
                    country: "USA",
                    lon: "-117.769442",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.640302"
                  },
                  {
                    city: "Covington",
                    zip: "41011",
                    country: "USA",
                    lon: "-84.542748",
                    cz: "4A",
                    state: "KY",
                    file: "0-93814",
                    lat: "39.05906"
                  },
                  {
                    city: "Rockwall",
                    zip: "75032",
                    country: "USA",
                    lon: "-96.409502",
                    cz: "3A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.886"
                  },
                  {
                    city: "Meridian",
                    zip: "39301",
                    country: "USA",
                    lon: "-88.663489",
                    cz: "3A",
                    state: "MS",
                    file: "0-13865",
                    lat: "32.381605"
                  },
                  {
                    city: "Riverton",
                    zip: "84065",
                    country: "USA",
                    lon: "-112.00627",
                    cz: "5B",
                    state: "UT",
                    file: "0-24127",
                    lat: "40.495129"
                  },
                  {
                    city: "Quincy",
                    zip: "62301",
                    country: "USA",
                    lon: "-91.200676",
                    cz: "5A",
                    state: "IL",
                    file: "0-93822",
                    lat: "39.952413"
                  },
                  {
                    city: "Morgan Hill",
                    zip: "95037",
                    country: "USA",
                    lon: "-121.681557",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.130238"
                  },
                  {
                    city: "Warren",
                    zip: "44481",
                    country: "USA",
                    lon: "-80.867431",
                    cz: "5A",
                    state: "OH",
                    file: "0-14852",
                    lat: "41.248912"
                  },
                  {
                    city: "Edmonds",
                    zip: "98020",
                    country: "USA",
                    lon: "-122.372401",
                    cz: "4C",
                    state: "WA",
                    file: "0-24233",
                    lat: "47.806068"
                  },
                  {
                    city: "Burleson",
                    zip: "76028",
                    country: "USA",
                    lon: "-97.264359",
                    cz: "3A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.492683"
                  },
                  {
                    city: "Beverly",
                    zip: "01915",
                    country: "USA",
                    lon: "-70.853843",
                    cz: "5A",
                    state: "MA",
                    file: "0-14739",
                    lat: "42.565145"
                  },
                  {
                    city: "Mankato",
                    zip: "56001",
                    country: "USA",
                    lon: "-94.003112",
                    cz: "6A",
                    state: "MN",
                    file: "0-14922",
                    lat: "44.061451"
                  },
                  {
                    city: "Hagerstown",
                    zip: "21740",
                    country: "USA",
                    lon: "-77.700213",
                    cz: "4A",
                    state: "MD",
                    file: "0-93738",
                    lat: "39.58887"
                  },
                  {
                    city: "Prescott",
                    zip: "86301",
                    country: "USA",
                    lon: "-112.567165",
                    cz: "4B",
                    state: "AZ",
                    file: "0-23184",
                    lat: "34.620826"
                  },
                  {
                    city: "Campbell",
                    zip: "95008",
                    country: "USA",
                    lon: "-121.705327",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.189396"
                  },
                  {
                    city: "Cedar Falls",
                    zip: "50613",
                    country: "USA",
                    lon: "-92.43585",
                    cz: "5A",
                    state: "IA",
                    file: "0-94910",
                    lat: "42.517091"
                  },
                  {
                    city: "Beaumont",
                    zip: "92223",
                    country: "USA",
                    lon: "-116.954753",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "33.92703"
                  },
                  {
                    city: "La Puente",
                    zip: "91744",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Crystal Lake",
                    zip: "60012",
                    country: "USA",
                    lon: "-88.305292",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "42.232096"
                  },
                  {
                    city: "Fitchburg",
                    zip: "01420",
                    country: "USA",
                    lon: "-71.816767",
                    cz: "5A",
                    state: "MA",
                    file: "0-94746",
                    lat: "42.583689"
                  },
                  {
                    city: "Carol Stream",
                    zip: "60116",
                    country: "USA",
                    lon: "-88.088716",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "41.839679"
                  },
                  {
                    city: "Hickory",
                    zip: "28601",
                    country: "USA",
                    lon: "-81.308224",
                    cz: "3A",
                    state: "NC",
                    file: "0-13881",
                    lat: "35.758221"
                  },
                  {
                    city: "Streamwood",
                    zip: "60107",
                    country: "USA",
                    lon: "-88.178475",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "42.019093"
                  },
                  {
                    city: "Norwich",
                    zip: "06360",
                    country: "USA",
                    lon: "-71.994757",
                    cz: "5A",
                    state: "CT",
                    file: "0-14765",
                    lat: "41.499398"
                  },
                  {
                    city: "Coppell",
                    zip: "75019",
                    country: "USA",
                    lon: "-96.777626",
                    cz: "2A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.767268"
                  },
                  {
                    city: "San Gabriel",
                    zip: "91775",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Holyoke",
                    zip: "01040",
                    country: "USA",
                    lon: "-72.64207",
                    cz: "5A",
                    state: "MA",
                    file: "0-14740",
                    lat: "42.198291"
                  },
                  {
                    city: "Bentonville",
                    zip: "72712",
                    country: "USA",
                    lon: "-94.223419",
                    cz: "4A",
                    state: "AR",
                    file: "0-13964",
                    lat: "36.347107"
                  },
                  {
                    city: "Florence",
                    zip: "35630",
                    country: "USA",
                    lon: "-87.686915",
                    cz: "3A",
                    state: "AL",
                    file: "0-3856",
                    lat: "34.869601"
                  },
                  {
                    city: "Brentwood",
                    zip: "37024",
                    country: "USA",
                    lon: "-86.907565",
                    cz: "4A",
                    state: "TN",
                    file: "0-13897",
                    lat: "35.874553"
                  },
                  {
                    city: "Bozeman",
                    zip: "59715",
                    country: "USA",
                    lon: "-111.168212",
                    cz: "6B",
                    state: "MT",
                    file: "0-24144",
                    lat: "45.809998"
                  },
                  {
                    city: "New Berlin",
                    zip: "53146",
                    country: "USA",
                    lon: "-88.177554",
                    cz: "5A",
                    state: "WI",
                    file: "0-14839",
                    lat: "42.969924"
                  },
                  {
                    city: "Goose Creek",
                    zip: "29445",
                    country: "USA",
                    lon: "-80.010088",
                    cz: "3A",
                    state: "SC",
                    file: "0-13880",
                    lat: "33.057972"
                  },
                  {
                    city: "Huntsville",
                    zip: "77320",
                    country: "USA",
                    lon: "-95.597029",
                    cz: "2A",
                    state: "TX",
                    file: "0-93987",
                    lat: "30.846986"
                  },
                  {
                    city: "Prescott Valley",
                    zip: "86312",
                    country: "USA",
                    lon: "-112.307777",
                    cz: "4B",
                    state: "AZ",
                    file: "0-23184",
                    lat: "34.668291"
                  },
                  {
                    city: "Romeoville",
                    zip: "60446",
                    country: "USA",
                    lon: "-88.069621",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "41.64038"
                  },
                  {
                    city: "Duncanville",
                    zip: "75116",
                    country: "USA",
                    lon: "-96.777626",
                    cz: "2A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.767268"
                  },
                  {
                    city: "Atlantic City",
                    zip: "08401",
                    country: "USA",
                    lon: "-74.643014",
                    cz: "4A",
                    state: "NJ",
                    file: "0-93730",
                    lat: "39.486848"
                  },
                  {
                    city: "Clovis",
                    zip: "88101",
                    country: "USA",
                    lon: "-103.294978",
                    cz: "4B",
                    state: "NM",
                    file: "0-23048",
                    lat: "34.497241"
                  },
                  {
                    city: "The Colony",
                    zip: "75056",
                    country: "USA",
                    lon: "-96.901605",
                    cz: "3A",
                    state: "TX",
                    file: "0-3927",
                    lat: "33.077136"
                  },
                  {
                    city: "Culver City",
                    zip: "90230",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Marlborough",
                    zip: "01752",
                    country: "USA",
                    lon: "-71.459405",
                    cz: "5A",
                    state: "MA",
                    file: "0-14739",
                    lat: "42.446396"
                  },
                  {
                    city: "Hilton Head Island",
                    zip: "29925",
                    country: "USA",
                    lon: "-80.799698",
                    cz: "2A",
                    state: "SC",
                    file: "0-3822",
                    lat: "32.21319"
                  },
                  {
                    city: "Moorhead",
                    zip: "56560",
                    country: "USA",
                    lon: "-96.557389",
                    cz: "6A",
                    state: "MN",
                    file: "0-14914",
                    lat: "46.803546"
                  },
                  {
                    city: "Calexico",
                    zip: "92231",
                    country: "USA",
                    lon: "-115.518355",
                    cz: "2B",
                    state: "CA",
                    file: "0-23188",
                    lat: "32.946832"
                  },
                  {
                    city: "Bullhead City",
                    zip: "86429",
                    country: "USA",
                    lon: "-114.538599",
                    cz: "3B",
                    state: "AZ",
                    file: "0-23169",
                    lat: "35.171497"
                  },
                  {
                    city: "Germantown",
                    zip: "38138",
                    country: "USA",
                    lon: "-89.792638",
                    cz: "4A",
                    state: "TN",
                    file: "0-13893",
                    lat: "35.08753"
                  },
                  {
                    city: "La Quinta",
                    zip: "92253",
                    country: "USA",
                    lon: "-116.259176",
                    cz: "3B",
                    state: "CA",
                    file: "0-23188",
                    lat: "33.670978"
                  },
                  {
                    city: "Lancaster",
                    zip: "43130",
                    country: "USA",
                    lon: "-82.609282",
                    cz: "5A",
                    state: "OH",
                    file: "0-14821",
                    lat: "39.68965"
                  },
                  {
                    city: "WaUSAu",
                    zip: "54401",
                    country: "USA",
                    lon: "-89.794002",
                    cz: "6A",
                    state: "WI",
                    file: "0-14991",
                    lat: "44.961874"
                  },
                  {
                    city: "Sherman",
                    zip: "75090",
                    country: "USA",
                    lon: "-96.659726",
                    cz: "3A",
                    state: "TX",
                    file: "0-3927",
                    lat: "33.647425"
                  },
                  {
                    city: "Ocoee",
                    zip: "34761",
                    country: "USA",
                    lon: "-81.530251",
                    cz: "2A",
                    state: "FL",
                    file: "0-12842",
                    lat: "28.569438"
                  },
                  {
                    city: "Shakopee",
                    zip: "55379",
                    country: "USA",
                    lon: "-93.474144",
                    cz: "6A",
                    state: "MN",
                    file: "0-14922",
                    lat: "44.731113"
                  },
                  {
                    city: "Woburn",
                    zip: "01801",
                    country: "USA",
                    lon: "-71.157271",
                    cz: "5A",
                    state: "MA",
                    file: "0-14739",
                    lat: "42.488595"
                  },
                  {
                    city: "Bremerton",
                    zip: "98310",
                    country: "USA",
                    lon: "-122.634712",
                    cz: "5C",
                    state: "WA",
                    file: "0-24233",
                    lat: "47.606478"
                  },
                  {
                    city: "Rock Island",
                    zip: "61201",
                    country: "USA",
                    lon: "-90.604899",
                    cz: "5A",
                    state: "IL",
                    file: "0-14923",
                    lat: "41.495083"
                  },
                  {
                    city: "Muskogee",
                    zip: "74401",
                    country: "USA",
                    lon: "-95.50025",
                    cz: "3A",
                    state: "OK",
                    file: "0-13968",
                    lat: "35.70582"
                  },
                  {
                    city: "Cape Girardeau",
                    zip: "63701",
                    country: "USA",
                    lon: "-89.611016",
                    cz: "4A",
                    state: "MO",
                    file: "0-13994",
                    lat: "37.341398"
                  },
                  {
                    city: "Annapolis",
                    zip: "21401",
                    country: "USA",
                    lon: "-76.610143",
                    cz: "4A",
                    state: "MD",
                    file: "0-93721",
                    lat: "38.967311"
                  },
                  {
                    city: "Ormond Beach",
                    zip: "32173",
                    country: "USA",
                    lon: "-81.172169",
                    cz: "2A",
                    state: "FL",
                    file: "0-12834",
                    lat: "29.022729"
                  },
                  {
                    city: "Stanton",
                    zip: "90680",
                    country: "USA",
                    lon: "-117.769442",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.640302"
                  },
                  {
                    city: "Puyallup",
                    zip: "98371",
                    country: "USA",
                    lon: "-122.317148",
                    cz: "5B",
                    state: "WA",
                    file: "0-24233",
                    lat: "47.212822"
                  },
                  {
                    city: "Pacifica",
                    zip: "94044",
                    country: "USA",
                    lon: "-122.480015",
                    cz: "3C",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.616774"
                  },
                  {
                    city: "Hurst",
                    zip: "76053",
                    country: "USA",
                    lon: "-97.227779",
                    cz: "2A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.882663"
                  },
                  {
                    city: "Lima",
                    zip: "45801",
                    country: "USA",
                    lon: "-84.0471",
                    cz: "5A",
                    state: "OH",
                    file: "0-94830",
                    lat: "40.772147"
                  },
                  {
                    city: "Marana",
                    zip: "85653",
                    country: "USA",
                    lon: "-111.159344",
                    cz: "2B",
                    state: "AZ",
                    file: "0-23160",
                    lat: "32.442979"
                  },
                  {
                    city: "Carpentersville",
                    zip: "60110",
                    country: "USA",
                    lon: "-88.297238",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "42.125008"
                  },
                  {
                    city: "Oakley",
                    zip: "94561",
                    country: "USA",
                    lon: "-121.68972",
                    cz: "3B",
                    state: "CA",
                    file: "0-23232",
                    lat: "37.996516"
                  },
                  {
                    city: "Lancaster",
                    zip: "75134",
                    country: "USA",
                    lon: "-96.76442",
                    cz: "2A",
                    state: "TX",
                    file: "0-3927",
                    lat: "32.621185"
                  },
                  {
                    city: "Montclair",
                    zip: "91763",
                    country: "USA",
                    lon: "-115.967051",
                    cz: "3B",
                    state: "CA",
                    file: "0-23161",
                    lat: "34.839964"
                  },
                  {
                    city: "Wheeling",
                    zip: "60090",
                    country: "USA",
                    lon: "-87.933819",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "42.124176"
                  },
                  {
                    city: "Brookfield",
                    zip: "53005",
                    country: "USA",
                    lon: "-88.105906",
                    cz: "5A",
                    state: "WI",
                    file: "0-14839",
                    lat: "43.062707"
                  },
                  {
                    city: "Park Ridge",
                    zip: "60068",
                    country: "USA",
                    lon: "-87.843714",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "42.037228"
                  },
                  {
                    city: "Florence",
                    zip: "29501",
                    country: "USA",
                    lon: "-79.685361",
                    cz: "3A",
                    state: "SC",
                    file: "0-13883",
                    lat: "34.049849"
                  },
                  {
                    city: "Roy",
                    zip: "84067",
                    country: "USA",
                    lon: "-112.052525",
                    cz: "5B",
                    state: "UT",
                    file: "0-24127",
                    lat: "41.178743"
                  },
                  {
                    city: "Winter Garden",
                    zip: "34777",
                    country: "USA",
                    lon: "-81.605846",
                    cz: "2A",
                    state: "FL",
                    file: "0-12842",
                    lat: "28.541579"
                  },
                  {
                    city: "Chelsea",
                    zip: "02150",
                    country: "USA",
                    lon: "-71.038894",
                    cz: "5A",
                    state: "MA",
                    file: "0-14739",
                    lat: "42.378197"
                  },
                  {
                    city: "Valley Stream",
                    zip: "11580",
                    country: "USA",
                    lon: "-73.697828",
                    cz: "4A",
                    state: "NY",
                    file: "0-94728",
                    lat: "40.676052"
                  },
                  {
                    city: "Spartanburg",
                    zip: "29301",
                    country: "USA",
                    lon: "-81.993403",
                    cz: "3A",
                    state: "SC",
                    file: "0-3870",
                    lat: "35.011309"
                  },
                  {
                    city: "Lake Oswego",
                    zip: "97034",
                    country: "USA",
                    lon: "-122.691388",
                    cz: "4C",
                    state: "OR",
                    file: "0-24229",
                    lat: "45.408374"
                  },
                  {
                    city: "Friendswood",
                    zip: "77546",
                    country: "USA",
                    lon: "-95.156545",
                    cz: "2A",
                    state: "TX",
                    file: "0-12960",
                    lat: "29.482185"
                  },
                  {
                    city: "Westerville",
                    zip: "43081",
                    country: "USA",
                    lon: "-82.896457",
                    cz: "5A",
                    state: "OH",
                    file: "0-14821",
                    lat: "40.10447"
                  },
                  {
                    city: "Phenix City",
                    zip: "36867",
                    country: "USA",
                    lon: "-85.203923",
                    cz: "3A",
                    state: "AL",
                    file: "0-93842",
                    lat: "32.375318"
                  },
                  {
                    city: "Grove City",
                    zip: "43123",
                    country: "USA",
                    lon: "-83.011389",
                    cz: "5A",
                    state: "OH",
                    file: "0-14821",
                    lat: "39.969036"
                  },
                  {
                    city: "Texarkana",
                    zip: "75501",
                    country: "USA",
                    lon: "-94.177354",
                    cz: "3A",
                    state: "TX",
                    file: "0-13957",
                    lat: "33.411321"
                  },
                  {
                    city: "Addison",
                    zip: "60101",
                    country: "USA",
                    lon: "-88.022516",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "41.887579"
                  },
                  {
                    city: "Dover",
                    zip: "19901",
                    country: "USA",
                    lon: "-75.49549",
                    cz: "4A",
                    state: "DE",
                    file: "0-13781",
                    lat: "39.156376"
                  },
                  {
                    city: "Lincoln Park",
                    zip: "48146",
                    country: "USA",
                    lon: "-83.180375",
                    cz: "5A",
                    state: "MI",
                    file: "0-94847",
                    lat: "42.242038"
                  },
                  {
                    city: "Calumet City",
                    zip: "60409",
                    country: "USA",
                    lon: "-87.68732",
                    cz: "5A",
                    state: "IL",
                    file: "0-94846",
                    lat: "41.811929"
                  },
                  {
                    city: "Muskegon",
                    zip: "49440",
                    country: "USA",
                    lon: "-86.232858",
                    cz: "5A",
                    state: "MI",
                    file: "0-14840",
                    lat: "43.233764"
                  },
                  {
                    city: "Martinez",
                    zip: "94553",
                    country: "USA",
                    lon: "-122.134976",
                    cz: "3B",
                    state: "CA",
                    file: "0-23234",
                    lat: "37.986421"
                  },
                  {
                    city: "Apache Junction",
                    zip: "85217",
                    country: "USA",
                    lon: "-111.478975",
                    cz: "2B",
                    state: "AZ",
                    file: "0-23183",
                    lat: "33.393398"
                  },
                  {
                    city: "Monrovia",
                    zip: "91016",
                    country: "USA",
                    lon: "-118.298662",
                    cz: "3B",
                    state: "CA",
                    file: "0-23129",
                    lat: "33.786594"
                  },
                  {
                    city: "Weslaco",
                    zip: "78596",
                    country: "USA",
                    lon: "-98.134649",
                    cz: "3A",
                    state: "TX",
                    file: "0-12919",
                    lat: "26.178744"
                  },
                  {
                    city: "Keizer",
                    zip: "97307",
                    country: "USA",
                    lon: "-122.457024",
                    cz: "4C",
                    state: "OR",
                    file: "0-24232",
                    lat: "44.984465"
                  },
                  {
                    city: "Spanish Fork",
                    zip: "84660",
                    country: "USA",
                    lon: "-111.649086",
                    cz: "5B",
                    state: "UT",
                    file: "0-24127",
                    lat: "40.069946"
                  },
                  {
                    city: "Beloit",
                    zip: "53511",
                    country: "USA",
                    lon: "-89.086045",
                    cz: "5A",
                    state: "WI",
                    file: "0-94822",
                    lat: "42.562039"
                  },
                  {
                    city: "Panama City",
                    zip: "32401",
                    country: "USA",
                    lon: "-85.663027",
                    cz: "2A",
                    state: "FL",
                    file: "0-93805",
                    lat: "30.1922"
                  },
                  {
                    "city": "Agartala",
                    "country": "India",
                    "lon": "91.25",
                    "cz": "1A",
                    "file": "0-41415",
                    "lat": "23.88"
                  },
                  {
                    "city": "Ahmadabad",
                    "country": "India",
                    "lon": "72.63",
                    "cz": "1B",
                    "file": "0-14607",
                    "lat": "23.07"
                  },
                  {
                    "city": "Akola",
                    "country": "India",
                    "lon": "77.07",
                    "cz": "1B",
                    "file": "0-14607",
                    "lat": "20.7"
                  },
                  {
                    "city": "Aurangabad Chikalth",
                    "country": "India",
                    "lon": "75.4",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "19.85"
                  },
                  {
                    "city": "Balasore",
                    "country": "India",
                    "lon": "86.93",
                    "cz": "1A",
                    "file": "0-41415",
                    "lat": "21.52"
                  },
                  {
                    "city": "Bangalore",
                    "country": "India",
                    "lon": "77.58",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "12.97"
                  },
                  {
                    "city": "Belgaum/Sambra",
                    "country": "India",
                    "lon": "74.62",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "15.85"
                  },
                  {
                    "city": "Bhopal/Bairagarh",
                    "country": "India",
                    "lon": "77.35",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "23.28"
                  },
                  {
                    "city": "Bhubaneswar",
                    "country": "India",
                    "lon": "85.83",
                    "cz": "1A",
                    "file": "0-41415",
                    "lat": "20.25"
                  },
                  {
                    "city": "Bhuj-Rudramata",
                    "country": "India",
                    "lon": "69.67",
                    "cz": "1B",
                    "file": "0-14607",
                    "lat": "23.25"
                  },
                  {
                    "city": "Bikaner",
                    "country": "India",
                    "lon": "73.3",
                    "cz": "1B",
                    "file": "0-14607",
                    "lat": "28"
                  },
                  {
                    "city": "Bombay/Santacruz",
                    "country": "India",
                    "lon": "72.85",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "19.12"
                  },
                  {
                    "city": "Calcutta/Dum Dum",
                    "country": "India",
                    "lon": "88.45",
                    "cz": "1A",
                    "file": "0-41415",
                    "lat": "22.65"
                  },
                  {
                    "city": "Chitradurga",
                    "country": "India",
                    "lon": "76.43",
                    "cz": "1B",
                    "file": "0-14607",
                    "lat": "14.23"
                  },
                  {
                    "city": "Coimbatore/Peelamed",
                    "country": "India",
                    "lon": "77.05",
                    "cz": "1B",
                    "file": "0-14607",
                    "lat": "11.03"
                  },
                  {
                    "city": "Cuddalore",
                    "country": "India",
                    "lon": "79.77",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "11.77"
                  },
                  {
                    "city": "Cwc Vishakhapatnam",
                    "country": "India",
                    "lon": "83.3",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "17.7"
                  },
                  {
                    "city": "Gadag",
                    "country": "India",
                    "lon": "75.63",
                    "cz": "1B",
                    "file": "0-14607",
                    "lat": "15.42"
                  },
                  {
                    "city": "Gauhati",
                    "country": "India",
                    "lon": "91.58",
                    "cz": "1A",
                    "file": "0-41415",
                    "lat": "26.1"
                  },
                  {
                    "city": "Goa/Panjim",
                    "country": "India",
                    "lon": "73.82",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "15.48"
                  },
                  {
                    "city": "Gwalior",
                    "country": "India",
                    "lon": "78.25",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "26.23"
                  },
                  {
                    "city": "Hissar",
                    "country": "India",
                    "lon": "75.73",
                    "cz": "1B",
                    "file": "0-14607",
                    "lat": "29.17"
                  },
                  {
                    "city": "Hyderabad Airport",
                    "country": "India",
                    "lon": "78.47",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "17.45"
                  },
                  {
                    "city": "Indore",
                    "country": "India",
                    "lon": "75.8",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "22.72"
                  },
                  {
                    "city": "Jabalpur",
                    "country": "India",
                    "lon": "79.95",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "23.2"
                  },
                  {
                    "city": "Jagdalpur",
                    "country": "India",
                    "lon": "82.03",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "19.08"
                  },
                  {
                    "city": "Jaipur/Sanganer",
                    "country": "India",
                    "lon": "75.8",
                    "cz": "1B",
                    "file": "0-14607",
                    "lat": "26.82"
                  },
                  {
                    "city": "Jamshedpur",
                    "country": "India",
                    "lon": "86.18",
                    "cz": "1A",
                    "file": "0-41415",
                    "lat": "22.82"
                  },
                  {
                    "city": "Jodhpur",
                    "country": "India",
                    "lon": "73.02",
                    "cz": "1B",
                    "file": "0-14607",
                    "lat": "26.3"
                  },
                  {
                    "city": "Kakinada",
                    "country": "India",
                    "lon": "82.23",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "16.95"
                  },
                  {
                    "city": "Kozhikode",
                    "country": "India",
                    "lon": "75.78",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "11.25"
                  },
                  {
                    "city": "Kurnool",
                    "country": "India",
                    "lon": "78.07",
                    "cz": "1B",
                    "file": "0-14607",
                    "lat": "15.8"
                  },
                  {
                    "city": "Lucknow/Amausi",
                    "country": "India",
                    "lon": "80.88",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "26.75"
                  },
                  {
                    "city": "Machilipatnam",
                    "country": "India",
                    "lon": "81.15",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "16.2"
                  },
                  {
                    "city": "Madras/Minambakkam",
                    "country": "India",
                    "lon": "80.18",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "13"
                  },
                  {
                    "city": "Mangalore/Bajpe",
                    "country": "India",
                    "lon": "74.88",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "12.92"
                  },
                  {
                    "city": "Nagpur Sonegaon",
                    "country": "India",
                    "lon": "79.05",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "21.1"
                  },
                  {
                    "city": "Nellore",
                    "country": "India",
                    "lon": "79.98",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "14.45"
                  },
                  {
                    "city": "New Delhi/Palam",
                    "country": "India",
                    "lon": "77.12",
                    "cz": "1B",
                    "file": "0-14607",
                    "lat": "28.57"
                  },
                  {
                    "city": "New Delhi/Safdarjun",
                    "country": "India",
                    "lon": "77.2",
                    "cz": "1B",
                    "file": "0-14607",
                    "lat": "28.58"
                  },
                  {
                    "city": "Patiala",
                    "country": "India",
                    "lon": "76.47",
                    "cz": "2B",
                    "file": "0-14607",
                    "lat": "30.33"
                  },
                  {
                    "city": "Patna",
                    "country": "India",
                    "lon": "85.1",
                    "cz": "1A",
                    "file": "0-41415",
                    "lat": "25.6"
                  },
                  {
                    "city": "Pbo Anantapur",
                    "country": "India",
                    "lon": "77.63",
                    "cz": "1B",
                    "file": "0-14607",
                    "lat": "14.58"
                  },
                  {
                    "city": "Poona",
                    "country": "India",
                    "lon": "73.85",
                    "cz": "1B",
                    "file": "0-14607",
                    "lat": "18.53"
                  },
                  {
                    "city": "Rajkot",
                    "country": "India",
                    "lon": "70.78",
                    "cz": "1B",
                    "file": "0-14607",
                    "lat": "22.3"
                  },
                  {
                    "city": "Ratnagiri",
                    "country": "India",
                    "lon": "73.33",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "16.98"
                  },
                  {
                    "city": "Sholapur",
                    "country": "India",
                    "lon": "75.9",
                    "cz": "1B",
                    "file": "0-14607",
                    "lat": "17.67"
                  },
                  {
                    "city": "Surat",
                    "country": "India",
                    "lon": "72.83",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "21.2"
                  },
                  {
                    "city": "Thiruvananthapuram",
                    "country": "India",
                    "lon": "76.95",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "8.48"
                  },
                  {
                    "city": "Tiruchchirapalli",
                    "country": "India",
                    "lon": "78.72",
                    "cz": "1A",
                    "file": "0-14607",
                    "lat": "10.77"
                  },
                  {
                    "city": "Veraval",
                    "country": "India",
                    "lon": "70.37",
                    "cz": "1B",
                    "file": "0-14607",
                    "lat": "20.9"
                  },
                  {
                    "city": "Abag Qi",
                    "country": "China",
                    "lon": "114.95",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "44.02"
                  },
                  {
                    "city": "Aihui",
                    "country": "China",
                    "lon": "127.45",
                    "cz": "7",
                    "file": "0-25713",
                    "lat": "50.25"
                  },
                  {
                    "city": "Akqi",
                    "country": "China",
                    "lon": "78.45",
                    "cz": "6B",
                    "file": "0-14607",
                    "lat": "40.93"
                  },
                  {
                    "city": "Alar",
                    "country": "China",
                    "lon": "81.05",
                    "cz": "5B",
                    "file": "0-14607",
                    "lat": "40.5"
                  },
                  {
                    "city": "Altay",
                    "country": "China",
                    "lon": "88.08",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "47.73"
                  },
                  {
                    "city": "Anda",
                    "country": "China",
                    "lon": "125.32",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "46.38"
                  },
                  {
                    "city": "Andir",
                    "country": "China",
                    "lon": "83.65",
                    "cz": "5B",
                    "file": "0-14607",
                    "lat": "37.93"
                  },
                  {
                    "city": "Ankang",
                    "country": "China",
                    "lon": "109.03",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "32.72"
                  },
                  {
                    "city": "Anqing",
                    "country": "China",
                    "lon": "117.05",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "30.53"
                  },
                  {
                    "city": "Anyang",
                    "country": "China",
                    "lon": "114.4",
                    "cz": "4B",
                    "file": "0-41415",
                    "lat": "36.05"
                  },
                  {
                    "city": "Arxan",
                    "country": "China",
                    "lon": "119.93",
                    "cz": "8",
                    "file": "0-41415",
                    "lat": "47.17"
                  },
                  {
                    "city": "Bachu",
                    "country": "China",
                    "lon": "78.57",
                    "cz": "4B",
                    "file": "0-14607",
                    "lat": "39.8"
                  },
                  {
                    "city": "Bailing-Miao",
                    "country": "China",
                    "lon": "110.43",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "41.7"
                  },
                  {
                    "city": "Baingoin",
                    "country": "China",
                    "lon": "90.02",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "31.37"
                  },
                  {
                    "city": "Baise",
                    "country": "China",
                    "lon": "106.6",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "23.9"
                  },
                  {
                    "city": "Balguntay",
                    "country": "China",
                    "lon": "86.33",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "42.67"
                  },
                  {
                    "city": "Baoding",
                    "country": "China",
                    "lon": "115.57",
                    "cz": "4B",
                    "file": "0-41415",
                    "lat": "38.85"
                  },
                  {
                    "city": "Baoji",
                    "country": "China",
                    "lon": "107.13",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "34.35"
                  },
                  {
                    "city": "Baoqing",
                    "country": "China",
                    "lon": "132.18",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "46.32"
                  },
                  {
                    "city": "Baoshan",
                    "country": "China",
                    "lon": "99.18",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "25.12"
                  },
                  {
                    "city": "Barkam",
                    "country": "China",
                    "lon": "102.23",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "31.9"
                  },
                  {
                    "city": "Batang",
                    "country": "China",
                    "lon": "99.1",
                    "cz": "4B",
                    "file": "0-41415",
                    "lat": "30"
                  },
                  {
                    "city": "Bayan Mod",
                    "country": "China",
                    "lon": "104.5",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "40.75"
                  },
                  {
                    "city": "Bayanbulak",
                    "country": "China",
                    "lon": "84.15",
                    "cz": "8",
                    "file": "0-41415",
                    "lat": "43.03"
                  },
                  {
                    "city": "Baytik Shan",
                    "country": "China",
                    "lon": "90.53",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "45.37"
                  },
                  {
                    "city": "Beihai",
                    "country": "China",
                    "lon": "109.1",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "21.48"
                  },
                  {
                    "city": "Beijing",
                    "country": "China",
                    "lon": "116.28",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "39.93"
                  },
                  {
                    "city": "Bengbu",
                    "country": "China",
                    "lon": "117.37",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "32.95"
                  },
                  {
                    "city": "Benxi",
                    "country": "China",
                    "lon": "123.78",
                    "cz": "6A",
                    "file": "0-41415",
                    "lat": "41.32"
                  },
                  {
                    "city": "Bijie",
                    "country": "China",
                    "lon": "105.23",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "27.3"
                  },
                  {
                    "city": "Binhai",
                    "country": "China",
                    "lon": "117.33",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "39.12"
                  },
                  {
                    "city": "Boxian",
                    "country": "China",
                    "lon": "115.77",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "33.88"
                  },
                  {
                    "city": "Bugt",
                    "country": "China",
                    "lon": "121.92",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "48.77"
                  },
                  {
                    "city": "Bugt",
                    "country": "China",
                    "lon": "120.7",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "42.33"
                  },
                  {
                    "city": "Cangzhou",
                    "country": "China",
                    "lon": "116.83",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "38.33"
                  },
                  {
                    "city": "Chang Dao",
                    "country": "China",
                    "lon": "120.72",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "37.93"
                  },
                  {
                    "city": "Changbai",
                    "country": "China",
                    "lon": "128.17",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "41.35"
                  },
                  {
                    "city": "Changchun",
                    "country": "China",
                    "lon": "125.22",
                    "cz": "6A",
                    "file": "0-41415",
                    "lat": "43.9"
                  },
                  {
                    "city": "Changde",
                    "country": "China",
                    "lon": "111.68",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "29.05"
                  },
                  {
                    "city": "Changling",
                    "country": "China",
                    "lon": "123.97",
                    "cz": "6A",
                    "file": "0-41415",
                    "lat": "44.25"
                  },
                  {
                    "city": "Changsha",
                    "country": "China",
                    "lon": "112.87",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "28.23"
                  },
                  {
                    "city": "Changting",
                    "country": "China",
                    "lon": "116.37",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "25.85"
                  },
                  {
                    "city": "Chaoyang",
                    "country": "China",
                    "lon": "120.45",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "41.55"
                  },
                  {
                    "city": "Chengde",
                    "country": "China",
                    "lon": "117.95",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "40.98"
                  },
                  {
                    "city": "Chengdu",
                    "country": "China",
                    "lon": "104.02",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "30.67"
                  },
                  {
                    "city": "Chengshantou",
                    "country": "China",
                    "lon": "122.68",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "37.4"
                  },
                  {
                    "city": "Chenzhou",
                    "country": "China",
                    "lon": "113.03",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "25.8"
                  },
                  {
                    "city": "Chifeng",
                    "country": "China",
                    "lon": "118.97",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "42.27"
                  },
                  {
                    "city": "Chongqing",
                    "country": "China",
                    "lon": "106.47",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "29.58"
                  },
                  {
                    "city": "Chuxiong",
                    "country": "China",
                    "lon": "101.52",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "25.02"
                  },
                  {
                    "city": "Da Xian",
                    "country": "China",
                    "lon": "107.5",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "31.2"
                  },
                  {
                    "city": "Dachen Dao",
                    "country": "China",
                    "lon": "121.88",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "28.45"
                  },
                  {
                    "city": "Dali",
                    "country": "China",
                    "lon": "100.18",
                    "cz": "3C",
                    "file": "0-41415",
                    "lat": "25.7"
                  },
                  {
                    "city": "Dalian",
                    "country": "China",
                    "lon": "121.63",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "38.9"
                  },
                  {
                    "city": "Dandong",
                    "country": "China",
                    "lon": "124.33",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "40.05"
                  },
                  {
                    "city": "Danxian",
                    "country": "China",
                    "lon": "109.58",
                    "cz": "1A",
                    "file": "0-41415",
                    "lat": "19.52"
                  },
                  {
                    "city": "Daocheng",
                    "country": "China",
                    "lon": "100.3",
                    "cz": "6A",
                    "file": "0-41415",
                    "lat": "29.05"
                  },
                  {
                    "city": "Da-Qaidam",
                    "country": "China",
                    "lon": "95.37",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "37.85"
                  },
                  {
                    "city": "Darlag",
                    "country": "China",
                    "lon": "99.65",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "33.75"
                  },
                  {
                    "city": "Datong",
                    "country": "China",
                    "lon": "113.33",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "40.1"
                  },
                  {
                    "city": "Dawu",
                    "country": "China",
                    "lon": "101.12",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "30.98"
                  },
                  {
                    "city": "Dege",
                    "country": "China",
                    "lon": "98.57",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "31.8"
                  },
                  {
                    "city": "Delingha",
                    "country": "China",
                    "lon": "97.37",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "37.37"
                  },
                  {
                    "city": "Dengqen",
                    "country": "China",
                    "lon": "95.6",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "31.42"
                  },
                  {
                    "city": "Deqen",
                    "country": "China",
                    "lon": "98.88",
                    "cz": "6A",
                    "file": "0-41415",
                    "lat": "28.45"
                  },
                  {
                    "city": "Dezhou",
                    "country": "China",
                    "lon": "116.32",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "37.43"
                  },
                  {
                    "city": "Dinghai",
                    "country": "China",
                    "lon": "122.12",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "30.03"
                  },
                  {
                    "city": "Dingtao",
                    "country": "China",
                    "lon": "115.57",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "35.07"
                  },
                  {
                    "city": "Diwopu",
                    "country": "China",
                    "lon": "87.47",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "43.9"
                  },
                  {
                    "city": "Dongfang",
                    "country": "China",
                    "lon": "108.62",
                    "cz": "1A",
                    "file": "0-41415",
                    "lat": "19.1"
                  },
                  {
                    "city": "Dongsheng",
                    "country": "China",
                    "lon": "109.98",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "39.83"
                  },
                  {
                    "city": "Dongtai",
                    "country": "China",
                    "lon": "120.28",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "32.85"
                  },
                  {
                    "city": "Dulan",
                    "country": "China",
                    "lon": "98.1",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "36.3"
                  },
                  {
                    "city": "Dunhua",
                    "country": "China",
                    "lon": "128.2",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "43.37"
                  },
                  {
                    "city": "Dunhuang",
                    "country": "China",
                    "lon": "94.68",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "40.15"
                  },
                  {
                    "city": "Duolun",
                    "country": "China",
                    "lon": "116.47",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "42.18"
                  },
                  {
                    "city": "Dushan",
                    "country": "China",
                    "lon": "107.55",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "25.83"
                  },
                  {
                    "city": "Ejin Qi",
                    "country": "China",
                    "lon": "101.07",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "41.95"
                  },
                  {
                    "city": "Emei Shan",
                    "country": "China",
                    "lon": "103.33",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "29.52"
                  },
                  {
                    "city": "Enshi",
                    "country": "China",
                    "lon": "109.47",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "30.28"
                  },
                  {
                    "city": "Erenhot",
                    "country": "China",
                    "lon": "112",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "43.65"
                  },
                  {
                    "city": "Fangxian",
                    "country": "China",
                    "lon": "110.77",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "32.03"
                  },
                  {
                    "city": "Fengjie",
                    "country": "China",
                    "lon": "109.53",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "31.02"
                  },
                  {
                    "city": "Fengning",
                    "country": "China",
                    "lon": "116.63",
                    "cz": "6A",
                    "file": "0-41415",
                    "lat": "41.22"
                  },
                  {
                    "city": "Fezxzan",
                    "country": "China",
                    "lon": "117.95",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "35.25"
                  },
                  {
                    "city": "Fogang",
                    "country": "China",
                    "lon": "113.53",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "23.87"
                  },
                  {
                    "city": "Fuding",
                    "country": "China",
                    "lon": "120.2",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "27.33"
                  },
                  {
                    "city": "Fujin",
                    "country": "China",
                    "lon": "131.98",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "47.23"
                  },
                  {
                    "city": "Fuyang",
                    "country": "China",
                    "lon": "115.73",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "32.87"
                  },
                  {
                    "city": "Fuyun",
                    "country": "China",
                    "lon": "89.52",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "46.98"
                  },
                  {
                    "city": "Fuzhou",
                    "country": "China",
                    "lon": "119.28",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "26.08"
                  },
                  {
                    "city": "Gangca",
                    "country": "China",
                    "lon": "100.13",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "37.33"
                  },
                  {
                    "city": "Ganyu",
                    "country": "China",
                    "lon": "119.13",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "34.83"
                  },
                  {
                    "city": "Ganzhou",
                    "country": "China",
                    "lon": "115",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "25.87"
                  },
                  {
                    "city": "Gaoyao",
                    "country": "China",
                    "lon": "112.47",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "23.05"
                  },
                  {
                    "city": "Garze",
                    "country": "China",
                    "lon": "100",
                    "cz": "6A",
                    "file": "0-41415",
                    "lat": "31.62"
                  },
                  {
                    "city": "Gengma",
                    "country": "China",
                    "lon": "99.4",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "23.55"
                  },
                  {
                    "city": "Golmud",
                    "country": "China",
                    "lon": "94.9",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "36.42"
                  },
                  {
                    "city": "Guaizihu",
                    "country": "China",
                    "lon": "102.37",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "41.37"
                  },
                  {
                    "city": "Guangchang",
                    "country": "China",
                    "lon": "116.33",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "26.85"
                  },
                  {
                    "city": "Guanghua",
                    "country": "China",
                    "lon": "111.67",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "32.38"
                  },
                  {
                    "city": "Guangnan",
                    "country": "China",
                    "lon": "105.07",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "24.07"
                  },
                  {
                    "city": "Guangzhou",
                    "country": "China",
                    "lon": "113.33",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "23.17"
                  },
                  {
                    "city": "Guilin",
                    "country": "China",
                    "lon": "110.3",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "25.33"
                  },
                  {
                    "city": "Guiping",
                    "country": "China",
                    "lon": "110.08",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "23.4"
                  },
                  {
                    "city": "Guiyang",
                    "country": "China",
                    "lon": "106.73",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "26.58"
                  },
                  {
                    "city": "Gushi",
                    "country": "China",
                    "lon": "115.67",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "32.17"
                  },
                  {
                    "city": "Haikou",
                    "country": "China",
                    "lon": "110.35",
                    "cz": "1A",
                    "file": "0-41415",
                    "lat": "20.03"
                  },
                  {
                    "city": "Hailar",
                    "country": "China",
                    "lon": "119.75",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "49.22"
                  },
                  {
                    "city": "Hails",
                    "country": "China",
                    "lon": "106.38",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "41.45"
                  },
                  {
                    "city": "Hailun",
                    "country": "China",
                    "lon": "126.97",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "47.43"
                  },
                  {
                    "city": "Haiyang",
                    "country": "China",
                    "lon": "121.17",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "36.77"
                  },
                  {
                    "city": "Haiyang Dao",
                    "country": "China",
                    "lon": "123.22",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "39.05"
                  },
                  {
                    "city": "Haliut",
                    "country": "China",
                    "lon": "108.52",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "41.57"
                  },
                  {
                    "city": "Hami",
                    "country": "China",
                    "lon": "93.52",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "42.82"
                  },
                  {
                    "city": "Hangzhou",
                    "country": "China",
                    "lon": "120.17",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "30.23"
                  },
                  {
                    "city": "Hanzhong",
                    "country": "China",
                    "lon": "107.03",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "33.07"
                  },
                  {
                    "city": "Harbin",
                    "country": "China",
                    "lon": "126.77",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "45.75"
                  },
                  {
                    "city": "Hechi",
                    "country": "China",
                    "lon": "108.05",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "24.7"
                  },
                  {
                    "city": "Hefei",
                    "country": "China",
                    "lon": "117.23",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "31.87"
                  },
                  {
                    "city": "Henan",
                    "country": "China",
                    "lon": "101.6",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "34.73"
                  },
                  {
                    "city": "Hequ",
                    "country": "China",
                    "lon": "111.15",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "39.38"
                  },
                  {
                    "city": "Heyuan",
                    "country": "China",
                    "lon": "114.73",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "23.8"
                  },
                  {
                    "city": "Heze/Caozhou",
                    "country": "China",
                    "lon": "115.43",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "35.25"
                  },
                  {
                    "city": "Hezuo",
                    "country": "China",
                    "lon": "102.9",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "35"
                  },
                  {
                    "city": "Hoboksar",
                    "country": "China",
                    "lon": "85.72",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "46.78"
                  },
                  {
                    "city": "Hohhot",
                    "country": "China",
                    "lon": "111.68",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "40.82"
                  },
                  {
                    "city": "Hong Kong Internati",
                    "country": "China",
                    "lon": "113.92",
                    "cz": "1A",
                    "file": "0-41415",
                    "lat": "22.32"
                  },
                  {
                    "city": "Hong Kong Observato",
                    "country": "China",
                    "lon": "114.17",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "22.3"
                  },
                  {
                    "city": "Hotan",
                    "country": "China",
                    "lon": "79.93",
                    "cz": "4B",
                    "file": "0-14607",
                    "lat": "37.13"
                  },
                  {
                    "city": "Hua Shan",
                    "country": "China",
                    "lon": "110.08",
                    "cz": "6A",
                    "file": "0-41415",
                    "lat": "34.48"
                  },
                  {
                    "city": "Huade",
                    "country": "China",
                    "lon": "114",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "41.9"
                  },
                  {
                    "city": "Huadian",
                    "country": "China",
                    "lon": "126.75",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "42.98"
                  },
                  {
                    "city": "Huailai",
                    "country": "China",
                    "lon": "115.5",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "40.4"
                  },
                  {
                    "city": "Huajialing",
                    "country": "China",
                    "lon": "105",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "35.38"
                  },
                  {
                    "city": "Huang Shan",
                    "country": "China",
                    "lon": "118.15",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "30.13"
                  },
                  {
                    "city": "Huili",
                    "country": "China",
                    "lon": "102.25",
                    "cz": "3C",
                    "file": "0-41415",
                    "lat": "26.65"
                  },
                  {
                    "city": "Huimin",
                    "country": "China",
                    "lon": "117.53",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "37.5"
                  },
                  {
                    "city": "Huize",
                    "country": "China",
                    "lon": "103.28",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "26.42"
                  },
                  {
                    "city": "Hulin",
                    "country": "China",
                    "lon": "132.97",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "45.77"
                  },
                  {
                    "city": "Huma",
                    "country": "China",
                    "lon": "126.65",
                    "cz": "7",
                    "file": "0-25713",
                    "lat": "51.72"
                  },
                  {
                    "city": "Huoshan",
                    "country": "China",
                    "lon": "116.33",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "31.4"
                  },
                  {
                    "city": "Jartai",
                    "country": "China",
                    "lon": "105.75",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "39.78"
                  },
                  {
                    "city": "Jarud Qi",
                    "country": "China",
                    "lon": "120.9",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "44.57"
                  },
                  {
                    "city": "Jian",
                    "country": "China",
                    "lon": "126.15",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "41.1"
                  },
                  {
                    "city": "Jian",
                    "country": "China",
                    "lon": "114.97",
                    "cz": "6A",
                    "file": "0-41415",
                    "lat": "27.12"
                  },
                  {
                    "city": "Jiangcheng",
                    "country": "China",
                    "lon": "101.82",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "22.62"
                  },
                  {
                    "city": "Jiangling",
                    "country": "China",
                    "lon": "112.18",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "30.33"
                  },
                  {
                    "city": "Jiexiu",
                    "country": "China",
                    "lon": "111.92",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "37.03"
                  },
                  {
                    "city": "Jinan",
                    "country": "China",
                    "lon": "117.05",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "36.6"
                  },
                  {
                    "city": "Jingdezhen",
                    "country": "China",
                    "lon": "117.2",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "29.3"
                  },
                  {
                    "city": "Jinghe",
                    "country": "China",
                    "lon": "82.9",
                    "cz": "6B",
                    "file": "0-14607",
                    "lat": "44.62"
                  },
                  {
                    "city": "Jinghong",
                    "country": "China",
                    "lon": "100.78",
                    "cz": "1A",
                    "file": "0-41415",
                    "lat": "22"
                  },
                  {
                    "city": "Jining",
                    "country": "China",
                    "lon": "113.07",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "41.03"
                  },
                  {
                    "city": "Jinzhou",
                    "country": "China",
                    "lon": "121.12",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "41.13"
                  },
                  {
                    "city": "Jiulong",
                    "country": "China",
                    "lon": "101.5",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "29"
                  },
                  {
                    "city": "Jiuquan",
                    "country": "China",
                    "lon": "98.48",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "39.77"
                  },
                  {
                    "city": "Jiuxian Shan",
                    "country": "China",
                    "lon": "118.1",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "25.72"
                  },
                  {
                    "city": "Jixi",
                    "country": "China",
                    "lon": "130.95",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "45.28"
                  },
                  {
                    "city": "Jurh",
                    "country": "China",
                    "lon": "112.9",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "42.4"
                  },
                  {
                    "city": "Kaba He",
                    "country": "China",
                    "lon": "86.35",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "48.05"
                  },
                  {
                    "city": "Kangding",
                    "country": "China",
                    "lon": "101.97",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "30.05"
                  },
                  {
                    "city": "Karamay",
                    "country": "China",
                    "lon": "84.85",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "45.6"
                  },
                  {
                    "city": "Kashi",
                    "country": "China",
                    "lon": "75.98",
                    "cz": "4B",
                    "file": "0-14607",
                    "lat": "39.47"
                  },
                  {
                    "city": "Keshan",
                    "country": "China",
                    "lon": "125.88",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "48.05"
                  },
                  {
                    "city": "Korla",
                    "country": "China",
                    "lon": "86.13",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "41.75"
                  },
                  {
                    "city": "Kuandian",
                    "country": "China",
                    "lon": "124.78",
                    "cz": "6A",
                    "file": "0-41415",
                    "lat": "40.72"
                  },
                  {
                    "city": "Kunming",
                    "country": "China",
                    "lon": "102.68",
                    "cz": "3C",
                    "file": "0-41415",
                    "lat": "25.02"
                  },
                  {
                    "city": "Kuocang Shan",
                    "country": "China",
                    "lon": "120.92",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "28.82"
                  },
                  {
                    "city": "Kuqa",
                    "country": "China",
                    "lon": "82.95",
                    "cz": "5B",
                    "file": "0-14607",
                    "lat": "41.72"
                  },
                  {
                    "city": "Lancang",
                    "country": "China",
                    "lon": "99.93",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "22.57"
                  },
                  {
                    "city": "Langzhong",
                    "country": "China",
                    "lon": "105.97",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "31.58"
                  },
                  {
                    "city": "Lanzhou",
                    "country": "China",
                    "lon": "103.88",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "36.05"
                  },
                  {
                    "city": "Lenghu",
                    "country": "China",
                    "lon": "93.38",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "38.83"
                  },
                  {
                    "city": "Leting",
                    "country": "China",
                    "lon": "118.9",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "39.43"
                  },
                  {
                    "city": "Lhasa",
                    "country": "China",
                    "lon": "91.13",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "29.67"
                  },
                  {
                    "city": "Lhunze",
                    "country": "China",
                    "lon": "92.47",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "28.42"
                  },
                  {
                    "city": "Lian Xian",
                    "country": "China",
                    "lon": "112.38",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "24.78"
                  },
                  {
                    "city": "Liangping",
                    "country": "China",
                    "lon": "107.8",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "30.68"
                  },
                  {
                    "city": "Lianping",
                    "country": "China",
                    "lon": "114.48",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "24.37"
                  },
                  {
                    "city": "Lijing",
                    "country": "China",
                    "lon": "100.47",
                    "cz": "3C",
                    "file": "0-41415",
                    "lat": "26.83"
                  },
                  {
                    "city": "Lincang",
                    "country": "China",
                    "lon": "100.22",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "23.95"
                  },
                  {
                    "city": "Lindong",
                    "country": "China",
                    "lon": "119.4",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "43.98"
                  },
                  {
                    "city": "Lingling",
                    "country": "China",
                    "lon": "111.62",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "26.23"
                  },
                  {
                    "city": "Lingxian",
                    "country": "China",
                    "lon": "116.57",
                    "cz": "4B",
                    "file": "0-41415",
                    "lat": "37.33"
                  },
                  {
                    "city": "Linhai",
                    "country": "China",
                    "lon": "121.13",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "28.85"
                  },
                  {
                    "city": "Linhe",
                    "country": "China",
                    "lon": "107.4",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "40.77"
                  },
                  {
                    "city": "Linjiang",
                    "country": "China",
                    "lon": "126.92",
                    "cz": "6A",
                    "file": "0-41415",
                    "lat": "41.72"
                  },
                  {
                    "city": "Linxi",
                    "country": "China",
                    "lon": "118.07",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "43.6"
                  },
                  {
                    "city": "Linyi",
                    "country": "China",
                    "lon": "118.35",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "35.05"
                  },
                  {
                    "city": "Lishi",
                    "country": "China",
                    "lon": "111.1",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "37.5"
                  },
                  {
                    "city": "Lishui",
                    "country": "China",
                    "lon": "119.92",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "28.45"
                  },
                  {
                    "city": "Litang",
                    "country": "China",
                    "lon": "100.27",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "30"
                  },
                  {
                    "city": "Liuzhou",
                    "country": "China",
                    "lon": "109.4",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "24.35"
                  },
                  {
                    "city": "Liyang",
                    "country": "China",
                    "lon": "119.48",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "31.43"
                  },
                  {
                    "city": "Longkou",
                    "country": "China",
                    "lon": "120.32",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "37.62"
                  },
                  {
                    "city": "Longyan",
                    "country": "China",
                    "lon": "117.02",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "25.1"
                  },
                  {
                    "city": "Longzhou",
                    "country": "China",
                    "lon": "106.75",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "22.37"
                  },
                  {
                    "city": "Lu Shan",
                    "country": "China",
                    "lon": "115.98",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "29.58"
                  },
                  {
                    "city": "Luodian",
                    "country": "China",
                    "lon": "106.77",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "25.43"
                  },
                  {
                    "city": "Lushi",
                    "country": "China",
                    "lon": "111.03",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "34.05"
                  },
                  {
                    "city": "Lusi",
                    "country": "China",
                    "lon": "121.6",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "32.07"
                  },
                  {
                    "city": "Luxi",
                    "country": "China",
                    "lon": "103.77",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "24.53"
                  },
                  {
                    "city": "Luzhou",
                    "country": "China",
                    "lon": "105.43",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "28.88"
                  },
                  {
                    "city": "Macheng",
                    "country": "China",
                    "lon": "114.97",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "31.18"
                  },
                  {
                    "city": "Madoi",
                    "country": "China",
                    "lon": "98.22",
                    "cz": "8",
                    "file": "0-41415",
                    "lat": "34.92"
                  },
                  {
                    "city": "Mandal",
                    "country": "China",
                    "lon": "110.13",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "42.53"
                  },
                  {
                    "city": "Mangnai",
                    "country": "China",
                    "lon": "90.85",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "38.25"
                  },
                  {
                    "city": "Mazong Shan",
                    "country": "China",
                    "lon": "97.03",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "41.8"
                  },
                  {
                    "city": "Mei Xian",
                    "country": "China",
                    "lon": "116.12",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "24.3"
                  },
                  {
                    "city": "Mengding",
                    "country": "China",
                    "lon": "99.08",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "23.57"
                  },
                  {
                    "city": "Mengjin",
                    "country": "China",
                    "lon": "112.43",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "34.82"
                  },
                  {
                    "city": "Mengla",
                    "country": "China",
                    "lon": "101.58",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "21.5"
                  },
                  {
                    "city": "Mengshan",
                    "country": "China",
                    "lon": "110.52",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "24.2"
                  },
                  {
                    "city": "Mengzi",
                    "country": "China",
                    "lon": "103.38",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "23.38"
                  },
                  {
                    "city": "Mianyang",
                    "country": "China",
                    "lon": "104.73",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "31.45"
                  },
                  {
                    "city": "Minfeng",
                    "country": "China",
                    "lon": "82.72",
                    "cz": "5B",
                    "file": "0-14607",
                    "lat": "37.07"
                  },
                  {
                    "city": "Minqin",
                    "country": "China",
                    "lon": "103.08",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "38.63"
                  },
                  {
                    "city": "Mohe",
                    "country": "China",
                    "lon": "122.52",
                    "cz": "8",
                    "file": "0-25713",
                    "lat": "52.13"
                  },
                  {
                    "city": "Mudanjiang",
                    "country": "China",
                    "lon": "129.6",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "44.57"
                  },
                  {
                    "city": "Nagqu",
                    "country": "China",
                    "lon": "92.07",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "31.48"
                  },
                  {
                    "city": "Nanchang",
                    "country": "China",
                    "lon": "115.92",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "28.6"
                  },
                  {
                    "city": "Nancheng",
                    "country": "China",
                    "lon": "116.65",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "27.58"
                  },
                  {
                    "city": "Nanchong",
                    "country": "China",
                    "lon": "106.08",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "30.8"
                  },
                  {
                    "city": "Nanjing",
                    "country": "China",
                    "lon": "118.8",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "32"
                  },
                  {
                    "city": "Nanning",
                    "country": "China",
                    "lon": "108.35",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "22.82"
                  },
                  {
                    "city": "Nanping",
                    "country": "China",
                    "lon": "118",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "26.63"
                  },
                  {
                    "city": "Nanyang",
                    "country": "China",
                    "lon": "112.58",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "33.03"
                  },
                  {
                    "city": "Nanyue",
                    "country": "China",
                    "lon": "112.7",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "27.3"
                  },
                  {
                    "city": "Napo",
                    "country": "China",
                    "lon": "105.95",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "23.3"
                  },
                  {
                    "city": "Naran Bulag",
                    "country": "China",
                    "lon": "114.15",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "44.62"
                  },
                  {
                    "city": "Neijiang",
                    "country": "China",
                    "lon": "105.05",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "29.58"
                  },
                  {
                    "city": "Nenjiang",
                    "country": "China",
                    "lon": "125.23",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "49.17"
                  },
                  {
                    "city": "Nyingchi",
                    "country": "China",
                    "lon": "94.47",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "29.57"
                  },
                  {
                    "city": "Otog Qi",
                    "country": "China",
                    "lon": "107.98",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "39.1"
                  },
                  {
                    "city": "Pagri",
                    "country": "China",
                    "lon": "89.08",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "27.73"
                  },
                  {
                    "city": "Pingliang",
                    "country": "China",
                    "lon": "106.67",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "35.55"
                  },
                  {
                    "city": "Pingtan",
                    "country": "China",
                    "lon": "119.78",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "25.52"
                  },
                  {
                    "city": "Pingwu",
                    "country": "China",
                    "lon": "104.52",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "32.42"
                  },
                  {
                    "city": "Pishan",
                    "country": "China",
                    "lon": "78.28",
                    "cz": "4B",
                    "file": "0-14607",
                    "lat": "37.62"
                  },
                  {
                    "city": "Potou",
                    "country": "China",
                    "lon": "116.55",
                    "cz": "4B",
                    "file": "0-41415",
                    "lat": "38.08"
                  },
                  {
                    "city": "Pucheng",
                    "country": "China",
                    "lon": "118.53",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "27.92"
                  },
                  {
                    "city": "Qamdo",
                    "country": "China",
                    "lon": "97.17",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "31.15"
                  },
                  {
                    "city": "Qian Gorlos",
                    "country": "China",
                    "lon": "124.87",
                    "cz": "6A",
                    "file": "0-41415",
                    "lat": "45.08"
                  },
                  {
                    "city": "Qiemo/Qarqan",
                    "country": "China",
                    "lon": "85.55",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "38.15"
                  },
                  {
                    "city": "Qingdao",
                    "country": "China",
                    "lon": "120.33",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "36.07"
                  },
                  {
                    "city": "Qingjiang",
                    "country": "China",
                    "lon": "119.03",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "33.6"
                  },
                  {
                    "city": "Qinglong",
                    "country": "China",
                    "lon": "118.95",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "40.4"
                  },
                  {
                    "city": "Qingyuan",
                    "country": "China",
                    "lon": "124.95",
                    "cz": "6A",
                    "file": "0-41415",
                    "lat": "42.1"
                  },
                  {
                    "city": "Qinzhou",
                    "country": "China",
                    "lon": "108.62",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "21.95"
                  },
                  {
                    "city": "Qionghai",
                    "country": "China",
                    "lon": "110.47",
                    "cz": "1A",
                    "file": "0-41415",
                    "lat": "19.23"
                  },
                  {
                    "city": "Qiqihar",
                    "country": "China",
                    "lon": "123.92",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "47.38"
                  },
                  {
                    "city": "Qitai",
                    "country": "China",
                    "lon": "89.57",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "44.02"
                  },
                  {
                    "city": "Qixian Shan",
                    "country": "China",
                    "lon": "117.83",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "27.95"
                  },
                  {
                    "city": "Qu Xian",
                    "country": "China",
                    "lon": "118.87",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "28.97"
                  },
                  {
                    "city": "Qumarleb",
                    "country": "China",
                    "lon": "95.78",
                    "cz": "8",
                    "file": "0-41415",
                    "lat": "34.13"
                  },
                  {
                    "city": "Rizhao",
                    "country": "China",
                    "lon": "119.53",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "35.43"
                  },
                  {
                    "city": "Rongjiang",
                    "country": "China",
                    "lon": "108.53",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "25.97"
                  },
                  {
                    "city": "Ruili",
                    "country": "China",
                    "lon": "97.83",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "24.02"
                  },
                  {
                    "city": "Ruoergai",
                    "country": "China",
                    "lon": "102.97",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "33.58"
                  },
                  {
                    "city": "Ruoqiang",
                    "country": "China",
                    "lon": "88.17",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "39.03"
                  },
                  {
                    "city": "Sangzhi",
                    "country": "China",
                    "lon": "110.17",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "29.4"
                  },
                  {
                    "city": "Sanhu Dao",
                    "country": "China",
                    "lon": "111.62",
                    "cz": "1A",
                    "file": "0-41415",
                    "lat": "16.53"
                  },
                  {
                    "city": "Sansui",
                    "country": "China",
                    "lon": "108.67",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "26.97"
                  },
                  {
                    "city": "Sertar",
                    "country": "China",
                    "lon": "100.33",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "32.28"
                  },
                  {
                    "city": "Shache",
                    "country": "China",
                    "lon": "77.27",
                    "cz": "4B",
                    "file": "0-14607",
                    "lat": "38.43"
                  },
                  {
                    "city": "Shangchuan Dao",
                    "country": "China",
                    "lon": "112.77",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "21.73"
                  },
                  {
                    "city": "Shanghai",
                    "country": "China",
                    "lon": "121.47",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "31.4"
                  },
                  {
                    "city": "Shanghai/Hongqiao",
                    "country": "China",
                    "lon": "121.43",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "31.17"
                  },
                  {
                    "city": "Shangzhi",
                    "country": "China",
                    "lon": "127.97",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "45.22"
                  },
                  {
                    "city": "Shantou",
                    "country": "China",
                    "lon": "116.68",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "23.4"
                  },
                  {
                    "city": "Shanwei",
                    "country": "China",
                    "lon": "115.37",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "22.78"
                  },
                  {
                    "city": "Shaoguan",
                    "country": "China",
                    "lon": "113.58",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "24.8"
                  },
                  {
                    "city": "Shaowu",
                    "country": "China",
                    "lon": "117.47",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "27.33"
                  },
                  {
                    "city": "Shaoyang",
                    "country": "China",
                    "lon": "111.47",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "27.23"
                  },
                  {
                    "city": "Sheng Shang",
                    "country": "China",
                    "lon": "122.82",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "30.72"
                  },
                  {
                    "city": "Shengsi",
                    "country": "China",
                    "lon": "122.45",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "30.73"
                  },
                  {
                    "city": "Shengxian",
                    "country": "China",
                    "lon": "120.82",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "29.6"
                  },
                  {
                    "city": "Shenyang",
                    "country": "China",
                    "lon": "123.52",
                    "cz": "6A",
                    "file": "0-41415",
                    "lat": "41.73"
                  },
                  {
                    "city": "Shenzhen",
                    "country": "China",
                    "lon": "114.1",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "22.55"
                  },
                  {
                    "city": "Sheyang",
                    "country": "China",
                    "lon": "120.25",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "33.77"
                  },
                  {
                    "city": "Shijiazhuang",
                    "country": "China",
                    "lon": "114.42",
                    "cz": "4B",
                    "file": "0-41415",
                    "lat": "38.03"
                  },
                  {
                    "city": "Shipu",
                    "country": "China",
                    "lon": "121.95",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "29.2"
                  },
                  {
                    "city": "Shiquanhe",
                    "country": "China",
                    "lon": "80.08",
                    "cz": "7",
                    "file": "0-14607",
                    "lat": "32.5"
                  },
                  {
                    "city": "Shisanjianfang",
                    "country": "China",
                    "lon": "91.73",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "43.22"
                  },
                  {
                    "city": "Simao",
                    "country": "China",
                    "lon": "100.98",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "22.77"
                  },
                  {
                    "city": "Sinan",
                    "country": "China",
                    "lon": "108.25",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "27.95"
                  },
                  {
                    "city": "Siping",
                    "country": "China",
                    "lon": "124.33",
                    "cz": "6A",
                    "file": "0-41415",
                    "lat": "43.18"
                  },
                  {
                    "city": "Sog Xian",
                    "country": "China",
                    "lon": "93.78",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "31.88"
                  },
                  {
                    "city": "Songpan",
                    "country": "China",
                    "lon": "103.57",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "32.65"
                  },
                  {
                    "city": "Suifenhe",
                    "country": "China",
                    "lon": "131.15",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "44.38"
                  },
                  {
                    "city": "Sunwu",
                    "country": "China",
                    "lon": "127.35",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "49.43"
                  },
                  {
                    "city": "Tacheng",
                    "country": "China",
                    "lon": "83",
                    "cz": "6B",
                    "file": "0-14607",
                    "lat": "46.73"
                  },
                  {
                    "city": "Tai Shan",
                    "country": "China",
                    "lon": "117.1",
                    "cz": "6A",
                    "file": "0-41415",
                    "lat": "36.25"
                  },
                  {
                    "city": "Tailai",
                    "country": "China",
                    "lon": "123.42",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "46.4"
                  },
                  {
                    "city": "Taishan",
                    "country": "China",
                    "lon": "120.7",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "27"
                  },
                  {
                    "city": "Taiyuan",
                    "country": "China",
                    "lon": "112.55",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "37.78"
                  },
                  {
                    "city": "Tangshan",
                    "country": "China",
                    "lon": "118.15",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "39.67"
                  },
                  {
                    "city": "Taoxian",
                    "country": "China",
                    "lon": "123.48",
                    "cz": "6A",
                    "file": "0-41415",
                    "lat": "41.63"
                  },
                  {
                    "city": "Tengchong",
                    "country": "China",
                    "lon": "98.48",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "25.12"
                  },
                  {
                    "city": "Tianjin",
                    "country": "China",
                    "lon": "117.17",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "39.1"
                  },
                  {
                    "city": "Tianmu Shan (Mtns)",
                    "country": "China",
                    "lon": "119.42",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "30.35"
                  },
                  {
                    "city": "Tianshui",
                    "country": "China",
                    "lon": "105.75",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "34.58"
                  },
                  {
                    "city": "Tikanlik",
                    "country": "China",
                    "lon": "87.7",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "40.63"
                  },
                  {
                    "city": "Tingri",
                    "country": "China",
                    "lon": "87.08",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "28.63"
                  },
                  {
                    "city": "Tongchuan",
                    "country": "China",
                    "lon": "109.05",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "35.17"
                  },
                  {
                    "city": "Tongdao",
                    "country": "China",
                    "lon": "109.78",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "26.17"
                  },
                  {
                    "city": "Tongde",
                    "country": "China",
                    "lon": "100.65",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "35.27"
                  },
                  {
                    "city": "Tonghe",
                    "country": "China",
                    "lon": "128.73",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "45.97"
                  },
                  {
                    "city": "Tongliao",
                    "country": "China",
                    "lon": "122.27",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "43.6"
                  },
                  {
                    "city": "Truong Sa",
                    "country": "China",
                    "lon": "111.92",
                    "cz": "1A",
                    "file": "0-41415",
                    "lat": "8.65"
                  },
                  {
                    "city": "Tulihe",
                    "country": "China",
                    "lon": "121.7",
                    "cz": "8",
                    "file": "0-41415",
                    "lat": "50.45"
                  },
                  {
                    "city": "Tuotuohe",
                    "country": "China",
                    "lon": "92.43",
                    "cz": "8",
                    "file": "0-41415",
                    "lat": "34.22"
                  },
                  {
                    "city": "Turpan",
                    "country": "China",
                    "lon": "89.2",
                    "cz": "4B",
                    "file": "0-41415",
                    "lat": "42.93"
                  },
                  {
                    "city": "Uliastai",
                    "country": "China",
                    "lon": "116.97",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "45.52"
                  },
                  {
                    "city": "Wanyuan",
                    "country": "China",
                    "lon": "108.03",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "32.07"
                  },
                  {
                    "city": "Weichang",
                    "country": "China",
                    "lon": "117.75",
                    "cz": "6A",
                    "file": "0-41415",
                    "lat": "41.93"
                  },
                  {
                    "city": "Weifang",
                    "country": "China",
                    "lon": "119.18",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "36.77"
                  },
                  {
                    "city": "Weining",
                    "country": "China",
                    "lon": "104.28",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "26.87"
                  },
                  {
                    "city": "Wenzhou",
                    "country": "China",
                    "lon": "120.67",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "28.02"
                  },
                  {
                    "city": "Wu Lu Mu Qi",
                    "country": "China",
                    "lon": "87.65",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "43.8"
                  },
                  {
                    "city": "Wudaoliang",
                    "country": "China",
                    "lon": "93.08",
                    "cz": "8",
                    "file": "0-41415",
                    "lat": "35.22"
                  },
                  {
                    "city": "Wudu",
                    "country": "China",
                    "lon": "104.92",
                    "cz": "3B",
                    "file": "0-41415",
                    "lat": "33.4"
                  },
                  {
                    "city": "Wugang",
                    "country": "China",
                    "lon": "110.63",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "26.73"
                  },
                  {
                    "city": "Wuhan",
                    "country": "China",
                    "lon": "114.13",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "30.62"
                  },
                  {
                    "city": "Wuhu",
                    "country": "China",
                    "lon": "118.35",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "31.33"
                  },
                  {
                    "city": "Wushaoling",
                    "country": "China",
                    "lon": "102.87",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "37.2"
                  },
                  {
                    "city": "Wutai Shan",
                    "country": "China",
                    "lon": "113.52",
                    "cz": "8",
                    "file": "0-41415",
                    "lat": "38.95"
                  },
                  {
                    "city": "Wuyishan",
                    "country": "China",
                    "lon": "118.03",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "27.77"
                  },
                  {
                    "city": "Wuzhou",
                    "country": "China",
                    "lon": "111.3",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "23.48"
                  },
                  {
                    "city": "Xainza",
                    "country": "China",
                    "lon": "88.63",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "30.95"
                  },
                  {
                    "city": "Xi Ujimqin Qi",
                    "country": "China",
                    "lon": "117.6",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "44.58"
                  },
                  {
                    "city": "Xiamen",
                    "country": "China",
                    "lon": "118.08",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "24.48"
                  },
                  {
                    "city": "Xian",
                    "country": "China",
                    "lon": "108.93",
                    "cz": "4B",
                    "file": "0-41415",
                    "lat": "34.3"
                  },
                  {
                    "city": "Xiaoergou",
                    "country": "China",
                    "lon": "123.72",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "49.2"
                  },
                  {
                    "city": "Xichang",
                    "country": "China",
                    "lon": "102.27",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "27.9"
                  },
                  {
                    "city": "Xifengzhen",
                    "country": "China",
                    "lon": "107.63",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "35.73"
                  },
                  {
                    "city": "Xigaze",
                    "country": "China",
                    "lon": "88.88",
                    "cz": "6C",
                    "file": "0-41415",
                    "lat": "29.25"
                  },
                  {
                    "city": "Xihua",
                    "country": "China",
                    "lon": "114.52",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "33.78"
                  },
                  {
                    "city": "Xilin Hot",
                    "country": "China",
                    "lon": "116.12",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "43.95"
                  },
                  {
                    "city": "Xin Barag Youqi",
                    "country": "China",
                    "lon": "116.82",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "48.67"
                  },
                  {
                    "city": "Xingren",
                    "country": "China",
                    "lon": "105.18",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "25.43"
                  },
                  {
                    "city": "Xingtai",
                    "country": "China",
                    "lon": "114.5",
                    "cz": "4B",
                    "file": "0-41415",
                    "lat": "37.07"
                  },
                  {
                    "city": "Xining",
                    "country": "China",
                    "lon": "101.77",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "36.62"
                  },
                  {
                    "city": "Xinxian",
                    "country": "China",
                    "lon": "115.67",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "36.23"
                  },
                  {
                    "city": "Xinyang",
                    "country": "China",
                    "lon": "114.05",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "32.13"
                  },
                  {
                    "city": "Xinyi",
                    "country": "China",
                    "lon": "110.93",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "22.35"
                  },
                  {
                    "city": "Xisha Dao",
                    "country": "China",
                    "lon": "112.33",
                    "cz": "1A",
                    "file": "0-41415",
                    "lat": "16.83"
                  },
                  {
                    "city": "Xiushui",
                    "country": "China",
                    "lon": "114.58",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "29.03"
                  },
                  {
                    "city": "Xunwu",
                    "country": "China",
                    "lon": "115.65",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "24.95"
                  },
                  {
                    "city": "Xuzhou",
                    "country": "China",
                    "lon": "117.15",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "34.28"
                  },
                  {
                    "city": "Yaan",
                    "country": "China",
                    "lon": "103",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "29.98"
                  },
                  {
                    "city": "Yan An",
                    "country": "China",
                    "lon": "109.5",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "36.6"
                  },
                  {
                    "city": "Yanchi",
                    "country": "China",
                    "lon": "107.38",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "37.8"
                  },
                  {
                    "city": "Yangcheng",
                    "country": "China",
                    "lon": "112.4",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "35.48"
                  },
                  {
                    "city": "Yangjiang",
                    "country": "China",
                    "lon": "111.97",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "21.87"
                  },
                  {
                    "city": "Yanji",
                    "country": "China",
                    "lon": "129.5",
                    "cz": "6A",
                    "file": "0-41415",
                    "lat": "42.87"
                  },
                  {
                    "city": "Yanzhou",
                    "country": "China",
                    "lon": "116.85",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "35.57"
                  },
                  {
                    "city": "Yaxian",
                    "country": "China",
                    "lon": "109.52",
                    "cz": "1A",
                    "file": "0-41415",
                    "lat": "18.23"
                  },
                  {
                    "city": "Yibin",
                    "country": "China",
                    "lon": "104.6",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "28.8"
                  },
                  {
                    "city": "Yichang",
                    "country": "China",
                    "lon": "111.3",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "30.7"
                  },
                  {
                    "city": "Yichun",
                    "country": "China",
                    "lon": "128.9",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "47.72"
                  },
                  {
                    "city": "Yichun",
                    "country": "China",
                    "lon": "114.38",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "27.8"
                  },
                  {
                    "city": "Yinchuan",
                    "country": "China",
                    "lon": "106.2",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "38.47"
                  },
                  {
                    "city": "Yingkou",
                    "country": "China",
                    "lon": "122.2",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "40.67"
                  },
                  {
                    "city": "Yining",
                    "country": "China",
                    "lon": "81.33",
                    "cz": "5B",
                    "file": "0-14607",
                    "lat": "43.95"
                  },
                  {
                    "city": "Yiwu",
                    "country": "China",
                    "lon": "94.7",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "43.27"
                  },
                  {
                    "city": "Yiyuan",
                    "country": "China",
                    "lon": "118.15",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "36.18"
                  },
                  {
                    "city": "Yongan",
                    "country": "China",
                    "lon": "117.35",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "25.97"
                  },
                  {
                    "city": "Youyang",
                    "country": "China",
                    "lon": "108.77",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "28.83"
                  },
                  {
                    "city": "Yu Xian",
                    "country": "China",
                    "lon": "114.57",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "39.83"
                  },
                  {
                    "city": "Yuanjiang",
                    "country": "China",
                    "lon": "101.98",
                    "cz": "1A",
                    "file": "0-41415",
                    "lat": "23.6"
                  },
                  {
                    "city": "Yuanling",
                    "country": "China",
                    "lon": "110.4",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "28.47"
                  },
                  {
                    "city": "Yuanmou",
                    "country": "China",
                    "lon": "101.87",
                    "cz": "2B",
                    "file": "0-41415",
                    "lat": "25.73"
                  },
                  {
                    "city": "Yuanping",
                    "country": "China",
                    "lon": "112.7",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "38.75"
                  },
                  {
                    "city": "Yueyang",
                    "country": "China",
                    "lon": "113.08",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "29.38"
                  },
                  {
                    "city": "Yulin",
                    "country": "China",
                    "lon": "109.7",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "38.23"
                  },
                  {
                    "city": "Yumenzhen",
                    "country": "China",
                    "lon": "97.03",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "40.27"
                  },
                  {
                    "city": "Yumenzhen",
                    "country": "China",
                    "lon": "97.03",
                    "cz": "6B",
                    "file": "0-41415",
                    "lat": "40.27"
                  },
                  {
                    "city": "Yuncheng",
                    "country": "China",
                    "lon": "111.05",
                    "cz": "4B",
                    "file": "0-41415",
                    "lat": "35.05"
                  },
                  {
                    "city": "Yushe",
                    "country": "China",
                    "lon": "112.98",
                    "cz": "5A",
                    "file": "0-41415",
                    "lat": "37.07"
                  },
                  {
                    "city": "Yushu",
                    "country": "China",
                    "lon": "97.02",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "33.02"
                  },
                  {
                    "city": "Yutian/Keriya",
                    "country": "China",
                    "lon": "81.7",
                    "cz": "5B",
                    "file": "0-14607",
                    "lat": "36.87"
                  },
                  {
                    "city": "Zadoi",
                    "country": "China",
                    "lon": "95.3",
                    "cz": "7",
                    "file": "0-41415",
                    "lat": "32.9"
                  },
                  {
                    "city": "Zaoyang",
                    "country": "China",
                    "lon": "112.67",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "32.15"
                  },
                  {
                    "city": "Zhang Ping",
                    "country": "China",
                    "lon": "117.4",
                    "cz": "2A",
                    "file": "0-41415",
                    "lat": "25.3"
                  },
                  {
                    "city": "Zhangjiakou",
                    "country": "China",
                    "lon": "114.88",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "40.78"
                  },
                  {
                    "city": "Zhangwu",
                    "country": "China",
                    "lon": "122.53",
                    "cz": "6A",
                    "file": "0-41415",
                    "lat": "42.42"
                  },
                  {
                    "city": "Zhangye",
                    "country": "China",
                    "lon": "100.43",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "38.93"
                  },
                  {
                    "city": "Zhanjiang",
                    "country": "China",
                    "lon": "110.4",
                    "cz": "1A",
                    "file": "0-41415",
                    "lat": "21.22"
                  },
                  {
                    "city": "Zhanyi",
                    "country": "China",
                    "lon": "103.83",
                    "cz": "3C",
                    "file": "0-41415",
                    "lat": "25.58"
                  },
                  {
                    "city": "Zhaotong",
                    "country": "China",
                    "lon": "103.75",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "27.33"
                  },
                  {
                    "city": "Zhengzhou",
                    "country": "China",
                    "lon": "113.65",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "34.72"
                  },
                  {
                    "city": "Zhijiang",
                    "country": "China",
                    "lon": "109.68",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "27.45"
                  },
                  {
                    "city": "Zhongning",
                    "country": "China",
                    "lon": "105.68",
                    "cz": "5B",
                    "file": "0-41415",
                    "lat": "37.48"
                  },
                  {
                    "city": "Zhongxiang",
                    "country": "China",
                    "lon": "112.57",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "31.17"
                  },
                  {
                    "city": "Zhumadian",
                    "country": "China",
                    "lon": "114.02",
                    "cz": "4A",
                    "file": "0-41415",
                    "lat": "33"
                  },
                  {
                    "city": "Zunyi",
                    "country": "China",
                    "lon": "106.88",
                    "cz": "3A",
                    "file": "0-41415",
                    "lat": "27.7"
                  }



                ]

            };




  };
  DashboardCtrl.$inject = ['$rootScope', '$scope', '$window','$sce','$timeout', '$q', '$log', 'benchmarkServices'];
  return {
    DashboardCtrl: DashboardCtrl,
    RootCtrl: RootCtrl    

  };
});
