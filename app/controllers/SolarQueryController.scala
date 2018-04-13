/**
 * Created by rimukas on 10/12/15.
 */


package controllers

import com.google.inject.Inject
import models.{NREL_Client, SolarQueryClient}
import play.api.cache.AsyncCacheApi
import play.api.libs.json._
import play.api.mvc.{request, _}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.language.implicitConversions
import scala.util.control.NonFatal


class SolarQueryController @Inject() (val cache: AsyncCacheApi, cc: ControllerComponents, solar_query_client: SolarQueryClient) extends AbstractController(cc) with Logging {

  def getStations(r:JsValue):JsValue = {
    println(r)
    val us_station = (r \ "outputs" \ "tmy2").get
    val intl_station = (r \ "outputs" \ "intl").get

    Json.obj("us_station" -> Json.toJson(us_station), "intl_station" -> Json.toJson(intl_station))
  }

  def getFile() = Action.async(parse.json) { implicit request =>


    val lat:String = (request.body \ "lat").get.as[String]
    val lon:String = (request.body \ "lon").get.as[String]

    val temp = Seq(("lat", lat),("lon", lon))

    val file_id:Future[JsValue] = solar_query_client.makeWsRequest(temp)

    file_id.map(getStations(_)).map(Ok(_))


  }
}

