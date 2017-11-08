using BerkTuner.Infra.ActionLog;
using BerkTuner.Infra.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.Mvc.Filters;
using BerkTuner.Infra.Streamer;
using System.Configuration;

namespace BerkTuner.Controllers
{
    public class BaseController : Controller
    {
        private static bool isInitted = false;
        private static readonly object lockObj = new object();

        static BaseController()
        {
            try
            {
                Init();
            }
            catch
            {
                //Swallow to not get TypeInitializationException
            }
        }

        protected BaseController()
        {
            //Init just to be safe in case static ctor got an exception
            Init();
        }

        /// <summary>
        /// Initializes default audio endpoint and attaches sound listener into it
        /// </summary>
        protected static void Init()
        {
            if (isInitted)
                return;

            lock (lockObj)
            {
                //Double checked locking
                if (isInitted)
                    return;

                //Get default audio endpoint and attach sound listener
                var audioEndpoint = NAudioHelper.GetDefaultAudioEndpoint();
                if (audioEndpoint != null)
                    NAudioHelper.AttachSoundLevelListener(audioEndpoint);

                //Set isInitted to true to make sure the logic executes only once
                isInitted = true;
            }
        }

        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            //Create ActionLog object to insert
            ActionLog log = new ActionLog()
            {
                Date = DateTime.Now,
                IP = HttpContextHelper.GetHostName(),
                Action = RouteData.Values["action"].ToString()
            };

            //Add IP to the list
            ActionLogManager.Insert(log);

            //Fill ViewBag
            ViewBag.Version = $"?n={ConfigurationManager.AppSettings["StaticContentVersion"]}";
            ViewBag.LastIPsAndActions = ActionLogManager.GetList();
            ViewBag.Streamers = NAudioStreamer.GetStreamers();

            base.OnActionExecuting(filterContext);
        }
    }
}