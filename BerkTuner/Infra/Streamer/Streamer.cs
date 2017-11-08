using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BerkTuner.Infra.Streamer
{
    /// <summary>
    /// Holds the streamer info
    /// </summary>
    public class Streamer
    {
        public HttpContext Context { get; set; }
        public string HostName { get; set; }
        public DateTime StreamDate { get; set; }
    }
}