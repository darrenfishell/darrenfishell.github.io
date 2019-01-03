
---
layout: page
title: Makeover Monday: NHL attendance
permalink: /NHLmakeover/
---

The original visualization showed two key metrics: average annual attendance and the percent change from the previous year, by team.

But numerous decisions in the original visualization made it difficult to see and compare those trends, including: use of the same axis, hard-to-read labels, the use of a line chart to show percent change and alphabetical ranking of the teams.

<img src="https://media.data.world/zTzWrGuNQOtMRyojL11Y_nhl-attendance-thru-feb-9th.png" width="100%">

For my makeover, I kept the focus on those same metrics, but used the expanded scope of the data set to show attendance trends from 2000-2017 (except for newcomers in Vegas, a team with only one season under its belt).

I used a scatterplot to more clearly split out these two trends of average overall attendance and change in attendance, which is measured as a compound growth rate from 2000-2017. I limited this to only home games, which is a more clear measure of enthusiasm for a given team.

The view makes it clearer which teams are up and which are down. For instance, Montreal is a clearer standout, having both the highest average attendance and also attendance gains from 2000-2017. Colorado (whose heydey I greatly enjoyed as a child) is a standout on the other side of the fence, with attendance dropping at a rate of about 1 percent annually _for 17 years_. Eek.

<iframe style="border: none;" src="https://public.tableau.com/views/NHLmakeover/NHL?:showVizHome=no&amp;:embed=true" width="100%" height="635px"></iframe>

I used shapes and color to more clearly distinguish whether teams had increases or drops in attendance, giving the viewer an initial way to sort those shapes before comparing their exact position on the Y axis.

The view also includes a reference line for average attendance across all teams, to help viewers interpret information on the X axis.
