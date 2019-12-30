#!/bin/bash

BUILD_DIR=`cd ${0%/*} && pwd -P`

ADDON_FILES=$BUILD_DIR/addon_files
ADDON_TMP=$BUILD_DIR/addon_tmp

mkdir $ADDON_TMP 2> /dev/null || rm -r $ADDON_TMP/*
mkdir $BUILD_DIR/dist 2> /dev/null

echo "copying files to tmp dir..."
cp -r $ADDON_FILES/* $ADDON_TMP/

source $ADDON_FILES/patcher/etc/version

cd $ADDON_TMP/patcher/www
echo "installing node modules..."
npm install

cd $BUILD_DIR

echo "creating changelog file"
cat >CHANGELOG.md <<EOL
[![GitHub Releases (by Asset)](https://img.shields.io/github/downloads/hobbyquaker/Patcher/v$PATCHER_VERSION/patcher-$PATCHER_VERSION.tar.gz.svg)](https://github.com/hobbyquaker/Patcher/releases/download/v$PATCHER_VERSION/patcher-$PATCHER_VERSION.tar.gz)

### Changelog

EOL

git log `git describe --tags --abbrev=0`..HEAD --pretty=format:'* %h @%an %s' >> CHANGELOG.md

ADDON_FILE=patcher-$PATCHER_VERSION.tar.gz
echo "compressing addon package $ADDON_FILE ..."

cd $ADDON_TMP
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [[ -f /usr/local/bin/gtar ]]; then
        gtar --exclude=.DS_Store --owner=root --group=root -czf $BUILD_DIR/dist/$ADDON_FILE *
    else
        tar --exclude=.DS_Store -czf $BUILD_DIR/dist/$ADDON_FILE *
    fi
else
    tar --owner=root --group=root -czf $BUILD_DIR/dist/$ADDON_FILE *
fi
cd $BUILD_DIR


echo "done."

cat CHANGELOG.md
