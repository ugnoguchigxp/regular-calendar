import '@testing-library/jest-dom';


// Mock specific window/document methods if needed
window.matchMedia = window.matchMedia || function () {
    return {
        matches: false,
        addListener: function () { },
        removeListener: function () { }
    };
};
