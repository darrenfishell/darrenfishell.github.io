---
layout: default
---

<div class="homepage-about">
  <div class="about-content">
    {% capture about_content %}{% include about.md %}{% endcapture %}
    {{ about_content | markdownify }}
  </div>
</div>

<div id="headlines-container"></div>

<script src="{{ site.baseurl }}/assets/js/news-headlines.js"></script>

