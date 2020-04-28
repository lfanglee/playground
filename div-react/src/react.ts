/*
    Element
    {
    type: 'div',
    props: {
        className: 'module',
        children: <Array<Element> | string>[
            {
                type: 'span',
                props: {
                    children: 'hello, wolrd'
                }
            }
        ]
    }
    }

    */    
interface Element {
    type: ElementType,
    props: ElementProps;
}

interface FC<T = {
    [key: string]: any
}> {
    (props: T): Element;
}

type ElementType = string | Component | FC;

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
const instantiate = function (element: Element) {
    const { type, props = {} } = element;
    // 原生dom元素
    if (typeof type === 'string') {
        const isTextElement = type === 'TEXT_ELEMENT';
        const dom = isTextElement ? document.createTextNode(props.nodeValue) : document.createElement(type);
        const children = props.children || [];
        const childrenInstance = children.map(instantiate);
        childrenInstance.forEach(childInstance => dom.appendChild(childInstance.dom));

        return {
            element,
            dom,
            childrenInstance
        };
    } else if (type instanceof Component) {
        const componentInstance = new type<typeof props>(props);
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
            childrenInstance: renderInstance
        };
    }
};

const reconcile = function (parentDom, instance, element) {
    // 新增instance
    if (!instance) {
        const newInstance = instantiate(element);
        newInstance.publicInstance
            & newInstance.publicInstance.componentWillMount
            && newInstance.publicInstance.componentWillMount();
        parentDom.appendChild(newInstance.dom);
        newInstance.publicInstance
            & newInstance.publicInstance.componentDidMount
            && newInstance.publicInstance.componentDidMount();
        return newInstance;
    } else if (instance.element.type !== element.type) {
        const newInstance = instantiate(element);
        // componentDidMount
        newInstance.publicInstance
            && newInstance.publicInstance.componentDidMount
            && newInstance.publicInstance.componentDidMount();
        parentDom.replaceChild(newInstance.dom, instance.dom);
        return newInstance;
    }  else if (typeof element.type === 'string') {
        
        return instance;
    } else {
        if (instance.publicInstance
            && instance.publicInstance.shouldcomponentUpdate) {
            if (!instance.publicInstance.shouldcomponentUpdate()) {
                return;
            }
        }
        instance.publicInstance
            && instance.publicInstance.componentWillUpdate
            && instance.publicInstance.componentWillUpdate();
        
        let newChildElement;
        if (instance.publicInstance) { // 类组件
            instance.publicInstance.props = element.props;
            newChildElement = instance.publicInstance.render();
        } else { // 函数式组件
            newChildElement = instance.fn(element.props);
        }
        
        const oldChildInstance = instance.childInstance;
        const newChildInstance = reconcile(parentDom, oldChildInstance, newChildElement);
        // componentDidUpdate
        instance.publicInstance
            && instance.publicInstance.componentDidUpdate
            && instance.publicInstance.componentDidUpdate();
        instance.dom = newChildInstance.dom;
        instance.childInstance = newChildInstance;
        instance.element = element;
        return instance;
    }
};

let rootInstance = null;
const render = function (element, parentDom) {
    const previousInstance = rootInstance;
    const nextInstance = reconcile(parentDom, previousInstance, element);
    rootInstance = nextInstance;
};

class Component<P = {}, S = {}> {
    public props: P;
    public state: S;
    protected __internalInstance: any;
    constructor(props: P) {
        this.props = props;
    }

    setState(partialState: Partial<S>) {
        this.state = Object.assign({}, this.state, partialState);
        const parentDom = this.__internalInstance.dom.parentNode;
        const element = this.__internalInstance.element;
        reconcile(parentDom, this.__internalInstance, element);
    }
}

export default {
    createElement,
    render,
    Component
};