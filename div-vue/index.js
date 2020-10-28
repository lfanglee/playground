function MyVue(options) {
    this.vm = this;
    this.data = options.data;
    Object.keys(this.data).forEach(key => {
        this.proxyKeys(key);
    })
    observer(this.data);
    new Compile(options.el, this.vm);
    return this;
}

MyVue.prototype = {
    proxyKeys(key) {
        const self = this;
        Object.defineProperty(this, key, {
            enumerable: false,
            configurable: true,
            get() {
                return self.data[key];
            },
            set(newVal) {
                self.data[key] = newVal;
            }
        })
    }
};
