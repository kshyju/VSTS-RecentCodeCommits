
export class RecentCodeCommitsWidgetConfiguration {

    $queryDropdown = $("#data-dropdown");
    $sourceCodePath = $("#sourceCodePath");
    $customWidgetTitle = $("#customWidgetTitle");
    $checkEnableSlideshow = $("#check-enable-slideshow");

    constructor(private WidgetHelpers: any) {

    }

    public load(widgetSettings, widgetConfigurationContext) {
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
        if (settings && settings.enableSlideshow) {
            _this.$checkEnableSlideshow.prop('checked', true);
        }
        else{
            _this.$checkEnableSlideshow.prop('checked', false);
        }

        this.$queryDropdown.on("change", function () {
            var customSettings = {
                data: JSON.stringify({
                    dataFor: _this.$queryDropdown.val(), sourceCodePath: _this.$sourceCodePath.val(),
                    title: _this.$customWidgetTitle.val(), enableSlideshow: _this.$checkEnableSlideshow.is(':checked')
                })
            };
            var eventName = _this.WidgetHelpers.WidgetEvent.ConfigurationChange;
            var eventArgs = _this.WidgetHelpers.WidgetEvent.Args(customSettings);
            widgetConfigurationContext.notify(eventName, eventArgs);
        });

        this.$sourceCodePath.on("blur", function () {
            var customSettings = {
                data: JSON.stringify({
                    dataFor: _this.$queryDropdown.val(), sourceCodePath: _this.$sourceCodePath.val(),
                    title: _this.$customWidgetTitle.val(), enableSlideshow: _this.$checkEnableSlideshow.is(':checked')
                })
            };
            var eventName = _this.WidgetHelpers.WidgetEvent.ConfigurationChange;
            var eventArgs = _this.WidgetHelpers.WidgetEvent.Args(customSettings);
            widgetConfigurationContext.notify(eventName, eventArgs);
        });

        this.$customWidgetTitle.on("blur", function () {
            var customSettings = {
                data: JSON.stringify({
                    dataFor: _this.$queryDropdown.val(), sourceCodePath: _this.$sourceCodePath.val(),
                    title: _this.$customWidgetTitle.val(), enableSlideshow: _this.$checkEnableSlideshow.is(':checked')
                })
            };
            var eventName = _this.WidgetHelpers.WidgetEvent.ConfigurationChange;
            var eventArgs = _this.WidgetHelpers.WidgetEvent.Args(customSettings);
            widgetConfigurationContext.notify(eventName, eventArgs);
        });

        this.$checkEnableSlideshow.on("click", function () {
            var customSettings = {
                data: JSON.stringify({
                    dataFor: _this.$queryDropdown.val(), sourceCodePath: _this.$sourceCodePath.val(),
                    title: _this.$customWidgetTitle.val(), enableSlideshow: _this.$checkEnableSlideshow.is(':checked')
                })
            };

            var eventName = _this.WidgetHelpers.WidgetEvent.ConfigurationChange;
            var eventArgs = _this.WidgetHelpers.WidgetEvent.Args(customSettings);
            widgetConfigurationContext.notify(eventName, eventArgs);
        });


        return this.WidgetHelpers.WidgetStatusHelper.Success();
    }

    public onSave() {
        var _this = this;
        var customSettings = { data: JSON.stringify({ dataFor: this.$queryDropdown.val(), sourceCodePath: this.$sourceCodePath.val(), title: _this.$customWidgetTitle.val(), enableSlideshow: _this.$checkEnableSlideshow.is(':checked') }) };
        return _this.WidgetHelpers.WidgetConfigurationSave.Valid(customSettings);

    }

}

VSS.require(["TFS/Dashboards/WidgetHelpers"], (WidgetHelpers) => {
    WidgetHelpers.IncludeWidgetStyles();
    WidgetHelpers.IncludeWidgetConfigurationStyles();
    VSS.register("RecentCodeCommitsWidgetConfiguration", () => {
        var configuration = new RecentCodeCommitsWidgetConfiguration(WidgetHelpers);
        return configuration;
    })

    VSS.notifyLoadSucceeded();
});
