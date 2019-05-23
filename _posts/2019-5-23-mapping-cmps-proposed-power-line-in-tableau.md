---
layout: wide-page
title: Mapping CMP's controversial power line proposal in Tableau 2019.2
---
Central Maine Power Co.'s controversial power line proposal winds its way through 37 different communities, which has elicited opposition from towns along the route and even from three communities outside of the project path.

By the latest tally compiled by opponents at the Natural Resources Council of Maine, 15 communities have come out against or rescinded support for the project. The City of Lewiston has maintained its support, while a number of those opposing communities reversed their earlier support.

<div><iframe style="border: none;" src="https://public.tableausoftware.com/views/TownsalongtheNECECroute/TownsalongtheNECECroute?:showVizHome=no&amp;:embed=true" width="100%" height="735px"></iframe></div>

Updates to spatial file handling and background maps in Tableau 2019.2 improve the performance of GIS layers from the Maine Office of GIS and Maine Department of Environmental Protection that outline the project.

The biggest mapping change is under the hood, with Tableau now using vector maps, with `streets`, `outdoor` and `satellite` map layers that users of Google Maps, etc., will recognize. The detail and resolution when zooming is _much improved._

Tableau's latest releases have made big leaps in handling geospatial data, including an ability introduced earlier to perform spatial joins between shapefiles.

I used a spatial join here to unify the project files for the New England Clean Energy Connect project with a shapefile of municipal boundaries from MEGIS. We can then narrow down our town boundary data to only those that intersect with the project OR those that have given their two cents on the project.

The support/opposition fields come from a separate file I compiled, based on a [tally](https://www.nrcm.org/projects/climate/proposed-cmp-transmission-line-bad-deal-maine/) from the Natural Resources Council of Maine and media reports ([here's Lewiston's statement of support](https://www.necleanenergyconnect.org/necec-milestones/2018/6/18/city-of-lewiston)).

Feel free to add any comments on other communities to note in that [simple tally here](https://docs.google.com/spreadsheets/d/1rLQ7gcWu-8hZPqYgOn8SnWJocJ_Vsb0tWhYNqSaeDB4/edit#gid=0).

Importantly, the latest update to Tableau expands spatial joins to text files, too, meaning you can blend shapefiles and text files that have no common fields but have some intersection on the map.

With that, some new calculations also enable better handling of geospatial data trapped in text files, with new functions `MAKELINE()` and `MAKEPOINT()` to eliminate the need to do spatial joins in another tool to land one shapefile in Tableau.

_[Find more on the source files *and* an earlier (and less interesting) CartoDB map of the project here](http://www.darrenfishell.website/heres-the-path-of-cmps-proposed-power-line/)._
