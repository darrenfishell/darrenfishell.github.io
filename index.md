---
layout: default
title: Home
---

<div class="homepage-about">
  <div class="about-content">
    {% capture about_content %}{% include about.md %}{% endcapture %}
    {{ about_content | markdownify }}
    <div class="news-hole-entry">
      <button type="button" id="news-hole-mode-btn" class="news-hole-btn">news hole mode</button>
    </div>
  </div>
</div>

<section class="home-blog" aria-labelledby="home-blog-heading">
  <div class="home-section-head">
    <h2 id="home-blog-heading">Recent writing</h2>
    <a class="home-section-link" href="{{ site.baseurl }}/blog">All posts →</a>
  </div>

  <div class="posts home-posts">
    {% for post in site.posts limit:3 %}
      <article class="post home-post{% if forloop.first %} home-post--latest{% endif %}">
        <time class="date" datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%B %d, %Y" }}</time>
        <h1><a href="{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></h1>
        <div class="entry">
          <em>{{ post.excerpt | strip_html | truncatewords: 36 }}</em>
        </div>
        <a href="{{ site.baseurl }}{{ post.url }}" class="read-more">Read more</a>
      </article>
    {% endfor %}
  </div>
</section>

<div id="headlines-container"></div>

<!-- The visual "hole" vortex (visible only in hole mode) -->
<div class="news-hole-vortex" id="news-hole-vortex"></div>

<!-- News hole mode overlay: exit button at top (visible only in hole mode) -->
<div class="news-hole-ui" id="news-hole-ui" aria-hidden="true">
  <div class="news-hole-top">
    <button type="button" id="exit-news-hole-btn" class="news-hole-btn news-hole-exit">exit the hole</button>
  </div>
</div>

<script src="{{ site.baseurl }}/assets/js/news-headlines.js"></script>
<script>
(function() {
  var btn = document.getElementById('news-hole-mode-btn');
  var exitBtn = document.getElementById('exit-news-hole-btn');
  var ui = document.getElementById('news-hole-ui');

  function enterHoleMode() {
    document.body.classList.add('news-hole-mode');
    if (ui) ui.setAttribute('aria-hidden', 'false');
    window.dispatchEvent(new CustomEvent('news-hole-mode-change', { detail: { active: true } }));
  }

  function exitHoleMode() {
    document.body.classList.remove('news-hole-mode');
    if (ui) ui.setAttribute('aria-hidden', 'true');
    window.dispatchEvent(new CustomEvent('news-hole-mode-change', { detail: { active: false } }));
  }

  if (btn) btn.addEventListener('click', enterHoleMode);
  if (exitBtn) exitBtn.addEventListener('click', exitHoleMode);
})();
</script>
