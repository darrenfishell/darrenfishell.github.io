---
layout: wide-page
title: Track Maine coronavirus cases by county in this interactive map
---
The virus COVID-19 continues to spread throughout Maine, with the first signs emerging of "community spread" in Cumberland County as of Tuesday, March 17.

The Maine CDC is [publishing](https://www.maine.gov/dhhs/mecdc/infectious-disease/epi/airborne/coronavirus.shtml) details about each confirmed and presumptive positive case in the state, as well as negative tests, which are visualized below.

_For ongoing coverage of coronavirus in Maine, see the free coverage from the [Bangor Daily News](https://bangordailynews.com/topic/coronavirus/) and the [Portland Press Herald](https://www.pressherald.com/coronavirus/). On Twitter, [OpenMaine](https://twitter.com/Open_Maine) also has some cool digital resources in the works._

<div><iframe style="border: none;" src="https://public.tableausoftware.com/views/covid-19-maine-dashboard/COVID-19casesbystatusandMainecounty?:showVizHome=no&amp;:embed=true" width="100%" height="835px"></iframe></div>

## The process behind the map
The data above is scraped from the Maine CDC website in Python, based on table names at the CDC's coronavirus webpage (more details in this [Github repository](https://github.com/darrenfishell/data-projects/tree/master/covid-19-me)). The scraper not currently scheduled to run on a regular cadence, as the state's reporting methods could change as the pandemic continues to spread.
