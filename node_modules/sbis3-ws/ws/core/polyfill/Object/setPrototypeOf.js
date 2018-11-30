if (!Object.setPrototypeOf) {
    Object.defineProperty(Object, 'setPrototypeOf', {
        value: function setPrototypeOf(object, proto) {
            object.__proto__ = proto;
            return object;
        },
        writable: true,
        configurable: true
    });
}
