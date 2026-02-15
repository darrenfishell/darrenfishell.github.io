PROJECT_ROOT := .

# Prefer Homebrew Ruby 3.2 when present (avoids system 2.6 / Ruby 4.x native gem issues).
RUBY32_PREFIX := /opt/homebrew/opt/ruby@3.2
RUBY32_PATH   := $(RUBY32_PREFIX)/bin:/opt/homebrew/lib/ruby/gems/3.2.0/bin
RUN_RUBY      := if [ -x "$(RUBY32_PREFIX)/bin/ruby" ]; then export PATH="$(RUBY32_PATH):$$PATH"; fi;

.PHONY: help install serve build clean dev check-ruby help-ruby

# Show this help (default target)
help:
	@echo "Jekyll site targets:"
	@echo "  make install     Install gems to vendor/bundle (bundle install)"
	@echo "  make serve       Serve site at http://127.0.0.1:4000/ with livereload"
	@echo "  make dev         Install gems then serve (install + serve)"
	@echo "  make build       Build site into _site/"
	@echo "  make clean       Remove _site/ and .jekyll-cache/"
	@echo "  make help-ruby   Show Ruby setup (if install fails with native gems)"

# Fail fast if Ruby is unsuitable (system 2.6 or 4.x often break native gems like racc).
check-ruby:
	@$(RUN_RUBY) ruby -e "r=\`ruby -e \"puts RbConfig::CONFIG['prefix']\"\`.strip; v=RUBY_VERSION; if v.start_with?('2.6') && (r.include?('System/Library') || r.include?('/usr')); puts 'ERROR: System Ruby 2.6 cannot build native gems on this macOS.'; exit(1); end; if v.start_with?('4.'); puts 'ERROR: Ruby 4.x can fail building racc (stdckdint.h). Use Ruby 3.2 (see .ruby-version). Run: make help-ruby'; exit(1); end; puts 'Ruby ' + v"

# Install gems to vendor/bundle (project-local, no system RubyGems).
install:
	@$(RUN_RUBY) ruby -e "r=\`ruby -e \"puts RbConfig::CONFIG['prefix']\"\`.strip; v=RUBY_VERSION; if v.start_with?('2.6') && (r.include?('System/Library') || r.include?('/usr')); puts 'ERROR: System Ruby 2.6 cannot build native gems on this macOS. Run: make help-ruby'; exit(1); end; if v.start_with?('4.'); puts 'ERROR: Ruby 4.x can fail building racc. Use Ruby 3.2. Run: make help-ruby'; exit(1); end" && \
	rm -rf $(PROJECT_ROOT)/vendor/bundle && \
	bundle config set --local path 'vendor/bundle' && \
	bundle install

# Serve site locally at http://127.0.0.1:4000/
serve:
	@$(RUN_RUBY) bundle exec jekyll serve --livereload

# Install gems then serve (convenience target)
dev: install
	@$(RUN_RUBY) bundle exec jekyll serve --livereload

# One-off build (output in _site/)
build:
	@$(RUN_RUBY) bundle exec jekyll build

# Remove generated site and optional bundle cache
clean:
	rm -rf _site
	rm -rf .jekyll-cache

# Ruby setup when install fails (e.g. racc, commonmarker on system Ruby or Ruby 4.x)
help-ruby:
	@echo "Use Ruby 3.2 (see .ruby-version). Ruby 4.x and system 2.6 often break native gems (racc)."
	@echo ""
	@echo "Option 1 - rbenv (recommended, uses .ruby-version 3.2.0):"
	@echo "  brew install rbenv ruby-build"
	@echo "  eval \"\$$(rbenv init -)\"    # add to ~/.zshrc to make permanent"
	@echo "  rbenv install 3.2.0"
	@echo "  rbenv local 3.2.0"
	@echo "  make install"
	@echo ""
	@echo "Option 2 - Homebrew Ruby 3.2 (avoid 4.x for this project):"
	@echo "  brew install ruby@3.2"
	@echo "  export PATH=\"\$$(brew --prefix ruby@3.2)/opt/ruby/bin:\$$PATH\""
	@echo "  make install"
