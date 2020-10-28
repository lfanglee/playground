function observer(data) {
    if (!data || Object.prototype.toString.call(data) !== '[object Object]') {
        return;
    }
    return new Observer(data);
}

function Observer(data) {
    this.data = data;
    this.dep = new Dep();
    this.init();
}

Observer.prototype = {
    init() {
        Object.keys(this.data).forEach(key => {
            this.defineReactive(this.data, key, this.data[key]);
        });
    },
    defineReactive(data, key, val) {
        const self = this;
        observer(val);
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get() {
                Dep.target && self.dep.addSub(Dep.target);

                return val;
            },
            set(newVal) {
                if (newVal === val) {
                    return;
                }
                val = newVal;
                self.dep.notify();
            }
        })
    }
};

function Dep() {
    this.subs = [];
}

Dep.prototype = {
    addSub(sub) {
        this.subs.push(sub);
    },
    notify() {
        this.subs.forEach(sub => sub.update());
    }
};
Dep.target = null;
