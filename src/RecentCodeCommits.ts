
import TfscRestClient = require("TFS/VersionControl/TfvcRestClient");
import WorkRestClient = require("TFS/Work/RestClient");
import TFS_VersionControl_Contracts = require("TFS/VersionControl/Contracts");


export class RecentCodeCommits {


    private widgetSettings: any; // this gets updated only in load & reload. So i am keeping this as global varibale instead of passing it around
    private previewSlideCounter: number = 0;
    private currentlyShowingItemIndex: number = -1;
    private changeSets: TFS_VersionControl_Contracts.TfvcChangesetRef[];
  
    private pollerIntervalId: number;
    private previewSwitcherIntervalId: number;
    private tfscRestClient: TfscRestClient.TfvcHttpClient3;

    private $itemsContainer = $("#items");
    private $widgetTitle = $("#widgetTitle");
    private $widgetSubTitle = $("#widgetSubTitle");

    constructor(private WidgetHelpers: any) {

        this.tfscRestClient = TfscRestClient.getClient();
    }


    public load(widgetSettings) {
        this.widgetSettings = widgetSettings;
        return this.getChangeSetData(widgetSettings);
    }
    public reload(widgetSettings) {
        this.widgetSettings = widgetSettings;
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
    private getEmptyStringIfUndefined(input: string, replaceValue: string): string {
        if (typeof input === 'undefined') {
            return replaceValue;
        }
        return input;
    }
    /**
     * this method returns the HTML markup for the grid/table row
     */
    private getGridRow(item: TFS_VersionControl_Contracts.TfvcChangesetRef, baseUrl) {
        var changeSetUrl = baseUrl + '_versionControl/changeset/' + item.changesetId;
        var rowMarkup = '<tr><td class="td-picture"><img class="changeset-author-picture" src="' + item.author.imageUrl + '" /><td>';
        rowMarkup += '<td class="td-result-details">';
        rowMarkup += '<div>';
        rowMarkup += '<a class="link-with-icon-text" href="' + changeSetUrl + '" target="_blank">' + this.getEmptyStringIfUndefined(item.comment,"No comments provided !!! ") + '</a>';
        rowMarkup += '</div>';
        rowMarkup += '<div class="subtitle changeset-meta">' + item.author.displayName + '<span>' + this.getPrettyDate(item.createdDate) + '</span></div>';
        rowMarkup += '</td></tr>';
        return rowMarkup;
    }



    /**
     * this method queries the API to get the change set, loop through the result array and build the grid row and append.
     */
    private getChangesets(projectId: string, maxCommentLength: number, skip: number, top: number, searchCriteria: TFS_VersionControl_Contracts.TfvcChangesetSearchCriteria, baseUrl: string) {
        var _this = this;

        this.tfscRestClient.getChangesets(projectId, maxCommentLength, skip, top, null, searchCriteria)
            .then(function (data: TFS_VersionControl_Contracts.TfvcChangesetRef[]) {

                if (data.length === 0) {
                    _this.$itemsContainer.append("<p>No commits found for the selected filter :( </p>");
                } else {                   
                    _this.changeSets = data;

                    _this.$itemsContainer.empty();
                    var t = $("<table />");
                    $.each(data,
                        function (index, item: TFS_VersionControl_Contracts.TfvcChangesetRef) {
                            t.append(_this.getGridRow(item, baseUrl));
                        });
                    _this.$itemsContainer.append(t);

                    clearInterval(_this.previewSwitcherIntervalId);

                    // Setup the timer for showing the slides and list
                    _this.previewSwitcherIntervalId = setInterval(function () {
                        _this.switchPreview()
                    }, 5000);



                }
            });

    }

    private switchPreview() {
        var _this = this;
        var $previewContainer = $("#itemPreview");
        this.previewSlideCounter++;

        var totalNumberOfItems = this.changeSets.length;
      
        if (this.previewSlideCounter < totalNumberOfItems) {
            $previewContainer.fadeOut(400, function () {
                _this.$itemsContainer.fadeIn();
            });
            return;
            //No need to swap the slides  ( we are showing the list now)
        }

        _this.$itemsContainer.fadeOut();

        this.currentlyShowingItemIndex = this.currentlyShowingItemIndex + 1;

        if (this.currentlyShowingItemIndex >= this.changeSets.length) {
            this.currentlyShowingItemIndex = 0;
        }
        var itemToPreview = this.changeSets[this.currentlyShowingItemIndex];

        $previewContainer.fadeOut(600, function () {
            _this.updatePreviewTexts(itemToPreview, $previewContainer);
            $previewContainer.fadeIn();
        });

        if (this.previewSlideCounter >= (totalNumberOfItems * 2)) {
            this.previewSlideCounter = 0;
        }

    }

    private updatePreviewTexts(changeSet: TFS_VersionControl_Contracts.TfvcChangesetRef, $previewContainer: any) {


        var comment = changeSet.comment;

        if (this.widgetSettings.size.columnSpan === 3 && this.widgetSettings.size.rowSpan === 3) {

            if (comment.length > 230) {
                comment = comment.substr(0, 229) + '...'
            }
        }
        else if (this.widgetSettings.size.columnSpan === 2 && this.widgetSettings.size.rowSpan === 3) {

            if (comment.length > 200) {
                comment = comment.substr(0, 199) + '...'
            }
        }
        else if (this.widgetSettings.size.columnSpan === 2 && this.widgetSettings.size.rowSpan === 2) {

            if (comment.length > 100) {
                comment = comment.substr(0, 99) + '...'
            }
        }

        $previewContainer.find(".changeset-author").text(changeSet.author.displayName);
        $previewContainer.find(".author-image").attr("src", changeSet.author.imageUrl);
        $previewContainer.find(".changeset-comment").text('“' + comment + '”');
        $previewContainer.find(".changeset-time").text(this.getPrettyDate(changeSet.createdDate));
    }

    private getChangeSetData(widgetSettings) {

        var _this = this;

        _this.widgetSettings = widgetSettings;

        $("#itemPreview").removeClass("size-" + widgetSettings.size.columnSpan).addClass("size-" + widgetSettings.size.columnSpan);

        var workRestClient = WorkRestClient.getClient();

        var pollInterval = 60; //seconds

        var maxCommentLength = 300;
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

        var baseUrl = vstsContext.collection.uri + vstsContext.project.name + '/'+vstsContext.team.name+'/';
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
                _this.$widgetTitle.text(widgetTitle);
                _this.$widgetSubTitle.text(widgetSubTitle);
                _this.$itemsContainer.empty();

                var pollIntervalInMilliSeconds = pollInterval * 1000;

                // Clear previously registered setInterval
                clearInterval(_this.pollerIntervalId);
                _this.getChangesets(projectId, maxCommentLength, skip, top, searchCriteria, baseUrl);


                _this.pollerIntervalId = setInterval(function () {
                    _this.getChangesets(projectId, maxCommentLength, skip, top, searchCriteria, baseUrl)
                }, pollIntervalInMilliSeconds);


            });

        return this.WidgetHelpers.WidgetStatusHelper.Success();
    }
}