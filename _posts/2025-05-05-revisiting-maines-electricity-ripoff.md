---
layout: wide-page
title: A durable data pipeline for tracking Revisiting Maine's retail electricity ripoff 
---

Some of the best things in journalism are your unique obsessions. I consider retail electricity pricing in Maine one of mine. 

So, it's fitting that I've thought about that work a lot since 2022, when I really stopped freelance reporting and focused solely on business intelligence work. But with those years of professional and academic experience done, I've turned to rebuilding that data pipeline and front end with a dedicated project I'm much more easily able to maintain. 

I'm delighted to share the dedicated project page for this work, which puts some of the data in context. 

# [The project page: Maine's retail electricity ripoff](https://www.darrenfishell.website/retail-electricity/)

The backend is built with dlt and dbt and is currently run locally, outputting a database in DuckDB that is ready for further analysis. 

The database is used directly in Observable data loaders upon deployment, with Github actions. The whole update of the process means the entire pipeline is much easier to maintain going forward.

Of course, I'm still partial to the ease of visualization development within Tableau, but the Observable and Plot frontend is much simpler, cleaner and snappier. 

I'm a big fan of this entire stack for future development. Find all of the technical details [here](https://github.com/darrenfishell/retail-electricity). 