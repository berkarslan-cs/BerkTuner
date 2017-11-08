using BerkTuner.Hubs;
using BerkTuner.Infra.Helpers;
using NAudio.CoreAudioApi;
using NAudio.Lame;
using NAudio.Wave;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Web;

namespace BerkTuner.Infra.Streamer
{
    public class NAudioStreamer
    {
        private const int BufferSize = 65536;
        private static readonly object lockObj = new object();
        private static readonly ConcurrentDictionary<Guid, Streamer> activeContexts;
        private static LameMP3FileWriter wri;
        private static MemoryStream outStream;
        private static IWaveIn waveIn;
        private static long pos;

        //This prop is used to prevent the event garbage collected (this event is used by unmanaged code so that GC can't track references..)
        private static event EventHandler<WaveInEventArgs> dataAvailableEvent;

        static NAudioStreamer()
        {
            dataAvailableEvent = DataAvailableEvent;
            activeContexts = new ConcurrentDictionary<Guid, Streamer>();
        }

        #region Private

        /// <summary>
        /// Initializes the recorder components and starts the recording
        /// </summary>
        private static void Init()
        {
            outStream = new MemoryStream();
            waveIn = new WasapiLoopbackCapture();
            waveIn.DataAvailable += dataAvailableEvent;
            wri = new LameMP3FileWriter(outStream, waveIn.WaveFormat, 64);

            //Start recording
            waveIn.StartRecording();
        }

        /// <summary>
        /// Stops the recording and disposes the recorder components
        /// </summary>
        private static void Stop()
        {
            //Stop recording
            waveIn.StopRecording();
            waveIn.Dispose();
            wri.Dispose();
            outStream.Dispose();
            waveIn = null;
            wri = null;
            outStream = null;
            pos = 0;
        }

        /// <summary>
        /// Validates the recorder in each begin/end request and inits/stops the recorder according to the current request load
        /// </summary>
        private static void ValidateRecorderState()
        {
            if (activeContexts.Keys.Count != 0 && waveIn == null)
                Init();
            else if (activeContexts.Keys.Count == 0 && waveIn != null)
                Stop();
        }

        /// <summary>
        /// NAudio Event to handle recorded data
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private static void DataAvailableEvent(object sender, WaveInEventArgs e)
        {
            //Write recorded data to MP3 writer
            wri.Write(e.Buffer, 0, e.BytesRecorded);

            byte[] buffer = null;
            int readCount = 0;

            outStream.Position = pos;

            // Read buffer
            buffer = new byte[BufferSize];
            readCount = outStream.Read(buffer, 0, BufferSize);
            while (readCount > 0)
            {
                pos += readCount;

                //Stream data to each connected users
                activeContexts.ToList().ForEach(context =>
                {
                    if (context.Value.Context.Response.IsClientConnected)
                    {
                        try
                        {
                            context.Value.Context.Response.OutputStream.Write(buffer, 0, readCount);
                            context.Value.Context.Response.Flush();
                        }
                        catch
                        {
                            //Swallow since client can disconnect when flushing and streaming to other clients shouldn't be affected
                        }
                    }
                });

                readCount = outStream.Read(buffer, 0, BufferSize);
            }
        }

        #endregion


        #region Public

        /// <summary>
        /// Gets the current streamers
        /// </summary>
        /// <returns>Streamer hostname/ip list</returns>
        public static List<string> GetStreamers()
        {
            return activeContexts
                .OrderByDescending(o => o.Value.StreamDate)
                .Select(s => s.Value.HostName)
                .ToList();
        }

        /// <summary>
        /// Starts the streaming for the user continously
        /// </summary>
        public static void StartStreaming()
        {
            Guid guid = Guid.NewGuid();
            Streamer streamer = new Streamer()
            {
                Context = System.Web.HttpContext.Current,
                HostName = HttpContextHelper.GetHostName(),
                StreamDate = DateTime.Now
            };

            //Add headers
            streamer.Context.Response.AddHeader("Content-Type", "audio/mp3");

            //Add it to context pool
            activeContexts.AddOrUpdate(guid, streamer, (k, v) => streamer);

            //Validate the recorder
            ValidateRecorderState();

            //Update the clients about newly joined streamer
            TunerHub.UpdateStreamers(streamer.HostName, ConnectionState.Connected);

            //Keep streaming
            while (streamer.Context.Response.IsClientConnected)
            {
                Thread.Sleep(1000);
            }

            //Delete context from activeContexts since the client is disconnected
            while (!activeContexts.TryRemove(guid, out streamer))
                Thread.Sleep(10);

            //Update the clients about disconnected streamer
            TunerHub.UpdateStreamers(streamer.HostName, ConnectionState.Disconnected);

            //Validate the recorder
            ValidateRecorderState();
        }

        #endregion
    }
}