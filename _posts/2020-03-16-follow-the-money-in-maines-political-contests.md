---
layout: wide-page
title: Follow the money in Maine's 2020 political contests
---
Maine's competitive Senate race has already attracted more than $20 million in contributions and outside spending, with election day still months away.

The dashboards below aim to make that flood of cash a little more digestible. The dashboards are still a little of a work in progress, but they update nightly from the FEC.

The primary work of the dashboard is bringing together disparate sources of information on campaign spending to summarize the influence in any given race.

For instance, the top left element combines totals contributed directly to a campaign committee or an affiliated committee with spending by outside groups and political parties.

Amounts to support are added into a candidate's total while amounts to oppose are noted as negative values on the x-axis.

### Maine Senate

<div><iframe style="border: none;" src="https://public.tableausoftware.com/views/senate-race-summary-dashboards/Senate?:showVizHome=no&amp;:embed=true" width="100%" height="935px"></iframe></div>

## Congressional District 2

<div><iframe style="border: none;" src="https://public.tableausoftware.com/views/senate-race-summary-dashboards/CD2?:showVizHome=no&amp;:embed=true" width="100%" height="935px"></iframe></div>

## Congressional District 1

<div><iframe style="border: none;" src="https://public.tableausoftware.com/views/senate-race-summary-dashboards/CD1?:showVizHome=no&amp;:embed=true" width="100%" height="935px"></iframe></div>

https://public.tableau.com/profile/darren.fishell#!/vizhome/?publish=yes

## Data details
The data is provided by the Federal Election Commission's API, for races in Maine. The data source is updated nightly.

There are still updates to come for the data pipeline: Now, unitemized contributions from the campaigns are bundled together. More detail is available from committees like ActBlue and WinRed, which itemize all contributions through their platforms.

The pipeline will eventually replace the unitemized donations with those itemized contributions.

I will also be adding different visualizations to track state races, coming nightly from the Maine Ethics Commission.

The state and federal data are stored in separate repositories at data.world: [Congressional races](https://data.world/darrenfishell/2020-election-repo) \| [State races](https://data.world/darrenfishell/2020-maine-state-campaign-finance).

Data.world houses the raw output from the FEC for Maine and the SQL scripts to bring those different tables together, for export to Google Sheets. The Tableau graphics refresh nightly from the Google Sheet source.
