#!/bin/sh

# cd /tmp
# wget https://www.openssl.org/source/old/1.1.1/openssl-1.1.1g.tar.gz
# tar xf openssl-1.1.1g.tar.gz
# export MACHINE=armv7
# export ARCH=arm
# export CC=arm-linux-gnueabihf-gcc
# cd openssl-1.1.1g
# ./config shared && make

export OPENSSL_LIB_DIR=/tmp/openssl-1.1.1g_gcc83
export OPENSSL_INCLUDE_DIR=/tmp/openssl-1.1.1g_gcc83/include
cargo build --target arm-unknown-linux-gnueabihf --release
