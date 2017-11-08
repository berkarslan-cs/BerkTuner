using BerkTuner.Infra.ActionLog;
using BerkTuner.Infra.Helpers;
using BerkTuner.Infra.Streamer;
using NAudio.CoreAudioApi;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Mvc;

namespace BerkTuner.Controllers
{
    public class HomeController : BaseController
    {
        public HomeController()
        {
            InitRequest();
        }

        private void InitRequest()
        {
            //Fill the viewbag values
            ViewBag.Volume = NAudioHelper.GetCurrentSoundLevel();
            ViewBag.AudioDeviceExists = NAudioHelper.GetDefaultAudioEndpoint() != null;
        }

        /// <summary>
        /// Main page
        /// </summary>
        /// <returns>Main view</returns>
        public ActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// Main view for streaming
        /// </summary>
        /// <returns>Streamer view</returns>
        public ActionResult Streamer()
        {
            return View();
        }

        /// <summary>
        /// Streams audio
        /// </summary>
        /// <returns>Stream</returns>
        public ActionResult Stream()
        {
            NAudioStreamer.StartStreaming();

            //It never reaches that point below, it flushes response continously
            return Content("");
        }

        /// <summary>
        /// Adjusts the volume -10 by -10 or mutes it directly
        /// </summary>
        /// <param name="level">If 0 is supplied, it mutes; otherwise decreases the sound level by 10</param>
        /// <returns>Message</returns>
        [HttpPost]
        public ActionResult DecreaseVolume(int level)
        {
            //Get default endpoint
            var audioEndpoint = NAudioHelper.GetDefaultAudioEndpoint();
            if (audioEndpoint == null)
                return Json("No devices found to record");

            try
            {
                if (audioEndpoint.AudioEndpointVolume.MasterVolumeLevelScalar == 0)
                    return Json("Device is already muted");

                //Set new volume and mute flag
                float newVolume = 0;
                if (level != 0)
                    newVolume = audioEndpoint.AudioEndpointVolume.MasterVolumeLevelScalar - (float)0.1;
                if (newVolume < 0)
                    newVolume = 0;
                audioEndpoint.AudioEndpointVolume.MasterVolumeLevelScalar = newVolume;
                audioEndpoint.AudioEndpointVolume.Mute = newVolume == 0;
            }
            catch
            {
                //Swallow and return
                return Json("An error has occured. WHAT DID YOU DO YOU????");
            }
            return Json(new { });
        }
    }
}