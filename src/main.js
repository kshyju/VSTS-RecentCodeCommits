define(["require", "exports", "src/RecentCodeCommits"], function (require, exports, RecentCodeCommits) {
    "use strict";
    VSS.require(["TFS/Dashboards/WidgetHelpers"], function (WidgetHelpers) {
        WidgetHelpers.IncludeWidgetStyles();
        VSS.register("RecentCodeCommitsWidget", function () {
            var countdownWidget = new RecentCodeCommits.RecentCodeCommits(WidgetHelpers);
            return countdownWidget;
        });
        VSS.notifyLoadSucceeded();
    });
});
