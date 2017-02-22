
import RecentCodeCommits = require("src/RecentCodeCommits")
VSS.require(["TFS/Dashboards/WidgetHelpers"], (WidgetHelpers) => {
     WidgetHelpers.IncludeWidgetStyles();
       
    VSS.register("RecentCodeCommitsWidget", () => {
        return new RecentCodeCommits.RecentCodeCommits(WidgetHelpers);         
    })
    VSS.notifyLoadSucceeded();
});
