"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LogList = function (_React$Component) {
    _inherits(LogList, _React$Component);

    function LogList(props) {
        _classCallCheck(this, LogList);

        var _this = _possibleConstructorReturn(this, (LogList.__proto__ || Object.getPrototypeOf(LogList)).call(this, props));

        _this.state = {
            data: props.data
        };
        return _this;
    }

    _createClass(LogList, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var component = this;
            var hub = $.connection.tunerHub;
            if (hub == null) return;

            hub.client.updateLastIPsAndActions = function (log) {
                var data = component.state.data.slice();
                data.unshift(log);
                component.setState({ data: data });
            };

            if ($.connection.hub.state === $.signalR.connectionState.disconnected) {
                $.connection.hub.start();
            }
        }
    }, {
        key: "render",
        value: function render() {
            var logs = this.state.data.map(function (log, index) {
                return React.createElement(Log, { text: log.IP + " - " + log.Action, key: index });
            });
            return logs.length != 0 && React.createElement(
                "div",
                null,
                React.createElement(
                    "span",
                    null,
                    "Last Logs:"
                ),
                logs
            );
        }
    }]);

    return LogList;
}(React.Component);