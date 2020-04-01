const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';

class MyPromise {
    constructor(executor) {
        this.value = null;
        this.reason = null;
        this.state = PENDING;
        this.onFulfilledCallbacks = [];
        this.onRejectedCallbacks = [];

        const resolve = (value) => {
            if (this.state !== PENDING) {
                return;
            }
            this.state = FULFILLED;
            this.value = value;

            this.onFulfilledCallbacks.forEach(callback => callback());
        };
        const reject = (reason) => {
            if (this.state !== PENDING) {
                return;
            }
            this.state = REJECTED;
            this.reason = reason;

            this.onRejectedCallbacks.forEach(callback => callback());
        }

        try {
            executor(resolve, reject);
        } catch (reason) {
            reject(reason);
        }
    }

    then(onFulfilled, onRejected) {
        const promise = new myPromise((resolve, reject) => {
            if (this.state === FULFILLED) {
                try {
                    const res = onFulfilled(this.value);
                    this.resolvePromise(res, resolve, reject);
                } catch (reason) {
                    reject(reason);
                }
            } else if (this.state === REJECTED) {
                try {
                    const res = onRejected(this.reason);
                    this.resolvePromise(res, resolve, reject);
                } catch (reason) {
                    reject(reason);
                }
            } else if (this.state === PENDING) {
                this.onFulfilledCallbacks.push(() => {
                    try {
                        const res = onFulfilled(this.value);
                        this.resolvePromise(res, resolve, reject);
                    } catch (reason) {
                        reject(reason);
                    }
                });
                this.onRejectedCallbacks.push(() => {
                    try {
                        const res = onRejected(this.reason);
                        this.resolvePromise(res, resolve, reject);
                    } catch (reason) {
                        reject(reason);
                    }
                });
            }
        });

        return promise;
    }

    resolvePromise(res, resolve, reject) {
        if (res instanceof myPromise) {
            res.then(res => {
                if (res instanceof myPromise) {
                    this.resolvePromise(res, resolve, reject);
                } else {
                    resolve(res);
                }
            }, err => {
                reject(err);
            });
        } else {
            resolve(res);
        }
    }
}

module.exports = MyPromise;
