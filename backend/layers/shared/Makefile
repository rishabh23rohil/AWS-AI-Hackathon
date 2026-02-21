# SAM layer build: put shared package at python/shared/ and install deps to python/
# so Lambda finds "import shared" at /opt/python/shared
build-SharedLayer:
	mkdir -p "$(ARTIFACTS_DIR)/python"
	cp -r python/shared "$(ARTIFACTS_DIR)/python/"
	python3 -m pip install -r requirements.txt -t "$(ARTIFACTS_DIR)/python" --quiet
	rm -rf "$(ARTIFACTS_DIR)/python/bin"
