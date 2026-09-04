# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.1.0](https://github.com/la-jarre-a-son/live-jar/compare/v1.0.2...v1.1.0) (2026-09-04)


### Features

* added quality in window modal ([536232d](https://github.com/la-jarre-a-son/live-jar/commit/536232ddf9514074d4b732a8ca2c0cbde00f9e64))
* added swith with main + many QoL settings and controls ([2afd150](https://github.com/la-jarre-a-son/live-jar/commit/2afd150ec94587062de64eae713b79b7c38e3628))

## [1.0.2](https://github.com/la-jarre-a-son/live-jar/compare/v1.0.1...v1.0.2) (2026-09-01)

### Fixes

* login with will-redirect ([1cd23a9](https://github.com/la-jarre-a-son/live-jar/commit/1cd23a9019d1e76faf895b6e264e46300976355f))

## 1.0.1 (2025-10-07)

Features:
- Online indicator in Set Channel menu
- Cache more channel infos
- Added update info popup

Fixes:
- disable Set Channel stickiness when scrolling
- disabeld backgroundThrottling
- ensure Twitch channel is lowercase
- animate channel title only on hover for better perfs
- unregister calls on destroyed window
- update windows titles

## 1.0.0 (2025-09-17)

First version of Live Jar, working with Twitch.

Features:
- Open multiple streams in separate window, with persistent states
- Create playlists of streams to quickly change channels
- Authenticate on Twitch.tv to access followed channels, preview channel status, use chat & watch streams with better experience
