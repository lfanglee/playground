const MyPromise = require('./promise.js');

const promise = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        resolve(1);
    }, 0);
}).then(res => {
    console.log(res);
}).then(res => {
    console.log(res);
    return new myPromise((resolve, reject) => {
        setTimeout(() => {
            resolve(2);
        });
    });
}).then(res => {
    console.log(res);
});

// new Promise((resolve, reject) => {
//     setTimeout(() => {
//         resolve(1);
//     }, 0);
// }).then(res => {
//     console.log(res);
// }).then(res => {
//     console.log(res);
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             resolve(2);
//         });
//     });
// }).then(res => {
//     console.log(res);
// });