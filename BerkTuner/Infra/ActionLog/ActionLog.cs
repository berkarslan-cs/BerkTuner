using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BerkTuner.Infra.ActionLog
{
    public class ActionLog
    {
        public DateTime Date { get; set; }
        public string IP { get; set; }
        public string Action { get; set; }
    }
}