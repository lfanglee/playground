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
    
    componentWillUpdate() {
        console.log('Counter will update');
    }

    componentDidUpdate() {
        console.log('Counter did update');
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
                <div>{this.state.value % 2 ? 'isOdd' : 'isEven'}</div>
                <span className="decrease" onClick={this.handleDecreaseClick}>-</span>
                <input id="valueDisplayed" type="number" value={this.state.value} readonly />
                <span className="plus" onClick={this.handlePlusClick}>+</span>
                {this.state.value % 2 ? <Comp /> : null}
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

    componentWillUpdate() {
        console.log('App will update');
    }

    componentDidUpdate() {
        console.log('App did update');
    }

    render() {
      return <div className="app">
          {this.state.title}

          <Counter />
          <div>footer</div>
      </div>
    }
}

