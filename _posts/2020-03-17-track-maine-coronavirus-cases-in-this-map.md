---
layout: wide-page
title: Track Maine coronavirus cases by county in this interactive map
---
The virus COVID-19 continues to spread throughout Maine, with the first signs emerging of "community spread" in Cumberland County as of Tuesday, March 17.

The Maine CDC is [publishing](https://www.maine.gov/dhhs/mecdc/infectious-disease/epi/airborne/coronavirus.shtml) details about each confirmed case in the state, as well as negative tests, which are visualized below.

As the CDC publishes these numbers, its director has, Dr. Nirav Shah, has noted that it's unclear how much the data lags behind the real spread of the virus.

"What we know about outbreaks is that we are often just detecting the tip of the iceberg," Shah told reporters Sunday, according to [Maine Public](https://www.mainepublic.org/post/number-maine-covid-19-cases-rises-89).

_For ongoing coverage of coronavirus in Maine, see the free coverage from the [Bangor Daily News](https://bangordailynews.com/topic/coronavirus/), the [Portland Press Herald](https://www.pressherald.com/coronavirus/) and [Maine Public](https://www.mainepublic.org/post/what-mainers-need-know-about-coronavirus). On Twitter, [OpenMaine](https://twitter.com/Open_Maine) also has some cool digital resources in the works._

_Update:_ The dashboard now updates daily from Google Sheets. The Google Sheet updates hourly, from 11 a.m. to 6 p.m., based on the CDC's historical daily update time.

<div><iframe style="border: none;" src="https://public.tableausoftware.com/views/covid-19-maine-dashboard/COVID-19casesbyMainecounty?:showVizHome=no&amp;:embed=true" width="100%" height="835px"></iframe></div>

## The process behind the map
The data above is scraped from the Maine CDC website in Python, based on table names at the CDC's coronavirus webpage (more details in this [Github repository](https://github.com/darrenfishell/data-projects/tree/master/covid-19-me)). The scraper runs every hour from 11 a.m. to 6 p.m. and stores a time series of the daily updates from the Maine CDC, starting March 10.

Tableau Public refreshes every 24 hours, in the afternoon.

You can find the raw output in this [project at data.world](https://data.world/darrenfishell/covid-19-me) or this [Google Sheet](https://docs.google.com/spreadsheets/d/1DXlFVTgbXE3avpFPp1gJ5IFu7cEN9Hl9yhYSFskffGE/edit#gid=0).

The sources include four of the different tables that the Maine CDC is publishing separately: a summary of cases, cases by county, cases by age and cases by sex.
