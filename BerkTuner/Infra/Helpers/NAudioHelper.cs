using BerkTuner.Hubs;
using Microsoft.AspNet.SignalR;
using NAudio.CoreAudioApi;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BerkTuner.Infra.Helpers
{
    public static class NAudioHelper
    {
        private static MMDevice audioEndpoint;

        private static void ProcessNotificationData(AudioVolumeNotificationData data)
        {
            TunerHub.UpdateSoundLevel((short)Math.Round(data.MasterVolume * 100));
        }

        /// <summary>
        /// Gets the default audio endpoint
        /// </summary>
        /// <returns>Default audio endpoint</returns>
        public static MMDevice GetDefaultAudioEndpoint()
        {
            if (audioEndpoint == null)
            {
                MMDeviceEnumerator MMDE = new MMDeviceEnumerator();
                try
                {
                    audioEndpoint = MMDE.GetDefaultAudioEndpoint(DataFlow.Render, Role.Console);
                }
                catch
                {
                    //Swallow and return null
                    return null;
                }
            }
            return audioEndpoint;
        }

        /// <summary>
        /// Gets the current sound level
        /// </summary>
        /// <returns>Current sound level</returns>
        public static int GetCurrentSoundLevel()
        {
            var devices = GetDefaultAudioEndpoint();
            return Convert.ToInt32(audioEndpoint?.AudioEndpointVolume.MasterVolumeLevelScalar * 100);
        }

        /// <summary>
        /// Attaches sound level listener to the supplied device so that the event can be triggered when the sound level changes
        /// </summary>
        /// <param name="device">Device to attach the sound level listener</param>
        public static void AttachSoundLevelListener(MMDevice device)
        {
            device.AudioEndpointVolume.OnVolumeNotification += new AudioEndpointVolumeNotificationDelegate(notificationData => ProcessNotificationData(notificationData));
        }
    }
}