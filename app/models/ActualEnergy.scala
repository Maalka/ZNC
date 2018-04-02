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
      case "No1 igal" => OilNo1UKGs(value)
      case "No1 gal" => OilNo1USGs(value)
      case "No1 L" => OilNo1Ls(value)
      case "No2 igal" => OilNo2UKGs(value)
      case "No2 gal" => OilNo2USGs(value)
      case "No2 L" => OilNo2Ls(value)
      case "No4 igal" => OilNo4UKGs(value)
      case "No4 gal" => OilNo4USGs(value)
      case "No4 L" => OilNo4Ls(value)
      case "No6 igal" => OilNo6UKGs(value)
      case "No6 gal" => OilNo6USGs(value)
      case "No6 L" => OilNo6Ls(value)
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
      case "CoalA ton" => CoalATons(value)
      case "CoalA tonne" => CoalATonnes(value)
      case "CoalA lb" => CoalALbs(value)
      case "CoalBit ton" => CoalBitTons(value)
      case "CoalBit tonne" => CoalBitTonnes(value)
      case "CoalBit lb" => CoalBitLbs(value)
      case "Coke ton" => CokeTons(value)
      case "Coke tonne" => CokeTonnes(value)
      case "Coke lb" => CokeLbs(value)
      case "Wood ton" => WoodTons(value)
      case "Wood tonne" => WoodTonnes(value)
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

