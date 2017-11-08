'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SoundLevelControls = function (_React$Component) {
    _inherits(SoundLevelControls, _React$Component);

    function SoundLevelControls(props) {
        _classCallCheck(this, SoundLevelControls);

        var _this = _possibleConstructorReturn(this, (SoundLevelControls.__proto__ || Object.getPrototypeOf(SoundLevelControls)).call(this, props));

        _this.state = {
            currentVolume: props.currentVolume,
            isMuteDisabled: !props.audioDeviceExists || props.currentVolume == 0,
            isReduceDisabled: !props.audioDeviceExists || props.currentVolume == 0,
            isStreamDisabled: !props.audioDeviceExists
        };

        _this.muteClick = _this.muteClick.bind(_this);
        _this.reduceVolumeClick = _this.reduceVolumeClick.bind(_this);
        _this.streamClick = _this.streamClick.bind(_this);
        _this.enableDisableButtons = _this.enableDisableButtons.bind(_this);
        return _this;
    }

    _createClass(SoundLevelControls, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var component = this;
            var hub = $.connection.tunerHub;
            if (!hub) return;

            hub.client.updateSoundLevel = function (level) {
                component.setState({ currentVolume: level }, function () {
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
    }, {
        key: 'decreaseVolume',
        value: function decreaseVolume(mute) {
            var level = 0;
            if (!mute) level = Math.max(this.state.currentVolume - 10, 0);

            $.ajax({
                url: URLS.decreaseVolume,
                data: { level: level },
                type: 'POST',
                success: function success(result) {
                    if (result && result.message) {
                        bootbox.alert(result.message);
                    }
                }
            });
        }
    }, {
        key: 'muteClick',
        value: function muteClick(e) {
            if (this.state.isMuteDisabled) return;
            this.decreaseVolume(true);
        }
    }, {
        key: 'reduceVolumeClick',
        value: function reduceVolumeClick(e) {
            if (this.state.isReduceDisabled) return;
            this.decreaseVolume();
        }
    }, {
        key: 'streamClick',
        value: function streamClick(e) {
            if (this.state.isStreamDisabled) {
                return;
            }
            window.location.href = URLS.streamer;
        }
    }, {
        key: 'enableDisableButtons',
        value: function enableDisableButtons() {
            var newState = {
                isMuteDisabled: !this.props.audioDeviceExists || this.state.currentVolume == 0,
                isReduceDisabled: !this.props.audioDeviceExists || this.state.currentVolume == 0,
                isStreamDisabled: !this.props.audioDeviceExists //isStreamDisabled will never change but let it stay for possible future changes
            };
            if (this.state.isMuteDisabled != newState.isMuteDisabled || this.state.isReduceDisabled != newState.isReduceDisabled || this.state.isStreamDisabled != newState.isStreamDisabled) this.setState(newState);
        }
    }, {
        key: 'render',
        value: function render() {
            var muteMessage = void 0,
                reduceMessage = void 0,
                streamMessage = void 0;
            if (!this.props.audioDeviceExists) {
                muteMessage = reduceMessage = streamMessage = MESSAGES.noDeviceFound;
            } else if (this.state.currentVolume == 0) {
                muteMessage = reduceMessage = MESSAGES.alreadyMuted;
            }

            return React.createElement(
                'div',
                { id: 'container', className: 'btn-group btn-group-sm', role: 'group', 'aria-label': 'Sound Level Controls' },
                React.createElement(
                    'div',
                    { className: 'tooltip-wrapper', 'data-toggle': 'tooltip', 'data-placement': 'bottom', 'data-original-title': muteMessage },
                    React.createElement(Button, { href: 'javascript:void(0);', className: 'btn btn-danger btn-sm', text: 'Mute', onClick: this.muteClick, disabled: this.state.isMuteDisabled })
                ),
                React.createElement(
                    'div',
                    { className: 'tooltip-wrapper', 'data-toggle': 'tooltip', 'data-placement': 'bottom', 'data-original-title': reduceMessage },
                    React.createElement(Button, { href: 'javascript:void(0);', className: 'btn btn-warning btn-sm', text: "Reduce Volume (Current: " + this.state.currentVolume + ")", onClick: this.reduceVolumeClick, disabled: this.state.isReduceDisabled })
                ),
                React.createElement(
                    'div',
                    { className: 'tooltip-wrapper', 'data-toggle': 'tooltip', 'data-placement': 'bottom', 'data-original-title': streamMessage },
                    React.createElement(Button, { href: 'javascript:void(0);', className: 'btn btn-success btn-sm', text: 'Stream', onClick: this.streamClick, disabled: this.state.isStreamDisabled })
                )
            );
        }
    }]);

    return SoundLevelControls;
}(React.Component);