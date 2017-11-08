class LogList extends React.Component {
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

        hub.client.updateLastIPsAndActions = function (log) {
            var data = component.state.data.slice();
            data.unshift(log);
            component.setState({ data: data });
        };

        if ($.connection.hub.state === $.signalR.connectionState.disconnected) {
            $.connection.hub.start()
        }
    }

    render() {
        var logs = this.state.data.map((log, index) => {
            return <Log text={log.IP + " - " + log.Action} key={index} />
        });
        return (
            logs.length != 0 &&
            <div>
                <span>Last Logs:</span>
                {logs}
            </div>
        );
    }
}