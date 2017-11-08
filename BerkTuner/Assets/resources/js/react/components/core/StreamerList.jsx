class StreamerList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.data
        };
    }

    componentDidMount() {
        var component = this;
        var hub = $.connection.tunerHub;
        if (hub == null)
            return;

        hub.client.updateStreamers = function (streamer, connectionState) {
            var data = component.state.data.slice();
            if (connectionState === $.signalR.connectionState.connected)
                data.unshift(streamer);
            else if (connectionState === $.signalR.connectionState.disconnected) {
                let index = data.indexOf(streamer);
                if(index != -1)
                    data.splice(index, 1);
            }
            component.setState({ data: data });
        };

        if ($.connection.hub.state === $.signalR.connectionState.disconnected) {
            $.connection.hub.start()
        }
    }

    render() {
        var streamers = this.state.data.map((streamer, index) => {
            return <Streamer text={streamer} key={index} />
        });
        return (
            streamers.length != 0 &&
            <div className="streamerList">
                <span>Streamers:</span>
                {streamers}
            </div>
        );
    }
}