using BerkTuner.Hubs;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BerkTuner.Infra.ActionLog
{
    public static class ActionLogManager
    {
        private const int MaxLogLimit = 1000;
        private static readonly ConcurrentBag<ActionLog> lastIPsAndActions = new ConcurrentBag<ActionLog>();

        /// <summary>
        /// Inserts given info to the list
        /// </summary>
        /// <param name="ip">Request ip</param>
        /// <param name="action">Request action</param>
        public static void Insert(ActionLog log)
        {
            lastIPsAndActions.Add(log);
            TunerHub.UpdateLastIPsAndActions(log);
        }

        /// <summary>
        /// Gets the last actions of users as list
        /// </summary>
        /// <returns>List of logs</returns>
        public static List<ActionLog> GetList()
        {
            return lastIPsAndActions
                .OrderByDescending(o => o.Date)
                .Take(MaxLogLimit)
                .ToList();
        }
    }
}