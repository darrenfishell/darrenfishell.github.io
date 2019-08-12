---
layout: wide-page
title: A political geography of Maine, or how winning truck town wasn't enough for Shawn Moody
---
After a [rough 2018 election for Republicans in Maine](https://bangordailynews.com/2018/11/07/politics/democrats-surge-to-solid-control-of-maine-legislature/), it appears they might have a statewide electoral problem: winning Maine's truck country was not enough to take the Blaine House.

Election returns and a database of vehicle registrations, as of September 2018, show Republican gubernatorial candidate Shawn Moody relied heavily on votes from towns where the Ford F-150, Chevy Silverado or GMC Sierra are the most popular vehicles.

Almost `7 in 10` votes for Moody came from such towns; he won `3 in 4` towns where a truck is the most popular vehicle. As trucks make up the top three vehicles in the state -- the Chevy Silverado, Ford F-150 and GMC Sierra -- that's a big pond to fish. But it wasn't enough. And he narrowly lost F-150 country.

<p><iframe style="border: none;" src="https://public.tableausoftware.com/views/Topvehiclesandthegovernorsracerevised/Votesbytopvehicle?:showVizHome=no&amp;:embed=true" width="100%" height="485px"></iframe></p>

For a frame of reference, let's focus first on the vehicles, establishing what we're dealing with for what we'll call truck- and non-truck towns. Generally, a truck was not the most popular vehicle in the state's coastal communities and urban centers.

There are some exceptions to that trend: for instance, the Chevy Impala was the most popular vehicle in the Southern Aroostook County town of Sherman, by one vehicle.

<!--TRUCK TOWNS AND NON-TRUCK TOWNS-->
<div><iframe style="border: none;" src="https://public.tableausoftware.com/views/Topvehiclesandthegovernorsracerevised/Trucktownsandnon-trucktowns?:showVizHome=no&amp;:embed=true" width="100%" height="635px"></iframe></div>

As you can see hovering over towns in the map above, many places are like Sherman, where the top vehicle has a narrow lead. But, the same goes for the governor's race. In both cases, we're going with majority rule for the rest of this analysis.

### Cut too thin to win in truck country

While Moody cleaned up in winning truck towns, his vote margins there were relatively thin. They were dwarfed by the lead Democratic Gov. Janet Mills amassed in Subaru country.

Overall, Mills held a pretty even margin in truck towns while dominating elsewhere by a nearly two-to-one margin.

<div><iframe style="border: none;" src="https://public.tableausoftware.com/views/Topvehiclesandthegovernorsracerevised/Townswonintruckcountry?:showVizHome=no&amp;:embed=true" width="100%" height="735px"></iframe></div>

The truck- and non-truck map reflects a general urban-rural split, but a closer look at vehicle totals and vote tallies by town show that's not the whole story.

In places where the Subaru Forester is the most popular vehicle, Mills got nearly 3 times the votes as Moody. Meanwhile, Mills nearly matched Moody's votes from Silverado towns.

<div><iframe style="border: none;" src="https://public.tableausoftware.com/views/Topvehiclesandthegovernorsracerevised/Vehiclesbyvote?:showVizHome=no&amp;:embed=true" width="100%" height="735px"></iframe></div>

Mills won a majority in Subaru Forester communities by a margin of `25:1`; Moody had a little more than a `3:1` lead on Mills for Chevy Silverado towns, where he picked up most of his votes.

Overall, Mills lagged Moody by `21,730` votes in truck country. Moody lost by about `69,100` votes in areas where trucks were not the most popular choice.

(Just how "trucky" a town is also shows some relation to the vote share Moody ultimately picked up, though slight. In other words, Moody's vote lead was [generally higher](https://public.tableau.com/views/Topvehiclesbygubernatorialvote/Moodysmarginintrucktown?:embed=y&:display_count=yes&publish=yes) where trucks had a stronger lead as the most popular vehicle.)

### What does your vehicle say about your partisan leanings?

Looking at the data a different way, it points to the partisan lean of specific rides.

Among the trucks, there was one outlier: the Toyota Tacoma. Mills and Moody both won 3 Tacoma towns each, making it the most bipartisan by towns won. By votes, the Ford F-150 was the most bipartisan, for vehicles that were the most popular in more than one community.

Mills edged out Moody in Maine's `76` F-150 towns by a margin of `985` votes.

<div><iframe style="border: none;" src="https://public.tableausoftware.com/views/Topvehiclesandthegovernorsracerevised/PartisanleanofMainevehicles?:showVizHome=no&amp;:embed=true" width="100%" height="735px"></iframe></div>

By make, GMC- and Chevy-led towns leaned heavily Republican. Subaru-led towns showed the most partisan lean of all, with the exceptions only of Woolwich and Kingfield. Looking only at votes for the two major party candidates, Mills racked up about `73%` of votes in Subaru Forester communities.

### Search by town
Use the search below to find local election results and the top 25 vehicles in Maine towns.

<div><iframe style="border: none;" src="https://public.tableausoftware.com/views/Topvehiclesandthegovernorsracerevised/Localtownsearch?:showVizHome=no&amp;:embed=true" width="100%" height="635px"></iframe></div>

### Data accounting
The analysis leaves some data on the cutting room floor, but ultimately accounts for more than 98 percent of all vehicle registrations and votes cast in the 2018 gubernatorial election. The vehicle registration data was captured before the election, as of Sept. 18, 2018, by request to the Maine Secretary of State's Office.

From the vehicle registration data, the analysis excludes towns where there was no clear top vehicle — ties of `1–1`, for instance. From the election data, it does not factor in overseas votes. A group of smaller towns were also not included because the voting district does not align with a distinct municipal boundary.

Any areas where voting is combined were grouped by the first town listed. For instance, the five votes from `Adamstown/Lower Cupsuptic Twps (Rangeley)` were processed as `Adamstown` and did not match with a geography provided by the Maine Office of GIS. For `Argyle Twp (Alton, Edinburg & Penobscot Nation)`, however, `Argyle Twp` was selected and matched.

The vehicle data was cleaned in OpenRefine, using fingerprint and phonetic string matching techniques for vehicle model names within each separate vehicle make.

That data was processed and merged with election results in a [public data.world project](https://data.world/darrenfishell/a-political-geography-of-maine-vehicles). That project also includes emissions data from the U.S. EPA, which was not able to join smoothly with the vehicle registration data. That database includes not only vehicle types, but estimated miles per gallon for vehicle years, etc., and could support additional analysis.

The original and cleaned vehicle registration file and election results file - with headers reformatted from the [Secretary of State's original](https://www.maine.gov/sos/cec/elec/results/index.html) - are all available in that project.

<!-- Vehicles
Joined data | SOS data
1,153,322 | 1,171,069 | 98.4%

Janet:
Joined data | SOS data
315,612 | 320,962 | 98.3%

Moody:
Joined data | SOS data
268,210 | 272,311 | 98.5%

Total votes
Joined data | SOS data
635,648 | 646,013 | 98.4% -->
