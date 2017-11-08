class Button extends React.Component {
    render() {
        return (
            this.props.disabled ? <a href={this.props.href} className={this.props.className} onClick={this.props.onClick} disabled>{this.props.text}</a>
                : <a href={this.props.href} className={this.props.className} onClick={this.props.onClick }>{this.props.text}</a>
        );
    }
}