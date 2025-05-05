---
layout: page
title: Projects
permalink: /projects/
---

# Retail Electricity Ripoff

Maine households are leaking about $15 million a year since 2012 to retail electricity companies who charge, on average, more than the default rate for electricity. The analysis is fairly easy to repeat but when I first began reporting on the topic, I did not have right toolkit to build this into a proper project. 

The project is an end-to-end data pipeline with visualizations and a front-end built using the Observable Framework and Github Actions. The project is a domain that I know well and the only such implementation of this kind of pipeline that I've built to date that uses public data.

There is far more detail on the project at the dedicated [project site]({{ site.baseurl }}/retail-electricity). 

# Semantic similarity analysis in Maine legislative testimony

Built end-to-end pipeline for 20,000+ bills with semantic clustering (0.535 silhouette score) and vector embedding system for 3.6M sentences using HuggingFace transformers. Created vector search in DuckDB for real-time similarity queries, enabling analysis of testimony influence patterns for Sierra Club advocacy.

Data pipeline improvements and front-end are still in development. Clustering and semantic similarity searches within Observable are validated for dynamic generation within specific organization pages. 

# Improving data quality and data model for healthcare client

Refactored brittle Perl/VBA pipeline with Python ETL for Medicare EDI 835 files and PDF remittance advice, implementing pattern-based extraction, DuckDB storage, and SQL view transformations. Cut annual development costs by 90% while improving modularity, speed and data quality.

This project was done while at Baker Newman Noyes. 

# Bias detection in Paycheck Protection Program funding Portland, Maine

Identified statistically significant biases in PPP loan distribution during COVID-19 by integrating multiple data sources and applying regression modeling that controlled for confounding variables including rural-urban differences and industry concentration. The project was completed in R. 