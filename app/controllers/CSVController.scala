package controllers

/**
  * Created by rimukas on 12/19/16.
  */

import java.io.{File, PrintWriter, StringWriter}

import akka.actor.ActorSystem
import akka.dispatch.Envelope
import akka.stream._
import akka.stream.scaladsl._
import akka.util.Timeout
import com.github.tototoshi.csv.CSVReader
import com.google.inject.Inject
import models._
import models.CSVlistCompute
import play.api.cache.CacheApi
import play.api.libs.concurrent.Akka
import play.api.libs.json.{JsObject, JsString, JsValue, Json}
import play.api.mvc._

import scala.concurrent.duration._
import scala.concurrent.Future
import scala.language.implicitConversions
import scala.util.control.NonFatal
import scala.language.postfixOps
import scala.util.Try


class CSVController @Inject() (val cache: CacheApi) extends Controller with Security with Logging {

  import scala.concurrent.ExecutionContext.Implicits.global
  import play.api.Play.current

  implicit val system = Akka.system


  val decider: Supervision.Decider = {
    case NonFatal(th) =>


      val sw = new StringWriter
      th.printStackTrace(new PrintWriter(sw))
      Console.println(sw.toString)
      //Supervision.Resume
      Supervision.Stop

    case _ => Supervision.Stop
  }

  implicit val materializer = ActorMaterializer()

  implicit val timeout = Timeout(5 seconds)
  //val listCompute = new CSVlistCompute

  val calculateDegreeDays = Flow.fromGraph(GraphDSL.create() { implicit builder =>
    import GraphDSL.Implicits._

    val zipWith = builder.add(ZipWith[Int,Int,JsValue,(Int,Int,JsValue)]((_, _, _)))

    val broadcast = builder.add(Broadcast[(JsValue,DegreeDays)](3))
    broadcast.out(0).mapAsync(1)(_._2.lookupCDD) ~> zipWith.in0
    broadcast.out(1).mapAsync(1)(_._2.lookupHDD) ~> zipWith.in1
    broadcast.out(2).map(_._1) ~> zipWith.in2

    FlowShape(broadcast.in, zipWith.out)

  })

  def upload = Action.async(parse.multipartFormData) { implicit request =>
    request.body.file("attachment").map { upload =>
      import java.io.File
      val filename = upload.filename
      val uploadedFile = upload.ref.moveTo(new File(s"/tmp/upload/$filename"))
      val reader = CSVReader.open(uploadedFile)
      Future(Ok("OK"))

      val csvTemp = CSVlistCompute()

      Source.fromIterator(() => CSVcompute(reader.all).goodBuildingJsonList.toIterator).map{
        js =>(js,DegreeDays(js))
      }.via(calculateDegreeDays).mapAsync(1){
        case (cdd,hdd,js) => {
          println("--------")

          csvTemp.getMetrics(Json.toJson(List(Json.obj("CDD" -> cdd,"HDD" -> hdd) ++ js.asInstanceOf[JsObject])))
          // case if there is no cdd/hdd returned, means we don't know where in the country the building is because the zip
          //code doesn't match, this should be show in the output with the rest of the badEntries list
        }

      }.runWith(Sink.ignore).map { r =>
        println(r.toString())
        Ok(r.toString())
      }.recover {
        case NonFatal(th) =>
          println(th)
          Ok("Failed")
      }
    }.getOrElse {
      Future {
        Ok("File is missing")
      }
    }



    //al f = new File("out_list.csv")


  }
}
