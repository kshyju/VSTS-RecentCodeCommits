
import TfscRestClient = require("TFS/VersionControl/TfvcRestClient");
import WorkRestClient = require("TFS/Work/RestClient");
import TFS_VersionControl_Contracts = require("TFS/VersionControl/Contracts");


export class RecentCodeCommits {
    constructor(private WidgetHelpers: any) {

    }


    public load(widgetSettings) {

        return this.getChangeSetData(widgetSettings);
    }
    public reload(widgetSettings) {
         return this.getChangeSetData(widgetSettings);
    }

    private getPrettyDate(dt): string {
        var d = new Date(dt);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    }

    private getDateFrom(numberOfDaysToCountFrom: number): string {
        var d = new Date();
        if (numberOfDaysToCountFrom) {
            d.setDate(d.getDate() - numberOfDaysToCountFrom);
        }
        return d.toLocaleDateString();
    }
    private getGridRow(item, baseUrl) {
        var changeSetUrl = baseUrl + '_versionControl/changeset/' + item.changesetId;
        var rowMarkup = '<tr><td class="td-picture"><img class="changeset-author-picture" src="' + item.author.imageUrl + '" /><td>';
        rowMarkup += '<td class="td-result-details">';
        rowMarkup += '<div>';
        rowMarkup += '<a class="link-with-icon-text" href="' + changeSetUrl + '" target="_blank">' + item.comment + '</a>';
        rowMarkup += '</div>';
        rowMarkup += '<div class="subtitle changeset-meta">' + item.author.displayName + '<span>' + this.getPrettyDate(item.createdDate) + '</span></div>';
        rowMarkup += '</td></tr>';
        return rowMarkup;
    }

    private getChangeSetData(widgetSettings) {

         var _this=this;
         
        var tfscRestClient = TfscRestClient.getClient();
        var workRestClient = WorkRestClient.getClient();

        var $itemsContainer = $("#items");
        var $widgetTitle = $("#widgetTitle");
        var $widgetSubTitle = $("#widgetSubTitle");

        var maxCommentLength = 40;
        var skip = 0;
        var top = 5;
        if (widgetSettings.size.rowSpan === 3) {
            top = 9;
        }
        var searchCriteria: TFS_VersionControl_Contracts.TfvcChangesetSearchCriteria = {
            author: '',
            followRenames: false, includeLinks: false, fromDate: '', itemPath: '', fromId: null, toId: null, toDate: ''
        };


        var vstsContext = VSS.getWebContext();
        var projectId = vstsContext.project.id;

        var baseUrl = vstsContext.collection.uri + vstsContext.project.name + '/';       
        var settings = JSON.parse(widgetSettings.customSettings.data);

        var widgetSubTitle = "";
        var widgetTitle = "";
        var projectName = vstsContext.project.id;
        var teamContext = { projectId: projectName, teamId: vstsContext.team.id, project: "", team: "" };;
        workRestClient.getTeamIterations(teamContext, "current")
            .then(function (iterations) {

                var currentSprintStartDate = null;
                if (iterations.length > 0) {
                    var currentIteration = iterations[0];
                    if (currentIteration.attributes.startDate) {
                        currentSprintStartDate = currentIteration.attributes.startDate;
                    }
                    widgetTitle = "Recent commits in " + currentIteration.name;
                }
                if (settings && settings.sourceCodePath) {
                    searchCriteria.itemPath = settings.sourceCodePath;
                    widgetSubTitle = settings.sourceCodePath;
                }
                else {
                    searchCriteria.itemPath = "";
                }

                if (settings && settings.dataFor) {
                    if (settings.dataFor === "7days") {
                        searchCriteria.fromDate = _this.getDateFrom(7);
                        widgetTitle = "Recent commits in last 7 days";
                    }
                    else if (settings.dataFor === "24hrs") {
                        searchCriteria.fromDate = _this.getDateFrom(1);
                        widgetTitle = "Recent commits in last 24 hours";
                    }
                    else if (settings.dataFor === "currentsprint") {
                        searchCriteria.fromDate = currentSprintStartDate;
                    }
                    else if (settings.dataFor === "nofilter") {
                        searchCriteria.fromDate = null;
                        widgetTitle = "Recent commits";
                    }
                }
                $widgetTitle.text(widgetTitle);
                $widgetSubTitle.text(widgetSubTitle);
                $itemsContainer.empty();
               
                tfscRestClient.getChangesets(projectId, maxCommentLength, skip, top, null, searchCriteria) 
                    .then(function (data)  {
                        if (data.length === 0) {
                            $itemsContainer.append("<p>No commits found for the selected filter :( </p>");
                        } else {
                            var t = $("<table />");
                            $.each(data,
                                function (index, item) {
                                    t.append(_this.getGridRow(item, baseUrl));
                                });
                            $itemsContainer.append(t);
                        }
                    });
            });







        return this.WidgetHelpers.WidgetStatusHelper.Success();
    }
}