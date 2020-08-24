---
layout: wide-page
title: Track Maine coronavirus cases and rates by county
---
COVID-19, the illness caused by the novel coronavirus, continues to spread throughout Maine, with the first signs emerging of "community spread" in Cumberland County as of Tuesday, March 17.

The Maine CDC is [publishing](https://www.maine.gov/dhhs/mecdc/infectious-disease/epi/airborne/coronavirus.shtml) details about each confirmed case in the state, as well as negative tests, which are visualized below.

As the Maine CDC publishes these numbers, its director, Dr. Nirav Shah, has noted that it's unclear how much the data lags behind the real spread of the virus.

"What we know about outbreaks is that we are often just detecting the tip of the iceberg," Shah told reporters on March 22, according to [Maine Public](https://www.mainepublic.org/post/number-maine-covid-19-cases-rises-89).

_The dashboards below update daily from Google Sheets._

_For ongoing coverage of coronavirus in Maine, see the free coverage from the [Bangor Daily News](https://bangordailynews.com/topic/coronavirus/), the [Portland Press Herald](https://www.pressherald.com/coronavirus/) and [Maine Public](https://www.mainepublic.org/post/what-mainers-need-know-about-coronavirus). On Twitter, [OpenMaine](https://twitter.com/Open_Maine) also has some cool digital resources in the works._

The trend in unresolved cases has gradually declined since a peak in late May. Unresolved cases are calculated as the sum of all reported cases, less deaths and recoveries.

<div><iframe style="border: none;" src="https://public.tableausoftware.com/views/covid-19-maine-dashboard/Unresolvedcasesbycounty?:showVizHome=no&amp;:embed=true" width="100%" height="835px"></iframe></div>

The chart below shows an overview of case trends, also filterable by county.

<div><iframe style="border: none;" src="https://public.tableausoftware.com/views/covid-19-maine-dashboard/COVID-19casesbyMainecounty?:showVizHome=no&amp;:embed=true" width="100%" height="835px"></iframe></div>

The chart on the left warrants a close look, as it reflects the growth trend in cases, on a logarithmic scale. As [The New York Times](https://www.nytimes.com/2020/03/20/health/coronavirus-data-logarithm-chart.html) detailed:

>Unconstrained, the coronavirus spreads exponentially, the caseload doubling at a steady rate. That curve, plotted linearly, is a skyrocketing curve. Plotted logarithmically, however, it transforms into a straight line — which means that deviations from the exponential spread of the virus become much easier to discern.

<div><iframe style="border: none;" src="https://public.tableausoftware.com/views/covid-19-maine-dashboard/BigCurve?:showVizHome=no&amp;:embed=true" width="100%" height="735px"></iframe></div>

That kind of curve is great to show places avoiding exponential case growth, but it can mask the still concerning linear growth, as is the case in Cumberland County.

This trend is visible in the county-level chart below, also since the first day that an area hit 10 cases or more.

<div><iframe style="border: none;" src="https://public.tableausoftware.com/views/covid-19-maine-dashboard/mainecountycurve?:showVizHome=no&amp;:embed=true" width="100%" height="735px"></iframe></div>

We can also use the current growth rate in confirmed COVID-19 cases to calculate how long it is taking for cases to double, called the doubling time.

The chart below shows this doubling time for each state, also starting from the first day where each state had at least 10 cases.

<div><iframe style="border: none;" src="https://public.tableausoftware.com/views/covid-19-maine-dashboard/DoublingRate?:showVizHome=no&amp;:embed=true" width="100%" height="735px"></iframe></div>

## The process behind the charts
The data above is scraped from the Maine CDC website in Python, based on table names at the CDC's coronavirus webpage (more details in this [Github repository](https://github.com/darrenfishell/data-projects/tree/master/covid-19-me)). The scraper runs every hour from 11 a.m. to 6 p.m. and stores a time series of the daily updates from the Maine CDC, starting March 10.

Tableau Public refreshes every 24 hours, in the afternoon.

You can find the raw output in this [project at data.world](https://data.world/darrenfishell/covid-19-me) or this [Google Sheet](https://docs.google.com/spreadsheets/d/1DXlFVTgbXE3avpFPp1gJ5IFu7cEN9Hl9yhYSFskffGE/edit#gid=0).

The sources include four of the different tables that the Maine CDC is publishing separately: a summary of cases, cases by county, cases by age and cases by sex.
