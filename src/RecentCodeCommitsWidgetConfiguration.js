define(["require", "exports"], function (require, exports) {
    "use strict";
    var RecentCodeCommitsWidgetConfiguration = (function () {
        function RecentCodeCommitsWidgetConfiguration(WidgetHelpers) {
            this.WidgetHelpers = WidgetHelpers;
            this.$queryDropdown = $("#data-dropdown");
            this.$sourceCodePath = $("#sourceCodePath");
            this.$customWidgetTitle = $("#customWidgetTitle");
        }
        RecentCodeCommitsWidgetConfiguration.prototype.load = function (widgetSettings, widgetConfigurationContext) {
            var _this = this;
            var settings = JSON.parse(widgetSettings.customSettings.data);
            if (settings && settings.dataFor) {
                _this.$queryDropdown.val(settings.dataFor);
            }
            if (settings && settings.sourceCodePath) {
                _this.$sourceCodePath.val(settings.sourceCodePath);
            }
            if (settings && settings.title) {
                _this.$customWidgetTitle.val(settings.title);
            }
            this.$queryDropdown.on("change", function () {
                var customSettings = { data: JSON.stringify({ dataFor: _this.$queryDropdown.val(), sourceCodePath: _this.$sourceCodePath.val(), title: _this.$customWidgetTitle.val() }) };
                var eventName = _this.WidgetHelpers.WidgetEvent.ConfigurationChange;
                var eventArgs = _this.WidgetHelpers.WidgetEvent.Args(customSettings);
                widgetConfigurationContext.notify(eventName, eventArgs);
            });
            this.$sourceCodePath.on("blur", function () {
                var customSettings = { data: JSON.stringify({ dataFor: _this.$queryDropdown.val(), sourceCodePath: _this.$sourceCodePath.val(), title: _this.$customWidgetTitle.val() }) };
                var eventName = _this.WidgetHelpers.WidgetEvent.ConfigurationChange;
                var eventArgs = _this.WidgetHelpers.WidgetEvent.Args(customSettings);
                widgetConfigurationContext.notify(eventName, eventArgs);
            });
            this.$customWidgetTitle.on("blur", function () {
                var customSettings = { data: JSON.stringify({ dataFor: _this.$queryDropdown.val(), sourceCodePath: _this.$sourceCodePath.val(), title: _this.$customWidgetTitle.val() }) };
                var eventName = _this.WidgetHelpers.WidgetEvent.ConfigurationChange;
                var eventArgs = _this.WidgetHelpers.WidgetEvent.Args(customSettings);
                widgetConfigurationContext.notify(eventName, eventArgs);
            });
            return this.WidgetHelpers.WidgetStatusHelper.Success();
        };
        RecentCodeCommitsWidgetConfiguration.prototype.onSave = function () {
            var _this = this;
            var customSettings = { data: JSON.stringify({ dataFor: this.$queryDropdown.val(), sourceCodePath: this.$sourceCodePath.val(), title: _this.$customWidgetTitle.val() }) };
            return _this.WidgetHelpers.WidgetConfigurationSave.Valid(customSettings);
        };
        return RecentCodeCommitsWidgetConfiguration;
    }());
    exports.RecentCodeCommitsWidgetConfiguration = RecentCodeCommitsWidgetConfiguration;
    VSS.require(["TFS/Dashboards/WidgetHelpers"], function (WidgetHelpers) {
        WidgetHelpers.IncludeWidgetStyles();
        WidgetHelpers.IncludeWidgetConfigurationStyles();
        VSS.register("RecentCodeCommitsWidgetConfiguration", function () {
            var configuration = new RecentCodeCommitsWidgetConfiguration(WidgetHelpers);
            return configuration;
        });
        VSS.notifyLoadSucceeded();
    });
});
