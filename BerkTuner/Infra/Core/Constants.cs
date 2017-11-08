using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BerkTuner.Infra.Core
{
    public static class Constants
    {
        public static bool IsDebug
        {
            get
            {
#if DEBUG
                return true;
#else
                return false;
#endif
            }
        }
    }
}