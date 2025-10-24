---
layout: wide-page
title: Maine households could have saved $200 million on electricity in past decade
---

Maine households paying more than the standard rate for power jumped sharply last year, after hitting a nine-year low in 2023.

According to federal data updated annually, Maine households spent $67.6 million with these retail electricity providers. That's roughly $20 million more than this group of customers would have spent by purchasing power instead from the standard offer. 

There's plenty of backstory here, covered in this dedicated project page:

> [The project page: Maine's retail electricity ripoff]({{ site.baseurl }}/retail-electricity-ripoff/)

And you can find more of the technical details about the analysis and the data pipeline from [this post](https://www.darrenfishell.website/revisiting-maines-electricity-ripoff/) back in May. 

I can vouch for the benefits of the refactored data pipeline, as this year's update — from source data to visuals — took minutes. I'll continue to sing the praises of DuckDB for this kind of work, from analysis to presentation and data wrangling within the Observable Framework site.

<style>
	
blockquote a {
  /* Bold, larger text */
  font-size: 1.1em;
  
  /* Create a subtle background highlight */
  background-color: rgba(255, 255, 0, 0.2);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  
  /* Better link styling */
  color: #0066cc;
  text-decoration: none;
  transition: all 0.2s ease;
  
  /* Add a slight underline effect */
  border-bottom: 2px solid currentColor;
}

/* Interactive effects on hover */
blockquote a:hover {
  background-color: rgba(255, 255, 0, 0.3);
  color: #004499;
  text-decoration: none;
  transform: translateY(-1px);
}

/* Active state for clicking */
blockquote a:active {
  transform: translateY(1px);
}

</style>