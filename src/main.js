define(["require", "exports", "src/RecentCodeCommits"], function (require, exports, RecentCodeCommits) {
    "use strict";
    VSS.require(["TFS/Dashboards/WidgetHelpers"], function (WidgetHelpers) {
        WidgetHelpers.IncludeWidgetStyles();
        VSS.register("RecentCodeCommitsWidget", function () {
            return new RecentCodeCommits.RecentCodeCommits(WidgetHelpers);
        });
        VSS.notifyLoadSucceeded();
    });
});
