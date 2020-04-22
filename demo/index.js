console.log(async function () {
    const res = await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(1);
        }, 300);
    });
    console.log(res);
}());

console.log(function () {
    return new Promise(function (resolve, reject) {
        setTimeout(() => resolve(1), 300);
    }).then(res => {
        console.log(res);
    });
}());

console.log(globalThis);