"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var StreamerList = function (_React$Component) {
    _inherits(StreamerList, _React$Component);

    function StreamerList(props) {
        _classCallCheck(this, StreamerList);

        var _this = _possibleConstructorReturn(this, (StreamerList.__proto__ || Object.getPrototypeOf(StreamerList)).call(this, props));

        _this.state = {
            data: props.data
        };
        return _this;
    }

    _createClass(StreamerList, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var component = this;
            var hub = $.connection.tunerHub;
            if (hub == null) return;

            hub.client.updateStreamers = function (streamer, connectionState) {
                var data = component.state.data.slice();
                if (connectionState === $.signalR.connectionState.connected) data.unshift(streamer);else if (connectionState === $.signalR.connectionState.disconnected) {
                    var index = data.indexOf(streamer);
                    if (index != -1) data.splice(index, 1);
                }
                component.setState({ data: data });
            };

            if ($.connection.hub.state === $.signalR.connectionState.disconnected) {
                $.connection.hub.start();
            }
        }
    }, {
        key: "render",
        value: function render() {
            var streamers = this.state.data.map(function (streamer, index) {
                return React.createElement(Streamer, { text: streamer, key: index });
            });
            return streamers.length != 0 && React.createElement(
                "div",
                { className: "streamerList" },
                React.createElement(
                    "span",
                    null,
                    "Streamers:"
                ),
                streamers
            );
        }
    }]);

    return StreamerList;
}(React.Component);