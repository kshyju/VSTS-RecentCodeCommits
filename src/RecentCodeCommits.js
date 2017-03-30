define(["require", "exports", "TFS/VersionControl/TfvcRestClient", "TFS/Work/RestClient"], function (require, exports, TfscRestClient, WorkRestClient) {
    "use strict";
    var RecentCodeCommits = (function () {
        function RecentCodeCommits(WidgetHelpers) {
            this.WidgetHelpers = WidgetHelpers;
            this.previewSlideCounter = 0;
            this.currentlyShowingItemIndex = -1;
            this.$itemsContainer = $("#items");
            this.$widgetTitle = $("#widgetTitle");
            this.$widgetSubTitle = $("#widgetSubTitle");
            this.tfscRestClient = TfscRestClient.getClient();
        }
        RecentCodeCommits.prototype.load = function (widgetSettings) {
            this.widgetSettings = widgetSettings;
            return this.getChangeSetData(widgetSettings);
        };
        RecentCodeCommits.prototype.reload = function (widgetSettings) {
            this.widgetSettings = widgetSettings;
            return this.getChangeSetData(widgetSettings);
        };
        RecentCodeCommits.prototype.getPrettyDate = function (dt) {
            var d = new Date(dt);
            return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
        };
        RecentCodeCommits.prototype.getDateFrom = function (numberOfDaysToCountFrom) {
            var d = new Date();
            if (numberOfDaysToCountFrom) {
                d.setDate(d.getDate() - numberOfDaysToCountFrom);
            }
            return d.toLocaleDateString();
        };
        RecentCodeCommits.prototype.getEmptyStringIfUndefined = function (input, replaceValue) {
            if (typeof input === 'undefined') {
                return replaceValue;
            }
            return input;
        };
        /**
         * this method returns the HTML markup for the grid/table row
         */
        RecentCodeCommits.prototype.getGridRow = function (item, baseUrl) {
            var changeSetUrl = baseUrl + '_versionControl/changeset/' + item.changesetId;
            var rowMarkup = '<tr><td class="td-picture"><img class="changeset-author-picture" src="' + item.author.imageUrl + '" /><td>';
            rowMarkup += '<td class="td-result-details">';
            rowMarkup += '<div>';
            rowMarkup += '<a class="link-with-icon-text" href="' + changeSetUrl + '" target="_blank">' + this.getEmptyStringIfUndefined(item.comment, "No comments provided !!! ") + '</a>';
            rowMarkup += '</div>';
            rowMarkup += '<div class="subtitle changeset-meta">' + item.author.displayName + '<span>' + this.getPrettyDate(item.createdDate) + '</span></div>';
            rowMarkup += '</td></tr>';
            return rowMarkup;
        };
        /**
         * this method queries the API to get the change set, loop through the result array and build the grid row and append.
         */
        RecentCodeCommits.prototype.getChangesets = function (projectId, maxCommentLength, skip, top, searchCriteria, baseUrl) {
            var _this = this;
            this.tfscRestClient.getChangesets(projectId, maxCommentLength, skip, top, null, searchCriteria)
                .then(function (data) {
                if (data.length === 0) {
                    _this.$itemsContainer.append("<p>No commits found for the selected filter :( </p>");
                }
                else {
                    _this.changeSets = data;
                    _this.$itemsContainer.empty();
                    var t = $("<table />");
                    $.each(data, function (index, item) {
                        t.append(_this.getGridRow(item, baseUrl));
                    });
                    _this.$itemsContainer.append(t);
                    clearInterval(_this.previewSwitcherIntervalId);
                    // Setup the timer for showing the slides and list
                    _this.previewSwitcherIntervalId = setInterval(function () {
                        _this.switchPreview();
                    }, 5000);
                }
            });
        };
        RecentCodeCommits.prototype.switchPreview = function () {
            var _this = this;
            var $previewContainer = $("#itemPreview");
            this.previewSlideCounter++;
            var totalNumberOfItems = this.changeSets.length;
            if (this.previewSlideCounter < totalNumberOfItems) {
                $previewContainer.fadeOut(400, function () {
                    _this.$itemsContainer.fadeIn();
                });
                return;
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
        };
        RecentCodeCommits.prototype.updatePreviewTexts = function (changeSet, $previewContainer) {
            var comment = changeSet.comment;
            if (this.widgetSettings.size.columnSpan === 3 && this.widgetSettings.size.rowSpan === 3) {
                if (comment.length > 230) {
                    comment = comment.substr(0, 229) + '...';
                }
            }
            else if (this.widgetSettings.size.columnSpan === 2 && this.widgetSettings.size.rowSpan === 3) {
                if (comment.length > 200) {
                    comment = comment.substr(0, 199) + '...';
                }
            }
            else if (this.widgetSettings.size.columnSpan === 2 && this.widgetSettings.size.rowSpan === 2) {
                if (comment.length > 100) {
                    comment = comment.substr(0, 99) + '...';
                }
            }
            $previewContainer.find(".changeset-author").text(changeSet.author.displayName);
            $previewContainer.find(".author-image").attr("src", changeSet.author.imageUrl);
            $previewContainer.find(".changeset-comment").text('“' + comment + '”');
            $previewContainer.find(".changeset-time").text(this.getPrettyDate(changeSet.createdDate));
        };
        RecentCodeCommits.prototype.getChangeSetData = function (widgetSettings) {
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
            var searchCriteria = {
                author: '',
                followRenames: false, includeLinks: false, fromDate: '', itemPath: '', fromId: null, toId: null, toDate: ''
            };
            var vstsContext = VSS.getWebContext();
            var projectId = vstsContext.project.id;
            var baseUrl = vstsContext.collection.uri + vstsContext.project.name + '/' + vstsContext.team.name + '/';
            var settings = JSON.parse(widgetSettings.customSettings.data);
            var widgetSubTitle = "";
            var widgetTitle = "";
            var projectName = vstsContext.project.id;
            var teamContext = { projectId: projectName, teamId: vstsContext.team.id, project: "", team: "" };
            ;
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
                    _this.getChangesets(projectId, maxCommentLength, skip, top, searchCriteria, baseUrl);
                }, pollIntervalInMilliSeconds);
            });
            return this.WidgetHelpers.WidgetStatusHelper.Success();
        };
        return RecentCodeCommits;
    }());
    exports.RecentCodeCommits = RecentCodeCommits;
});
