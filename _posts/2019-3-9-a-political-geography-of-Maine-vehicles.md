---
layout: wide-page
title: A political geography of Maine, or how winning truck town wasn't enough for Shawn Moody
---
After a rough election for Republicans in Maine, it appears they might have a statewide electoral problem: winning truck country is not enough.

Election returns and a database of vehicle registrations by town show Republican gubernatorial candidate Shawn Moody relied heavily on votes from towns where the Ford F-150, Chevy Silverado or GMC Sierra are the most popular vehicles.

Almost `7 in 10` votes for Moody came from such towns; he won `3 in 4` towns where a truck is the most popular vehicle.

<div><iframe style="border: none;" src="https://public.tableausoftware.com/views/Topvehiclesbygubernatorialvote/Townswonintruckcountry?:showVizHome=no&amp;:embed=true" width="100%" height="735px"></iframe></div>

### Cut too thin to win
While Moody cleaned up in truck towns, his margins there were relatively thin when compared with the lead Democratic Gov. Janet Mills amassed in Subaru country. That reflects a general urban-rural split, but vehicle data shows that's not the whole story.

In places where the Subaru Forester is the most popular vehicle, Mills got nearly 3 times the votes as Moody. Mills almost matched Moody's votes from Silverado towns.

By town, Mills won Subaru Forester country `25:1`; Moody had a little more than a `3:1` lead on Mills for Chevy Silverado towns, where he picked up most of his votes.

(Truck towns hold some relation to the vote share Moody ultimately picked up. If the leading truck made up a larger share of all vehicles, that showed a [slight correlation](https://public.tableau.com/views/Topvehiclesbygubernatorialvote/Moodysmarginintrucktown?:embed=y&:display_count=yes&publish=yes) with higher vote margins for Moody.)

By vehicle make, Moody had a `16,705` vote lead in Chevy towns; Mills led by `47,832` in Subaru towns.

<div><iframe style="border: none;" src="https://public.tableausoftware.com/views/Topvehiclesbygubernatorialvote/Votesbytopvehicle?:showVizHome=no&amp;:embed=true" width="100%" height="485px"></iframe></div>

Overall, Mills lagged Moody by about `21,600` votes in truck country. Moody lost by about `69,000` votes in areas where trucks were not the most popular choice.

### What does your vehicle say about your partisan leanings?

The data points to some general trends in the partisan lean of specific vehicles.

For this analysis, I winnowed the data down to a pairing of an election winner and the most popular local vehicle -- a process that largely involved cleaning and standardizing model names from the vehicle registration data (thank you very much, [OpenRefine](http://openrefine.org/)). For instance, the GMC Sierra and Chevy Silverado were reported both under those names and the model name `1500`.

The result allows us to see how towns voted, broken out by the most popular local vehicle.

Among the trucks, there was one outlier: the Toyota Tacoma. Mills and Moody both won 3 Tacoma towns each, making it the most bipartisan by towns won. By votes, the Nissan Sentra was the most middle of the road. Moody edged out Mills in Sentra towns by `90` votes.

<div><iframe style="border: none;" src="https://public.tableausoftware.com/views/Topvehiclesbygubernatorialvote/PartisanleanofMainevehicles?:showVizHome=no&amp;:embed=true" width="100%" height="735px"></iframe></div>

By make, GMC- and Chevy-led towns leaned heavily Republican. Subaru-led towns leaned left (with the exceptions only of Woolwich and Kingfield).

The graphic below shows those fault lines in more detail. For instance, you can see the Silverado town votes that went for Mills and the Toyota Camry votes that went for Moody.

<div><iframe style="border: none;" src="https://public.tableausoftware.com/views/Topvehiclesbygubernatorialvote/Vehiclesbyvote?:showVizHome=no&amp;:embed=true" width="100%" height="735px"></iframe></div>

### Search your towns
Use the search below to find local election results and the top 25 vehicles in Maine towns.

<div><iframe style="border: none;" src="https://public.tableausoftware.com/views/Topvehiclesbygubernatorialvote/Localtownsearch?:showVizHome=no&amp;:embed=true" width="100%" height="635px"></iframe></div>

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
