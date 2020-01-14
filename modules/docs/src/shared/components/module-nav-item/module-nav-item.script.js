(() => {
    document.querySelector(`a[data-module-nav-item][href="${location.pathname}"]`).className += ' is-active';
})();
