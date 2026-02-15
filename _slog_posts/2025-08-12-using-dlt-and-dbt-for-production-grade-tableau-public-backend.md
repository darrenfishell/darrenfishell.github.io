---
layout: post
title: Building a modern analytics pipeline for Tableau Public with dlt, dbt, and DuckDB
date: 2025-08-12
---

A comprehensive guide to building a production-grade analytics pipeline combining dlt for data extraction, DuckDB for local analytics, and dbt for transformations, specifically designed to serve Tableau Public visualizations. The pipeline demonstrates how to automatically export dbt models to CSV files using post-hooks, creating a dedicated `tableau_public` schema that separates public-facing datasets from internal analytical work, enabling reproducible publishing and version control for visualizations.
