using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BerkTuner.Infra.Helpers
{
    public static class HttpContextHelper
    {
        /// <summary>
        /// Gets host name from current <see cref="HttpContext"/>
        /// </summary>
        /// <returns>Host name</returns>
        public static string GetHostName()
        {
            return GetHostName(HttpContext.Current);
        }

        /// <summary>
        /// Gets the host name from supplied <see cref="HttpContext"/>
        /// </summary>
        /// <param name="context">Context to get the host name from</param>
        /// <returns>Host name</returns>
        public static string GetHostName(HttpContext context)
        {
            //Try to get ip from HTTP_X_FORWARDED_FOR parameter
            var addresses = context.Request.ServerVariables["HTTP_X_FORWARDED_FOR"]?.Split(',');
            if (addresses != null && addresses.Length != 0)
                return addresses[0];

            //Try to get ip from REMOTE_ADDR parameter
            string ip = context.Request.ServerVariables["REMOTE_ADDR"];
            return System.Net.Dns.GetHostEntry(ip).HostName ?? ip;
        }
    }
}