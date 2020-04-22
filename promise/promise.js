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
        const resolvePromise = (res, resolve, reject) => {
            if (res instanceof MyPromise) {
                res.then(res => {
                    resolvePromise(res, resolve, reject);
                }, err => {
                    reject(err);
                });
            } else {
                resolve(res);
            }
        }
        const promise = new MyPromise((resolve, reject) => {
            if (this.state === FULFILLED && onFulfilled) {
                try {
                    const res = onFulfilled(this.value);
                    resolvePromise(res, resolve, reject);
                } catch (reason) {
                    reject(reason);
                }
            } else if (this.state === REJECTED && onRejected) {
                try {
                    const res = onRejected(this.reason);
                    resolvePromise(res, resolve, reject);
                } catch (reason) {
                    reject(reason);
                }
            } else if (this.state === PENDING) {
                onFulfilled && this.onFulfilledCallbacks.push(() => {
                    try {
                        const res = onFulfilled(this.value);
                        resolvePromise(res, resolve, reject);
                    } catch (reason) {
                        reject(reason);
                    }
                });
                onRejected && this.onRejectedCallbacks.push(() => {
                    try {
                        const res = onRejected(this.reason);
                        resolvePromise(res, resolve, reject);
                    } catch (reason) {
                        reject(reason);
                    }
                });
            }
        });

        return promise;
    }

    catch(onRejected) {
        this.then(null, onRejected);
    }

    finally(onDone) {
        return this.then(value => MyPromise.resolve(onDone()).then(() => value), reason => MyPromise.resolve(onDone()).then(() => {throw reason; }));
    }

    static resolve(value) {
        if (value instanceof MyPromise) {
            return value;
        } else {
            return new MyPromise((resolve) => resolve(value));
        }
    }

    static reject(reason) {
        return new MyPromise((resolve) => reject(reason));
    }

    static all(promiseList) {
        return new MyPromise((resolve, reject) => {
            const values = [];
            let count = 0;
            promiseList.forEach((promise, index) => {
                this.resolve(promise).then(value => {
                    values[index] = value;
                    count++;
                    if (count === promiseList.length) {
                        resolve(values);
                    }
                }, err => reject(err));
            });
        });
    }

    static race(promiseList) {
        return new MyPromise((resolve, reject) => {
            promiseList.forEach(promise => {
                this.resolve(promise).then(value => {
                    resolve(value);
                }, err => reject(err));
            })
        }));
    }
}

module.exports = MyPromise;
