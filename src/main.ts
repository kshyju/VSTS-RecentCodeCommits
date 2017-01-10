
import RecentCodeCommits = require("src/RecentCodeCommits")
VSS.require(["TFS/Dashboards/WidgetHelpers"], (WidgetHelpers) => {
     WidgetHelpers.IncludeWidgetStyles();
       
    VSS.register("RecentCodeCommitsWidget", () => {
        var countdownWidget = new RecentCodeCommits.RecentCodeCommits(WidgetHelpers);     
        return countdownWidget;
    })
    VSS.notifyLoadSucceeded();
});
