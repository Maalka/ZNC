package models

/**
 * Created by rimukas on 10/20/15.
 */

import play.api.libs.json._
import play.api.libs.json.Reads._
import squants.energy.{Gigajoules, KBtus}
import squants.space.{Area, SquareFeet, SquareMeters}

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
import scala.language.implicitConversions
import play.api.libs.functional.syntax._
import squants.energy._
import EnergyConversions.EnergyNumeric
import squants.energy
import squants.motion.CubicFeetPerHour

import scala.util._
import scala.util.control.NonFatal

case class EUICalculator(parameters: JsValue) {

  implicit def boolOptToInt(b: Option[Boolean]): Int = if (b.getOrElse(false)) 1 else 0

  def getTotalSiteEnergy: Future[Energy] = {
    for {
      validatedList <- getValidateSiteEnergyList
      sum <- getSiteEnergySum(validatedList)
    } yield sum
  }


  def getSiteEnergySum(energyList: List[ValidatedEnergy]):Future[Energy] = Future {
    energyList.map(_.energyValue).sum in KBtus
  }

  //always read energy input values as KBtus
  def getValidateSiteEnergyList: Future[List[ValidatedEnergy]] = {
    for {
      energyList <- getSiteEnergyList
      validatedEnergyList <- Future {
        energyList.energies.map {
          case a: EnergyMetrics => ValidatedEnergy(a.energyType, a.energyName, mapEnergy(a.energyUnits, a.energyUse) in KBtus)
        }
      }
    } yield validatedEnergyList
  }

  def getSiteEnergyList: Future[EnergyList] = Future {
    parameters.asOpt[EnergyList] match {
      case Some(a) => a.energies.isEmpty match {
        case true => throw new Exception("No performance energy data provided!")
        case _ => a
      }
      case _ => throw new Exception("Unidentified energy entry in array!")
    }
  }

  def mapEnergy(units:String,value:Double):Energy = {
    units match {
      case "kBtu" => KBtus(value)
      case "MBtu" => MBtus(value)
      case "kWh" => KilowattHours(value)
      case "MWh" => MegawattHours(value)
      case "GJ" => Gigajoules(value)
      case "NG Mcf" => NGMCfs(value)
      case "NG kcf" => NGKCfs(value)
      case "NG ccf" => NGCCfs(value)
      case "NG cf" => NGCfs(value)
      case "NGm3" => NGm3s(value)
      case "therms" => Therms(value)
      case "No1UKG" => OilNo1UKGs(value)
      case "No1USG" => OilNo1USGs(value)
      case "No1L" => OilNo1Ls(value)
      case "No2UKG" => OilNo2UKGs(value)
      case "No2USG" => OilNo2USGs(value)
      case "No2L" => OilNo2Ls(value)
      case "No4UKG" => OilNo4UKGs(value)
      case "No4USG" => OilNo4USGs(value)
      case "No4L" => OilNo4Ls(value)
      case "No6UKG" => OilNo6UKGs(value)
      case "No6USG" => OilNo6USGs(value)
      case "No6L" => OilNo6Ls(value)
      case "Propane igal" => PropaneUKGs(value)
      case "Propane gal" => PropaneUSGs(value)
      case "Propane cf" => PropaneCfs(value)
      case "Propane ccf" => PropaneCCfs(value)
      case "Propane kcf" => PropaneKCfs(value)
      case "Propane L" => PropaneLs(value)
      case "Steam lb" => SteamLbs(value)
      case "Steam klb" => SteamKLbs(value)
      case "Steam Mlb" => SteamMLbs(value)
      case "CHW TonH" => CHWTonHs(value)
      case "CoalATon" => CoalATons(value)
      case "CoalATonne" => CoalATonnes(value)
      case "CoalALb" => CoalALbs(value)
      case "CoalBitTon" => CoalBitTons(value)
      case "CoalBitTonne" => CoalBitTonnes(value)
      case "CoalBitLb" => CoalBitLbs(value)
      case "CokeTon" => CokeTons(value)
      case "CokeTonne" => CokeTonnes(value)
      case "CokeLb" => CokeLbs(value)
      case "WoodTon" => WoodTons(value)
      case "WoodTonne" => WoodTonnes(value)
    }
  }

}


case class EnergyMetrics(energyType:String,energyName:String,energyUnits:String,energyUse:Double)
object EnergyMetrics {
  implicit val energyReads: Reads[EnergyMetrics] = (
    (JsPath \ "energy_type").read[String] and
    (JsPath \ "energy_name").read[String] and
    (JsPath \ "energy_units").read[String] and
    (JsPath \ "energy_use").read[Double](min(0.0))
    )(EnergyMetrics.apply _)
}

case class EnergyList(energies:List[EnergyMetrics])
object EnergyList {
  implicit val listReads:Reads[EnergyList] = Json.reads[EnergyList]
}

case class RenewableEnergyList(renewableEnergies:List[EnergyMetrics])
object RenewableEnergyList {
  implicit val listReads:Reads[RenewableEnergyList] = Json.reads[RenewableEnergyList]
}




case class ValidatedEnergy(energyType: String, energyName: String, energyValue: Energy)

