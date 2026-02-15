.PHONY: install serve build clean

# Install gems (uses vendor/bundle if configured)
install:
	bundle install

# Serve site locally at http://127.0.0.1:4000/
serve:
	bundle exec jekyll serve --livereload

# One-off build (output in _site/)
build:
	bundle exec jekyll build

# Remove generated site and optional bundle cache
clean:
	rm -rf _site
	rm -rf .jekyll-cache
