import React from './react';

const Comp = () => {
    return <div className="module"><span>1. </span>hello, world</div>;
};

class Counter extends React.Component<{
    initialValue?: number
}, {
    value: number
}> {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.initialValue || 0
        };
        this.handleDecreaseClick = this.handleDecreaseClick.bind(this);
        this.handlePlusClick = this.handlePlusClick.bind(this);
    }

    componentDidMount() {
        console.log('Counter mounted');
        document.getElementById('valueDisplayed').style.textAlign = 'center';
    }

    handleDecreaseClick() {
        this.setState({
            value: this.state.value - 1
        });
    }

    handlePlusClick() {
        this.setState({
            value: this.state.value + 1
        });
    }

    render() {
        return (
            <div className="c-comp-counter">
                <span className="decrease" onClick={this.handleDecreaseClick}>-</span>
                <input id="valueDisplayed" type="number" value={this.state.value} readonly />
                <span className="plus" onClick={this.handlePlusClick}>+</span>
            </div>
        )
    }
}

export default class App extends React.Component<{}, {
    title: string
}> {
    constructor(props) {
        super(props);
        this.state = {
            title: 'hello, world!'
        };
    }

    componentWillMount() {
        console.log('App will mount');
        setTimeout(() => {
            this.setState({
                title: 'hello'
            });
        }, 3000);
    }

    componentDidMount() {
        console.log('App did mount');
    }

    render() {
      return <div className="app">
          {this.state.title}
          <Comp />

          <Counter />
          <div>footer</div>
      </div>
    }
}

