function debounce(fn, delay = 0) {
    let timer = null;
    return function (...args) {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

function throttle(fn, delay = 0) {
    let timer = null;
    let flag = false;
    return function (...args) {
        if (timer) {
            return;
        }
        if (!flag) {
            fn.apply(this, args);
            flag = true;
            return;
        }
        timer = setTimeout(() => {
            timer = null;
            fn.apply(this, args)
        }, delay);
    };
}
