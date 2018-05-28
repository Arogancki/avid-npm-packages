#!/bin/bash

cp ./service.spec "<%= serviceType %>.spec"

ORIGINAL_DIR="$(pwd)"

# The directory that we are going to tar
SOURCE_DIR="$(dirname $1)"

# The base name of the spec file. This name will be used
# for the tar file.
SPEC_NAME="<%= serviceType %>"

# Set up rpmbuild tree
mkdir -p rpmbuild/{BUILD,RPMS,SOURCES,SPECS,SRPMS}

pushd "$SOURCE_DIR"

    # Compress sources and move into rpmbuild tree
    tar -czf "$SPEC_NAME-src.tgz" ./* --exclude=.acignore
    mv "$SPEC_NAME-src.tgz" "$ORIGINAL_DIR/rpmbuild/SOURCES/"

    # Copy spec into rpmbuild tree
    cp "$SPEC_NAME.spec" "$ORIGINAL_DIR/rpmbuild/SPECS/"

popd

# Build rpm
rpmbuild --define "_topdir `pwd`/rpmbuild" -bb "rpmbuild/SPECS/$SPEC_NAME.spec"