class SoundLevelControls extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentVolume: props.currentVolume,
            isMuteDisabled: !props.audioDeviceExists || props.currentVolume == 0,
            isReduceDisabled: !props.audioDeviceExists || props.currentVolume == 0,
            isStreamDisabled: !props.audioDeviceExists
        };

        this.muteClick = this.muteClick.bind(this);
        this.reduceVolumeClick = this.reduceVolumeClick.bind(this);
        this.streamClick = this.streamClick.bind(this);
        this.enableDisableButtons = this.enableDisableButtons.bind(this);
    }

    componentDidMount() {
        var component = this;
        var hub = $.connection.tunerHub;
        if (!hub)
            return;

        hub.client.updateSoundLevel = function (level) {
            component.setState({ currentVolume: level }, () => {
                component.enableDisableButtons();
            });
        };

        if ($.connection.hub.state === $.signalR.connectionState.disconnected) {
            $.connection.hub.start();
        }

        $('[data-toggle=tooltip]').tooltip({
            trigger: 'hover'
        });
    }

    decreaseVolume(mute) {
        let level = 0;
        if (!mute)
            level = Math.max(this.state.currentVolume - 10, 0);

        $.ajax({
            url: URLS.decreaseVolume,
            data: { level: level },
            type: 'POST',
            success: function (result) {
                if (result && result.message) {
                    bootbox.alert(result.message);
                }
            },
        });
    }

    muteClick(e) {
        if (this.state.isMuteDisabled)
            return;
        this.decreaseVolume(true);
    }

    reduceVolumeClick(e) {
        if (this.state.isReduceDisabled)
            return;
        this.decreaseVolume();
    }

    streamClick(e) {
        if (this.state.isStreamDisabled) {
            return;
        }
        window.location.href = URLS.streamer;
    }

    enableDisableButtons() {
        let newState = {
            isMuteDisabled: !this.props.audioDeviceExists || this.state.currentVolume == 0,
            isReduceDisabled: !this.props.audioDeviceExists || this.state.currentVolume == 0,
            isStreamDisabled: !this.props.audioDeviceExists //isStreamDisabled will never change but let it stay for possible future changes
        };
        if (this.state.isMuteDisabled != newState.isMuteDisabled || this.state.isReduceDisabled != newState.isReduceDisabled || this.state.isStreamDisabled != newState.isStreamDisabled)
            this.setState(newState);
    }

    render() {
        let muteMessage, reduceMessage, streamMessage;
        if (!this.props.audioDeviceExists) {
            muteMessage = reduceMessage = streamMessage = MESSAGES.noDeviceFound;
        }
        else if (this.state.currentVolume == 0) {
            muteMessage = reduceMessage = MESSAGES.alreadyMuted;
        }

        return (
            <div id="container" className="btn-group btn-group-sm" role="group" aria-label="Sound Level Controls">
                <div className="tooltip-wrapper" data-toggle="tooltip" data-placement="bottom" data-original-title={muteMessage}>
                    <Button href="javascript:void(0);" className="btn btn-danger btn-sm" text="Mute" onClick={this.muteClick} disabled={this.state.isMuteDisabled} />
                </div>
                <div className="tooltip-wrapper" data-toggle="tooltip" data-placement="bottom" data-original-title={reduceMessage}>
                    <Button href="javascript:void(0);" className="btn btn-warning btn-sm" text={"Reduce Volume (Current: " + this.state.currentVolume + ")"} onClick={this.reduceVolumeClick} disabled={this.state.isReduceDisabled} />
                </div>
                <div className="tooltip-wrapper" data-toggle="tooltip" data-placement="bottom" data-original-title={streamMessage}>
                    <Button href="javascript:void(0);" className="btn btn-success btn-sm" text="Stream" onClick={this.streamClick} disabled={this.state.isStreamDisabled} />
                </div>
            </div>
        );
    }
}