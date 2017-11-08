using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using BerkTuner.Infra.ActionLog;

namespace BerkTuner.Hubs
{
    /// <summary>
    /// This enum is from $.signalR.connectionState variable and added here to not add a reference for SignalR Client dll
    /// </summary>
    public enum ConnectionState
    {
        Connecting = 0,
        Connected = 1,
        Reconnecting = 2,
        Disconnected = 4,
    }

    /// <summary>
    /// Hub between client and server for managing sound level, log list and current streamers
    /// </summary>
    public class TunerHub : Hub
    {
        /// <summary>
        /// Updates the clients about sound level change
        /// </summary>
        /// <param name="level">Current sound level</param>
        public static void UpdateSoundLevel(short level)
        {
            var context = GlobalHost.ConnectionManager.GetHubContext<TunerHub>();
            context.Clients.All.updateSoundLevel(level);
        }

        /// <summary>
        /// Updates the clients about newly added log
        /// </summary>
        /// <param name="log">Log object to send to the clients</param>
        public static void UpdateLastIPsAndActions(ActionLog log)
        {
            var context = GlobalHost.ConnectionManager.GetHubContext<TunerHub>();
            context.Clients.All.updateLastIPsAndActions(log);
        }

        /// <summary>
        /// Updates the clients about newly joined streamer
        /// </summary>
        /// <param name="id">Identifier of the streamer</param>
        /// <param name="state">Connection state of the streamer</param>
        public static void UpdateStreamers(string id, ConnectionState state)
        {
            var context = GlobalHost.ConnectionManager.GetHubContext<TunerHub>();
            context.Clients.All.updateStreamers(id, state);
        }
    }
}