package models

import javax.inject._

import play.api.libs.json.{JsDefined, JsValue}
import play.api.libs.ws.WSClient
import play.api.{Configuration, Logger}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class SolarQueryClient @Inject()(ws: WSClient, config: Configuration) {


  val url = config.get[String]("pv_system_details.solar_query_url")

  def makeWsRequest(queryParameters: Seq[(String, String)]): Future[JsValue]  = {

    Logger.info("calling WS with params: " + queryParameters)

    ws.url(url)
      .addQueryStringParameters(
        Seq(
          ("api_key", config.get[String]("pv_system_details.api_key")),
          ("radius", config.get[String]("pv_system_details.radius"))
        ) ++ queryParameters: _*
      )
      .get().map(_.json)
  }

  def parseResponse(json: JsValue): Either[String, JsValue] = {
    val err: Option[JsValue] = json \ "error" match {
      case e:JsDefined => Some(e.get)
      case _ => None
    }
   err.map { e => Left(e.toString()) }.getOrElse( Right(json))
  }
}


