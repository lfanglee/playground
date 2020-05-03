  
interface Element {
    type: ElementType;
    props: ElementProps;
}

interface Instance {
    element: Element;
    dom: HTMLElement | Text;
    // this class component and function component will have a childrenInstance property
    childrenInstance?: Instance;
    // the native dom instance will have a childrenInstances property and a publicInstance property
    childrenInstances?: Array<Instance>;
    publicInstance?: Component;
    // this function component will have a fn property
    fn?: FC;
}

interface FC<T = {
    [key: string]: any
}> {
    (props: T): Element;
}

type ElementType = string | ComponentClass | FC;

interface ElementProps {
    className?: string;
    nodeValue?: string;
    children?: Array<Element>
}

const createElement = function (
    type: ElementType,
    props: ElementProps,
    ...children: Array<Element | string>
): Element {
    props = Object.assign({}, props);
    props.children = [].concat(...children)
        .filter(child => child !== null || child !== false)
        .map((child: Element | string) => child instanceof Object
            ? child
            : {
                type: 'TEXT_ELEMENT',
                props: { nodeValue: child },
            });
    return { type, props };
};

// 将createElement函数产生的dom树对象实例化成组件实例
const instantiate = function (element: Element): Instance {
    const { type, props = {} } = element;
    // 原生dom元素
    const isDomElement = (type: ElementType): type is string => {
        return typeof type === 'string';
    };
    const isClassComponent = (type: ElementType): type is ComponentClass => {
        return (type as ComponentClass).prototype && (type as ComponentClass).prototype.isReactComponent;
    };
    if (isDomElement(type)) {
        const isTextElement = type === 'TEXT_ELEMENT';
        const dom = isTextElement ? document.createTextNode(props.nodeValue) : document.createElement(type);
        const children = props.children || [];
        const childrenInstances = children.map(instantiate);
        updateDomProperties(dom, {}, element.props);
        childrenInstances.forEach(childInstance => dom.appendChild(childInstance.dom));

        return {
            element,
            dom,
            childrenInstances
        };
    } else if (isClassComponent(type)) {
        const componentInstance = new type(props);
        const renderElement = componentInstance.render();
        const renderInstance = instantiate(renderElement);
        const instance = {
            element,
            dom: renderInstance.dom,
            childrenInstance: renderInstance,
            publicInstance: componentInstance
        };
        componentInstance.__internalInstance = instance;
        return instance;
    } else {
        const renderElement = type(props);
        const renderInstance = instantiate(renderElement);
        return {
            element,
            dom: renderInstance.dom,
            childrenInstance: renderInstance,
            fn: type
        };
    }
};

const updateDomProperties = function (dom: HTMLElement | Text, prevProps: ElementProps, nextProps: ElementProps): void {
    const isEvent = (name: string) => name.startsWith("on");
    const isAttribute = (name: string) => !isEvent(name) && name != "children";
    // Remove event listeners
    Object.keys(prevProps).filter(isEvent).forEach(name => {
        const eventType = name.toLowerCase().substring(2);
        dom.removeEventListener(eventType, prevProps[name]);
    });
  
    // Remove attributes
    Object.keys(prevProps).filter(isAttribute).forEach(name => {
        dom[name] = null;
    });
  
      // Set attributes
    Object.keys(nextProps).filter(isAttribute).forEach(name => {
        dom[name] = nextProps[name];
    });
  
    // Add event listeners
    Object.keys(nextProps).filter(isEvent).forEach(name => {
        const eventType = name.toLowerCase().substring(2);
        dom.addEventListener(eventType, nextProps[name]);
    });
};

type LifeCycleMethodName = 'componentWillMount' | 'componentDidMount' | 'componentWillUpdate' | 'componentDidUpdate' | 'componentWillUnmount' | 'shouldcomponentUpdate';

const lifeCycleExecutor = function (instance: Instance, lifeCycleMethodName: LifeCycleMethodName): void {
    if (instance.publicInstance) {
        instance.publicInstance[lifeCycleMethodName]
            && instance.publicInstance[lifeCycleMethodName]();
    }
    if (instance.childrenInstances) {
        instance.childrenInstances.forEach(childInstance => {
            lifeCycleExecutor(childInstance, lifeCycleMethodName);
        });
    }
    if (instance.childrenInstance) {
        lifeCycleExecutor(instance.childrenInstance, lifeCycleMethodName);
    }
}

const reconcile = function (parentDom: HTMLElement, instance: Instance, element: Element): Instance {
    // add instance
    if (!instance) {
        const newInstance = instantiate(element);
        lifeCycleExecutor(newInstance, 'componentWillMount');
        parentDom.appendChild(newInstance.dom);
        lifeCycleExecutor(newInstance, 'componentDidMount');
        return newInstance;
    } else if (!element) { // delete instance
        lifeCycleExecutor(instance, 'componentWillUnmount');
        parentDom.removeChild(instance.dom);
        return null;
    } else if (instance.element.type !== element.type) { // instance node type changed
        const newInstance = instantiate(element);
        lifeCycleExecutor(instance, 'componentWillUnmount');
        lifeCycleExecutor(newInstance, 'componentWillMount');
        parentDom.replaceChild(newInstance.dom, instance.dom);
        lifeCycleExecutor(newInstance, 'componentDidMount');
        return newInstance;
    }  else if (typeof element.type === 'string') {
        const {dom, childrenInstances} = instance;
        const { children: childrenElements = [] } = element.props;
        const count = Math.max(childrenElements.length, childrenInstances.length);
        const newChildrenInstances = [];
        updateDomProperties(dom, instance.element.props, element.props);
        for (let i = 0; i < count; i++) {
            newChildrenInstances.push(reconcile(dom as HTMLElement, childrenInstances[i], childrenElements[i]));
        }
        instance.childrenInstances = newChildrenInstances.filter(childInstance => childInstance);
        instance.element = element;
        return instance;
    } else {
        if (instance.publicInstance
            && instance.publicInstance.shouldcomponentUpdate) {
            if (!instance.publicInstance.shouldcomponentUpdate()) {
                return;
            }
        }
        lifeCycleExecutor(instance, 'componentWillUpdate');
        let newChildElement: Element;
        if (instance.publicInstance) { // 类组件
            instance.publicInstance.props = element.props;
            newChildElement = instance.publicInstance.render();
        } else { // 函数式组件
            newChildElement = instance.fn(element.props);
        }
        
        const oldChildInstance = instance.childrenInstance;
        const newChildInstance = reconcile(parentDom, oldChildInstance, newChildElement);
        // componentDidUpdate
        lifeCycleExecutor(instance, 'componentDidUpdate');
        instance.dom = newChildInstance.dom;
        instance.childrenInstance = newChildInstance;
        instance.element = element;
        return instance;
    }
};

let rootInstance: Instance = null;
const render = function (element: Element, parentDom: HTMLElement) {
    const previousInstance = rootInstance;
    const nextInstance = reconcile(parentDom, previousInstance, element);
    rootInstance = nextInstance;
};

interface ComponentClass<P = {}> {
    new (props?: P): Component<P>;
}

interface Component<P = {}, S = {}> {
    isReactComponent: boolean;
    props: P;
    state: S;
    __internalInstance: any;

    componentWillMount(): void;
    componentDidMount(): void;
    shouldcomponentUpdate(): boolean;
    componentWillUpdate(): void;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    render(): Element;
}

abstract class Component<P = {}, S = {}> {
    constructor(props?: P) {
        this.props = props;
    }

    setState(partialState: Partial<S>) {
        this.state = Object.assign({}, this.state, partialState);
        const parentDom = this.__internalInstance.dom.parentNode;
        const element = this.__internalInstance.element;
        reconcile(parentDom, this.__internalInstance, element);
    }
}
Component.prototype.isReactComponent = true;

export default {
    createElement,
    render,
    Component
};