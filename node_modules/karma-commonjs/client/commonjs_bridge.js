// Copyright (c) 2013 Titanium I.T. LLC. Licensed under the MIT license.
(function() {
    "use strict";

    var cachedModules = {};

    // load all modules
    for (var modulePath in window.__cjs_module__) {
        require(modulePath, modulePath);
    };


    function require(requiringFile, dependency) {
        dependency = normalizePath(requiringFile, dependency);

        // find module
        var moduleFn = window.__cjs_module__[dependency];
        if (moduleFn === undefined) throw new Error("Could not find module '" + dependency + "' from '" + requiringFile + "'");

        // run the module (if necessary)
        var module = cachedModules[dependency];
        if (module === undefined) {
            module = { exports: {} };
            moduleFn(requireFn(dependency), module, module.exports);
            cachedModules[dependency] = module;
        }
        return module.exports;
    };

    function requireFn(basepath) {
        return function(dependency) {
            return require(basepath, dependency);
        };
    };

    function normalizePath(basePath, relativePath) {
        if (isFullPath(relativePath)) return relativePath;
        if (!isFullPath(basePath)) throw new Error("basePath should be full path, but was [" + basePath + "]");

        var baseComponents = basePath.split("/");
        var relativeComponents = relativePath.split("/");
        var nextComponent;

        baseComponents.pop();     // remove file portion of basePath before starting
        while (relativeComponents.length > 0) {
            nextComponent = relativeComponents.shift();

            if (nextComponent === ".") continue;
            else if (nextComponent === "..") baseComponents.pop();
            else baseComponents.push(nextComponent);
        }

        var normalizedPath = baseComponents.join("/");

        if (normalizedPath.substr(normalizedPath.length - 3) !== ".js") {
            normalizedPath += ".js";
        }

        return normalizedPath;


        function isFullPath(path) {
            var unixFullPath = (path.charAt(0) === "/");
            var windowsFullPath = (path.indexOf(":") !== -1);

            return unixFullPath || windowsFullPath;
        }
    }

})(window);
