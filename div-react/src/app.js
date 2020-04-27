const Comp = () => {
    return <div className="module"><span>1. </span>hello, world</div>;
};

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: 'hello, world'
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
      </div>
    }
  }

React.render(<App />, document.getElementById('app'));


