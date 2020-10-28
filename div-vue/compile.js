function Compile(el, vm) {
    this.vm = vm;
    this.el = document.querySelector(el);
    this.fragment = null;
    this.init();
}

Compile.prototype = {
    init() {
        if (this.el) {
            this.fragment = this.nodeToFragment(this.el);
            this.compile(this.fragment);
            this.el.appendChild(this.fragment);
        }
    },
    nodeToFragment(el) {
        const fragment = document.createDocumentFragment();
        let child = el.firstChild;
        while(child) {
            fragment.appendChild(child);
            child = el.firstChild;
        }
        return fragment;
    },
    compile(el) {
        const childNodes = el.childNodes;
        [].slice.call(childNodes).forEach(node => {
            const reg = /\{\{(.*)\}\}/;
            const text = node.textContent;

            if (this.isTextNode(node) && reg.test(text)) {
                this.compileTextNode(node, reg.exec(text)[1]);
            } else if (this.isElementNode(node)) {
                this.compileElementNode(node);
            }

            if (node.childNodes && node.childNodes.length) {
                this.compile(node);
            }
        });
    },
    compileElementNode(node) {
        const nodeAttrs = node.attributes;
        [].forEach.call(nodeAttrs, (attr) => {
            const attrName = attr.name;
            const exp = attr.value;
            const dir = attrName.substring(2);
            // TODO
        });
    },
    compileTextNode(node, exp) {
        const initText = this.vm[exp];
        this.updateText(node, initText);
        new Watcher(this.vm, exp, value => {
            this.updateText(node, value);
        });
    },
    updateText(node, value) {
        node.textContent = typeof value === 'undefined' ? '' : value;
    },
    isElementNode(node) {
        return node.nodeType === 1;
    },
    isTextNode(node) {
        return node.nodeType === 3;
    }
};
