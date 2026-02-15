---
layout: default
permalink: /blog/
---

<div class="posts">
  {% for post in site.posts %}
    <article class="post">
      {{ post.date | date: "%B %d, %Y" }}
      <h1><a href="{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></h1>
      <div class="entry">
        <em>{{ post.excerpt }}</em>
      </div>

      <a href="{{ site.baseurl }}{{ post.url }}" class="read-more">Read More</a>
    </article>
  {% endfor %}
</div>

