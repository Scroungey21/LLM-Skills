import React from "react";
import {Composition, Folder, Still} from "remotion";
import {HiddenSystemsThumbnail, HiddenSystemsVideo} from "./DoodleVideo";
import {IconAtlas} from "./IconAtlas";
import toiletPackage from "../../../../../hidden-everyday-systems/examples/toilet-water/package.json";
import electricityPackage from "../../../../../hidden-everyday-systems/examples/electricity-to-outlet/package.json";
import birdsPackage from "../../../../../hidden-everyday-systems/examples/birds-on-wires/package.json";
import trashPackage from "../../../../../hidden-everyday-systems/examples/trash-collection/package.json";
import crosswalkPackage from "../../../../../hidden-everyday-systems/examples/crosswalk-button/package.json";
import sewerSmellPackage from "../../../../../hidden-everyday-systems/examples/sewer-smell-trap/package.json";
import toiletLong from "../../../../../hidden-everyday-systems/examples/toilet-water/render.long.json";
import toiletShort from "../../../../../hidden-everyday-systems/examples/toilet-water/render.short.json";
import electricityLong from "../../../../../hidden-everyday-systems/examples/electricity-to-outlet/render.long.json";
import electricityShort from "../../../../../hidden-everyday-systems/examples/electricity-to-outlet/render.short.json";
import birdsLong from "../../../../../hidden-everyday-systems/examples/birds-on-wires/render.long.json";
import birdsShort from "../../../../../hidden-everyday-systems/examples/birds-on-wires/render.short.json";
import trashLong from "../../../../../hidden-everyday-systems/examples/trash-collection/render.long.json";
import trashShort from "../../../../../hidden-everyday-systems/examples/trash-collection/render.short.json";
import crosswalkLong from "../../../../../hidden-everyday-systems/examples/crosswalk-button/render.long.json";
import crosswalkShort from "../../../../../hidden-everyday-systems/examples/crosswalk-button/render.short.json";
import sewerSmellLong from "../../../../../hidden-everyday-systems/examples/sewer-smell-trap/render.long.json";
import sewerSmellShort from "../../../../../hidden-everyday-systems/examples/sewer-smell-trap/render.short.json";
import tapWaterPackage from "../../../../../hidden-everyday-systems/examples/tap-water-treatment/package.json";
import waterMeterPackage from "../../../../../hidden-everyday-systems/examples/water-meter/package.json";
import breakerPanelPackage from "../../../../../hidden-everyday-systems/examples/breaker-panel/package.json";
import streetlightsPackage from "../../../../../hidden-everyday-systems/examples/streetlights/package.json";
import waterTowerPackage from "../../../../../hidden-everyday-systems/examples/water-tower/package.json";
import tapWaterLong from "../../../../../hidden-everyday-systems/examples/tap-water-treatment/render.long.json";
import tapWaterShort from "../../../../../hidden-everyday-systems/examples/tap-water-treatment/render.short.json";
import waterMeterLong from "../../../../../hidden-everyday-systems/examples/water-meter/render.long.json";
import waterMeterShort from "../../../../../hidden-everyday-systems/examples/water-meter/render.short.json";
import breakerPanelLong from "../../../../../hidden-everyday-systems/examples/breaker-panel/render.long.json";
import breakerPanelShort from "../../../../../hidden-everyday-systems/examples/breaker-panel/render.short.json";
import streetlightsLong from "../../../../../hidden-everyday-systems/examples/streetlights/render.long.json";
import streetlightsShort from "../../../../../hidden-everyday-systems/examples/streetlights/render.short.json";
import waterTowerLong from "../../../../../hidden-everyday-systems/examples/water-tower/render.long.json";
import waterTowerShort from "../../../../../hidden-everyday-systems/examples/water-tower/render.short.json";
import recyclingSortingPackage from "../../../../../hidden-everyday-systems/examples/recycling-sorting/package.json";
import stormSewersPackage from "../../../../../hidden-everyday-systems/examples/storm-sewers/package.json";
import solarGridPackage from "../../../../../hidden-everyday-systems/examples/solar-grid/package.json";
import windTransmissionPackage from "../../../../../hidden-everyday-systems/examples/wind-transmission/package.json";
import wasteToEnergyPackage from "../../../../../hidden-everyday-systems/examples/waste-to-energy/package.json";
import recyclingSortingLong from "../../../../../hidden-everyday-systems/examples/recycling-sorting/render.long.json";
import recyclingSortingShort from "../../../../../hidden-everyday-systems/examples/recycling-sorting/render.short.json";
import stormSewersLong from "../../../../../hidden-everyday-systems/examples/storm-sewers/render.long.json";
import stormSewersShort from "../../../../../hidden-everyday-systems/examples/storm-sewers/render.short.json";
import solarGridLong from "../../../../../hidden-everyday-systems/examples/solar-grid/render.long.json";
import solarGridShort from "../../../../../hidden-everyday-systems/examples/solar-grid/render.short.json";
import windTransmissionLong from "../../../../../hidden-everyday-systems/examples/wind-transmission/render.long.json";
import windTransmissionShort from "../../../../../hidden-everyday-systems/examples/wind-transmission/render.short.json";
import wasteToEnergyLong from "../../../../../hidden-everyday-systems/examples/waste-to-energy/render.long.json";
import wasteToEnergyShort from "../../../../../hidden-everyday-systems/examples/waste-to-energy/render.short.json";
import refrigeratorPackage from "../../../../../hidden-everyday-systems/examples/refrigerator-heat-pump/package.json";
import gasOdorizationPackage from "../../../../../hidden-everyday-systems/examples/gas-odorization/package.json";
import wifiSharingPackage from "../../../../../hidden-everyday-systems/examples/wifi-channel-sharing/package.json";
import elevatorDispatchPackage from "../../../../../hidden-everyday-systems/examples/elevator-dispatch/package.json";
import trafficLightSyncPackage from "../../../../../hidden-everyday-systems/examples/traffic-light-sync/package.json";
import smokeDetectorPackage from "../../../../../hidden-everyday-systems/examples/smoke-detector-types/package.json";
import refrigeratorLong from "../../../../../hidden-everyday-systems/examples/refrigerator-heat-pump/render.long.json";
import refrigeratorShort from "../../../../../hidden-everyday-systems/examples/refrigerator-heat-pump/render.short.json";
import gasOdorizationLong from "../../../../../hidden-everyday-systems/examples/gas-odorization/render.long.json";
import gasOdorizationShort from "../../../../../hidden-everyday-systems/examples/gas-odorization/render.short.json";
import wifiSharingLong from "../../../../../hidden-everyday-systems/examples/wifi-channel-sharing/render.long.json";
import wifiSharingShort from "../../../../../hidden-everyday-systems/examples/wifi-channel-sharing/render.short.json";
import elevatorDispatchLong from "../../../../../hidden-everyday-systems/examples/elevator-dispatch/render.long.json";
import elevatorDispatchShort from "../../../../../hidden-everyday-systems/examples/elevator-dispatch/render.short.json";
import trafficLightSyncLong from "../../../../../hidden-everyday-systems/examples/traffic-light-sync/render.long.json";
import trafficLightSyncShort from "../../../../../hidden-everyday-systems/examples/traffic-light-sync/render.short.json";
import smokeDetectorLong from "../../../../../hidden-everyday-systems/examples/smoke-detector-types/render.long.json";
import smokeDetectorShort from "../../../../../hidden-everyday-systems/examples/smoke-detector-types/render.short.json";
import type {EditorialPackage, RenderTiming} from "./types";

const FPS = 30;

export const PilotRoot: React.FC = () => <>
  <Folder name="Hidden-Systems-Pilots">
    <Still id="HiddenSystems-IconAtlas" component={IconAtlas} width={1920} height={1080}/>
    <Composition id="ToiletWater-Long" component={HiddenSystemsVideo} fps={FPS} width={1920} height={1080} durationInFrames={Math.ceil((toiletLong.audio_duration_ms/1000)*FPS)} defaultProps={{content:toiletPackage as EditorialPackage,timing:toiletLong as RenderTiming,variant:"long"}}/>
    <Composition id="ToiletWater-Short" component={HiddenSystemsVideo} fps={FPS} width={1080} height={1920} durationInFrames={Math.ceil((toiletShort.audio_duration_ms/1000)*FPS)} defaultProps={{content:toiletPackage as EditorialPackage,timing:toiletShort as RenderTiming,variant:"short"}}/>
    <Still id="ToiletWater-Thumbnail" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:toiletPackage as EditorialPackage}}/>
    <Still id="ToiletWater-ThumbnailB" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:{...toiletPackage,thumbnail:{text:"IT DIDN'T DISAPPEAR",subtext:"MILES OF PIPES BENEATH YOU",accent:"#28B8D5",icon:"sewer"}} as unknown as EditorialPackage}}/>
    <Still id="ToiletWater-ThumbnailC" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:{...toiletPackage,thumbnail:{text:"FLUSH \u2192 TREATMENT PLANT",subtext:"ONE JOURNEY, ONE CITY",accent:"#28B8D5",icon:"plant"}} as unknown as EditorialPackage}}/>
    <Composition id="ElectricityOutlet-Long" component={HiddenSystemsVideo} fps={FPS} width={1920} height={1080} durationInFrames={Math.ceil((electricityLong.audio_duration_ms/1000)*FPS)} defaultProps={{content:electricityPackage as EditorialPackage,timing:electricityLong as RenderTiming,variant:"long"}}/>
    <Composition id="ElectricityOutlet-Short" component={HiddenSystemsVideo} fps={FPS} width={1080} height={1920} durationInFrames={Math.ceil((electricityShort.audio_duration_ms/1000)*FPS)} defaultProps={{content:electricityPackage as EditorialPackage,timing:electricityShort as RenderTiming,variant:"short"}}/>
    <Still id="ElectricityOutlet-Thumbnail" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:electricityPackage as EditorialPackage}}/>
    <Still id="ElectricityOutlet-ThumbnailB" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:{...electricityPackage,thumbnail:{text:"HUNDREDS OF MILES LONG",subtext:"ONE MACHINE, ONE OUTLET",accent:"#FFD33D",icon:"outlet"}} as unknown as EditorialPackage}}/>
    <Still id="ElectricityOutlet-ThumbnailC" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:{...electricityPackage,thumbnail:{text:"NOT WHERE YOU THINK",subtext:"PLANT \u2192 GRID \u2192 WALL",accent:"#FFD33D",icon:"plant"}} as unknown as EditorialPackage}}/>
    <Composition id="BirdsPowerLines-Long" component={HiddenSystemsVideo} fps={FPS} width={1920} height={1080} durationInFrames={Math.ceil((birdsLong.audio_duration_ms/1000)*FPS)} defaultProps={{content:birdsPackage as EditorialPackage,timing:birdsLong as RenderTiming,variant:"long"}}/>
    <Composition id="BirdsPowerLines-Short" component={HiddenSystemsVideo} fps={FPS} width={1080} height={1920} durationInFrames={Math.ceil((birdsShort.audio_duration_ms/1000)*FPS)} defaultProps={{content:birdsPackage as EditorialPackage,timing:birdsShort as RenderTiming,variant:"short"}}/>
    <Still id="BirdsPowerLines-Thumbnail" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:birdsPackage as EditorialPackage}}/>
    <Still id="BirdsPowerLines-ThumbnailB" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:{...birdsPackage,thumbnail:{text:"50,000 V",subtext:"THIS BIRD DOESN'T CARE",accent:"#F2A33D",icon:"bird-wire-closeup"}} as unknown as EditorialPackage}}/>
    <Still id="BirdsPowerLines-ThumbnailC" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:{...birdsPackage,thumbnail:{text:"SAME WIRE, SAME VOLTAGE",subtext:"THAT'S WHY IT LIVES",accent:"#F2A33D",icon:"bird-wire-closeup"}} as unknown as EditorialPackage}}/>
    <Composition id="TrashCollection-Long" component={HiddenSystemsVideo} fps={FPS} width={1920} height={1080} durationInFrames={Math.ceil((trashLong.audio_duration_ms/1000)*FPS)} defaultProps={{content:trashPackage as EditorialPackage,timing:trashLong as RenderTiming,variant:"long"}}/>
    <Composition id="TrashCollection-Short" component={HiddenSystemsVideo} fps={FPS} width={1080} height={1920} durationInFrames={Math.ceil((trashShort.audio_duration_ms/1000)*FPS)} defaultProps={{content:trashPackage as EditorialPackage,timing:trashShort as RenderTiming,variant:"short"}}/>
    <Still id="TrashCollection-Thumbnail" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:trashPackage as EditorialPackage}}/>
    <Composition id="CrosswalkButton-Long" component={HiddenSystemsVideo} fps={FPS} width={1920} height={1080} durationInFrames={Math.ceil((crosswalkLong.audio_duration_ms/1000)*FPS)} defaultProps={{content:crosswalkPackage as EditorialPackage,timing:crosswalkLong as RenderTiming,variant:"long"}}/>
    <Composition id="CrosswalkButton-Short" component={HiddenSystemsVideo} fps={FPS} width={1080} height={1920} durationInFrames={Math.ceil((crosswalkShort.audio_duration_ms/1000)*FPS)} defaultProps={{content:crosswalkPackage as EditorialPackage,timing:crosswalkShort as RenderTiming,variant:"short"}}/>
    <Still id="CrosswalkButton-Thumbnail" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:crosswalkPackage as EditorialPackage}}/>
    <Composition id="SewerSmellTrap-Long" component={HiddenSystemsVideo} fps={FPS} width={1920} height={1080} durationInFrames={Math.ceil((sewerSmellLong.audio_duration_ms/1000)*FPS)} defaultProps={{content:sewerSmellPackage as EditorialPackage,timing:sewerSmellLong as RenderTiming,variant:"long"}}/>
    <Composition id="SewerSmellTrap-Short" component={HiddenSystemsVideo} fps={FPS} width={1080} height={1920} durationInFrames={Math.ceil((sewerSmellShort.audio_duration_ms/1000)*FPS)} defaultProps={{content:sewerSmellPackage as EditorialPackage,timing:sewerSmellShort as RenderTiming,variant:"short"}}/>
    <Still id="SewerSmellTrap-Thumbnail" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:sewerSmellPackage as EditorialPackage}}/>
    <Composition id="TapWaterTreatment-Long" component={HiddenSystemsVideo} fps={FPS} width={1920} height={1080} durationInFrames={Math.ceil((tapWaterLong.audio_duration_ms/1000)*FPS)} defaultProps={{content:tapWaterPackage as EditorialPackage,timing:tapWaterLong as RenderTiming,variant:"long"}}/>
    <Composition id="TapWaterTreatment-Short" component={HiddenSystemsVideo} fps={FPS} width={1080} height={1920} durationInFrames={Math.ceil((tapWaterShort.audio_duration_ms/1000)*FPS)} defaultProps={{content:tapWaterPackage as EditorialPackage,timing:tapWaterShort as RenderTiming,variant:"short"}}/>
    <Still id="TapWaterTreatment-Thumbnail" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:tapWaterPackage as EditorialPackage}}/>
    <Composition id="WaterMeter-Long" component={HiddenSystemsVideo} fps={FPS} width={1920} height={1080} durationInFrames={Math.ceil((waterMeterLong.audio_duration_ms/1000)*FPS)} defaultProps={{content:waterMeterPackage as EditorialPackage,timing:waterMeterLong as RenderTiming,variant:"long"}}/>
    <Composition id="WaterMeter-Short" component={HiddenSystemsVideo} fps={FPS} width={1080} height={1920} durationInFrames={Math.ceil((waterMeterShort.audio_duration_ms/1000)*FPS)} defaultProps={{content:waterMeterPackage as EditorialPackage,timing:waterMeterShort as RenderTiming,variant:"short"}}/>
    <Still id="WaterMeter-Thumbnail" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:waterMeterPackage as EditorialPackage}}/>
    <Composition id="BreakerPanel-Long" component={HiddenSystemsVideo} fps={FPS} width={1920} height={1080} durationInFrames={Math.ceil((breakerPanelLong.audio_duration_ms/1000)*FPS)} defaultProps={{content:breakerPanelPackage as EditorialPackage,timing:breakerPanelLong as RenderTiming,variant:"long"}}/>
    <Composition id="BreakerPanel-Short" component={HiddenSystemsVideo} fps={FPS} width={1080} height={1920} durationInFrames={Math.ceil((breakerPanelShort.audio_duration_ms/1000)*FPS)} defaultProps={{content:breakerPanelPackage as EditorialPackage,timing:breakerPanelShort as RenderTiming,variant:"short"}}/>
    <Still id="BreakerPanel-Thumbnail" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:breakerPanelPackage as EditorialPackage}}/>
    <Composition id="Streetlights-Long" component={HiddenSystemsVideo} fps={FPS} width={1920} height={1080} durationInFrames={Math.ceil((streetlightsLong.audio_duration_ms/1000)*FPS)} defaultProps={{content:streetlightsPackage as EditorialPackage,timing:streetlightsLong as RenderTiming,variant:"long"}}/>
    <Composition id="Streetlights-Short" component={HiddenSystemsVideo} fps={FPS} width={1080} height={1920} durationInFrames={Math.ceil((streetlightsShort.audio_duration_ms/1000)*FPS)} defaultProps={{content:streetlightsPackage as EditorialPackage,timing:streetlightsShort as RenderTiming,variant:"short"}}/>
    <Still id="Streetlights-Thumbnail" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:streetlightsPackage as EditorialPackage}}/>
    <Composition id="WaterTower-Long" component={HiddenSystemsVideo} fps={FPS} width={1920} height={1080} durationInFrames={Math.ceil((waterTowerLong.audio_duration_ms/1000)*FPS)} defaultProps={{content:waterTowerPackage as EditorialPackage,timing:waterTowerLong as RenderTiming,variant:"long"}}/>
    <Composition id="WaterTower-Short" component={HiddenSystemsVideo} fps={FPS} width={1080} height={1920} durationInFrames={Math.ceil((waterTowerShort.audio_duration_ms/1000)*FPS)} defaultProps={{content:waterTowerPackage as EditorialPackage,timing:waterTowerShort as RenderTiming,variant:"short"}}/>
    <Still id="WaterTower-Thumbnail" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:waterTowerPackage as EditorialPackage}}/>
    <Composition id="RecyclingSorting-Long" component={HiddenSystemsVideo} fps={FPS} width={1920} height={1080} durationInFrames={Math.ceil((recyclingSortingLong.audio_duration_ms/1000)*FPS)} defaultProps={{content:recyclingSortingPackage as EditorialPackage,timing:recyclingSortingLong as RenderTiming,variant:"long"}}/>
    <Composition id="RecyclingSorting-Short" component={HiddenSystemsVideo} fps={FPS} width={1080} height={1920} durationInFrames={Math.ceil((recyclingSortingShort.audio_duration_ms/1000)*FPS)} defaultProps={{content:recyclingSortingPackage as EditorialPackage,timing:recyclingSortingShort as RenderTiming,variant:"short"}}/>
    <Still id="RecyclingSorting-Thumbnail" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:recyclingSortingPackage as EditorialPackage}}/>
    <Composition id="StormSewers-Long" component={HiddenSystemsVideo} fps={FPS} width={1920} height={1080} durationInFrames={Math.ceil((stormSewersLong.audio_duration_ms/1000)*FPS)} defaultProps={{content:stormSewersPackage as EditorialPackage,timing:stormSewersLong as RenderTiming,variant:"long"}}/>
    <Composition id="StormSewers-Short" component={HiddenSystemsVideo} fps={FPS} width={1080} height={1920} durationInFrames={Math.ceil((stormSewersShort.audio_duration_ms/1000)*FPS)} defaultProps={{content:stormSewersPackage as EditorialPackage,timing:stormSewersShort as RenderTiming,variant:"short"}}/>
    <Still id="StormSewers-Thumbnail" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:stormSewersPackage as EditorialPackage}}/>
    <Composition id="SolarGrid-Long" component={HiddenSystemsVideo} fps={FPS} width={1920} height={1080} durationInFrames={Math.ceil((solarGridLong.audio_duration_ms/1000)*FPS)} defaultProps={{content:solarGridPackage as EditorialPackage,timing:solarGridLong as RenderTiming,variant:"long"}}/>
    <Composition id="SolarGrid-Short" component={HiddenSystemsVideo} fps={FPS} width={1080} height={1920} durationInFrames={Math.ceil((solarGridShort.audio_duration_ms/1000)*FPS)} defaultProps={{content:solarGridPackage as EditorialPackage,timing:solarGridShort as RenderTiming,variant:"short"}}/>
    <Still id="SolarGrid-Thumbnail" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:solarGridPackage as EditorialPackage}}/>
    <Composition id="WindTransmission-Long" component={HiddenSystemsVideo} fps={FPS} width={1920} height={1080} durationInFrames={Math.ceil((windTransmissionLong.audio_duration_ms/1000)*FPS)} defaultProps={{content:windTransmissionPackage as EditorialPackage,timing:windTransmissionLong as RenderTiming,variant:"long"}}/>
    <Composition id="WindTransmission-Short" component={HiddenSystemsVideo} fps={FPS} width={1080} height={1920} durationInFrames={Math.ceil((windTransmissionShort.audio_duration_ms/1000)*FPS)} defaultProps={{content:windTransmissionPackage as EditorialPackage,timing:windTransmissionShort as RenderTiming,variant:"short"}}/>
    <Still id="WindTransmission-Thumbnail" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:windTransmissionPackage as EditorialPackage}}/>
    <Composition id="WasteToEnergy-Long" component={HiddenSystemsVideo} fps={FPS} width={1920} height={1080} durationInFrames={Math.ceil((wasteToEnergyLong.audio_duration_ms/1000)*FPS)} defaultProps={{content:wasteToEnergyPackage as EditorialPackage,timing:wasteToEnergyLong as RenderTiming,variant:"long"}}/>
    <Composition id="WasteToEnergy-Short" component={HiddenSystemsVideo} fps={FPS} width={1080} height={1920} durationInFrames={Math.ceil((wasteToEnergyShort.audio_duration_ms/1000)*FPS)} defaultProps={{content:wasteToEnergyPackage as EditorialPackage,timing:wasteToEnergyShort as RenderTiming,variant:"short"}}/>
    <Still id="WasteToEnergy-Thumbnail" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:wasteToEnergyPackage as EditorialPackage}}/>
    <Composition id="RefrigeratorHeatPump-Long" component={HiddenSystemsVideo} fps={FPS} width={1920} height={1080} durationInFrames={Math.ceil((refrigeratorLong.audio_duration_ms/1000)*FPS)} defaultProps={{content:refrigeratorPackage as EditorialPackage,timing:refrigeratorLong as RenderTiming,variant:"long"}}/>
    <Composition id="RefrigeratorHeatPump-Short" component={HiddenSystemsVideo} fps={FPS} width={1080} height={1920} durationInFrames={Math.ceil((refrigeratorShort.audio_duration_ms/1000)*FPS)} defaultProps={{content:refrigeratorPackage as EditorialPackage,timing:refrigeratorShort as RenderTiming,variant:"short"}}/>
    <Still id="RefrigeratorHeatPump-Thumbnail" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:refrigeratorPackage as EditorialPackage}}/>
    <Composition id="GasOdorization-Long" component={HiddenSystemsVideo} fps={FPS} width={1920} height={1080} durationInFrames={Math.ceil((gasOdorizationLong.audio_duration_ms/1000)*FPS)} defaultProps={{content:gasOdorizationPackage as EditorialPackage,timing:gasOdorizationLong as RenderTiming,variant:"long"}}/>
    <Composition id="GasOdorization-Short" component={HiddenSystemsVideo} fps={FPS} width={1080} height={1920} durationInFrames={Math.ceil((gasOdorizationShort.audio_duration_ms/1000)*FPS)} defaultProps={{content:gasOdorizationPackage as EditorialPackage,timing:gasOdorizationShort as RenderTiming,variant:"short"}}/>
    <Still id="GasOdorization-Thumbnail" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:gasOdorizationPackage as EditorialPackage}}/>
    <Composition id="WifiChannelSharing-Long" component={HiddenSystemsVideo} fps={FPS} width={1920} height={1080} durationInFrames={Math.ceil((wifiSharingLong.audio_duration_ms/1000)*FPS)} defaultProps={{content:wifiSharingPackage as EditorialPackage,timing:wifiSharingLong as RenderTiming,variant:"long"}}/>
    <Composition id="WifiChannelSharing-Short" component={HiddenSystemsVideo} fps={FPS} width={1080} height={1920} durationInFrames={Math.ceil((wifiSharingShort.audio_duration_ms/1000)*FPS)} defaultProps={{content:wifiSharingPackage as EditorialPackage,timing:wifiSharingShort as RenderTiming,variant:"short"}}/>
    <Still id="WifiChannelSharing-Thumbnail" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:wifiSharingPackage as EditorialPackage}}/>
    <Composition id="ElevatorDispatch-Long" component={HiddenSystemsVideo} fps={FPS} width={1920} height={1080} durationInFrames={Math.ceil((elevatorDispatchLong.audio_duration_ms/1000)*FPS)} defaultProps={{content:elevatorDispatchPackage as EditorialPackage,timing:elevatorDispatchLong as RenderTiming,variant:"long"}}/>
    <Composition id="ElevatorDispatch-Short" component={HiddenSystemsVideo} fps={FPS} width={1080} height={1920} durationInFrames={Math.ceil((elevatorDispatchShort.audio_duration_ms/1000)*FPS)} defaultProps={{content:elevatorDispatchPackage as EditorialPackage,timing:elevatorDispatchShort as RenderTiming,variant:"short"}}/>
    <Still id="ElevatorDispatch-Thumbnail" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:elevatorDispatchPackage as EditorialPackage}}/>
    <Composition id="TrafficLightSync-Long" component={HiddenSystemsVideo} fps={FPS} width={1920} height={1080} durationInFrames={Math.ceil((trafficLightSyncLong.audio_duration_ms/1000)*FPS)} defaultProps={{content:trafficLightSyncPackage as EditorialPackage,timing:trafficLightSyncLong as RenderTiming,variant:"long"}}/>
    <Composition id="TrafficLightSync-Short" component={HiddenSystemsVideo} fps={FPS} width={1080} height={1920} durationInFrames={Math.ceil((trafficLightSyncShort.audio_duration_ms/1000)*FPS)} defaultProps={{content:trafficLightSyncPackage as EditorialPackage,timing:trafficLightSyncShort as RenderTiming,variant:"short"}}/>
    <Still id="TrafficLightSync-Thumbnail" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:trafficLightSyncPackage as EditorialPackage}}/>
    <Composition id="SmokeDetectorTypes-Long" component={HiddenSystemsVideo} fps={FPS} width={1920} height={1080} durationInFrames={Math.ceil((smokeDetectorLong.audio_duration_ms/1000)*FPS)} defaultProps={{content:smokeDetectorPackage as EditorialPackage,timing:smokeDetectorLong as RenderTiming,variant:"long"}}/>
    <Composition id="SmokeDetectorTypes-Short" component={HiddenSystemsVideo} fps={FPS} width={1080} height={1920} durationInFrames={Math.ceil((smokeDetectorShort.audio_duration_ms/1000)*FPS)} defaultProps={{content:smokeDetectorPackage as EditorialPackage,timing:smokeDetectorShort as RenderTiming,variant:"short"}}/>
    <Still id="SmokeDetectorTypes-Thumbnail" component={HiddenSystemsThumbnail} width={1280} height={720} defaultProps={{content:smokeDetectorPackage as EditorialPackage}}/>
  </Folder>
</>;
