<div class="projects-grid">

  <article class="project-card">
    <a class="project-card-media" href="{{ site.baseurl }}/retail-electricity-ripoff">
      <img src="{{ site.baseurl }}/images/projects/retail-electricity.png" alt="Chart of Maine retail electricity supplier charges above the standard offer" loading="lazy">
    </a>
    <div class="project-card-body">
      <p class="project-meta">Portland, Maine · Jan 2015 — Present</p>
      <h3><a href="{{ site.baseurl }}/retail-electricity-ripoff">Cost analysis for Maine's residential retail electricity suppliers</a></h3>
      <p>Developed a data pipeline and framework for comparing cost of Maine's retail electricity supplier prices to the state's standard offer. This framework was validated and adopted by the Maine Public Utilities Commission in their own study. The analysis revealed Maine customers could have saved $180.5 million from 2012-2024. Initial analysis at the Bangor Daily News was done manually and visualized in Tableau. The updated project uses dlt for data ingestion, dbt for transformations and the Observable Framework to display interactive visualizations.</p>
    </div>
  </article>

  <article class="project-card">
    <a class="project-card-media" href="https://github.com/darrenfishell/newspaper-jobs">
      <img src="{{ site.baseurl }}/images/projects/newspaper-jobs-trends.png" alt="Tableau visualization of statewide newspaper publishing job trends" loading="lazy">
    </a>
    <div class="project-card-body">
      <p class="project-meta">Portland, Maine · August 2025</p>
      <h3><a href="https://github.com/darrenfishell/newspaper-jobs">Newspaper jobs in freefall</a></h3>
      <p>Formalized a data pipeline for statewide payroll jobs data from the U.S. Bureau of Labor Statistics' Quarterly Census of Employment and Wages. This project includes visualizations highlighting particular trends within newspaper publishing jobs, a subject I previously reported on for the <a href="https://themainemonitor.org/the-growing-crisis-in-the-maine-newspaper-industry/">Maine Monitor</a>.</p>
    </div>
  </article>

  <article class="project-card">
    <div class="project-card-media project-card-media--stat" aria-hidden="true">
      <span class="project-stat-value">0.535</span>
      <span class="project-stat-label">silhouette score · 3.6M embedded sentences</span>
    </div>
    <div class="project-card-body">
      <p class="project-meta">Portland, Maine · Sep 2024 — Present</p>
      <h3><a href="https://github.com/darrenfishell/maine-legislative-interpreter">Semantic similarity analysis in Maine legislative testimony</a></h3>
      <p>Built end-to-end pipeline for 20,000+ bills with semantic clustering and a vector embedding system for 3.6M sentences using HuggingFace transformers. Created vector search in DuckDB for real-time similarity queries, enabling analysis of testimony influence patterns for Sierra Club advocacy.</p>
    </div>
  </article>

  <article class="project-card">
    <div class="project-card-media project-card-media--stat project-card-media--stat-alt" aria-hidden="true">
      <span class="project-stat-value">PPP</span>
      <span class="project-stat-label">bias detection · multi-source regression</span>
    </div>
    <div class="project-card-body">
      <p class="project-meta">Portland, Maine · Jan 2022 — Jun 2022</p>
      <h3><a href="https://github.com/darrenfishell/ppp_lending_analysis">Bias detection in Paycheck Protection Program funding</a></h3>
      <p>Identified statistically significant biases in PPP loan distribution during COVID-19 by integrating multiple data sources and applying regression modeling that controlled for confounding variables including rural-urban differences and industry concentration.</p>
      <p>Group project originally written in R and refactored in Python within the repository above.</p>
    </div>
  </article>

  <article class="project-card">
    <div class="project-card-media project-card-media--stat project-card-media--stat-third" aria-hidden="true">
      <span class="project-stat-value">90%</span>
      <span class="project-stat-label">lower annual development costs</span>
    </div>
    <div class="project-card-body">
      <p class="project-meta">Portland, Maine · Jan 2024 — Dec 2025</p>
      <h3>Improving data quality and data model for healthcare client deliverables</h3>
      <p class="project-subhead">Crossover and Disproportionate Share Hospital reporting</p>
      <p>Refactored brittle Perl/VBA pipeline with Python ETL for Medicare EDI 835 files and PDF remittance advice, implementing pattern-based extraction, DuckDB storage, and SQL view transformations. Cut annual development costs by 90% while improving modularity, speed and data quality.</p>
    </div>
  </article>

</div>
